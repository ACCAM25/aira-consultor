import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, MessageCircleQuestion, Scale, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/ari/BrandLogo';
import FlowMapStep from '@/components/ari/FlowMapStep';

const steps = [
  ['1', 'Preparar o caso', 'Você registra o objetivo, setor, site institucional e documentos. O sistema deixa claro o que é informado, verificável ou pendente.'],
  ['2', 'Retratar o processo', 'O AIra organiza processo, atores, entradas, decisões e saídas antes de avançar.'],
  ['3', 'Identificar gaps', 'Problemas operacionais e de maturidade são separados, com sua evidência e grau de confirmação.'],
  ['4', 'Dimensionar', 'Cada gap é quantificado com dados reais ou fica explicitamente pendente de dimensionamento.'],
  ['5', 'Triar o tratamento', 'O caso é avaliado como IA, melhoria de processo ou não agir por ora.'],
  ['6', 'Priorizar', 'As opções são ordenadas por Valor, Esforço e Risco, sem desenhar a implementação.'],
  ['7', 'Decidir e registrar', 'Você recebe a recomendação, decide livremente e registra riscos conhecidos quando optar por outro caminho.'],
];

export default function FlowMap() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"><div className="flex items-center gap-3"><BrandLogo /><div><h1 className="text-lg font-semibold">AIra Consultor</h1><p className="text-xs text-muted-foreground">Mapa da jornada atual</p></div></div><Link to="/casos" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-muted">Voltar aos casos</Link></div></header>
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><section className="max-w-3xl"><p className="text-xs font-bold tracking-[.2em] text-primary">DIAGNÓSTICO EXPRESS</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Como cada caso avança no AIra</h2><p className="mt-4 text-base leading-7 text-muted-foreground">A jornada organiza o diagnóstico em etapas claras, do retrato do processo ao ranking de prioridades. Cada pendência é tratada antes de avançar. A decisão permanece com você.</p></section>
      <section className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-7" aria-label="Etapas do fluxo atual">{steps.map(([number, title, detail], index) => <div className="contents" key={number}><FlowMapStep className="flex-1" number={number} title={title} detail={detail} tone={index === 1 ? 'bg-primary/5' : undefined} /></div>)}</section>
      <section className="mt-12 grid gap-5 md:grid-cols-3"><article className="rounded-2xl border border-border bg-card p-6"><FileText className="text-primary" /><h3 className="mt-4 font-semibold">Evidências e pendências</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Documentos e declarações são apresentados com sua origem. Sem dados suficientes, a pendência fica explícita.</p></article><article className="rounded-2xl border border-border bg-card p-6"><MessageCircleQuestion className="text-primary" /><h3 className="mt-4 font-semibold">Anamnese guiada</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Cada pergunta busca completar a etapa mais antiga ainda pendente, começando pelo que ajuda a dimensionar o gap.</p></article><article className="rounded-2xl border border-border bg-card p-6"><Scale className="text-primary" /><h3 className="mt-4 font-semibold">Orientação, não veto</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">A recomendação aponta o melhor próximo passo. Você pode seguir outra direção e manter a decisão registrada.</p></article></section>
      <section className="mt-8 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={18} />AIRA v2.1</div><p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/85">O Express indica o que fazer e por onde começar. O desenho da solução e sua implementação são conduzidos em uma etapa posterior.</p></div><Link to="/casos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-primary sm:mt-0">Abrir um caso <ArrowRight size={16} /></Link></section>
    </main>
  </div>;
}