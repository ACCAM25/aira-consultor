import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CheckCircle2, FileText, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { Btn, ErrorNote, PageTitle, Panel, Pill } from '@/components/aira/kit';
import { readDocuments, uploadProjectFile, useSaveRecord, useUpdateProject } from '@/api/data';
import { CONFIDENCE, DEMAND_QUESTIONS, OBJECT_TYPES, ROLES, nameOf } from '@/canon/aira';

const MAX_FILES = 6;
const sourceText = f => (f?.documento ? `${f.documento}: “${f.trecho}”` : '');

function Quote({ fonte }) {
  if (!fonte?.trecho) return null;
  return <p className="mt-1 border-l-2 border-blue-200 pl-2 text-xs italic text-muted-foreground">“{fonte.trecho}” <span className="not-italic">({fonte.documento})</span></p>;
}

function Section({ title, count, children, allOn, onAll }) {
  if (!count) return null;
  return (
    <Panel title={`${title} (${count})`} action={onAll && <button type="button" onClick={onAll} className="text-xs font-semibold text-blue-800 hover:underline">{allOn ? 'Desmarcar todos' : 'Marcar todos'}</button>}>
      <div className="space-y-2">{children}</div>
    </Panel>
  );
}

function Item({ checked, onChange, children }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${checked ? 'border-blue-200 bg-blue-50/40' : 'border-border'}`}>
      <input type="checkbox" aria-label="Aceitar proposta" className="mt-1 h-4 w-4 shrink-0 cursor-pointer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="min-w-0 flex-1 cursor-pointer text-sm" onClick={e => { if (!e.target.closest('select')) onChange(!checked); }}>{children}</div>
    </div>
  );
}

export default function DocumentReader() {
  const { project, readOnly } = useOutletContext();
  const save = useSaveRecord(project.id);
  const update = useUpdateProject(project.id);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [reading, setReading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [sel, setSel] = useState({});
  const [conf, setConf] = useState({});
  const [registerDocs, setRegisterDocs] = useState(true);
  const [done, setDone] = useState(null);

  if (readOnly) return <p className="text-sm text-muted-foreground">Seu acesso a este projeto é somente leitura.</p>;

  async function addFiles(list) {
    setError(null); setUploading(true);
    try {
      const incoming = Array.from(list);
      if (files.length + incoming.length > MAX_FILES) throw new Error(`Envie até ${MAX_FILES} arquivos por leitura.`);
      const added = [];
      for (const f of incoming) {
        if (!/\.(pdf|docx|txt|md|vtt|srt)$/i.test(f.name)) throw new Error(`${f.name}: use PDF, DOCX ou TXT (transcrições .vtt e .srt também servem).`);
        if (f.size > 20 * 1024 * 1024) throw new Error(`${f.name} passa de 20 MB.`);
        added.push(await uploadProjectFile(project.id, f));
      }
      setFiles(prev => [...prev, ...added]);
    } catch (e) { setError(e); } finally { setUploading(false); }
  }

  async function read() {
    setError(null); setReading(true); setDone(null);
    try {
      const data = await readDocuments(project.id, files.map(f => ({ path: f.path, name: f.name })));
      const p = data.proposals || {};
      const s = {};
      Object.keys(p.demanda || {}).forEach(k => { if (p.demanda[k]?.resposta) s[`demanda.${k}`] = !project.config?.demand?.[k]; });
      if (p.pergunta_executiva?.texto) s.pergunta = !project.executive_question;
      if (p.tipo_objeto) s.tipo = !project.config?.object_type;
      ['evidencias', 'pessoas', 'gaps', 'pendencias'].forEach(k => (p[k] || []).forEach((_, i) => { s[`${k}.${i}`] = true; }));
      setSel(s);
      setConf(Object.fromEntries((p.evidencias || []).map((e, i) => [i, e.confianca])));
      setResult(data);
    } catch (e) { setError(e); } finally { setReading(false); }
  }

  const toggle = (key, value) => setSel(prev => ({ ...prev, [key]: value }));
  const group = prefix => Object.keys(sel).filter(k => k.startsWith(prefix + '.'));
  const allOn = prefix => group(prefix).every(k => sel[k]);
  const setAll = prefix => { const on = !allOn(prefix); setSel(prev => ({ ...prev, ...Object.fromEntries(group(prefix).map(k => [k, on])) })); };
  const selectedCount = Object.values(sel).filter(Boolean).length + (registerDocs ? files.length : 0);

  async function apply() {
    setError(null); setApplying(true);
    const p = result.proposals || {};
    const created = { evidencia: 0, papel: 0, gap: 0, pendencia: 0 };
    try {
      const today = new Date().toISOString().slice(0, 10);
      const docEvidence = {};
      if (registerDocs) {
        for (const f of files) {
          const r = await save.mutateAsync({ kind: 'evidencia', title: `Documento: ${f.name}`, phase: project.current_phase?.startsWith('F') ? project.current_phase : null, status: 'baixo',
            data: { fonte: 'Entrevistas e workshops', descricao: 'Documento-fonte enviado para leitura assistida. Ajuste o tipo de fonte e o grau de confiança após revisar.', confianca: 'baixo', justificativa_confianca: 'Documento ainda não validado com o responsável competente.', data_evidencia: today, arquivos: [f] } });
          docEvidence[f.name] = r.id; created.evidencia++;
        }
      }
      for (const [i, e] of (p.evidencias || []).entries()) {
        if (!sel[`evidencias.${i}`]) continue;
        const c = conf[i] || e.confianca || 'baixo';
        await save.mutateAsync({ kind: 'evidencia', title: e.titulo, phase: project.current_phase?.startsWith('F') ? project.current_phase : null, status: c,
          data: { descricao: e.descricao || '', fonte: e.fonte_tipo, origem: e.origem || '', confianca: c, justificativa_confianca: e.justificativa_confianca, divergencias: e.divergencias || '', data_evidencia: today, fonte_documento: sourceText(e.fonte), origem_ia: true } });
        created.evidencia++;
      }
      for (const [i, x] of (p.pessoas || []).entries()) {
        if (!sel[`pessoas.${i}`]) continue;
        await save.mutateAsync({ kind: 'papel', title: x.nome, status: x.papel || null, data: { papel: x.papel || '', organizacao: x.organizacao || '', autoridade: x.autoridade || '', fonte_documento: sourceText(x.fonte), origem_ia: true } });
        created.papel++;
      }
      for (const [i, g] of (p.gaps || []).entries()) {
        if (!sel[`gaps.${i}`]) continue;
        const dim = typeof g.dimensao_valor === 'number' ? g.dimensao_valor : null;
        await save.mutateAsync({ kind: 'gap', title: g.titulo, status: g.tipo === 'maturidade' ? 'maturidade' : dim == null ? 'pendente' : 'incompleto',
          data: { tipo: g.tipo, processo: g.processo || '', descricao: g.descricao || '', confirmacao: g.confirmacao, unidade: g.unidade || '', dimensao_valor: dim, dimensao_conta: g.dimensao_conta || '', causa: g.causa || '', consequencia: g.consequencia || '', fonte_documento: sourceText(g.fonte), origem_ia: true, prioridade: null } });
        created.gap++;
      }
      for (const [i, x] of (p.pendencias || []).entries()) {
        if (!sel[`pendencias.${i}`]) continue;
        await save.mutateAsync({ kind: 'pendencia', title: x.titulo, status: 'aberta', data: { tipo: x.tipo || 'Pendência', impacto: x.impacto || '', responsavel: x.responsavel_sugerido || 'A definir', origem: 'Leitura de documentos', estado: 'aberta', fonte_documento: sourceText(x.fonte), origem_ia: true } });
        created.pendencia++;
      }
      const patch = {};
      const demand = { ...(project.config?.demand || {}) };
      let demandChanged = false;
      Object.entries(p.demanda || {}).forEach(([k, v]) => { if (sel[`demanda.${k}`] && v?.resposta) { demand[k] = v.resposta; demandChanged = true; } });
      const config = { ...project.config };
      if (demandChanged) config.demand = demand;
      if (sel.tipo && p.tipo_objeto) config.object_type = p.tipo_objeto;
      if (demandChanged || sel.tipo) patch.config = config;
      if (sel.pergunta && p.pergunta_executiva?.texto) patch.executive_question = p.pergunta_executiva.texto;
      if (Object.keys(patch).length) await update.mutateAsync(patch);
      await save.mutateAsync({ kind: 'nota', title: `Leitura de documentos: ${files.map(f => f.name).join(', ')}`.slice(0, 480), status: 'leitura_ia',
        data: { arquivos: files, propostas: p, aplicado: { ...created, demanda: demandChanged, pergunta: !!patch.executive_question }, data: today } });
      setDone(created);
      setResult(null); setFiles([]); setSel({});
    } catch (e) { setError(e); } finally { setApplying(false); }
  }

  const p = result?.proposals || {};
  const demandEntries = Object.entries(p.demanda || {}).filter(([, v]) => v?.resposta);

  return (
    <div className="pb-24">
      <PageTitle eyebrow="Leitura assistida" title="Ler documentos com o AIra"
        description="Envie entrevistas, atas, transcrições ou relatórios. O AIra propõe respostas da qualificação, evidências, pessoas, gaps e pendências, cada uma com o trecho de origem. Nada entra no projeto sem a sua revisão." />

      {done && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" />Propostas aplicadas</p>
          <p className="mt-1">{done.evidencia} evidência(s), {done.papel} pessoa(s), {done.gap} gap(s) e {done.pendencia} pendência(s) criadas. Revise grau de confiança e campos em branco antes de concluir.</p>
          <div className="mt-3 flex flex-wrap gap-3 font-semibold"><Link className="underline" to="../evidencias">Evidências</Link><Link className="underline" to="../gaps">Gaps</Link><Link className="underline" to="../pessoas">Pessoas</Link><Link className="underline" to="../pendencias">Pendências</Link><Link className="underline" to="..">Visão geral</Link></div>
        </div>
      )}

      {!result && (
        <Panel title="1. Documentos" description={`Até ${MAX_FILES} arquivos por leitura, 20 MB cada. PDF com texto, DOCX, TXT ou transcrições (.vtt, .srt).`}>
          <ul className="mb-3 space-y-2">{files.map(f => (
            <li key={f.path} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{f.name}</span></span>
              <button onClick={() => setFiles(files.filter(x => x.path !== f.path))} className="rounded-lg p-1 text-muted-foreground hover:bg-muted" aria-label="Remover"><X className="h-4 w-4" /></button>
            </li>
          ))}</ul>
          {files.length < MAX_FILES && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input px-4 py-8 text-sm text-muted-foreground hover:bg-muted/50">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              <span>{uploading ? 'Enviando…' : 'Clique para escolher os arquivos'}</span>
              <input type="file" multiple accept=".pdf,.docx,.txt,.md,.vtt,.srt" className="sr-only" disabled={uploading} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn disabled={!files.length || reading || uploading} onClick={read}>{reading ? <Loader2 className="animate-spin" /> : <Sparkles />}{reading ? 'Lendo os documentos…' : 'Ler com o AIra'}</Btn>
            {reading && <span className="text-xs text-muted-foreground">Pode levar até 2 minutos, conforme o tamanho dos arquivos.</span>}
          </div>
          <div className="mt-3"><ErrorNote error={error} /></div>
        </Panel>
      )}

      {result && (
        <div className="space-y-5">
          <Panel title="2. Revise as propostas" description="Marque o que aceitar. Itens já preenchidos no projeto vêm desmarcados para não sobrescrever.">
            {p.resumo && <p className="text-sm leading-6">{p.resumo}</p>}
            {result.unreadable?.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Não foi possível ler: {result.unreadable.join(', ')}. Verifique se o PDF tem texto selecionável.</p>}
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={registerDocs} onChange={e => setRegisterDocs(e.target.checked)} />Registrar cada documento enviado como evidência, com o arquivo anexado</label>
          </Panel>

          <Section title="Qualificação da demanda" count={demandEntries.length + (p.pergunta_executiva?.texto ? 1 : 0) + (p.tipo_objeto ? 1 : 0)}>
            {p.pergunta_executiva?.texto && (
              <Item checked={!!sel.pergunta} onChange={v => toggle('pergunta', v)}>
                <p className="font-medium">Pergunta executiva</p>
                <p className="mt-0.5">{p.pergunta_executiva.texto}</p>
                {p.pergunta_executiva.justificativa && <p className="mt-1 text-xs text-muted-foreground">{p.pergunta_executiva.justificativa}</p>}
                {project.executive_question && <p className="mt-1 text-xs text-amber-700">Substitui a atual: “{project.executive_question}”</p>}
              </Item>
            )}
            {p.tipo_objeto && (
              <Item checked={!!sel.tipo} onChange={v => toggle('tipo', v)}><p className="font-medium">Tipo de objeto: {nameOf(OBJECT_TYPES, p.tipo_objeto)}</p></Item>
            )}
            {demandEntries.map(([k, v]) => (
              <Item key={k} checked={!!sel[`demanda.${k}`]} onChange={val => toggle(`demanda.${k}`, val)}>
                <p className="font-medium">{DEMAND_QUESTIONS.find(q => q.id === k)?.text}</p>
                <p className="mt-0.5">{v.resposta}</p>
                {project.config?.demand?.[k] && <p className="mt-1 text-xs text-amber-700">Substitui a resposta atual.</p>}
                <Quote fonte={v.fonte} />
              </Item>
            ))}
          </Section>

          <Section title="Evidências" count={p.evidencias?.length} allOn={allOn('evidencias')} onAll={() => setAll('evidencias')}>
            {(p.evidencias || []).map((e, i) => (
              <Item key={i} checked={!!sel[`evidencias.${i}`]} onChange={v => toggle(`evidencias.${i}`, v)}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{e.titulo}</p>
                  <select value={conf[i] || ''} onChange={ev => setConf({ ...conf, [i]: ev.target.value })} className="h-8 rounded-lg border border-input bg-background px-2 text-xs">
                    {CONFIDENCE.map(c => <option key={c.id} value={c.id}>Confiança {c.name.toLowerCase()}</option>)}
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">{e.fonte_tipo}{e.origem ? ` · ${e.origem}` : ''}</p>
                {e.descricao && <p className="mt-1">{e.descricao}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Justificativa: {e.justificativa_confianca}</p>
                {e.divergencias && <p className="mt-1 text-xs text-amber-700">Divergência: {e.divergencias}</p>}
                <Quote fonte={e.fonte} />
              </Item>
            ))}
          </Section>

          <Section title="Pessoas e papéis" count={p.pessoas?.length} allOn={allOn('pessoas')} onAll={() => setAll('pessoas')}>
            {(p.pessoas || []).map((x, i) => (
              <Item key={i} checked={!!sel[`pessoas.${i}`]} onChange={v => toggle(`pessoas.${i}`, v)}>
                <p className="font-medium">{x.nome} {x.papel && <Pill tone="blue" className="ml-1">{nameOf(ROLES, x.papel)}</Pill>}</p>
                {(x.organizacao || x.autoridade) && <p className="text-xs text-muted-foreground">{[x.organizacao, x.autoridade].filter(Boolean).join(' · ')}</p>}
                <Quote fonte={x.fonte} />
              </Item>
            ))}
          </Section>

          <Section title="Gaps" count={p.gaps?.length} allOn={allOn('gaps')} onAll={() => setAll('gaps')}>
            {(p.gaps || []).map((g, i) => (
              <Item key={i} checked={!!sel[`gaps.${i}`]} onChange={v => toggle(`gaps.${i}`, v)}>
                <p className="font-medium">{g.titulo}</p>
                <p className="text-xs text-muted-foreground">{g.tipo === 'maturidade' ? 'De maturidade' : 'Operacional'} · dor {g.confirmacao}{g.processo ? ` · ${g.processo}` : ''}{g.tipo === 'operacional' ? (typeof g.dimensao_valor === 'number' ? ` · ${g.dimensao_valor} ${g.unidade || ''}` : ' · pendente de dimensionamento') : ''}</p>
                {g.descricao && <p className="mt-1">{g.descricao}</p>}
                <Quote fonte={g.fonte} />
              </Item>
            ))}
          </Section>

          <Section title="Pendências" count={p.pendencias?.length} allOn={allOn('pendencias')} onAll={() => setAll('pendencias')}>
            {(p.pendencias || []).map((x, i) => (
              <Item key={i} checked={!!sel[`pendencias.${i}`]} onChange={v => toggle(`pendencias.${i}`, v)}>
                <p className="font-medium">{x.titulo} {x.tipo === 'Bloqueio' && <Pill tone="red" className="ml-1">Bloqueio</Pill>}</p>
                <p className="text-xs text-muted-foreground">{x.impacto}{x.responsavel_sugerido ? ` · responsável sugerido: ${x.responsavel_sugerido}` : ''}</p>
                <Quote fonte={x.fonte} />
              </Item>
            ))}
          </Section>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-end gap-3">
              <ErrorNote error={error} />
              <span className="text-sm text-muted-foreground">{selectedCount} item(ns) selecionado(s)</span>
              <Btn variant="outline" onClick={() => { setResult(null); setSel({}); }}>Descartar</Btn>
              <Btn disabled={!selectedCount || applying} onClick={apply}>{applying && <Loader2 className="animate-spin" />}Aplicar ao projeto</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
