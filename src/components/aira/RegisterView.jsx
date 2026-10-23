import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { REGISTERS, displayValue, statusLabel, statusTone } from '@/canon/registers';
import { Btn, Empty, PageTitle, Pill, TextInput } from './kit';
import RecordSheet from './RecordSheet';

export default function RegisterView({ kind, project, records, readOnly, children, defaults }) {
  const register = REGISTERS[kind];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const items = useMemo(() => records.filter(r => r.kind === kind), [records, kind]);
  const statuses = useMemo(() => [...new Set(items.map(r => r.status).filter(Boolean))], [items]);
  const visible = items.filter(r => (showArchived || !r.archived)
    && (!status || r.status === status)
    && (!query || `${r.code} ${r.title} ${JSON.stringify(r.data)}`.toLowerCase().includes(query.toLowerCase())));

  const openRecord = r => { setEditing(r); setOpen(true); };
  const newRecord = () => { setEditing(null); setOpen(true); };

  const cell = (r, key) => {
    if (key === 'code') return <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{r.code}</span>;
    if (key === 'title') return <span className="font-medium">{r.title}</span>;
    if (key === 'status' || key === register.statusField) return <Pill tone={statusTone(register, r.status)}>{statusLabel(register, r.status)}</Pill>;
    if (key === 'phase') return r.phase || '';
    if (key === 'prioridade') return r.data?.prioridade ?? '';
    return displayValue(register, key, r.data?.[key]);
  };
  const headers = register.columns.map(key => key === 'code' ? 'Código' : key === 'title' ? register.fields.find(f => f.key === 'title')?.label || 'Título' : key === 'status' ? 'Situação' : key === 'phase' ? 'Fase' : key === 'prioridade' ? 'Prioridade' : register.fields.find(f => f.key === key)?.label || key);

  return (
    <div>
      <PageTitle eyebrow="Registro do projeto" title={register.label} description={register.intro}
        action={!readOnly && <Btn onClick={newRecord}><Plus />{register.newLabel}</Btn>} />
      {children?.({ openRecord })}
      {items.length === 0 ? (
        <Empty title={`Nenhum registro em ${register.label.toLowerCase()}`} text="Comece pelo primeiro registro. Tudo fica com código, autor e histórico para rastreabilidade." action={!readOnly && <Btn onClick={newRecord}><Plus />{register.newLabel}</Btn>} />
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <TextInput placeholder="Buscar" value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
            </div>
            {statuses.length > 1 && (
              <select className="h-10 rounded-xl border border-input bg-background px-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Todas as situações</option>
                {statuses.map(s => <option key={s} value={s}>{statusLabel(register, s)}</option>)}
              </select>
            )}
            {items.some(r => r.archived) && (
              <label className="flex items-center gap-2 px-2 text-xs text-muted-foreground"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />Mostrar arquivados</label>
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">{headers.map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} onClick={() => openRecord(r)} className={`cursor-pointer border-b border-border last:border-0 hover:bg-muted/60 ${r.archived ? 'opacity-50' : ''}`}>
                    {register.columns.map(key => <td key={key} className="px-4 py-3 align-top">{cell(r, key)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border md:hidden">
            {visible.map(r => (
              <li key={r.id}>
                <button onClick={() => openRecord(r)} className={`w-full px-4 py-3 text-left hover:bg-muted/60 ${r.archived ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-muted-foreground">{r.code}</span><Pill tone={statusTone(register, r.status)}>{statusLabel(register, r.status)}</Pill></div>
                  <p className="mt-1 font-medium">{r.title}</p>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum registro com esses filtros.</p>}
        </div>
      )}
      <RecordSheet open={open} onOpenChange={setOpen} kind={kind} record={editing} projectId={project.id} records={records} readOnly={readOnly} defaults={{ phase: project.current_phase?.startsWith('F') ? project.current_phase : '', ...defaults }} />
    </div>
  );
}
