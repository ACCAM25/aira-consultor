import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleAlert } from 'lucide-react';

function excerpt(content) {
  const recommendation = content.match(/(?:^|\n)#{1,6}\s*Recomenda[^\n]*\n([\s\S]*?)(?=\n#{1,6}\s|$)/i);
  return (recommendation?.[1] || content).replace(/^#{1,6}\s+/gm, '').replace(/\*\*|__/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim().slice(0, 1000);
}

export default function ProjectAnalysisCard({ project, opinion, statusLabel }) {
  const pending = project.status === 'pendente';
  return <Link to={`/casos?case=${encodeURIComponent(project.id)}`} className="flex min-w-0 flex-col rounded-2xl border border-primary/20 bg-card p-5 shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <div className="flex items-start justify-between gap-3"><h3 className="break-words text-lg font-semibold leading-snug text-card-foreground">{project.title}</h3><ArrowUpRight size={18} className="shrink-0 text-primary" /></div>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{statusLabel}</span><span className="text-muted-foreground">Setor {project.sector === 'publico' ? 'público' : 'privado'}</span></div>
    <div className="mt-5 rounded-xl bg-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Resumo da análise</p>
      <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{opinion ? excerpt(opinion.content) : 'Ainda não há parecer. Abra o caso para solicitar a primeira análise.'}</p>
      {opinion && <p className="mt-3 text-xs text-muted-foreground">Trecho do último parecer · {new Date(opinion.created_date).toLocaleDateString('pt-BR')}</p>}
    </div>
    {pending && <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-primary"><CircleAlert size={14} />Aprofundamento disponível</p><p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-foreground">{project.pending_reason || project.pending_question || 'Há uma lacuna que pode alterar a recomendação.'}</p></div>}
    {project.status === 'conducao_usuario' && <p className="mt-3 rounded-xl bg-muted p-3 text-xs leading-relaxed text-foreground">Devolva a condução ao AIra para solicitar outra análise.</p>}
    <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Objetivo da avaliação</p><p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{project.objective}</p></div>
    <span className="mt-auto flex items-center justify-between gap-2 pt-5 text-sm font-semibold text-primary">Abrir caso e ver histórico<ArrowUpRight size={16} className="shrink-0" /></span>
  </Link>;
}