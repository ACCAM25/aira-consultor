import React, { useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Btn, CheckRow, ErrorNote, Field, PageTitle, Panel, Pill, ProgressBar, TextArea, TextInput } from '@/components/aira/kit';
import { useSaveRecord, useUpdateProject } from '@/api/data';
import { GATES, GATE_RESULTS, INSTRUMENTS, nameOf } from '@/canon/aira';
import { active, phaseProgress, projectPhases } from '@/canon/engine';
import { cn } from '@/lib/utils';

export default function Journey() {
  const { project, records, readOnly } = useOutletContext();
  const location = useLocation();
  const phases = projectPhases(project);
  const [selected, setSelected] = useState(location.state?.phase || (project.current_phase?.startsWith('F') ? project.current_phase : phases[0]?.id));
  const [exception, setException] = useState(false);
  const update = useUpdateProject(project.id);
  const saveRecord = useSaveRecord(project.id);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ justificativa: '', autoridade: '', riscos: '' });

  const phase = phases.find(p => p.id === selected) || phases[0];
  if (!phase) return <p className="text-sm text-muted-foreground">Nenhuma fase configurada. Ajuste o modo em Configuração.</p>;
  const idx = phases.findIndex(p => p.id === phase.id);
  const currentIdx = phases.findIndex(p => p.id === project.current_phase);
  const isCurrent = phase.id === project.current_phase && project.status === 'em_andamento';
  const prog = phaseProgress(project, phase.id);
  const next = phases[idx + 1];
  const gates = active(records, 'gate');
  const deliverables = active(records, 'entregavel').filter(d => d.phase === phase.id);
  const instruments = active(records, 'instrumento');

  async function toggle(id, value) {
    const checks = { ...(project.phase_checks || {}) };
    checks[phase.id] = { ...(checks[phase.id] || {}), [id]: value };
    try { await update.mutateAsync({ phase_checks: checks }); } catch (e) { setError(e); }
  }

  async function advance() {
    setError(null);
    try {
      if (next) await update.mutateAsync({ current_phase: next.id });
      else await update.mutateAsync({ current_phase: 'ENC' });
      if (next) setSelected(next.id);
    } catch (e) { setError(e); }
  }

  async function advanceWithException(e) {
    e.preventDefault();
    if (!form.justificativa.trim() || !form.autoridade.trim()) return setError(new Error('Informe a justificativa e quem decidiu.'));
    try {
      const missing = prog.criteria.filter(c => !prog.checks[c.id]).map(c => `- ${c.text}`).join('\n');
      await saveRecord.mutateAsync({
        kind: 'decisao', title: `Exceção: avançar de ${phase.id} para ${next ? next.id : 'o encerramento'} com critérios em aberto`, phase: phase.id, status: null,
        data: { opcoes: `Aguardar o cumprimento dos critérios de saída ou avançar com exceção registrada.`, decisao: `Avançar com os seguintes critérios em aberto:\n${missing}`, contexto: form.justificativa, autoridade: form.autoridade, condicoes: form.riscos, excecao: true, data_decisao: new Date().toISOString().slice(0, 10), evidencias: [] },
      });
      await advance();
      setException(false);
    } catch (err) { setError(err); }
  }

  const gateStatus = gateId => {
    const list = gates.filter(g => g.data?.gate === gateId);
    if (!list.length) return null;
    return list.at(-1).status;
  };

  return (
    <div>
      <PageTitle eyebrow="Jornada" title={`${phase.id} ${phase.name}`} description={phase.goal} />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {phases.map((p, i) => (
          <button key={p.id} onClick={() => setSelected(p.id)} className={cn('shrink-0 rounded-xl border px-3 py-2 text-left text-sm', p.id === phase.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted')}>
            <span className="font-semibold">{p.id}</span> {p.name}
            {(project.status === 'encerrado' || i < currentIdx) && <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5" />}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Critérios de saída da fase" description={`${prog.done} de ${prog.total} atendidos. Marque somente o que estiver sustentado por registro ou evidência.`}>
            <ProgressBar value={prog.done} total={prog.total} className="mb-4" />
            <div className="space-y-0.5">
              {prog.criteria.map(c => {
                const g = c.gate ? gateStatus(c.gate) : undefined;
                const note = c.gate ? (g ? `Último registro do gate: ${nameOf(GATE_RESULTS, g)}` : 'Nenhuma ata deste gate registrada ainda.') : undefined;
                return <CheckRow key={c.id} checked={prog.checks[c.id]} disabled={readOnly || update.isPending} onChange={v => toggle(c.id, v)} note={note}>{c.text}</CheckRow>;
              })}
            </div>
            <ErrorNote error={error} />
            {isCurrent && !readOnly && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Btn disabled={!prog.complete || update.isPending} onClick={advance}>{update.isPending && <Loader2 className="animate-spin" />}{next ? `Concluir ${phase.id} e avançar para ${next.id}` : 'Concluir última fase'}<ArrowRight /></Btn>
                {!prog.complete && <Btn variant="ghost" onClick={() => setException(true)}>Avançar com exceção registrada</Btn>}
              </div>
            )}
            {project.status === 'configuracao' && <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">O projeto ainda está em configuração. <Link to="../configuracao#kickoff" className="font-semibold underline">Conclua o kickoff</Link> para iniciar a execução.</p>}
          </Panel>

          <Panel title="Entregável mínimo" description={phase.deliverable} action={!readOnly && <Link to="../entregaveis"><Btn variant="outline" size="sm">Abrir entregáveis</Btn></Link>}>
            {deliverables.length ? <ul className="space-y-1.5 text-sm">{deliverables.map(d => <li key={d.id} className="flex items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{d.code}</span>{d.title}<Pill tone={d.status?.startsWith('aceito') ? 'green' : 'amber'}>{d.status}</Pill></li>)}</ul> : <p className="text-sm text-muted-foreground">Ainda não registrado.</p>}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Instrumentos de referência">
            <ul className="space-y-2">{phase.instruments.map(id => {
              const ins = INSTRUMENTS.find(i => i.id === id);
              const used = instruments.find(r => r.data?.instrumento === id);
              return <li key={id} className="text-sm"><div className="flex items-start justify-between gap-2"><span><span className="font-mono text-xs text-muted-foreground">{id}</span> {ins.name}</span>{used && <Pill tone={used.status === 'concluido' ? 'green' : 'amber'}>{used.status}</Pill>}</div><p className="text-xs text-muted-foreground">{ins.use}</p></li>;
            })}</ul>
          </Panel>
          <Panel title="Gates que podem ser acionados">
            <ul className="space-y-3">{GATES.map(g => (
              <li key={g.id} className="text-sm"><p className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-muted-foreground" />{g.name}{gateStatus(g.id) && <Pill tone="blue">{nameOf(GATE_RESULTS, gateStatus(g.id))}</Pill>}</p><p className="text-xs text-muted-foreground">{g.moment}. {g.question}</p></li>
            ))}</ul>
            {!readOnly && <Link to="../gates" className="mt-3 inline-block text-sm font-semibold text-blue-800 hover:underline">Registrar ata de gate</Link>}
          </Panel>
        </div>
      </div>

      <Dialog open={exception} onOpenChange={setException}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Avançar com exceção registrada</DialogTitle>
            <DialogDescription>O método orienta e não veta, mas avançar com critérios em aberto exige exceção registrada: quem decidiu, ciente de quê e quando. Uma decisão será criada no registro.</DialogDescription>
          </DialogHeader>
          <form onSubmit={advanceWithException} className="space-y-4">
            <Field label="Por que avançar agora" required><TextArea value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })} /></Field>
            <Field label="Quem decidiu" required><TextInput value={form.autoridade} onChange={e => setForm({ ...form, autoridade: e.target.value })} placeholder="Nome e papel da autoridade" /></Field>
            <Field label="Riscos de que tinha ciência e condições"><TextArea value={form.riscos} onChange={e => setForm({ ...form, riscos: e.target.value })} /></Field>
            <ErrorNote error={error} />
            <div className="flex justify-end gap-2"><Btn type="button" variant="outline" onClick={() => setException(false)}>Cancelar</Btn><Btn type="submit" disabled={saveRecord.isPending}>Registrar e avançar</Btn></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
