import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Loader2, Paperclip, RotateCcw, Upload } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Btn, ErrorNote, Field, Select, TextArea, TextInput, Pill } from './kit';
import { openProjectFile, uploadProjectFile, useSaveRecord } from '@/api/data';
import { REGISTERS } from '@/canon/registers';
import { cn } from '@/lib/utils';

const COLUMN_KEYS = ['title', 'phase', 'module'];

function initialData(register, record, defaults) {
  if (record) return { ...record.data, title: record.title, phase: record.phase || '', module: record.module || '' };
  const base = { title: '', phase: '', module: '', ...defaults };
  for (const f of register.fields) if (f.default !== undefined && base[f.key] === undefined) base[f.key] = f.default;
  return base;
}

function Scale({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button type="button" key={n} disabled={disabled} onClick={() => onChange(value === n ? '' : n)}
          className={cn('h-10 w-10 rounded-xl border text-sm font-semibold transition-colors', value === n ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted')}>{n}</button>
      ))}
    </div>
  );
}

function Refs({ value = [], onChange, options, disabled }) {
  if (!options.length) return <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">Nenhuma evidência registrada ainda.</p>;
  return (
    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-input p-2">
      {options.map(o => (
        <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
          <input type="checkbox" className="mt-0.5" disabled={disabled} checked={value.includes(o.id)} onChange={e => onChange(e.target.checked ? [...value, o.id] : value.filter(v => v !== o.id))} />
          <span><span className="font-mono text-xs text-muted-foreground">{o.code}</span> {o.title}{o.status && <span className="ml-1 text-xs text-muted-foreground">· confiança {o.status}</span>}</span>
        </label>
      ))}
    </div>
  );
}

