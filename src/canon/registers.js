// Registros do projeto (§24 Modelos mínimos de registro) descritos como dados.
// Cada registro gera lista, formulário e exportação a partir desta configuração.
import { CONFIDENCE, CONCLUSIONS, EVIDENCE_SOURCES, GATES, GATE_RESULTS, GAP_TREATMENTS, INSTRUMENTS, MODULES, PHASES, ROLES, gapPriority, PRIORITY_BANDS, nameOf } from './aira';

const phaseOptions = PHASES.map(p => ({ id: p.id, name: `${p.id} ${p.name}` }));
const moduleOptions = MODULES.map(m => ({ id: m.id, name: `${m.id} ${m.name}` }));
const opts = list => list.map(x => (typeof x === 'string' ? { id: x, name: x } : x));

export const REGISTERS = {
  evidencia: {
    label: 'Evidências', singular: 'Evidência', newLabel: 'Nova evidência', path: 'evidencias', icon: 'FileSearch',
    intro: 'Toda conclusão deve citar evidência, ausência, limitação ou dependência. Declaração de entrevistado orienta investigação, mas não comprova a condição.',
    statusField: 'confianca',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'descricao', label: 'Descrição', type: 'textarea' },
      { key: 'fonte', label: 'Tipo de fonte', type: 'select', options: opts(EVIDENCE_SOURCES), required: true },
      { key: 'origem', label: 'Origem e responsável', type: 'text' },
      { key: 'data_evidencia', label: 'Data', type: 'date', half: true },
      { key: 'validade', label: 'Válida até', type: 'date', half: true },
      { key: 'phase', label: 'Fase', type: 'select', options: phaseOptions, half: true },
      { key: 'module', label: 'Módulo', type: 'select', options: moduleOptions, half: true },
      { key: 'responde_a', label: 'Pergunta ou gate a que responde', type: 'text' },
      { key: 'restricao', label: 'Restrição de acesso', type: 'text' },
      { key: 'completude', label: 'Completude e atualidade', type: 'textarea' },
      { key: 'divergencias', label: 'Divergências conhecidas', type: 'textarea', hint: 'Registre ambas as fontes sem escolher silenciosamente uma delas.' },
      { key: 'confianca', label: 'Grau de confiança', type: 'select', options: CONFIDENCE, required: true, help: c => CONFIDENCE.find(x => x.id === c)?.use },
      { key: 'justificativa_confianca', label: 'Justificativa do grau de confiança', type: 'textarea', required: true },
      { key: 'conclusao', label: 'Conclusão que sustenta ou limita', type: 'textarea' },
      { key: 'fonte_documento', label: 'Documento e trecho de origem', type: 'textarea', hint: 'Preenchido quando o registro veio da leitura de documentos.' },
      { key: 'arquivos', label: 'Arquivos', type: 'files' },
    ],
    columns: ['code', 'title', 'fonte', 'phase', 'confianca'],
  },
  gap: {
    label: 'Gaps e prioridades', singular: 'Gap', newLabel: 'Novo gap', path: 'gaps', icon: 'Target',
    intro: 'Gap operacional é dimensionado na sua unidade própria; gap de maturidade, na distância da régua. Sem dado, o gap fica pendente de dimensionamento e fora do ranking. Nunca transforme ausência em zero.',
    fields: [
      { key: 'title', label: 'Gap', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo de gap', type: 'select', required: true, options: [{ id: 'operacional', name: 'Operacional' }, { id: 'maturidade', name: 'De maturidade' }], hint: 'Operacional: diferença de desempenho, custo, tempo ou qualidade do processo. De maturidade: capacidade organizacional insuficiente.' },
      { key: 'processo', label: 'Processo ou tarefa', type: 'text' },
      { key: 'descricao', label: 'Problema atual e evidência da ocorrência', type: 'textarea' },
      { key: 'confirmacao', label: 'A dor é', type: 'select', options: [{ id: 'confirmada', name: 'Confirmada por evidência' }, { id: 'percebida', name: 'Apenas percebida' }], half: true },
      { key: 'module', label: 'Módulo', type: 'select', options: moduleOptions, half: true },
      { key: 'evidencias', label: 'Evidências', type: 'refs', refKind: 'evidencia' },
      { key: 'unidade', label: 'Unidade de dimensionamento', type: 'text', half: true, showIf: d => d.tipo === 'operacional', hint: 'Ex.: horas/mês, R$/ano, % de retrabalho' },
      { key: 'dimensao_valor', label: 'Dimensão', type: 'number', half: true, showIf: d => d.tipo === 'operacional', hint: 'Deixe vazio se não houver dado: o gap fica pendente.' },
      { key: 'dimensao_conta', label: 'Memória de cálculo e fonte dos dados', type: 'textarea', showIf: d => d.tipo === 'operacional' },
      { key: 'nivel_atual', label: 'Nível atual', type: 'select', half: true, showIf: d => d.tipo === 'maturidade', options: opts(['L1 Inicial', 'L2 Gerenciado', 'L3 Definido', 'L4 Gerenciado quantitativamente', 'L5 Otimizado', 'Não determinável com os dados atuais']) },
      { key: 'nivel_alvo', label: 'Nível necessário', type: 'select', half: true, showIf: d => d.tipo === 'maturidade', options: opts(['L1 Inicial', 'L2 Gerenciado', 'L3 Definido', 'L4 Gerenciado quantitativamente', 'L5 Otimizado']) },
      { key: 'causa', label: 'Causa', type: 'textarea', half: true },
      { key: 'consequencia', label: 'Consequência', type: 'textarea', half: true },
      { key: 'dependencias', label: 'Dependências e precedências', type: 'textarea' },
      { key: 'bloqueia', label: 'Bloqueia outros gaps (tratar antes das ondas)', type: 'boolean' },
      { key: 'fonte_documento', label: 'Documento e trecho de origem', type: 'textarea', hint: 'Preenchido quando o registro veio da leitura de documentos.' },
      { key: 'section_triagem', type: 'section', label: 'Triagem do tratamento', showIf: d => d.tipo === 'operacional' },
      { key: 'eixo_volume', label: 'Repetição e volume', type: 'select', half: true, showIf: d => d.tipo === 'operacional', options: opts(['Alta repetição e volume', 'Média', 'Rara ou baixo volume']) },
      { key: 'eixo_natureza', label: 'Natureza da tarefa', type: 'select', half: true, showIf: d => d.tipo === 'operacional', options: opts(['Regra determinística', 'Linguagem, contexto ou ambiguidade', 'Julgamento humano genuíno']) },
      { key: 'eixo_custo_erro', label: 'Custo de errar', type: 'select', half: true, showIf: d => d.tipo === 'operacional', options: opts(['Baixo', 'Moderado', 'Alto (jurídico, financeiro ou humano)']) },
      { key: 'tratamento', label: 'Tratamento indicado', type: 'select', half: true, showIf: d => d.tipo === 'operacional', options: GAP_TREATMENTS },
      { key: 'alternativas', label: 'Alternativas comparadas (manter, redesenhar, automação convencional, IA)', type: 'textarea', showIf: d => d.tipo === 'operacional', requiredIf: d => d.tipo === 'operacional' && d.tratamento === 'ia', hint: 'Obrigatório quando o tratamento é IA (§21.3).' },
      { key: 'section_prioridade', type: 'section', label: 'Prioridade = 3V + (6 − E) + (6 − R)', showIf: d => d.tipo === 'operacional' },
      { key: 'valor', label: 'Valor do tratamento (1 a 5)', type: 'scale', third: true, showIf: d => d.tipo === 'operacional', hint: 'Inclui o risco de não agir.' },
      { key: 'esforco', label: 'Esforço (1 a 5)', type: 'scale', third: true, showIf: d => d.tipo === 'operacional' },
      { key: 'risco', label: 'Risco de executar (1 a 5)', type: 'scale', third: true, showIf: d => d.tipo === 'operacional' },
      { key: 'onda', label: 'Onda', type: 'number', half: true, showIf: d => d.tipo === 'operacional' },
    ],
    derive: data => {
      const p = gapPriority(data);
      return { status: data.tipo === 'maturidade' ? 'maturidade' : p.band, data: { ...data, prioridade: p.score } };
    },
    columns: ['code', 'title', 'tipo', 'tratamento', 'prioridade', 'status'],
    statusName: s => (s === 'maturidade' ? 'Maturidade' : PRIORITY_BANDS[s]?.name || s),
    statusTone: s => PRIORITY_BANDS[s]?.tone || 'slate',
  },
  decisao: {
    label: 'Decisões', singular: 'Decisão', newLabel: 'Nova decisão', path: 'decisoes', icon: 'Gavel',
    intro: 'O AIra recomenda, condiciona e encaminha. A decisão final pertence à autoridade competente do cliente (§2.3).',
    fields: [
      { key: 'title', label: 'Objeto da decisão', type: 'text', required: true },
      { key: 'data_decisao', label: 'Data', type: 'date', half: true },
      { key: 'phase', label: 'Fase', type: 'select', options: phaseOptions, half: true },
      { key: 'contexto', label: 'Contexto', type: 'textarea' },
      { key: 'opcoes', label: 'Opções consideradas', type: 'textarea', required: true },
      { key: 'evidencias', label: 'Evidências utilizadas', type: 'refs', refKind: 'evidencia' },
      { key: 'recomendacao', label: 'Recomendação AIra', type: 'textarea' },
      { key: 'conclusao', label: 'Conclusão (quando parecer de viabilidade)', type: 'select', options: CONCLUSIONS },
      { key: 'decisao', label: 'Decisão tomada', type: 'textarea', required: true },
      { key: 'autoridade', label: 'Autoridade que decidiu', type: 'text', required: true, half: true },
      { key: 'participantes', label: 'Participantes', type: 'text', half: true },
      { key: 'condicoes', label: 'Condições, responsáveis e prazos', type: 'textarea' },
      { key: 'impacto', label: 'Impacto em escopo, gate ou fase', type: 'textarea' },
      { key: 'excecao', label: 'É exceção registrada (avanço contra recomendação ou critério)', type: 'boolean' },
      { key: 'reavaliacao', label: 'Necessidade de reavaliação', type: 'text' },
    ],
    statusField: 'conclusao',
    columns: ['code', 'title', 'autoridade', 'data_decisao', 'conclusao'],
  },
  gate: {
    label: 'Gates', singular: 'Ata de gate', newLabel: 'Nova ata de gate', path: 'gates', icon: 'ShieldCheck',
    intro: 'Gates são pontos de controle acionados por decisão, impacto, risco, autonomia ou mudança material. Não são fases e podem ser reaplicados. Gate AIra não substitui parecer obrigatório.',
    fields: [
      { key: 'gate', label: 'Gate', type: 'select', options: GATES, required: true, help: g => { const x = GATES.find(i => i.id === g); return x ? `${x.question} Autoridade final: ${x.authority}.` : null; } },
      { key: 'title', label: 'Objeto do gate', type: 'text', required: true },
      { key: 'data_gate', label: 'Data', type: 'date', half: true },
      { key: 'phase', label: 'Fase', type: 'select', options: phaseOptions, half: true },
      { key: 'autoridade', label: 'Autoridade decisória', type: 'text', required: true, half: true },
      { key: 'participantes', label: 'Participantes', type: 'text', half: true },
      { key: 'criterios', label: 'Critérios avaliados', type: 'textarea' },
      { key: 'evidencias', label: 'Pacote de evidências', type: 'refs', refKind: 'evidencia' },
      { key: 'ausencias', label: 'Ausências e pareceres pendentes', type: 'textarea' },
      { key: 'resultado', label: 'Resultado', type: 'select', options: GATE_RESULTS, required: true },
      { key: 'justificativa', label: 'Justificativa', type: 'textarea', required: true },
      { key: 'condicoes', label: 'Condições, responsáveis e prazos', type: 'textarea' },
      { key: 'reavaliacao', label: 'Data de reavaliação', type: 'date', half: true },
    ],
    statusField: 'resultado',
    columns: ['code', 'gate', 'title', 'data_gate', 'resultado'],
  },
  pendencia: {
    label: 'Pendências e bloqueios', singular: 'Pendência', newLabel: 'Nova pendência', path: 'pendencias', icon: 'CircleAlert',
    intro: 'Item aberto que requer evidência, ação ou decisão. Bloqueio impede avanço até ser resolvido ou aceito pela autoridade competente.',
    fields: [
      { key: 'title', label: 'Descrição', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: opts(['Pendência', 'Bloqueio']), half: true },
      { key: 'severidade', label: 'Severidade', type: 'select', options: opts(['Baixa', 'Média', 'Alta', 'Crítica']), half: true },
      { key: 'origem', label: 'Origem', type: 'text' },
      { key: 'impacto', label: 'Impacto', type: 'textarea' },
      { key: 'responsavel', label: 'Responsável', type: 'text', required: true, half: true },
      { key: 'prazo', label: 'Prazo', type: 'date', half: true },
      { key: 'dependencia', label: 'Dependência', type: 'text' },
      { key: 'resposta', label: 'Ação de resposta', type: 'textarea' },
      { key: 'condicao', label: 'Condição de resolução', type: 'text' },
      { key: 'fonte_documento', label: 'Documento e trecho de origem', type: 'textarea', hint: 'Preenchido quando o registro veio da leitura de documentos.' },
      { key: 'estado', label: 'Estado', type: 'select', options: [{ id: 'aberta', name: 'Aberta' }, { id: 'andamento', name: 'Em andamento' }, { id: 'resolvida', name: 'Resolvida' }, { id: 'aceita', name: 'Aceita pela autoridade' }], required: true, default: 'aberta' },
    ],
    statusField: 'estado',
    columns: ['code', 'title', 'responsavel', 'prazo', 'estado'],
  },
  mudanca: {
    label: 'Controle de mudanças', singular: 'Mudança', newLabel: 'Nova mudança', path: 'mudancas', icon: 'GitBranch',
    intro: 'Nova demanda não é absorvida informalmente. Toda mudança material de modo, fase, módulo, profundidade ou entregável precisa de decisão do sponsor (§2.6).',
    fields: [
      { key: 'title', label: 'Fato que originou a mudança', type: 'text', required: true },
      { key: 'impacto', label: 'Impacto em fases, módulos, profundidade, prazo e equipe', type: 'textarea', required: true },
      { key: 'entregavel', label: 'Novo entregável ou alteração do aceite', type: 'textarea' },
      { key: 'decisao', label: 'Decisão do sponsor', type: 'select', options: [{ id: 'pendente', name: 'Pendente' }, { id: 'aprovada', name: 'Aprovada' }, { id: 'rejeitada', name: 'Rejeitada' }], required: true, default: 'pendente' },
      { key: 'instrumento', label: 'Necessidade de aditivo, nova ordem de serviço ou novo projeto', type: 'text' },
    ],
    statusField: 'decisao',
    columns: ['code', 'title', 'decisao'],
  },
  encaminhamento: {
    label: 'Encaminhamentos especializados', singular: 'Encaminhamento', newLabel: 'Novo encaminhamento', path: 'encaminhamentos', icon: 'Send',
    intro: 'Quando um tema ultrapassa a competência do projeto: registre a pergunta, a competência requerida e limite a conclusão até o retorno (§2.4 e §20).',
    fields: [
      { key: 'title', label: 'Tema', type: 'text', required: true },
      { key: 'pergunta', label: 'Pergunta objetiva', type: 'textarea', required: true },
      { key: 'razao', label: 'Por que a resposta é material para a decisão', type: 'textarea' },
      { key: 'competencia', label: 'Competência requerida', type: 'text', half: true },
      { key: 'formato', label: 'Formato de retorno esperado', type: 'text', half: true },
      { key: 'evidencias', label: 'Evidências fornecidas', type: 'refs', refKind: 'evidencia' },
      { key: 'responsavel', label: 'Responsável', type: 'text', half: true },
      { key: 'prazo', label: 'Prazo', type: 'date', half: true },
      { key: 'impacto_ausencia', label: 'Impacto da ausência', type: 'textarea' },
      { key: 'estado', label: 'Estado', type: 'select', options: [{ id: 'solicitado', name: 'Solicitado' }, { id: 'recebido', name: 'Retorno recebido' }, { id: 'integrado', name: 'Integrado ao Dossiê' }], default: 'solicitado' },
      { key: 'retorno', label: 'Retorno recebido, autoria, data, premissas e limitações', type: 'textarea' },
    ],
    statusField: 'estado',
    columns: ['code', 'title', 'competencia', 'prazo', 'estado'],
  },
  papel: {
    label: 'Papéis e autoridades', singular: 'Pessoa', newLabel: 'Nova pessoa', path: 'pessoas', icon: 'Users',
    intro: 'Matriz de Papéis e Autoridades. Sponsor e autoridade decisória precisam estar nomeados antes da coleta principal (§4.4).',
    fields: [
      { key: 'title', label: 'Nome', type: 'text', required: true },
      { key: 'papel', label: 'Papel', type: 'select', options: ROLES, required: true, help: r => { const x = ROLES.find(i => i.id === r); return x ? `${x.duty}. Não deve ser presumido: ${x.not.toLowerCase()}.` : null; } },
      { key: 'organizacao', label: 'Organização e cargo', type: 'text' },
      { key: 'email', label: 'Contato', type: 'text' },
      { key: 'autoridade', label: 'Autoridade formal (o que pode aprovar)', type: 'textarea' },
      { key: 'poder', label: 'Poder', type: 'select', options: opts(['Alto', 'Médio', 'Baixo']), half: true },
      { key: 'interesse', label: 'Interesse', type: 'select', options: opts(['Alto', 'Médio', 'Baixo']), half: true },
      { key: 'impacto', label: 'Como é afetado', type: 'textarea' },
      { key: 'fonte_documento', label: 'Documento e trecho de origem', type: 'textarea', hint: 'Preenchido quando o registro veio da leitura de documentos.' },
    ],
    statusField: 'papel',
    columns: ['title', 'papel', 'organizacao', 'email'],
  },
  instrumento: {
    label: 'Instrumentos', singular: 'Instrumento', newLabel: 'Novo instrumento', path: 'instrumentos', icon: 'Wrench',
    intro: 'Os 27 instrumentos do kit apoiam as fases. Registre quais foram previstos, aplicados e seus achados.',
    fields: [
      { key: 'instrumento', label: 'Instrumento', type: 'select', options: INSTRUMENTS.map(i => ({ id: i.id, name: `${i.id} ${i.name}` })), required: true, help: id => { const i = INSTRUMENTS.find(x => x.id === id); return i ? `${i.use}. Fase principal: ${i.phases}.` : null; } },
      { key: 'phase', label: 'Fase', type: 'select', options: phaseOptions, half: true },
      { key: 'estado', label: 'Estado', type: 'select', options: [{ id: 'previsto', name: 'Previsto' }, { id: 'aplicando', name: 'Em aplicação' }, { id: 'concluido', name: 'Concluído' }, { id: 'nao_aplicavel', name: 'Não aplicável' }], default: 'previsto', half: true },
      { key: 'achados', label: 'Achados e limitações', type: 'textarea' },
      { key: 'arquivos', label: 'Arquivos', type: 'files' },
    ],
    titleFrom: d => { const i = INSTRUMENTS.find(x => x.id === d.instrumento); return i ? `${i.id} ${i.name}` : d.instrumento; },
    statusField: 'estado',
    columns: ['title', 'phase', 'estado'],
  },
  entregavel: {
    label: 'Entregáveis', singular: 'Entregável', newLabel: 'Novo entregável', path: 'entregaveis', icon: 'FileText',
    intro: 'Cada fase tem um entregável mínimo com critério de aceite. O Dossiê consolida apenas as seções do corte contratado.',
    fields: [
      { key: 'title', label: 'Entregável', type: 'text', required: true },
      { key: 'phase', label: 'Fase', type: 'select', options: phaseOptions, half: true },
      { key: 'estado', label: 'Estado', type: 'select', options: [{ id: 'rascunho', name: 'Rascunho' }, { id: 'revisao', name: 'Em revisão' }, { id: 'apresentado', name: 'Apresentado' }, { id: 'aceito', name: 'Aceito' }, { id: 'aceito_ressalvas', name: 'Aceito com ressalvas' }], default: 'rascunho', half: true },
      { key: 'conteudo', label: 'Conteúdo', type: 'longtext' },
      { key: 'criterios_aceite', label: 'Critérios de aceite', type: 'textarea' },
      { key: 'aceite_por', label: 'Aceite por', type: 'text', half: true },
      { key: 'data_aceite', label: 'Data do aceite', type: 'date', half: true },
      { key: 'ressalvas', label: 'Ressalvas', type: 'textarea' },
      { key: 'arquivos', label: 'Arquivos', type: 'files' },
    ],
    statusField: 'estado',
    columns: ['code', 'title', 'phase', 'estado'],
  },
};

