import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import AppShell from '@/components/aira/AppShell';
import { Btn, Empty, ErrorNote, Loading, PageTitle, Pill, ProgressBar, fmtDate } from '@/components/aira/kit';
import { useProjects } from '@/api/data';
import { modeById, phaseById } from '@/canon/aira';
import { phaseProgress, projectPhases } from '@/canon/engine';

const STATUS = { configuracao: ['Em configuração', 'blue'], em_andamento: ['Em andamento', 'green'], pausado: ['Pausado', 'amber'], encerrado: ['Encerrado', 'slate'] };

export default function Projects() {
  const { data: projects, isLoading, error } = useProjects();
  return (
    <AppShell>
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10">
        <PageTitle eyebrow="AIra Consultor" title="Projetos" description="Cada projeto segue a espinha F0 a F6 do método, com uma pergunta decisória, evidências rastreáveis, gates e encerramento formal."
          action={<Link to="/novo"><Btn size="lg"><Plus />Novo projeto</Btn></Link>} />
        <ErrorNote error={error} />
        {isLoading ? <Loading /> : !projects?.length ? (
          <Empty icon={FolderKanban} title="Nenhum projeto ainda" text="Crie o primeiro projeto. O assistente guia a qualificação da demanda, a pergunta executiva e a escolha do modo de aplicação." action={<Link to="/novo"><Btn><Plus />Criar primeiro projeto</Btn></Link>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map(p => {
              const phases = projectPhases(p);
              const idx = phases.findIndex(ph => ph.id === p.current_phase);
              const current = phaseById(p.current_phase);
              const prog = current ? phaseProgress(p, current.id) : null;
              const [label, tone] = STATUS[p.status] || [p.status, 'slate'];
              return (
                <Link key={p.id} to={`/projetos/${p.id}`} className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.client_name}</p>
                      <h2 className="mt-1 line-clamp-2 font-semibold leading-snug group-hover:text-blue-800">{p.name}</h2>
                    </div>
                    <Pill tone={tone}>{label}</Pill>
                  </div>
                  {p.executive_question && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">“{p.executive_question}”</p>}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Pill tone="blue">{modeById(p.config?.mode)?.name || 'Modo não definido'}</Pill>
                    <Pill>{p.sector === 'publico' ? 'Setor público' : 'Setor privado'}</Pill>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>{p.status === 'encerrado' ? 'Encerrado' : current ? `${current.id} ${current.name} · fase ${idx + 1} de ${phases.length}` : '—'}</span>
                      {p.end_date && <span>fim {fmtDate(p.end_date)}</span>}
                    </div>
                    <ProgressBar value={prog?.done || 0} total={prog?.total || 1} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
