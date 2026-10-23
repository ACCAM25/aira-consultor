import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import ProjectStatusGroup from '@/components/ari/ProjectStatusGroup';
import BrandLogo from '@/components/ari/BrandLogo';
import ProjectHealthSummary from '@/components/ari/ProjectHealthSummary';

const statuses = [
  { key: 'pendente', label: 'Aprofundamento opcional' },
  { key: 'novo', label: 'Aguardando parecer' },
  { key: 'em_analise', label: 'Em análise' },
  { key: 'conducao_usuario', label: 'Condução com você' },
  { key: 'parecer_emitido', label: 'Parecer emitido' }
];

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [opinions, setOpinions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const all = [];
        let page;
        do {
          page = await api.entities.ConsultingCase.list('-created_date', 500, all.length);
          all.push(...page);
        } while (page.length === 500);
        const latest = await Promise.all(all.map(async project => {
          const records = await api.entities.CaseEntry.filter({ case_id: project.id, kind: 'parecer' }, '-created_date', 1);
          return [project.id, records[0] || null];
        }));
        if (active) { setProjects(all); setOpinions(Object.fromEntries(latest)); }
      } catch (e) { if (active) setError(e.message || 'Não foi possível carregar os projetos.'); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [retry]);
  return <div className="min-h-screen bg-muted text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-8"><span className="flex items-center gap-2 font-semibold"><BrandLogo className="h-9 w-20" />AIra Consultor</span><Link to="/casos" className="text-sm font-semibold text-primary hover:underline">Voltar aos casos</Link></div></header>
    <main className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-8 sm:py-10"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Painel central</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Todos os projetos</h1><p className="mt-2 text-sm text-muted-foreground">Status, pendências e últimos pareceres para acompanhar a saúde dos casos.</p></div>
      {loading ? <p role="status" className="text-sm text-muted-foreground">Carregando projetos…</p> : error ? <div role="alert" className="text-sm"><p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="mt-2 font-semibold text-primary underline">Tentar novamente</button></div> : projects.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card p-8"><p className="text-muted-foreground">Nenhum projeto criado ainda.</p><Link to="/casos" className="mt-3 inline-block font-semibold text-primary underline">Criar primeiro projeto</Link></div> : <><ProjectHealthSummary projects={projects}/>{statuses.map(status => { const group = projects.filter(project => (project.status || 'novo') === status.key); return group.length ? <ProjectStatusGroup key={status.key} label={status.label} projects={group} opinions={opinions}/> : null; })}</>}
    </main>
  </div>;
}