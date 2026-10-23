import React from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { BookOpenCheck, CircleAlert, ScanText, FileSearch, FileText, GitBranch, Gavel, LayoutDashboard, Route, Send, Settings2, ShieldCheck, Target, Users, Wrench } from 'lucide-react';
import AppShell from '@/components/aira/AppShell';
import { ErrorNote, Loading, Pill } from '@/components/aira/kit';
import { useMyRole, useProject, useRecords } from '@/api/data';
import { phaseById } from '@/canon/aira';
import { cn } from '@/lib/utils';

const NAV = [
  { group: 'Projeto', items: [
    { to: '', label: 'Visão geral', icon: LayoutDashboard, end: true },
    { to: 'jornada', label: 'Jornada F0–F6', icon: Route },
    { to: 'configuracao', label: 'Configuração', icon: Settings2 },
    { to: 'pessoas', label: 'Pessoas e equipe', icon: Users },
    { to: 'leitura', label: 'Ler documentos (IA)', icon: ScanText },
  ] },
  { group: 'Registros', items: [
    { to: 'evidencias', label: 'Evidências', icon: FileSearch, kind: 'evidencia' },
    { to: 'gaps', label: 'Gaps e prioridades', icon: Target, kind: 'gap' },
    { to: 'decisoes', label: 'Decisões', icon: Gavel, kind: 'decisao' },
    { to: 'gates', label: 'Gates', icon: ShieldCheck, kind: 'gate' },
    { to: 'pendencias', label: 'Pendências', icon: CircleAlert, kind: 'pendencia' },
    { to: 'mudancas', label: 'Mudanças', icon: GitBranch, kind: 'mudanca' },
    { to: 'encaminhamentos', label: 'Encaminhamentos', icon: Send, kind: 'encaminhamento' },
    { to: 'instrumentos', label: 'Instrumentos', icon: Wrench, kind: 'instrumento' },
    { to: 'entregaveis', label: 'Entregáveis', icon: FileText, kind: 'entregavel' },
  ] },
  { group: 'Fechamento', items: [
    { to: 'dossie', label: 'Dossiê e handoff', icon: BookOpenCheck },
  ] },
];

export default function ProjectLayout() {
  const { id } = useParams();
  const project = useProject(id);
  const records = useRecords(id);
  const role = useMyRole(id);
  const p = project.data;
  const counts = (records.data || []).reduce((acc, r) => { if (!r.archived) acc[r.kind] = (acc[r.kind] || 0) + 1; return acc; }, {});
  const phase = phaseById(p?.current_phase);

  const link = (item, compact) => (
    <NavLink key={item.to} to={item.to} end={item.end}
      className={({ isActive }) => cn('flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors', compact && 'shrink-0', isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-muted')}>
      <item.icon className="h-4 w-4 shrink-0" /><span className="truncate">{item.label}</span>
      {!compact && item.kind && counts[item.kind] ? <span className="ml-auto text-xs opacity-60">{counts[item.kind]}</span> : null}
    </NavLink>
  );

  return (
    <AppShell crumb={p?.name}>
      {project.isLoading || records.isLoading ? <Loading /> : !p ? (
        <div className="mx-auto max-w-xl px-4 py-16"><ErrorNote error={project.error || new Error('Projeto não encontrado ou sem acesso.')} /></div>
      ) : (
        <div className="mx-auto flex max-w-[1440px] gap-6 px-4 sm:px-6">
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto py-6 lg:block print:hidden">
            <div className="mb-5 px-3">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.client_name}</p>
              <p className="mt-0.5 line-clamp-2 font-semibold leading-snug">{p.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.status === 'encerrado' ? <Pill>Encerrado</Pill> : p.status === 'configuracao' ? <Pill tone="blue">Em configuração</Pill> : phase && <Pill tone="green">{phase.id} {phase.name}</Pill>}
                {role.data === 'cliente' && <Pill tone="amber">Somente leitura</Pill>}
              </div>
            </div>
            {NAV.map(g => (
              <div key={g.group} className="mb-4">
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{g.group}</p>
                <nav className="space-y-0.5">{g.items.map(i => link(i))}</nav>
              </div>
            ))}
          </aside>
          <div className="min-w-0 flex-1 py-6 sm:py-8">
            <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-border px-4 pb-3 lg:hidden print:hidden">{NAV.flatMap(g => g.items).map(i => link(i, true))}</nav>
            <Outlet context={{ project: p, records: records.data || [], role: role.data, readOnly: role.data === 'cliente' || p.status === 'encerrado' }} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
