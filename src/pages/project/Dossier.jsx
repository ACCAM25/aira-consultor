import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Loader2, Lock, Printer } from 'lucide-react';
import { Btn, CheckRow, ErrorNote, Field, PageTitle, Panel, ProgressBar, TextArea, TextInput, fmtDate } from '@/components/aira/kit';
import { useMembers, useUpdateProject } from '@/api/data';
import { CONCLUSIONS, CONFIDENCE, DEPTHS, GATES, GATE_RESULTS, HANDOFF_ITEMS, LIMITS, MODULES, PRIORITY_BANDS, QUALITY_REVIEW, VERIFICATION_STATES, modeById, nameOf } from '@/canon/aira';
import { ROLES } from '@/canon/aira';
import { active, projectPhases } from '@/canon/engine';

const TEXTS = [
  { key: 'summary', label: 'Sumário executivo' },
  { key: 'people', label: 'Impactos sobre pessoas e adoção' },
  { key: 'consumption', label: 'Consumo, limites e capacidade de resposta' },
  { key: 'limitations', label: 'Limitações da conclusão' },
  { key: 'next', label: 'Próximos passos' },
];
const HANDOFF = [
  { key: 'corte', label: 'Objeto e corte concluído' },
  { key: 'aceitos', label: 'Itens aceitos e ressalvas' },
  { key: 'transferidos', label: 'Documentos e acessos transferidos' },
  { key: 'responsabilidades', label: 'Responsabilidades futuras' },
  { key: 'novo_contrato', label: 'Necessidade de novo projeto ou contrato' },
  { key: 'autoridades', label: 'Autoridades participantes' },
];

function Section({ n, title, children }) {
  return (
    <section className="break-inside-avoid-page border-t border-slate-200 pt-6">
      <h2 className="mb-3 text-lg font-semibold"><span className="mr-2 text-slate-400">{n}.</span>{title}</h2>
      <div className="space-y-2 text-sm leading-6">{children}</div>
    </section>
  );
}

const Md = ({ text }) => text ? <div className="[&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-1.5 [&_ul]:list-disc"><ReactMarkdown>{text}</ReactMarkdown></div> : <p className="italic text-slate-400">Não registrado.</p>;

