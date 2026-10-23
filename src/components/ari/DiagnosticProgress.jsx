import React from 'react';
import { Check } from 'lucide-react';
import { diagnosticStages } from '@/lib/diagnosticStages';

export default function DiagnosticProgress({ stage = 'processes' }) {
  const currentIndex = stage === 'complete' ? diagnosticStages.length : Math.max(0, diagnosticStages.findIndex(item => item.id === stage));
  return <section className="rounded-2xl border border-stone-200 bg-white p-5">
    <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[.15em] uppercase text-stone-500">Diagnóstico Express</p><p className="mt-1 text-sm text-stone-700">Uma etapa por vez, com pendências claras.</p></div><span className="text-sm font-semibold text-primary">{stage === 'complete' ? 'Concluído' : `${currentIndex + 1} de 5`}</span></div>
    <ol className="mt-5 grid gap-3 sm:grid-cols-5">{diagnosticStages.map((item, index) => { const done = index < currentIndex || stage === 'complete'; const active = index === currentIndex && stage !== 'complete'; return <li key={item.id} className="min-w-0"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-primary text-primary-foreground' : active ? 'border-2 border-primary text-primary' : 'bg-stone-100 text-stone-400'}`}>{done ? <Check size={15} /> : index + 1}</div><p className={`mt-2 text-xs leading-4 ${active ? 'font-semibold text-primary' : done ? 'text-stone-700' : 'text-stone-400'}`}>{item.shortLabel}</p></li>; })}</ol>
  </section>;
}