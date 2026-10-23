import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import RegisterView from '@/components/aira/RegisterView';
import { Panel, Pill } from '@/components/aira/kit';
import AiraAssist from '@/components/aira/AiraAssist';
import { useSaveRecord } from '@/api/data';
import { PRIORITY_BANDS, phaseById } from '@/canon/aira';
import { active } from '@/canon/engine';
import { registerByPath } from '@/canon/registers';

function GapRanking({ records, openRecord }) {
  const gaps = active(records, 'gap');
  const ranked = gaps.filter(g => g.data?.prioridade != null).sort((a, b) => b.data.prioridade - a.data.prioridade);
  const pending = gaps.filter(g => g.status === 'pendente');
  const maturity = gaps.filter(g => g.data?.tipo === 'maturidade');
  const blocking = gaps.filter(g => g.data?.bloqueia);
  if (!gaps.length) return null;
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <Panel title="Ranking operacional" description="3V + (6 − E) + (6 − R). 19–25 alta · 14–18 média · 9–13 baixa · abaixo de 9 não atuar." className="lg:col-span-2">
        {ranked.length ? <ol className="space-y-1">{ranked.map((g, i) => (
          <li key={g.id}><button onClick={() => openRecord(g)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted">
            <span className="w-5 text-right font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate"><span className="font-mono text-xs text-muted-foreground">{g.code}</span> {g.title}</span>
            {g.data?.onda && <Pill>onda {g.data.onda}</Pill>}
            <span className="w-8 text-right font-semibold tabular-nums">{g.data.prioridade}</span>
            <Pill tone={PRIORITY_BANDS[g.status]?.tone}>{PRIORITY_BANDS[g.status]?.name}</Pill>
          </button></li>
        ))}</ol> : <p className="text-sm text-muted-foreground">Nenhum gap operacional com dimensão, triagem e V/E/R completos.</p>}
      </Panel>
      <div className="space-y-4">
        <Panel title="Fora do ranking">
          <p className="text-sm"><strong>{pending.length}</strong> pendente(s) de dimensionamento</p>
          <p className="text-sm"><strong>{maturity.length}</strong> de maturidade (régua L1 a L5)</p>
          <p className="text-sm"><strong>{gaps.filter(g => g.status === 'nao_agir').length}</strong> com triagem “não agir”</p>
        </Panel>
        {blocking.length > 0 && <Panel title="Bloqueiam outros gaps"><ul className="space-y-1 text-sm">{blocking.map(g => <li key={g.id}>{g.code} {g.title}</li>)}</ul><p className="mt-2 text-xs text-muted-foreground">Trate antes da formação de ondas.</p></Panel>}
      </div>
    </div>
  );
}

function DeliverableAssist({ project, readOnly }) {
  const save = useSaveRecord(project.id);
  const phase = phaseById(project.current_phase);
  if (readOnly || !phase) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
      <span className="text-muted-foreground">Entregável mínimo de {phase.id}: <strong className="text-foreground">{phase.deliverable}</strong></span>
      <AiraAssist action="draft_deliverable" projectId={project.id} extra={{ phase: phase.id }} label="Rascunhar com o AIra" title={`Rascunho: ${phase.deliverable}`} useLabel="Salvar como rascunho"
        onUse={result => save.mutateAsync({ kind: 'entregavel', title: phase.deliverable, phase: phase.id, status: 'rascunho', data: { estado: 'rascunho', conteudo: result.text } })} />
    </div>
  );
}

export default function RegisterPage() {
  const { register: path } = useParams();
  const { project, records, readOnly } = useOutletContext();
  const found = registerByPath(path);
  if (!found) return <p className="text-sm text-muted-foreground">Registro não encontrado.</p>;
  const [kind] = found;
  return (
    <RegisterView key={kind} kind={kind} project={project} records={records} readOnly={readOnly}>
      {({ openRecord }) => (
        <>
          {kind === 'gap' && <GapRanking records={records} openRecord={openRecord} />}
          {kind === 'entregavel' && <DeliverableAssist project={project} readOnly={readOnly} />}
        </>
      )}
    </RegisterView>
  );
}
