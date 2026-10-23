import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Loader2, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Btn, CheckRow, ErrorNote, Field, PageTitle, Panel, Pill, Select, TextArea, TextInput } from '@/components/aira/kit';
import AiraAssist from '@/components/aira/AiraAssist';
import { useUpdateProject } from '@/api/data';
import { DEMAND_QUESTIONS, DEPTHS, KICKOFF_CONDITIONS, MODES, MODULES, OBJECT_TYPES, PHASES, QUESTION_TESTS, VERIFICATION_STATES, defaultModules, modeById } from '@/canon/aira';
import { kickoffProgress } from '@/canon/engine';

const pick = p => ({
  name: p.name, client_name: p.client_name, sector: p.sector, executive_question: p.executive_question || '',
  start_date: p.start_date || '', end_date: p.end_date || '', current_phase: p.current_phase,
  config: { exclusions: [], kickoff: {}, question_checks: {}, demand: {}, modules: {}, ...p.config },
});

export default function Settings() {
  const { project, readOnly } = useOutletContext();
  const update = useUpdateProject(project.id);
  const [form, setForm] = useState(() => pick(project));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (!dirty) setForm(pick(project)); }, [project]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth' }); }, []);

  const cfg = form.config;
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); setSaved(false); };
  const setCfg = (k, v) => set('config', { ...form.config, [k]: v });
  const mode = modeById(cfg.mode);
  const running = project.status !== 'configuracao';
  const kickoff = kickoffProgress({ config: cfg });

  async function save(extra = {}) {
    setError(null);
    try {
      await update.mutateAsync({ ...form, start_date: form.start_date || null, end_date: form.end_date || null, ...extra });
      setDirty(false); setSaved(true);
    } catch (e) { setError(e); }
  }

  function changeMode(id) {
    const m = modeById(id);
    if (!m) return;
    set('config', { ...cfg, mode: id, phases: m.phases, modules: defaultModules(m) });
    if (!running) set('current_phase', m.phases[0]);
  }

  const setModule = (id, patch) => setCfg('modules', { ...cfg.modules, [id]: { ...(cfg.modules?.[id] || {}), ...patch } });

  return (
    <div className="pb-24">
      <PageTitle eyebrow="Passos 1 a 5" title="Configuração do projeto" description="Registro de Configuração do Projeto (§24.1). A proposta configura um projeto; ela não modifica a metodologia." />
      {running && <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">O projeto está em execução. Mudança material de modo, fase, módulo, profundidade ou entregável deve ser registrada em <strong>Mudanças</strong> com decisão do sponsor (§19.5).</p>}

      <div className="space-y-6">
        <Panel title="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome do projeto" required><TextInput disabled={readOnly} value={form.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Organização cliente" required><TextInput disabled={readOnly} value={form.client_name} onChange={e => set('client_name', e.target.value)} /></Field>
            <Field label="Setor"><Select disabled={readOnly} options={[{ id: 'privado', name: 'Privado' }, { id: 'publico', name: 'Público' }]} value={form.sector} onChange={e => set('sector', e.target.value)} /></Field>
            <Field label="Tipo de objeto"><Select disabled={readOnly} options={OBJECT_TYPES} value={cfg.object_type} onChange={e => setCfg('object_type', e.target.value)} /></Field>
          </div>
        </Panel>

        <Panel title="Pergunta executiva" description="Sujeito, objeto e decisão; respondível com evidências; mais de um resultado legítimo; sem presumir IA; com limite e autoridade (§3.2)."
          action={!readOnly && <AiraAssist action="review_question" projectId={project.id} extra={{ question: form.executive_question }} label="Revisar com o AIra" title="Revisão da pergunta executiva" />}>
          <TextArea rows={3} disabled={readOnly} value={form.executive_question} onChange={e => set('executive_question', e.target.value)} />
          <div className="mt-3 grid gap-0.5 sm:grid-cols-2">{QUESTION_TESTS.map(t => <CheckRow key={t.id} disabled={readOnly} checked={cfg.question_checks?.[t.id]} onChange={v => setCfg('question_checks', { ...cfg.question_checks, [t.id]: v })}>{t.text}</CheckRow>)}</div>
        </Panel>

        <Panel title="Qualificação da demanda" description="Perguntas mínimas do passo 1." action={!readOnly && <Link to="../leitura"><Btn variant="soft" size="sm"><Sparkles />Preencher com documentos (IA)</Btn></Link>}>
          <div className="grid gap-4 sm:grid-cols-2">{DEMAND_QUESTIONS.map(q => <Field key={q.id} label={q.text}><TextArea rows={2} disabled={readOnly} value={cfg.demand?.[q.id] || ''} onChange={e => setCfg('demand', { ...cfg.demand, [q.id]: e.target.value })} /></Field>)}</div>
        </Panel>

        <Panel title="Modo, fases e ponto de entrada" description={mode ? `${mode.need}. Entrega: ${mode.deliverable}. Limite: ${mode.limit}` : undefined}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Modo de referência"><Select disabled={readOnly} options={MODES} value={cfg.mode} onChange={e => changeMode(e.target.value)} /></Field>
            <Field label="Fase atual" hint={running ? 'Avance pela Jornada, conforme os critérios de saída.' : 'Ponto de entrada do projeto.'}>
              <Select disabled={readOnly || running} options={PHASES.filter(p => cfg.phases?.includes(p.id)).map(p => ({ id: p.id, name: `${p.id} ${p.name}` }))} value={form.current_phase} onChange={e => set('current_phase', e.target.value)} />
            </Field>
          </div>
          <p className="mb-2 mt-4 text-sm font-medium">Fases incluídas</p>
          <div className="flex flex-wrap gap-2">{PHASES.map(p => {
            const on = cfg.phases?.includes(p.id);
            return <button type="button" key={p.id} disabled={readOnly} onClick={() => setCfg('phases', on ? cfg.phases.filter(x => x !== p.id) : PHASES.map(x => x.id).filter(x => x === p.id || cfg.phases?.includes(x)))}
              className={`rounded-xl border px-3 py-2 text-sm ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'}`}>{p.id} {p.name}{mode?.optional?.includes(p.id) && !on ? ' (opcional)' : ''}</button>;
          })}</div>
        </Panel>

        <Panel title="Módulos, profundidade e estado de verificação" description="Flexibilidade comercial não permite remover dependência crítica sem explicitar a consequência (§3.3).">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="py-2 pr-3 font-medium">Módulo</th><th className="py-2 pr-3 font-medium">Incluído</th><th className="py-2 pr-3 font-medium">Profundidade</th><th className="py-2 pr-3 font-medium">Estado de verificação</th><th className="py-2 font-medium">Justificativa ou efeito da exclusão</th></tr></thead>
              <tbody>{MODULES.map(m => {
                const v = cfg.modules?.[m.id] || {};
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 align-top">
                    <td className="py-3 pr-3"><p className="font-medium">{m.id} {m.name}</p><p className="text-xs text-muted-foreground">{m.question}</p>{mode?.core.includes(m.id) && <Pill tone="blue" className="mt-1">central</Pill>}{mode?.conditional.includes(m.id) && <Pill className="mt-1">condicional</Pill>}</td>
                    <td className="py-3 pr-3"><input type="checkbox" disabled={readOnly} checked={!!v.included} onChange={e => setModule(m.id, { included: e.target.checked })} /></td>
                    <td className="py-3 pr-3"><Select disabled={readOnly || !v.included} className="h-9 w-36" options={DEPTHS} value={v.depth} onChange={e => setModule(m.id, { depth: e.target.value })} /></td>
                    <td className="py-3 pr-3"><Select disabled={readOnly} className="h-9 w-48" options={VERIFICATION_STATES} value={v.state} onChange={e => setModule(m.id, { state: e.target.value })} /></td>
                    <td className="py-3"><TextInput disabled={readOnly} className="h-9" value={v.note || ''} onChange={e => setModule(m.id, { note: e.target.value })} placeholder={!v.included ? 'Qual conclusão fica limitada?' : ''} /></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Prazo e escopo">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Início"><TextInput type="date" disabled={readOnly} value={form.start_date} onChange={e => set('start_date', e.target.value)} /></Field>
            <Field label="Encerramento previsto" required><TextInput type="date" disabled={readOnly} value={form.end_date} onChange={e => set('end_date', e.target.value)} /></Field>
            <Field label="Marcos"><TextArea disabled={readOnly} value={cfg.milestones || ''} onChange={e => setCfg('milestones', e.target.value)} /></Field>
            <Field label="Entregáveis consolidados e critérios de aceite"><TextArea disabled={readOnly} value={cfg.acceptance || ''} onChange={e => setCfg('acceptance', e.target.value)} /></Field>
            <Field label="Evidências e acessos esperados do cliente"><TextArea disabled={readOnly} value={cfg.client_evidence || ''} onChange={e => setCfg('client_evidence', e.target.value)} /></Field>
            <Field label="Especialistas necessários"><TextArea disabled={readOnly} value={cfg.specialists || ''} onChange={e => setCfg('specialists', e.target.value)} /></Field>
            <Field label="Atuação da consultoria na implantação" hint="Deixe claro se está incluída ou excluída (§3.4)." className="sm:col-span-2"><TextInput disabled={readOnly} value={cfg.implementation_role || ''} onChange={e => setCfg('implementation_role', e.target.value)} /></Field>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">Exclusões e efeito de cada exclusão</p>
            <div className="space-y-2">
              {(cfg.exclusions || []).map((x, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <TextInput disabled={readOnly} placeholder="O que fica fora" value={x.item} onChange={e => setCfg('exclusions', cfg.exclusions.map((y, j) => j === i ? { ...y, item: e.target.value } : y))} />
                  <TextInput disabled={readOnly} placeholder="Efeito na conclusão" value={x.efeito} onChange={e => setCfg('exclusions', cfg.exclusions.map((y, j) => j === i ? { ...y, efeito: e.target.value } : y))} />
                  {!readOnly && <Btn variant="ghost" size="md" onClick={() => setCfg('exclusions', cfg.exclusions.filter((_, j) => j !== i))} aria-label="Remover"><Trash2 /></Btn>}
                </div>
              ))}
              {!readOnly && <Btn variant="outline" size="sm" onClick={() => setCfg('exclusions', [...(cfg.exclusions || []), { item: '', efeito: '' }])}><Plus />Adicionar exclusão</Btn>}
            </div>
          </div>
        </Panel>

        <Panel id="kickoff" title="Kickoff e condição para iniciar a execução" description="Não iniciar a coleta principal enquanto faltarem estas condições (§4.4).">
          <div className="grid gap-0.5 sm:grid-cols-2">{KICKOFF_CONDITIONS.map(c => <CheckRow key={c.id} disabled={readOnly || running} checked={cfg.kickoff?.[c.id]} onChange={v => setCfg('kickoff', { ...cfg.kickoff, [c.id]: v })}>{c.text}</CheckRow>)}</div>
          {!running && !readOnly && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Btn disabled={!kickoff.complete || update.isPending} onClick={() => save({ status: 'em_andamento' })}><Play />Iniciar execução em {form.current_phase}</Btn>
              {!kickoff.complete && <span className="text-xs text-muted-foreground">{kickoff.done} de {kickoff.total} condições atendidas.</span>}
            </div>
          )}
          {running && <p className="mt-3 text-sm text-emerald-700">Execução iniciada.</p>}
        </Panel>

        {!readOnly && running && (
          <Panel title="Situação do projeto">
            {project.status === 'pausado'
              ? <Btn variant="outline" onClick={() => save({ status: 'em_andamento' })}>Retomar projeto</Btn>
              : <Btn variant="outline" onClick={() => save({ status: 'pausado' })}>Pausar projeto</Btn>}
            <p className="mt-2 text-xs text-muted-foreground">Encerramento é feito no Dossiê, com aceite e handoff.</p>
          </Panel>
        )}
      </div>

      {!readOnly && (dirty || saved || error) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur print:hidden">
          <div className="mx-auto flex max-w-[1440px] items-center justify-end gap-3">
            <ErrorNote error={error} />
            {saved && !dirty ? <span className="text-sm text-emerald-700">Alterações salvas.</span> : <span className="text-sm text-muted-foreground">Alterações não salvas</span>}
            {dirty && <Btn variant="outline" onClick={() => { setForm(pick(project)); setDirty(false); }}>Descartar</Btn>}
            {dirty && <Btn onClick={() => save()} disabled={update.isPending}>{update.isPending && <Loader2 className="animate-spin" />}Salvar</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}
