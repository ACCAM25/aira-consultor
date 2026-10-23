import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Btn, Panel, Pill, ProgressBar, fmtDate, fmtDateTime } from '@/components/aira/kit';
import { useHistory } from '@/api/data';
import { CONFIDENCE, canonHash, modeById, nameOf, PRIORITY_BANDS } from '@/canon/aira';
import { REGISTERS } from '@/canon/registers';
import { active, healthIssues, nextSteps, phaseProgress, projectPhases } from '@/canon/engine';
import { cn } from '@/lib/utils';

function PhaseRail({ project }) {
  const phases = projectPhases(project);
  const currentIdx = phases.findIndex(p => p.id === project.current_phase);
  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}>
      {phases.map((ph, i) => {
        const done = project.status === 'encerrado' || i < currentIdx;
        const current = i === currentIdx && project.status !== 'encerrado';
        const prog = phaseProgress(project, ph.id);
        return (
          <li key={ph.id} className="min-w-0">
            <Link to="jornada" state={{ phase: ph.id }} className={cn('block rounded-xl border px-3 py-2.5 transition-colors hover:bg-muted', current ? 'border-primary bg-primary/5' : 'border-border')}>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className={cn('h-2 w-2 rounded-full', current ? 'bg-primary' : 'bg-muted-foreground/30')} />}
                {ph.id}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{ph.name}</p>
              {current && <ProgressBar className="mt-2" value={prog.done} total={prog.total} />}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function Stat({ label, value, sub, to }) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-4 hover:bg-muted/40">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </Link>
  );
}

export default function Overview() {
  const { project, records } = useOutletContext();
  const history = useHistory(project.id, 12);
  const [hash, setHash] = useState(null);
  useEffect(() => { canonHash().then(setHash); }, []);
  const steps = nextSteps(project, records);
  const [first, ...rest] = steps;
  const issues = healthIssues(project, records, hash);
  const mode = modeById(project.config?.mode);

  const evid = active(records, 'evidencia');
  const gaps = active(records, 'gap');
  const ranked = gaps.filter(g => g.data?.prioridade != null).sort((a, b) => b.data.prioridade - a.data.prioridade);
  const openPend = active(records, 'pendencia').filter(p => ['aberta', 'andamento'].includes(p.status));
  const gates = active(records, 'gate');
  const recordsById = new Map(records.map(r => [r.id, r]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-700">{project.client_name} · {project.sector === 'publico' ? 'setor público' : 'setor privado'}</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">{project.name}</h1>
        {project.executive_question && <p className="mt-3 max-w-3xl border-l-2 border-blue-700 pl-4 text-base leading-7">{project.executive_question}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill tone="blue">{mode?.name}</Pill>
          {project.start_date && <Pill>{fmtDate(project.start_date)} a {fmtDate(project.end_date)}</Pill>}
        </div>
      </div>

      {first && (
        <section className={cn('rounded-2xl p-5 sm:p-6', first.tone === 'red' ? 'bg-rose-700 text-white' : 'bg-primary text-primary-foreground')}>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] opacity-80"><Sparkles className="h-4 w-4" />Próximo passo</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 max-w-2xl">
              <h2 className="text-xl font-semibold">{first.title}</h2>
              <p className="mt-1 text-sm opacity-85">{first.why}</p>
            </div>
            <Link to={first.to}><Btn variant="outline" className="border-transparent bg-white text-primary hover:bg-white/90">{first.action}<ArrowRight /></Btn></Link>
          </div>
        </section>
      )}

      <Panel title="Jornada" description={project.status === 'configuracao' ? 'O projeto está em configuração. A fase inicial começa após o kickoff.' : undefined}>
        <PhaseRail project={project} />
      </Panel>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat to="evidencias" label="Evidências" value={evid.length} sub={CONFIDENCE.map(c => `${evid.filter(e => e.status === c.id).length} ${c.name.toLowerCase()}`).join(' · ')} />
        <Stat to="gaps" label="Gaps" value={gaps.length} sub={ranked[0] ? `Maior prioridade: ${ranked[0].code} (${ranked[0].data.prioridade})` : 'Sem ranking ainda'} />
        <Stat to="pendencias" label="Pendências abertas" value={openPend.length} sub={openPend.filter(p => p.data?.tipo === 'Bloqueio').length + ' bloqueio(s)'} />
        <Stat to="gates" label="Gates registrados" value={gates.length} sub={gates.at(-1) ? `Último: ${nameOf(REGISTERS.gate.fields[0].options, gates.at(-1).data?.gate)}` : 'Nenhum ainda'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Também falta" description="Outros pontos que o método pede neste momento.">
          {rest.length ? (
            <ul className="space-y-2">{rest.map(s => (
              <li key={s.id}><Link to={s.to} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
                <Clock className={cn('mt-0.5 h-4 w-4 shrink-0', s.tone === 'red' ? 'text-rose-600' : 'text-muted-foreground')} />
                <span className="min-w-0"><span className="block text-sm font-medium">{s.title}</span><span className="block text-xs text-muted-foreground">{s.why}</span></span>
              </Link></li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Nada além do próximo passo.</p>}
        </Panel>
        <Panel title="Saúde metodológica" description="Verificação automática das não conformidades graves do §21.3.">
          {issues.length ? (
            <ul className="space-y-2">{issues.map((i, n) => (
              <li key={n}><Link to={i.to} className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-muted">
                <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', i.level === 'grave' ? 'text-rose-600' : 'text-amber-600')} />
                <span className="text-sm">{i.text} <Pill tone={i.level === 'grave' ? 'red' : 'amber'} className="ml-1">{i.level === 'grave' ? 'grave' : 'alerta'}</Pill></span>
              </Link></li>
            ))}</ul>
          ) : <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />Nenhuma não conformidade detectada.</p>}
        </Panel>
      </div>

      {ranked.length > 0 && (
        <Panel title="Ranking de gaps operacionais" description="Prioridade = 3V + (6 − E) + (6 − R). Gaps pendentes de dimensionamento ficam fora." action={<Link to="gaps" className="text-sm font-semibold text-blue-800 hover:underline">Ver todos</Link>}>
          <ol className="space-y-1.5">{ranked.slice(0, 5).map((g, i) => (
            <li key={g.id} className="flex items-center gap-3 text-sm"><span className="w-5 text-right font-semibold tabular-nums text-muted-foreground">{i + 1}</span><span className="min-w-0 flex-1 truncate">{g.code} {g.title}</span><span className="tabular-nums font-semibold">{g.data.prioridade}</span><Pill tone={PRIORITY_BANDS[g.status]?.tone}>{PRIORITY_BANDS[g.status]?.name}</Pill></li>
          ))}</ol>
        </Panel>
      )}

      <Panel title="Atividade recente">
        {history.data?.length ? (
          <ul className="space-y-2">{history.data.map(h => {
            const rec = recordsById.get(h.record_id);
            return <li key={h.id} className="flex flex-wrap items-baseline gap-x-2 text-sm"><span className="text-xs tabular-nums text-muted-foreground">{fmtDateTime(h.changed_at)}</span><span>{h.action === 'insert' ? 'Criado' : 'Atualizado'}</span><span className="font-medium">{h.snapshot?.code} {h.snapshot?.title}</span>{rec?.archived && <Pill tone="amber">arquivado</Pill>}</li>;
          })}</ul>
        ) : <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>}
      </Panel>
    </div>
  );
}
