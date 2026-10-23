import React from 'react';
import { Sparkles } from 'lucide-react';
import TimelineEntry from '@/components/ari/TimelineEntry';
export default function CaseTimeline({ entries, processing, busy, onCorrect, onDeleteOpinion }) {
  return <div className="space-y-5">{!entries.length && <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 sm:p-12 text-center"><div className="mx-auto mb-5 grid place-items-center w-12 h-12 rounded-2xl bg-blue-50 text-primary"><Sparkles size={22}/></div><h2 className="text-xl font-semibold">O parecer começa pelo seu objetivo.</h2><p className="mt-3 text-sm text-stone-600 leading-relaxed max-w-md mx-auto">Peça um parecer prévio sobre o cenário e a solução descritos no objetivo. Se tiver documentos, anexe-os para aprofundar a análise.</p></div>}
    {entries.map(entry => <TimelineEntry key={entry.id} entry={entry} referencedEntry={entries.find(e => e.id === entry.reference_id)} busy={busy} onCorrect={onCorrect} onDeleteOpinion={onDeleteOpinion}/>)}
    {processing && <div role="status" className="rounded-2xl bg-white border p-6 text-sm text-primary animate-pulse">O AIra está lendo os documentos e preparando o parecer…</div>}
  </div>;
}