export const REGISTER_ORDER = ['papel', 'evidencia', 'gap', 'decisao', 'gate', 'pendencia', 'mudanca', 'encaminhamento', 'instrumento', 'entregavel'];
export const registerByPath = path => Object.entries(REGISTERS).find(([, r]) => r.path === path);

export function displayValue(register, key, value) {
  if (value === null || value === undefined || value === '') return '';
  const field = register.fields.find(f => f.key === key);
  if (field?.type === 'select') return nameOf(field.options, value);
  if (field?.type === 'boolean') return value ? 'Sim' : 'Não';
  if (field?.type === 'date') return new Date(value + 'T12:00:00').toLocaleDateString('pt-BR');
  if (Array.isArray(value)) return value.length ? `${value.length}` : '';
  return String(value);
}

export function statusLabel(register, status) {
  if (register.statusName) return register.statusName(status);
  const field = register.fields.find(f => f.key === register.statusField);
  return field ? nameOf(field.options || [], status) : status;
}

const TONES = { green: ['avancar', 'atendido', 'alto', 'resolvida', 'aceita', 'aprovada', 'integrado', 'concluido', 'aceito'], amber: ['avancar_condicoes', 'atendido_condicoes', 'medio', 'andamento', 'pendente', 'recebido', 'aplicando', 'revisao', 'aceito_ressalvas', 'inconclusivo', 'aguardar', 'redirecionar'], red: ['nao_atendido', 'baixo', 'aberta', 'rejeitada', 'nao_avancar', 'nao_ia'] };
export function statusTone(register, status) {
  if (register.statusTone) return register.statusTone(status);
  return Object.entries(TONES).find(([, list]) => list.includes(status))?.[0] || 'slate';
}
