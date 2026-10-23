import React from 'react';
import { FolderOpen, Clock3, Loader2, FileCheck2, CircleAlert, Hand } from 'lucide-react';

const indicators = [
  { key: 'total', label: 'Total de casos', icon: FolderOpen },
  { key: 'pendente', label: 'Com pendência', icon: CircleAlert },
  { key: 'novo', label: 'Sem parecer', icon: Clock3 },
  { key: 'em_analise', label: 'Em análise', icon: Loader2 },
  { key: 'conducao_usuario', label: 'Com você', icon: Hand },
  { key: 'parecer_emitido', label: 'Parecer emitido', icon: FileCheck2 }
];

export default function ProjectHealthSummary({ projects }) {
  return <section aria-label="Saúde dos casos" className="space-y-4">
    <div><h2 className="text-lg font-semibold text-foreground">Visão geral dos casos</h2><p className="mt-1 text-sm text-muted-foreground">Comece pelos indicadores e acompanhe os projetos por etapa abaixo.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {indicators.map(({ key, label, icon: Icon }) => {
        const count = key === 'total' ? projects.length : projects.filter(p => (p.status || 'novo') === key).length;
        return <div key={key} data-status={key} className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${key === 'total' ? 'border-primary bg-primary text-primary-foreground' : 'border-primary/20 bg-card text-card-foreground'}`}>
          <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{label}</p><Icon size={17} className={`shrink-0 ${key === 'total' ? 'text-primary-foreground' : 'text-primary'}`} /></div>
          <p className="mt-3 text-3xl font-semibold" data-count={count}>{count}</p>
          {key !== 'total' && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full bg-primary" style={{ width: `${projects.length ? count / projects.length * 100 : 0}%` }} /></div>}
        </div>;
      })}
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">A saúde indica o andamento e as pendências, não a aprovação da solução. Parecer emitido não significa caso encerrado; não há encerramento registrado nesta versão.</p>
  </section>;
}