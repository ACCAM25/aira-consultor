import React from 'react';
import ProjectAnalysisCard from '@/components/ari/ProjectAnalysisCard';

export default function ProjectStatusGroup({ label, projects, opinions = {} }) {
  return <section className="space-y-4 rounded-2xl border border-primary/15 bg-background p-4 sm:p-6" aria-label={label}>
    <div className="flex items-center gap-3 border-b border-primary/15 pb-4"><h2 className="text-lg font-semibold text-primary">{label}</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{projects.length}</span></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {projects.map(project => <ProjectAnalysisCard key={project.id} project={project} opinion={opinions[project.id]} statusLabel={label} />)}
    </div>
  </section>;
}