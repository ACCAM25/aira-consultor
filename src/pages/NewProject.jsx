import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/aira/AppShell';
import { Btn, CheckRow, ErrorNote, Field, Pill, TextArea, TextInput } from '@/components/aira/kit';
import { createProject, uploadProjectFile } from '@/api/data';
import { CANON_VERSION, DEMAND_QUESTIONS, MODES, OBJECT_TYPES, defaultModules, QUESTION_EXAMPLES, QUESTION_TESTS, canonHash } from '@/canon/aira';
import { cn } from '@/lib/utils';

const STEPS = ['Cliente', 'Demanda', 'Pergunta executiva', 'Modo de aplicação', 'Prazo'];
const SUGGESTED_MODE = { ambiente: 'express', processo: 'processo', oportunidade: 'processo', aquisicao: 'aquisicao', solucao: 'solucao', portfolio: 'full' };

export default function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [docs, setDocs] = useState([]);
  const [docError, setDocError] = useState(null);
  const [form, setForm] = useState({ name: '', client_name: '', sector: 'privado', object_type: '', demand: {}, executive_question: '', question_checks: {}, mode: '', start_date: '', end_date: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const suggested = SUGGESTED_MODE[form.object_type];
  const mode = MODES.find(m => m.id === form.mode);
  const testsDone = QUESTION_TESTS.filter(t => form.question_checks[t.id]).length;

  const canNext = useMemo(() => [
    form.name.trim() && form.client_name.trim(),
    !!form.object_type || docs.length > 0,
    form.executive_question.trim().length > 10 || docs.length > 0,
    !!form.mode,
    !!form.start_date && !!form.end_date && form.end_date >= form.start_date,
  ][step], [form, step, docs.length]);

  function addDocs(list) {
    setDocError(null);
    const incoming = Array.from(list);
    const bad = incoming.find(f => !/\.(pdf|docx|txt|md|vtt|srt)$/i.test(f.name) || f.size > 20 * 1024 * 1024);
    if (bad) return setDocError(new Error(`${bad.name}: use PDF, DOCX ou TXT de até 20 MB.`));
    if (docs.length + incoming.length > 6) return setDocError(new Error('Envie até 6 arquivos.'));
    setDocs(prev => [...prev, ...incoming]);
  }

  async function finish() {
    setBusy(true); setError(null);
    try {
      const m = MODES.find(x => x.id === form.mode);
      const project = await createProject({
        name: form.name.trim(), client_name: form.client_name.trim(), sector: form.sector,
        executive_question: form.executive_question.trim() || null,
        start_date: form.start_date, end_date: form.end_date,
        current_phase: m.phases[0],
        canon_version: CANON_VERSION, canon_hash: await canonHash(),
        config: { mode: m.id, object_type: form.object_type, demand: form.demand, question_checks: form.question_checks, phases: m.phases, modules: defaultModules(m), exclusions: [], kickoff: {} },
      });
      qc.invalidateQueries({ queryKey: ['projects'] });
      if (docs.length) {
        const uploaded = [];
        for (const d of docs) uploaded.push(await uploadProjectFile(project.id, d));
        navigate(`/projetos/${project.id}/leitura`, { state: { files: uploaded, autoRead: true } });
      } else {
        navigate(`/projetos/${project.id}`);
      }
    } catch (e) { setError(e); setBusy(false); }
  }

  return (
    <AppShell crumb="Novo projeto">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-2">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              <span className={cn('text-sm', i === step ? 'font-semibold' : 'text-muted-foreground')}>{s}</span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-semibold">Quem é o cliente e qual é o projeto?</h1><p className="mt-1 text-sm text-muted-foreground">Passo 1 do método: qualificar a demanda.</p></div>
              <Field label="Nome do projeto" required><TextInput autoFocus value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Governança de IA generativa na produção de atos" /></Field>
              <Field label="Organização cliente" required><TextInput value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Ex.: Tribunal de Justiça do Maranhão" /></Field>
              <Field label="Setor" group>
                <div className="grid grid-cols-2 gap-2">
                  {[['privado', 'Privado'], ['publico', 'Público']].map(([id, name]) => (
                    <button type="button" key={id} onClick={() => set('sector', id)} className={cn('rounded-xl border px-4 py-3 text-left text-sm', form.sector === id ? 'border-primary bg-primary/5 font-semibold' : 'border-input hover:bg-muted')}>{name}</button>
                  ))}
                </div>
              </Field>
              {form.sector === 'publico' && <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">O perfil setor público acrescenta critérios de autoridade formal, controle externo, LGPD no poder público e Lei 14.133 às fases, sem alterar as regras do método.</p>}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-semibold">O que está em jogo?</h1><p className="mt-1 text-sm text-muted-foreground">Responda o que já souber. Lacunas ficam registradas como pendências, sem problema.</p></div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-blue-950"><Sparkles className="h-4 w-4" />Tem entrevistas, atas ou transcrições?</p>
                <p className="mt-1 text-sm text-blue-950/80">Anexe aqui. Ao criar o projeto, o AIra lê os documentos e propõe as respostas abaixo, a pergunta executiva, evidências, pessoas, gaps e pendências, com o trecho de origem. Você revisa antes de aplicar. Com documentos, os campos abaixo podem ficar em branco.</p>
                {docs.length > 0 && <ul className="mt-3 space-y-1.5">{docs.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-sm"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{d.name}</span></span><button type="button" onClick={() => setDocs(docs.filter((_, j) => j !== i))} aria-label="Remover" className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></li>
                ))}</ul>}
                {docs.length < 6 && (
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">
                    <Upload className="h-4 w-4" />Anexar documentos
                    <input type="file" multiple accept=".pdf,.docx,.txt,.md,.vtt,.srt" className="sr-only" onChange={e => { addDocs(e.target.files); e.target.value = ''; }} />
                  </label>
                )}
                {docError && <p className="mt-2 text-sm text-rose-700">{docError.message}</p>}
              </div>
              <Field label="Tipo de objeto" required={!docs.length} group>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OBJECT_TYPES.map(o => (
                    <button type="button" key={o.id} onClick={() => set('object_type', o.id)} className={cn('rounded-xl border px-4 py-3 text-left text-sm', form.object_type === o.id ? 'border-primary bg-primary/5 font-semibold' : 'border-input hover:bg-muted')}>{o.name}</button>
                  ))}
                </div>
              </Field>
              {DEMAND_QUESTIONS.map(q => (
                <Field key={q.id} label={q.text}><TextArea rows={2} value={form.demand[q.id] || ''} onChange={e => set('demand', { ...form.demand, [q.id]: e.target.value })} /></Field>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-semibold">Qual é a pergunta executiva?</h1><p className="mt-1 text-sm text-muted-foreground">Uma pergunta decisória por projeto (§2.1). Se ela não puder ser formulada, o trabalho ainda está em pré-venda.</p></div>
              <Field label="Pergunta executiva" required={!docs.length} hint={docs.length ? 'Pode deixar em branco: o AIra propõe uma a partir dos documentos.' : undefined}><TextArea rows={3} autoFocus value={form.executive_question} onChange={e => set('executive_question', e.target.value)} placeholder={QUESTION_EXAMPLES[1]} /></Field>
              <details className="rounded-xl bg-muted/60 px-4 py-3 text-sm"><summary className="cursor-pointer font-medium">Exemplos do método</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{QUESTION_EXAMPLES.map(e => <li key={e}><button type="button" className="text-left hover:text-foreground" onClick={() => set('executive_question', e)}>{e}</button></li>)}</ul></details>
              <div>
                <p className="mb-2 text-sm font-medium">Teste de qualidade da pergunta <span className="font-normal text-muted-foreground">({testsDone} de {QUESTION_TESTS.length})</span></p>
                <div className="space-y-0.5">{QUESTION_TESTS.map(t => <CheckRow key={t.id} checked={form.question_checks[t.id]} onChange={v => set('question_checks', { ...form.question_checks, [t.id]: v })}>{t.text}</CheckRow>)}</div>
                <p className="mt-2 text-xs text-muted-foreground">Pode avançar com critérios em aberto; o painel do projeto vai lembrar de completá-los.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-semibold">Qual modo de aplicação?</h1><p className="mt-1 text-sm text-muted-foreground">O modo é configuração de referência, não pacote rígido. Fases e módulos podem ser ajustados depois.</p></div>
              {MODES.map(m => (
                <button type="button" key={m.id} onClick={() => set('mode', m.id)} className={cn('w-full rounded-2xl border p-4 text-left transition-colors', form.mode === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-input hover:bg-muted/60')}>
                  <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{m.name}</span>{suggested === m.id && <Pill tone="green">Sugerido pelo tipo de objeto</Pill>}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.need}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {m.phases.map(p => <Pill key={p} tone="blue">{p}</Pill>)}{m.optional?.map(p => <Pill key={p}>{p} opcional</Pill>)}
                    <span className="ml-1 text-muted-foreground">Módulos centrais: {m.core.join(', ')}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground"><strong className="font-medium text-foreground">Entrega:</strong> {m.deliverable}. <strong className="font-medium text-foreground">Limite:</strong> {m.limit}</p>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-semibold">Quando começa e quando termina?</h1><p className="mt-1 text-sm text-muted-foreground">Projeto finito: todo projeto declara início e data de fim (§2.5).</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Início" required><TextInput type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></Field>
                <Field label="Encerramento previsto" required><TextInput type="date" value={form.end_date} min={form.start_date} onChange={e => set('end_date', e.target.value)} /></Field>
              </div>
              {mode && (
                <div className="rounded-xl bg-muted/60 p-4 text-sm">
                  <p className="font-medium">Resumo</p>
                  <p className="mt-1 text-muted-foreground">{form.name} · {form.client_name} · {mode.name} · fases {mode.phases.join(', ')}</p>
                  <p className="mt-1 text-muted-foreground">O projeto começa em configuração. A coleta principal só começa depois das condições de kickoff (§4.4).</p>
                </div>
              )}
              <ErrorNote error={error} />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <Btn variant="ghost" onClick={() => (step ? setStep(step - 1) : navigate('/'))}><ArrowLeft />{step ? 'Voltar' : 'Cancelar'}</Btn>
            {step < STEPS.length - 1
              ? <Btn disabled={!canNext} onClick={() => setStep(step + 1)}>Continuar<ArrowRight /></Btn>
              : <Btn disabled={!canNext || busy} onClick={finish}>{busy && <Loader2 className="animate-spin" />}Criar projeto</Btn>}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