function Files({ value = [], onChange, projectId, disabled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function add(files) {
    setBusy(true); setError(null);
    try {
      const added = [];
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name} excede 20 MB.`);
        added.push(await uploadProjectFile(projectId, file));
      }
      onChange([...value, ...added]);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }
  return (
    <div className="space-y-2">
      {value.map(f => (
        <div key={f.path} className="flex items-center justify-between gap-2 rounded-xl border border-input px-3 py-2 text-sm">
          <button type="button" className="flex min-w-0 items-center gap-2 text-left text-blue-800 hover:underline" onClick={() => openProjectFile(f.path)}><Paperclip className="h-4 w-4 shrink-0" /><span className="truncate">{f.name}</span></button>
          {!disabled && <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => onChange(value.filter(x => x.path !== f.path))}>Remover</button>}
        </div>
      ))}
      {!disabled && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input px-3 py-3 text-sm text-muted-foreground hover:bg-muted">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{busy ? 'Enviando…' : 'Anexar arquivo'}
          <input type="file" multiple className="sr-only" disabled={busy} onChange={e => { add(e.target.files); e.target.value = ''; }} />
        </label>
      )}
      <ErrorNote error={error} />
    </div>
  );
}

export function RecordForm({ kind, data, setData, records, projectId, readOnly }) {
  const register = REGISTERS[kind];
  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const evidences = useMemo(() => (records || []).filter(r => r.kind === 'evidencia' && !r.archived), [records]);
  const visible = register.fields.filter(f => !f.showIf || f.showIf(data));
  return (
    <div className="grid grid-cols-6 gap-x-3 gap-y-4">
      {visible.map(f => {
        if (f.type === 'section') return <h3 key={f.key} className="col-span-6 mt-2 border-t border-border pt-4 text-sm font-semibold">{f.label}</h3>;
        const span = f.third ? 'col-span-6 sm:col-span-2' : f.half ? 'col-span-6 sm:col-span-3' : 'col-span-6';
        const required = f.required || f.requiredIf?.(data);
        const v = data[f.key];
        const help = f.help?.(v);
        let input;
        switch (f.type) {
          case 'textarea': input = <TextArea value={v || ''} disabled={readOnly} onChange={e => set(f.key, e.target.value)} />; break;
          case 'longtext': input = <TextArea rows={12} value={v || ''} disabled={readOnly} onChange={e => set(f.key, e.target.value)} className="font-mono text-[13px]" />; break;
          case 'select': input = <Select options={f.options} value={v} disabled={readOnly} onChange={e => set(f.key, e.target.value)} />; break;
          case 'date': input = <TextInput type="date" value={v || ''} disabled={readOnly} onChange={e => set(f.key, e.target.value)} />; break;
          case 'number': input = <TextInput type="number" step="any" value={v ?? ''} disabled={readOnly} onChange={e => set(f.key, e.target.value === '' ? null : Number(e.target.value))} />; break;
          case 'scale': input = <Scale value={v} disabled={readOnly} onChange={n => set(f.key, n)} />; break;
          case 'boolean': input = <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={readOnly} checked={!!v} onChange={e => set(f.key, e.target.checked)} /> Sim</label>; break;
          case 'refs': input = <Refs value={v || []} options={evidences} disabled={readOnly} onChange={x => set(f.key, x)} />; break;
          case 'files': input = <Files value={v || []} projectId={projectId} disabled={readOnly} onChange={x => set(f.key, x)} />; break;
          default: input = <TextInput value={v || ''} disabled={readOnly} onChange={e => set(f.key, e.target.value)} />;
        }
        return <Field key={f.key} label={f.label} required={required} hint={help || f.hint} className={span} group={['scale', 'refs', 'files', 'boolean'].includes(f.type)}>{input}</Field>;
      })}
    </div>
  );
}

export function validateRecord(kind, data) {
  const register = REGISTERS[kind];
  const title = register.titleFrom ? register.titleFrom(data) : data.title;
  const missing = register.fields.filter(f => (!f.showIf || f.showIf(data)) && (f.required || f.requiredIf?.(data)) && f.key !== 'title' && (data[f.key] === undefined || data[f.key] === null || data[f.key] === '' || (Array.isArray(data[f.key]) && !data[f.key].length)));
  if (!title?.trim()) return 'Preencha o campo principal.';
  if (missing.length) return `Preencha: ${missing.map(f => f.label).join(', ')}.`;
  return null;
}

export function toRecordPayload(kind, data) {
  const register = REGISTERS[kind];
  const rest = Object.fromEntries(Object.entries(data).filter(([k]) => !COLUMN_KEYS.includes(k)));
  const derived = register.derive ? register.derive(rest) : { status: rest[register.statusField] ?? null, data: rest };
  return {
    kind,
    title: (register.titleFrom ? register.titleFrom(data) : data.title).trim(),
    phase: data.phase || null,
    module: data.module || null,
    status: derived.status ?? null,
    data: derived.data,
  };
}

export default function RecordSheet({ open, onOpenChange, kind, record, projectId, records, readOnly, defaults }) {
  const register = REGISTERS[kind];
  const [data, setData] = useState(() => initialData(register, record, defaults));
  const [error, setError] = useState(null);
  const save = useSaveRecord(projectId);
  useEffect(() => { if (open) { setData(initialData(register, record, defaults)); setError(null); } }, [open, record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e) {
    e.preventDefault();
    const problem = validateRecord(kind, data);
    if (problem) return setError(new Error(problem));
    try {
      await save.mutateAsync({ id: record?.id, ...toRecordPayload(kind, data) });
      onOpenChange(false);
    } catch (err) { setError(err); }
  }

  async function toggleArchive() {
    try {
      await save.mutateAsync({ id: record.id, archived: !record.archived });
      onOpenChange(false);
    } catch (err) { setError(err); }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit} className="flex min-h-full flex-col">
          <SheetHeader className="mb-5 text-left">
            <div className="flex items-center gap-2">
              {record?.code && <Pill>{record.code}</Pill>}
              {record?.archived && <Pill tone="amber">Arquivado</Pill>}
            </div>
            <SheetTitle>{record ? register.singular : register.newLabel}</SheetTitle>
            <SheetDescription className="text-xs leading-5">{register.intro}</SheetDescription>
          </SheetHeader>
          <div className="flex-1">
            <RecordForm kind={kind} data={data} setData={setData} records={records} projectId={projectId} readOnly={readOnly} />
          </div>
          <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border bg-card px-6 py-4">
            <ErrorNote error={error} />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {record && !readOnly ? (
                <Btn type="button" variant="ghost" size="sm" onClick={toggleArchive}>{record.archived ? <><RotateCcw />Restaurar</> : <><Archive />Arquivar</>}</Btn>
              ) : <span />}
              <div className="flex gap-2">
                <Btn type="button" variant="outline" onClick={() => onOpenChange(false)}>{readOnly ? 'Fechar' : 'Cancelar'}</Btn>
                {!readOnly && <Btn type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />}Salvar</Btn>}
              </div>
            </div>
            {record && <p className="mt-2 text-xs text-muted-foreground">Registros não são apagados: arquivar mantém o histórico para rastreabilidade.</p>}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