export default function Dossier() {
  const { project, records, readOnly } = useOutletContext();
  const members = useMembers(project.id);
  const update = useUpdateProject(project.id);
  const [closing, setClosing] = useState(project.closing || {});
  const [quality, setQuality] = useState(project.config?.quality || {});
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (!dirty) { setClosing(project.closing || {}); setQuality(project.config?.quality || {}); } }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  const setC = (k, v) => { setClosing(c => ({ ...c, [k]: v })); setDirty(true); };
  const checks = closing.checklist || {};
  const handoffDone = HANDOFF_ITEMS.filter(i => checks[i.id]).length;
  const qualityDone = QUALITY_REVIEW.filter(i => quality[i.id]).length;
  const closed = project.status === 'encerrado';

  async function save(extra = {}) {
    setError(null);
    try { await update.mutateAsync({ closing, config: { ...project.config, quality }, ...extra }); setDirty(false); } catch (e) { setError(e); }
  }

  const mode = modeById(project.config?.mode);
  const ev = active(records, 'evidencia');
  const gaps = active(records, 'gap');
  const ranked = gaps.filter(g => g.data?.prioridade != null).sort((a, b) => b.data.prioridade - a.data.prioridade);
  const decisions = active(records, 'decisao');
  const gates = active(records, 'gate');
  const refs = active(records, 'encaminhamento');
  const deliverables = active(records, 'entregavel');
  const pend = active(records, 'pendencia').filter(p => ['aberta', 'andamento'].includes(p.status));
  const people = active(records, 'papel');
  const byId = new Map(records.map(r => [r.id, r]));

  return (
    <div>
      <div className="print:hidden">
        <PageTitle eyebrow="Passos 15 e 16" title="Dossiê AIra e handoff" description="O Dossiê é montado a partir dos registros. Complete os textos de síntese, faça a revisão de qualidade e registre o Termo de Conclusão e Handoff."
          action={<Btn variant="outline" onClick={() => window.print()}><Printer />Imprimir ou salvar PDF</Btn>} />
        <div className="mb-8 grid gap-6 xl:grid-cols-2">
          <Panel title="Textos de síntese">
            <div className="space-y-4">{TEXTS.map(t => <Field key={t.key} label={t.label}><TextArea rows={3} disabled={readOnly} value={closing[t.key] || ''} onChange={e => setC(t.key, e.target.value)} /></Field>)}</div>
          </Panel>
          <div className="space-y-6">
            <Panel title="Revisão de qualidade metodológica" description={`${qualityDone} de ${QUALITY_REVIEW.length} itens verificados (§21.1).`}>
              <ProgressBar value={qualityDone} total={QUALITY_REVIEW.length} className="mb-3" />
              {QUALITY_REVIEW.map(i => <CheckRow key={i.id} disabled={readOnly} checked={quality[i.id]} onChange={v => { setQuality(q => ({ ...q, [i.id]: v })); setDirty(true); }}>{i.text}</CheckRow>)}
            </Panel>
            <Panel title="Termo de Conclusão e Handoff">
              <div className="space-y-3">
                {HANDOFF.map(h => <Field key={h.key} label={h.label}><TextArea rows={2} disabled={readOnly} value={closing[h.key] || ''} onChange={e => setC(h.key, e.target.value)} /></Field>)}
                <Field label="Data de encerramento"><TextInput type="date" disabled={readOnly} value={closing.data_encerramento || ''} onChange={e => setC('data_encerramento', e.target.value)} /></Field>
              </div>
              <p className="mb-2 mt-5 text-sm font-medium">Checklist de encerramento ({handoffDone} de {HANDOFF_ITEMS.length})</p>
              {HANDOFF_ITEMS.map(i => <CheckRow key={i.id} disabled={readOnly} checked={checks[i.id]} onChange={v => setC('checklist', { ...checks, [i.id]: v })}>{i.text}</CheckRow>)}
            </Panel>
          </div>
        </div>
        <ErrorNote error={error} />
        {!readOnly && (
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <Btn disabled={!dirty || update.isPending} onClick={() => save()}>{update.isPending && <Loader2 className="animate-spin" />}Salvar</Btn>
            <Btn variant="outline" disabled={handoffDone < HANDOFF_ITEMS.length || !closing.data_encerramento || update.isPending} onClick={() => save({ status: 'encerrado', current_phase: 'ENC', end_date: closing.data_encerramento })}><Lock />Encerrar projeto</Btn>
            {handoffDone < HANDOFF_ITEMS.length && <span className="text-xs text-muted-foreground">O encerramento exige o checklist completo e a data de encerramento.</span>}
          </div>
        )}
        {closed && <p className="mb-8 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Projeto encerrado em {fmtDate(project.end_date)}. Monitoramento posterior pertence ao cliente ou a novo contrato (§2.5).</p>}
      </div>

      <article className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-border bg-white p-6 text-slate-900 sm:p-10 print:max-w-none print:border-0 print:p-0">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">Dossiê AIra · {mode?.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-slate-600">{project.client_name} · {fmtDate(project.start_date)} a {fmtDate(project.end_date)}</p>
          <p className="mt-1 text-xs text-slate-500">Cânone AIra {project.canon_version} · impressão digital {project.canon_hash?.slice(0, 12)}</p>
        </header>
        <Section n={1} title="Sumário executivo"><Md text={closing.summary} /></Section>
        <Section n={2} title="Objetivo e decisão esperada">
          <p className="text-base font-medium">{project.executive_question}</p>
          {project.config?.demand?.decidir && <p><strong>O que se pretende decidir:</strong> {project.config.demand.decidir}</p>}
          <p><strong>Autoridade decisória:</strong> {people.filter(p => p.data?.papel === 'autoridade').map(p => p.title).join(', ') || 'não nomeada'}</p>
        </Section>
        <Section n={3} title="Modo, fases, módulos e profundidade">
          <p>{mode?.name}. Fases: {projectPhases(project).map(p => `${p.id} ${p.name}`).join(', ')}.</p>
          <table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-1.5">Módulo</th><th>Incluído</th><th>Profundidade</th><th>Estado de verificação</th></tr></thead><tbody>
            {MODULES.map(m => { const v = project.config?.modules?.[m.id] || {}; return <tr key={m.id} className="border-b border-slate-100"><td className="py-1.5">{m.id} {m.name}</td><td>{v.included ? 'Sim' : 'Não'}</td><td>{v.included ? nameOf(DEPTHS, v.depth) : '—'}</td><td>{nameOf(VERIFICATION_STATES, v.state)}{v.note ? ` · ${v.note}` : ''}</td></tr>; })}
          </tbody></table>
        </Section>
        <Section n={4} title="Evidências, ausências e grau de confiança">
          {ev.length ? <table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-1.5">Código</th><th>Evidência</th><th>Fonte</th><th>Confiança</th></tr></thead><tbody>
            {ev.map(e => <tr key={e.id} className="border-b border-slate-100 align-top"><td className="py-1.5 font-mono text-xs">{e.code}</td><td>{e.title}{e.data?.divergencias && <span className="block text-xs text-amber-700">Divergência: {e.data.divergencias}</span>}</td><td>{e.data?.fonte}</td><td>{nameOf(CONFIDENCE, e.status)}</td></tr>)}
          </tbody></table> : <p className="italic text-slate-400">Nenhuma evidência registrada.</p>}
        </Section>
        <Section n={5} title="Diagnóstico, gaps e oportunidades">
          {gaps.length ? <ul className="space-y-1.5">{gaps.map(g => <li key={g.id}><strong>{g.code}</strong> {g.title} · {g.data?.tipo === 'maturidade' ? `maturidade (${g.data?.nivel_atual || '?'} → ${g.data?.nivel_alvo || '?'})` : `operacional${g.data?.dimensao_valor != null ? ` · ${g.data.dimensao_valor} ${g.data.unidade || ''}` : ' · pendente de dimensionamento'}`}</li>)}</ul> : <p className="italic text-slate-400">Não aplicável ou não registrado.</p>}
        </Section>
        <Section n={6} title="Priorização e direcionamento">
          {ranked.length ? <ol className="ml-5 list-decimal space-y-1">{ranked.map(g => <li key={g.id}>{g.code} {g.title} · prioridade {g.data.prioridade} ({PRIORITY_BANDS[g.status]?.name})</li>)}</ol> : <p className="italic text-slate-400">Sem ranking.</p>}
          {decisions.filter(d => d.data?.conclusao).map(d => <p key={d.id}><strong>{d.code} · {nameOf(CONCLUSIONS, d.data.conclusao)}:</strong> {d.data.decisao} <span className="text-slate-500">(decidido por {d.data.autoridade})</span></p>)}
        </Section>
        <Section n={7} title="Requisitos e condições de governança">
          {deliverables.length ? deliverables.map(d => <div key={d.id} className="mb-3"><p className="font-medium">{d.code} {d.title} <span className="text-xs text-slate-500">({d.phase}, {d.status})</span></p><Md text={d.data?.conteudo} /></div>) : <p className="italic text-slate-400">Nenhum entregável registrado.</p>}
        </Section>
        <Section n={8} title="Resultados dos gates">
          {gates.length ? <ul className="space-y-1.5">{gates.map(g => <li key={g.id}><strong>{g.code} {nameOf(GATES, g.data?.gate)}</strong> · {g.title}: {nameOf(GATE_RESULTS, g.status)} · autoridade: {g.data?.autoridade}{g.data?.condicoes ? ` · condições: ${g.data.condicoes}` : ''}</li>)}</ul> : <p className="italic text-slate-400">Nenhum gate registrado.</p>}
        </Section>
        <Section n={9} title="Impactos sobre pessoas e adoção"><Md text={closing.people} /></Section>
        <Section n={10} title="Consumo, limites e capacidade de resposta"><Md text={closing.consumption} /></Section>
        <Section n={11} title="Encaminhamentos especializados">
          {refs.length ? <ul className="space-y-1.5">{refs.map(r => <li key={r.id}><strong>{r.code} {r.title}</strong> · {r.data?.competencia} · {r.status}{r.data?.retorno ? ` · retorno: ${r.data.retorno}` : ''}</li>)}</ul> : <p className="italic text-slate-400">Nenhum.</p>}
        </Section>
        <Section n={12} title="Recomendações, responsáveis e prazos">
          {decisions.length ? <ul className="space-y-1.5">{decisions.map(d => <li key={d.id}><strong>{d.code}</strong> {d.title}: {d.data?.decisao}{d.data?.condicoes ? ` · condições: ${d.data.condicoes}` : ''}{d.data?.excecao ? ' · exceção registrada' : ''}{d.data?.evidencias?.length ? ` · evidências: ${d.data.evidencias.map(id => byId.get(id)?.code).filter(Boolean).join(', ')}` : ''}</li>)}</ul> : <p className="italic text-slate-400">Nenhuma decisão registrada.</p>}
          {pend.length > 0 && <><p className="mt-3 font-medium">Ações abertas</p><ul className="space-y-1">{pend.map(p => <li key={p.id}>{p.code} {p.title} · {p.data?.responsavel} · {fmtDate(p.data?.prazo)}</li>)}</ul></>}
        </Section>
        <Section n={13} title="Limitações da conclusão">
          <Md text={closing.limitations} />
          {(project.config?.exclusions || []).filter(x => x.item).map((x, i) => <p key={i}><strong>Exclusão:</strong> {x.item}. <strong>Efeito:</strong> {x.efeito || 'não declarado'}</p>)}
          <p className="mt-2 text-xs text-slate-500">Este Dossiê não constitui: {LIMITS.map(l => l.charAt(0).toLowerCase() + l.slice(1)).join('; ')}.</p>
        </Section>
        <Section n={14} title="Próximos passos"><Md text={closing.next} /></Section>
        <Section n={15} title="Termo de Conclusão e Handoff">
          {HANDOFF.map(h => <p key={h.key}><strong>{h.label}:</strong> {closing[h.key] || '—'}</p>)}
          <p><strong>Data de encerramento:</strong> {fmtDate(closing.data_encerramento) || '—'}</p>
          <p className="mt-2 text-xs text-slate-500">Papéis: {people.map(p => `${p.title} (${nameOf(ROLES, p.data?.papel)})`).join('; ') || '—'}. Equipe AIra: {(members.data || []).filter(m => m.role !== 'cliente').map(m => m.email).join(', ')}.</p>
        </Section>
      </article>
    </div>
  );
}
