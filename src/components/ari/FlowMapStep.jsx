import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function FlowMapStep({ number, title, detail, tone = 'bg-card', className = '' }) {
  return <div className={`flex flex-col items-center gap-3 ${className}`}>
    <article className={`w-full rounded-2xl border border-border ${tone} p-5 shadow-sm`}>
      <p className="text-xs font-bold tracking-[.18em] text-primary">ETAPA {number}</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </article>
    <ArrowDown className="h-5 w-5 text-primary lg:hidden" aria-hidden="true" />
  </div>;
}