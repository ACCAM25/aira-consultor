import React from 'react';
import ReactMarkdown from 'react-markdown';

const sections = [
  'Objetivo e cenário',
  'Avaliação da solução proposta e sua coerência com o problema',
  'Pontos favoráveis e fragilidades',
  'Evidências disponíveis e o que não foi verificado',
  'Riscos e alternativas',
  'Recomendação provisória fundamentada',
  'Necessidade de anamnese',
  'Escopo e informações recebidas',
  'Etapa 1. Retrato dos processos',
  'Etapa 2. Identificação dos problemas',
  'Etapa 3. Dimensionamento',
  'Etapa 4. Triagem de tratamento',
  'Etapa 5. Ranking por Valor, Esforço e Risco',
  'Posição na régua de maturidade',
  'Pendências e próximos dados a levantar',
  'Recomendação do Express e fronteira com a implementação',
];

function formatOpinion(content) {
  const separated = (content || '').replace(/[ \t]+(#{1,6})[ \t]+/g, '\n\n$1 ');
  const headings = new RegExp(`^(#{1,6}[ \\t]+(?:\\d+[.)][ \\t]+)?(?:${sections.join('|')})[ \\t]*:?) +(?=\\S)`, 'gim');
  return separated.replace(headings, '$1\n\n');
}

export default function OpinionContent({ content }) {
  return <div data-opinion-content className="min-w-0 max-w-none break-words text-sm leading-7 text-foreground [&_h1]:mb-6 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:leading-snug [&_h1]:text-primary [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-primary [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-primary [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:font-semibold [&_strong]:text-primary [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_hr]:my-6 [&_a]:text-primary [&_a]:underline [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4">
    <ReactMarkdown>{formatOpinion(content)}</ReactMarkdown>
  </div>;
}