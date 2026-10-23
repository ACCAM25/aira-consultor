import React, { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import DeleteOpinionButton from '@/components/ari/DeleteOpinionButton';
export default function CaseComposer({ mode, question, onSubmit, onCancel, busy, hasQuestion, targetLabel, onDelete }) {
  const formRef = useRef(null);
  useEffect(() => { if (mode === 'resposta') formRef.current?.scrollIntoView({ block: 'center' }); }, [mode]);
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const titles = {correcao: targetLabel ? `Corrigir ${targetLabel}` : 'Corrigir parecer', decisao:'Registrar sua decisão', resposta:'Responder ao AIra', nota:'Acrescentar informação'};
  return <form ref={formRef} aria-label={titles[mode]} onSubmit={async e=>{e.preventDefault(); const ok = await onSubmit(content.trim(), reason.trim()); if(ok){setContent('');setReason('');onCancel();}}} className="rounded-2xl border bg-white p-5 space-y-3">
    <div className="flex items-center justify-between"><h3 className="font-semibold">{titles[mode]}</h3><button type="button" onClick={onCancel} aria-label="Fechar" className="p-1 hover:bg-stone-100 rounded"><X size={18}/></button></div>
    {mode==='resposta' && question && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="mb-2 text-xs font-semibold text-primary">Pergunta do AIra</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{question}</p></div>}
    <textarea aria-label={mode==='resposta'?'Sua resposta':titles[mode]} required maxLength={5000} rows={3} value={content} onChange={e=>setContent(e.target.value)} placeholder={mode==='correcao' ? 'O que deve ser interpretado de outra forma?' : mode==='resposta' ? 'Sua resposta à pergunta…' : mode==='decisao' ? 'Qual decisão você tomou?' : 'Que informação deseja acrescentar ao caso?'} className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700/30"/>
    {mode==='correcao' && onDelete && <DeleteOpinionButton onDelete={onDelete} busy={busy}/>}
    {mode==='decisao' && <div className="space-y-2"><p className="text-xs text-stone-600">Orienta, não restringe: você pode decidir contra a recomendação. Nesse caso, registre de quais riscos tem ciência. Seu nome e a data ficam registrados.</p><input maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Riscos conhecidos e, se aplicável, por que diverge da recomendação" className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700/30"/></div>}
    {mode==='correcao' && <input required maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Por que esta correção é necessária?" className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-700/30"/>}
    <div className="flex items-center justify-between gap-4"><p className="text-xs text-stone-500">{mode==='resposta' && hasQuestion ? 'O AIra atualizará o parecer após sua resposta.' : 'O registro anterior será preservado.'}</p><button disabled={busy} className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send size={15}/>{busy?'Salvando…':'Enviar'}</button></div>
  </form>;
}