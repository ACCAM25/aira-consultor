import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, UserRound, MessageCircleQuestion, PenLine } from 'lucide-react';
import CaseComposer from '@/components/ari/CaseComposer';
import OpinionContent from '@/components/ari/OpinionContent';

const labels = {parecer:'Parecer prévio · AIra', pergunta:'Pergunta · AIra', resposta:'Sua resposta', nota:'Informação adicional', correcao:'Correção registrada', decisao:'Sua decisão', controle:'Condução do caso'};
export default function TimelineEntry({ entry, referencedEntry, busy, onCorrect, onDeleteOpinion }) {
  const [editing, setEditing] = useState(false);
  const isAri = entry.kind === 'parecer' || entry.kind === 'pergunta';
  return <article className={`rounded-2xl border p-5 sm:p-7 ${entry.kind === 'parecer' ? 'bg-white border-stone-200 shadow-sm' : entry.kind === 'pergunta' ? 'bg-blue-50 border-blue-100' : 'bg-[#f7f5ef] border-stone-200'}`}>
    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-bold tracking-wide text-primary">{entry.kind === 'parecer' ? <Sparkles size={16}/> : entry.kind === 'pergunta' ? <MessageCircleQuestion size={16}/> : <UserRound size={16}/>} {labels[entry.kind] || entry.kind}<span className="ml-auto text-stone-500 font-normal"><time dateTime={entry.created_date}>{new Date(entry.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></span></div>
    {entry.kind === 'correcao' && referencedEntry && <p className="mb-3 text-xs text-stone-600">Referente a: {labels[referencedEntry.kind] || referencedEntry.kind} de {new Date(referencedEntry.created_date).toLocaleDateString('pt-BR')}</p>}
    {entry.kind === 'parecer' ? <OpinionContent content={entry.content}/> : <div className="max-w-none text-sm text-slate-700 leading-relaxed [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:my-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-slate-900"><ReactMarkdown>{entry.content}</ReactMarkdown></div>}
    {entry.justification && <p className="mt-4 border-t pt-3 text-xs text-stone-600"><strong>Justificativa:</strong> {entry.justification}</p>}
    {isAri && <button type="button" disabled={busy} onClick={() => setEditing(value => !value)} className="mt-4 flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-primary disabled:opacity-50"><PenLine size={15}/>{editing ? 'Fechar correção' : 'Corrigir este registro'}</button>}
    {editing && isAri && <div className="mt-4"><CaseComposer key={entry.id} mode="correcao" targetLabel={entry.kind === 'pergunta' ? 'pergunta' : 'parecer'} onSubmit={(content,reason) => onCorrect(entry,content,reason)} onCancel={() => setEditing(false)} busy={busy} onDelete={entry.kind === 'parecer' ? () => onDeleteOpinion(entry) : undefined}/></div>}
  </article>;
}