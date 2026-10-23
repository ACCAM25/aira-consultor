import React from 'react';
import { Sparkles, MessageCircleQuestion, PenLine, Hand, RotateCcw } from 'lucide-react';
import { currentDiagnosticStage, nextDiagnosticStage } from '@/lib/diagnosticStages';
export default function CaseActions({ item, hasOpinion, busy, onAnalyze, onDeepen, onCorrect, onTakeOver, onReturn, onDecision, onNote }) {
  const stage = currentDiagnosticStage(item.diagnostic_stage);
  const nextStage = nextDiagnosticStage(item.diagnostic_stage);
  const actionLabel = item.diagnostic_stage === 'complete' ? 'Diagnóstico concluído' : hasOpinion ? `Continuar: ${stage.shortLabel}` : `Iniciar: ${stage.shortLabel}`;
  return <div className="flex flex-wrap items-center gap-2"><button disabled={busy || item.status==='conducao_usuario' || item.diagnostic_stage==='complete' || Boolean(item.pending_question)} onClick={onAnalyze} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Sparkles size={16}/>{busy ? 'Analisando…' : actionLabel}</button>
    {item.pending_question && item.status==='pendente' && <button disabled={busy} onClick={onDeepen} className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-900"><MessageCircleQuestion size={16}/>Responder para avançar</button>}
    <button disabled={busy || !hasOpinion} onClick={onCorrect} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-40"><PenLine size={16}/>Corrigir registro</button>
    <button disabled={busy} onClick={onNote} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium">Acrescentar informação</button>
    <button disabled={busy} onClick={onDecision} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-medium">Registrar decisão</button>
    <button disabled={busy} onClick={item.status==='conducao_usuario'? onReturn : onTakeOver} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium">{item.status==='conducao_usuario' ? <><RotateCcw size={16}/>Devolver ao AIra</> : <><Hand size={16}/>Assumir condução</>}</button>
    <p className="w-full text-xs text-stone-600" role="status">{item.diagnostic_stage === 'complete' ? 'As cinco etapas foram registradas. A decisão final continua com você.' : item.pending_question ? 'Responda à pergunta para concluir a etapa atual.' : `Próxima etapa: ${nextStage?.label || stage.label}.`}</p>
  </div>;
}