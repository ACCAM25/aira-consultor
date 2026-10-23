// Cânone AIra 3.0 operacionalizado (Manual de Implementação 3.0, vigência 20/08/2026).
// Este arquivo é a única fonte das regras do método dentro do app. Qualquer mudança aqui
// altera a impressão digital (CANON_HASH), registrada em cada projeto no momento da criação.
// O app operacionaliza o método; em divergência, prevalece o Manual Canônico (ordem do §0).

export const CANON_VERSION = '3.0';

export const PHASES = [
  { id: 'F0', name: 'Sensibilizar', step: 7, goal: 'Alinhar por que o trabalho existe, qual decisão deve suportar, quem participa e quais são os limites do projeto.', deliverable: 'Termo de Enquadramento e Plano de Trabalho', instruments: ['AIRA_03', 'AIRA_08'],
    exit: [
      { id: 'pergunta', text: 'Pergunta decisória confirmada' },
      { id: 'sponsor', text: 'Sponsor e autoridade decisória nomeados' },
      { id: 'escopo', text: 'Escopo, limites e entregáveis compreendidos' },
      { id: 'agenda', text: 'Agenda e responsabilidades acordadas' },
      { id: 'evidencias', text: 'Evidências iniciais solicitadas' },
      { id: 'encerramento', text: 'Data de encerramento reconhecida' },
    ] },
  { id: 'F1', name: 'Diagnosticar', step: 8, goal: 'Compreender ambiente, maturidade, prontidão organizacional, atores e condições atuais relevantes para a decisão.', deliverable: 'Diagnóstico de Contexto, Maturidade e Prontidão', instruments: ['AIRA_01', 'AIRA_02', 'AIRA_03', 'AIRA_04'],
    exit: [
      { id: 'contexto', text: 'Contexto e objetivo validados' },
      { id: 'capacidades', text: 'Capacidades e lacunas documentadas' },
      { id: 'stakeholders', text: 'Stakeholders e autoridades identificados' },
      { id: 'prontidao', text: 'Prontidão descrita sem transformar ausência em nota artificial' },
      { id: 'limitacoes', text: 'Limitações e dependências explícitas' },
      { id: 'confianca', text: 'Confiança da conclusão registrada' },
      { id: 'gate_suf', text: 'Gate de Suficiência de Evidências aplicado', gate: 'suficiencia' },
    ] },
  { id: 'F2', name: 'Mapear', step: 9, goal: 'Compreender processos, tarefas, gaps, impactos e oportunidades antes de escolher tecnologia ou IA.', deliverable: 'Mapa de Gaps, Processos e Oportunidades', instruments: ['AIRA_05', 'AIRA_06', 'AIRA_07', 'AIRA_18'],
    exit: [
      { id: 'processo', text: 'Processo e problema compreendidos' },
      { id: 'gaps', text: 'Gaps classificados e dimensionados (ou marcados como pendentes)' },
      { id: 'causas', text: 'Causas e dependências registradas' },
      { id: 'alternativas', text: 'Alternativas não tecnológicas consideradas' },
      { id: 'impactos', text: 'Impactos sobre pessoas e dados visíveis' },
      { id: 'oportunidades', text: 'Oportunidades descritas com evidência suficiente para priorização' },
    ] },
  { id: 'F3', name: 'Priorizar', step: 10, goal: 'Decidir o que merece avançar, em quais condições, por qual caminho e com quais dependências.', deliverable: 'Parecer de Viabilidade e Direcionamento', instruments: ['AIRA_07', 'AIRA_16', 'AIRA_17', 'AIRA_19', 'AIRA_23', 'AIRA_24', 'AIRA_27'],
    exit: [
      { id: 'suficiencia', text: 'Gaps e oportunidades com evidência suficiente confirmados' },
      { id: 'triagem', text: 'Triagem aplicada conforme o tipo de gap' },
      { id: 'ranking', text: 'Prioridade calculada (3V + (6 − E) + (6 − R)) para gaps dimensionados' },
      { id: 'consumo', text: 'Visibilidade de consumo e custo por unidade verificada' },
      { id: 'riscos', text: 'Riscos, direitos, conformidade e necessidade de especialista triados' },
      { id: 'caminhos', text: 'Caminhos de processo, automação, aquisição e desenvolvimento comparados' },
      { id: 'gate_viab', text: 'Gate de Viabilidade realizado', gate: 'viabilidade' },
      { id: 'continuidade', text: 'Decisão de continuidade registrada pela autoridade (passo 11)' },
    ] },
  { id: 'F4', name: 'Desenhar', step: 12, goal: 'Definir como a solução deve ser governada, quais requisitos e critérios precisa atender e quem responde por cada decisão.', deliverable: 'Blueprint de Governança, Requisitos e Critérios', instruments: ['AIRA_08', 'AIRA_09', 'AIRA_10', 'AIRA_11', 'AIRA_18', 'AIRA_20', 'AIRA_22', 'AIRA_25', 'AIRA_26'],
    exit: [
      { id: 'objetivo', text: 'Objetivo, usuários, impactos e critérios de sucesso confirmados' },
      { id: 'requisitos', text: 'Requisitos funcionais e de governança definidos' },
      { id: 'papeis', text: 'Papéis, autoridades, supervisão humana e segregação de funções definidos' },
      { id: 'dados', text: 'Requisitos de dados, privacidade, segurança e conformidade registrados' },
      { id: 'consumo', text: 'Visibilidade de consumo, unidade, limites, alertas e responsáveis especificados' },
      { id: 'adocao', text: 'Estratégia de adoção, comunicação, capacitação e suporte definida' },
      { id: 'criterios', text: 'Critérios de teste, aceite, prontidão e entrada em produção estabelecidos' },
      { id: 'fallback', text: 'Fallback, rollback e tratamento de incidentes registrados' },
      { id: 'especialistas', text: 'Avaliações especializadas necessárias identificadas' },
    ] },
  { id: 'F5', name: 'Implantar', step: 13, goal: 'Avaliar evidências da solução implantada ou em implantação e determinar se existem condições para piloto, aceite ou entrada em produção.', deliverable: 'Parecer de Prontidão e Condições de Implantação', instruments: ['AIRA_06', 'AIRA_09', 'AIRA_10', 'AIRA_11', 'AIRA_12', 'AIRA_13', 'AIRA_22', 'AIRA_25', 'AIRA_27'],
    exit: [
      { id: 'versao', text: 'Versão, ambiente e escopo da solução avaliada confirmados' },
      { id: 'testes', text: 'Evidências de testes funcionais e especializados verificadas' },
      { id: 'confronto', text: 'Solução confrontada com requisitos e critérios de F4' },
      { id: 'desvios', text: 'Desvios, riscos, responsáveis e prazos registrados' },
      { id: 'supervisao', text: 'Supervisão humana, permissões e limites de ação verificados' },
      { id: 'fallback', text: 'Fallback, rollback e incidente verificados' },
      { id: 'gate_pront', text: 'Gate de Prontidão para piloto ou produção realizado', gate: 'prontidao' },
      { id: 'decisao', text: 'Decisão final do cliente e condições registradas' },
    ] },
  { id: 'F6', name: 'Sustentar e Escalar', step: 14, goal: 'Acompanhar por período definido a adoção, a estabilidade, a governança de consumo, as pendências e as condições de continuidade, escala, substituição ou retirada.', deliverable: 'Relatório de Sustentação e Plano de Transição', instruments: ['AIRA_12', 'AIRA_13', 'AIRA_14', 'AIRA_15', 'AIRA_21', 'AIRA_22', 'AIRA_23', 'AIRA_24', 'AIRA_25', 'AIRA_27'],
    exit: [
      { id: 'periodo', text: 'Período contratado concluído' },
      { id: 'resultados', text: 'Resultados, incidentes e pendências registrados' },
      { id: 'responsaveis', text: 'Responsáveis futuros definidos' },
      { id: 'recomendacao', text: 'Recomendação de manter, corrigir, limitar, escalar, substituir ou retirar' },
      { id: 'transferencia', text: 'Documentação e acessos transferidos' },
      { id: 'gate_cont', text: 'Gate de Continuidade, Escala ou Retirada realizado', gate: 'continuidade' },
    ] },
];

// Critérios adicionais para o setor público (perfil sobre o mesmo cânone; não altera regras).
export const PUBLIC_SECTOR_EXIT = {
  F0: [{ id: 'pub_autoridade', text: 'Autoridade competente formal identificada (ordenador de despesa, comitê ou equivalente)' }],
  F3: [
    { id: 'pub_controle', text: 'Rastreabilidade suficiente para controle interno e externo (TCU/TCE) verificada' },
    { id: 'pub_lgpd', text: 'Tratamento de dados pessoais pelo poder público (LGPD) triado' },
  ],
  F4: [{ id: 'pub_14133', text: 'Caminho de aquisição compatível com a Lei 14.133/2021 identificado para validação jurídica' }],
};

export const KICKOFF_CONDITIONS = [
  { id: 'sponsor', text: 'Sponsor ou autoridade equivalente' },
  { id: 'pergunta', text: 'Pergunta decisória aprovada' },
  { id: 'escopo', text: 'Escopo e critérios de aceite' },
  { id: 'responsaveis', text: 'Responsáveis por fornecer evidências' },
  { id: 'canal', text: 'Canal de decisão para bloqueios' },
  { id: 'datas', text: 'Data de início e previsão de encerramento' },
];

export const MODULES = [
  { id: 'M01', name: 'Contexto e maturidade', question: 'O ambiente possui direção, capacidade e prontidão compatíveis com o objeto?' },
  { id: 'M02', name: 'Processo, gaps e oportunidades', question: 'Qual problema existe, onde ocorre, por que ocorre e quais tratamentos são plausíveis?' },
  { id: 'M03', name: 'Priorização e direcionamento', question: 'O que deve ser tratado primeiro e por qual caminho?' },
  { id: 'M04', name: 'Governança e responsabilidade', question: 'Existem papéis, controles, avaliações e autoridades para decidir e responder pelo objeto?' },
  { id: 'M05', name: 'Aquisição ou desenvolvimento', question: 'Que caminho de solução atende ao problema e às condições de governança?' },
  { id: 'M06', name: 'Pessoas e adoção', question: 'Pessoas, papéis, comunicação, capacitação e suporte sustentam a mudança?' },
  { id: 'M07', name: 'Implantação e validação', question: 'A solução possui evidências e condições para piloto, aceite ou produção?' },
  { id: 'M08', name: 'Sustentação e transição', question: 'A organização consegue acompanhar, corrigir, limitar, escalar, substituir ou retirar a solução?' },
];

export const DEPTHS = [
  { id: 'reduzida', name: 'Reduzida' },
  { id: 'padrao', name: 'Padrão' },
  { id: 'aprofundada', name: 'Aprofundada' },
];

export const MODES = [
  { id: 'express', name: 'Diagnóstico Express', need: 'Compreender maturidade, gaps e oportunidades', phases: ['F0', 'F1', 'F2', 'F3'], core: ['M01', 'M02', 'M03'], conditional: ['M04', 'M06'], deliverable: 'Dossiê de Anamnese e Direcionamento', limit: 'Não desenha nem valida solução.', depth: 'reduzida' },
  { id: 'processo', name: 'Validação de Processo', need: 'Decidir o tratamento de um processo definido', phases: ['F1', 'F2', 'F3'], optional: ['F4'], core: ['M02', 'M03'], conditional: ['M01', 'M04', 'M05', 'M06'], deliverable: 'Parecer de Viabilidade e Direcionamento', limit: 'Não constrói a automação ou solução.' },
  { id: 'aquisicao', name: 'Validação de Aquisição', need: 'Comparar soluções ou fornecedores', phases: ['F3', 'F4', 'F5'], core: ['M04', 'M05'], conditional: ['M03', 'M06', 'M07', 'M08'], deliverable: 'Critérios comparáveis, riscos, condições e recomendação', limit: 'Não substitui due diligence, negociação, parecer jurídico ou decisão de compra.' },
  { id: 'solucao', name: 'Validação de Solução', need: 'Avaliar solução existente ou contratada', phases: ['F4', 'F5', 'F6'], core: ['M04', 'M07', 'M08'], conditional: ['M05', 'M06'], deliverable: 'Parecer de prontidão, condições, sustentação ou retirada', limit: 'Depende de evidências técnicas e especializadas produzidas por responsáveis competentes.' },
  { id: 'full', name: 'AIra Full', need: 'Conduzir a jornada completa', phases: ['F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6'], core: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08'], conditional: [], deliverable: 'Dossiê AIra completo e Termo de Handoff', limit: 'Não incorpora automaticamente delivery técnico ou especialidades.' },
];

export const OBJECT_TYPES = [
  { id: 'ambiente', name: 'Ambiente organizacional e maturidade' },
  { id: 'processo', name: 'Processo ou conjunto de tarefas' },
  { id: 'oportunidade', name: 'Oportunidade ou caso de uso' },
  { id: 'aquisicao', name: 'Aquisição de solução ou fornecedor' },
  { id: 'solucao', name: 'Solução em desenho, construção, piloto ou produção' },
  { id: 'portfolio', name: 'Portfólio ou jornada completa de transformação' },
];

// Passo 1: perguntas mínimas de qualificação da demanda
export const DEMAND_QUESTIONS = [
  { id: 'decidir', text: 'O que o cliente pretende decidir?' },
  { id: 'objeto', text: 'Qual problema, processo, aquisição ou solução está em pauta?' },
  { id: 'afetados', text: 'Quem é afetado pela decisão?' },
  { id: 'autoridade', text: 'Quem possui autoridade para decidir?' },
  { id: 'evidencias', text: 'Que evidências já existem?' },
  { id: 'prazo', text: 'Há prazo regulatório, contratual, operacional ou estratégico?' },
  { id: 'expectativa', text: 'O cliente quer apenas orientação ou espera execução especializada?' },
];

// Passo 2: teste de qualidade da pergunta executiva
export const QUESTION_TESTS = [
  { id: 'estrutura', text: 'Possui sujeito, objeto e decisão' },
  { id: 'evidencia', text: 'Pode ser respondida com evidências' },
  { id: 'resultados', text: 'Aceita mais de um resultado legítimo' },
  { id: 'nao_presume', text: 'Não presume que IA é a resposta' },
  { id: 'limite', text: 'Indica o limite da análise' },
  { id: 'autoridade', text: 'Possui autoridade decisória identificável' },
];

export const QUESTION_EXAMPLES = [
  'A organização está preparada para iniciar iniciativas de IA?',
  'Este processo deve ser mantido, redesenhado, automatizado convencionalmente ou tratado com IA?',
  'Qual solução ou fornecedor atende às condições de contratação?',
  'A solução existente está pronta para piloto, produção, escala ou continuidade?',
  'Quais condições precisam existir para que o objeto se torne viável?',
];

export const CONCLUSIONS = [
  { id: 'avancar', name: 'Avançar' },
  { id: 'avancar_condicoes', name: 'Avançar com condições' },
  { id: 'redirecionar', name: 'Redirecionar para redesenho de processo ou automação convencional' },
  { id: 'aguardar', name: 'Aguardar evidências ou capacidades' },
  { id: 'nao_ia', name: 'Não recomendar IA' },
  { id: 'nao_avancar', name: 'Não avançar' },
  { id: 'inconclusiva', name: 'Declarar conclusão inconclusiva' },
];

export const GATES = [
  { id: 'suficiencia', name: 'Suficiência de evidências', moment: 'Antes de qualquer parecer', question: 'Há base suficiente e rastreável para concluir?', authority: 'Consultor líder quanto à suficiência metodológica' },
  { id: 'viabilidade', name: 'Viabilidade', moment: 'F3 e revisão material', question: 'O objeto deve avançar, ser condicionado, redirecionado, aguardado ou encerrado?', authority: 'Sponsor e decisor do cliente' },
  { id: 'compliance', name: 'Compliance Gate (AIRA_24)', moment: 'Dados, direitos, impacto ou requisitos relevantes', question: 'As avaliações competentes existem e suas condições foram tratadas?', authority: 'Autoridade jurídica, privacidade ou compliance do cliente' },
  { id: 'enactment', name: 'Enactment Gate (AIRA_27)', moment: 'Autonomia, ferramentas, ação material ou interação direta', question: 'A ação é elegível, supervisionada, limitada e reversível?', authority: 'Cliente com validações técnicas e institucionais' },
  { id: 'prontidao', name: 'Prontidão para piloto ou produção', moment: 'Antes de piloto, aceite ou entrada em produção', question: 'Requisitos, testes, adoção, suporte e respostas estão prontos?', authority: 'Cliente e autoridades técnicas competentes' },
  { id: 'continuidade', name: 'Continuidade, escala ou retirada', moment: 'F6, incidente ou mudança material', question: 'Deve manter, corrigir, limitar, escalar, substituir ou retirar?', authority: 'Responsável executivo e operacional do cliente' },
];

export const GATE_RESULTS = [
  { id: 'atendido', name: 'Atendido', tone: 'green' },
  { id: 'atendido_condicoes', name: 'Atendido com condições', tone: 'amber' },
  { id: 'pendente', name: 'Pendente', tone: 'slate' },
  { id: 'nao_atendido', name: 'Não atendido', tone: 'red' },
  { id: 'inconclusivo', name: 'Inconclusivo por falta de evidência', tone: 'amber' },
  { id: 'nao_aplicavel', name: 'Não aplicável, com justificativa', tone: 'slate' },
];

export const CONFIDENCE = [
  { id: 'alto', name: 'Alto', use: 'Permite sustentar conclusão dentro do escopo', tone: 'green' },
  { id: 'medio', name: 'Médio', use: 'Permite conclusão condicionada', tone: 'amber' },
  { id: 'baixo', name: 'Baixo', use: 'Orienta investigação, não conclusão definitiva', tone: 'red' },
];

export const VERIFICATION_STATES = [
  { id: 'nao_avaliado', name: 'Não avaliado' },
  { id: 'ausente', name: 'Ausente' },
  { id: 'parcial', name: 'Parcialmente tratado' },
  { id: 'evidenciado', name: 'Evidenciado' },
  { id: 'especialista', name: 'Depende de especialista' },
  { id: 'nao_aplicavel', name: 'Não aplicável, com justificativa' },
];

export const EVIDENCE_SOURCES = [
  'Políticas, normas e procedimentos', 'Registros de sistemas e relatórios', 'Contratos e documentos de fornecedor',
  'Arquitetura, inventário ou documentação técnica', 'Entrevistas e workshops', 'Observação de processo',
  'Indicadores e séries históricas', 'Testes e laudos de profissionais competentes', 'Logs, amostras e registros de operação',
  'Decisões e aprovações formais',
];

export const ROLES = [
  { id: 'sponsor', name: 'Sponsor', duty: 'Sustentar prioridade, remover impedimentos e decidir escalonamentos', not: 'Condução cotidiana do projeto' },
  { id: 'autoridade', name: 'Autoridade decisória', duty: 'Aceitar, condicionar, redirecionar ou rejeitar recomendações', not: 'Produzir evidência técnica' },
  { id: 'lider', name: 'Consultor líder AIra', duty: 'Garantir método, escopo, integração, gates e entregáveis', not: 'Decidir pelo cliente' },
  { id: 'modulo', name: 'Consultor de módulo', duty: 'Executar análise do módulo e registrar evidências e limitações', not: 'Emitir parecer fora da competência' },
  { id: 'coordenador', name: 'Coordenador do cliente', duty: 'Organizar agenda, acessos, evidências e responsáveis', not: 'Assumir decisões do sponsor' },
  { id: 'dono', name: 'Dono do processo ou produto', duty: 'Explicar operação, aprovar fatos e responder por ações', not: 'Validar temas especializados sozinho' },
  { id: 'especialista', name: 'Especialista', duty: 'Produzir ou validar evidência em sua disciplina', not: 'Alterar regra AIra' },
  { id: 'revisor', name: 'Revisor metodológico', duty: 'Verificar coerência, rastreabilidade e limites', not: 'Reexecutar o projeto sem necessidade' },
];

export const GAP_TREATMENTS = [
  { id: 'manter', name: 'Manter' },
  { id: 'redesenhar', name: 'Redesenhar processo' },
  { id: 'automacao', name: 'Automação convencional' },
  { id: 'ia', name: 'Tratar com IA' },
  { id: 'nao_agir', name: 'Não agir por ora' },
];

export const INSTRUMENTS = [
  ['AIRA_01', 'Assessment de Maturidade', 'F1', 'Diagnóstico de capacidade e maturidade'],
  ['AIRA_02', 'Anamnese Organizacional', 'F1', 'Levantamento estruturado do ambiente'],
  ['AIRA_03', 'Stakeholder & Influence Map', 'F1–F4', 'Atores, poder, interesse e influência'],
  ['AIRA_04', 'Adoption Readiness Matrix', 'F1–F4', 'Prontidão para adoção'],
  ['AIRA_05', 'Change Impact Assessment', 'F2–F4', 'Impactos sobre pessoas e trabalho'],
  ['AIRA_06', 'Resistance & Friction Analysis', 'F2–F5', 'Resistências e fricções'],
  ['AIRA_07', 'Gap & Value Map', 'F2–F3', 'Gaps, dimensionamento, triagem e prioridade'],
  ['AIRA_08', 'Change Narrative Canvas', 'F0–F4', 'Narrativa e alinhamento da mudança'],
  ['AIRA_09', 'Communication Plan', 'F4–F6', 'Comunicação da implantação e adoção'],
  ['AIRA_10', 'Training & Enablement Plan', 'F4–F6', 'Capacitação e enablement'],
  ['AIRA_11', 'AI Champions Network Plan', 'F4–F6', 'Rede de apoio e champions'],
  ['AIRA_12', 'Adoption Pulse Survey', 'F5–F6', 'Pulso periódico de adoção'],
  ['AIRA_13', 'Hypercare de Adoção', 'F5–F6', 'Acompanhamento limitado pós-implantação'],
  ['AIRA_14', 'Sustaining Plan', 'F6', 'Sustentação e transição'],
  ['AIRA_15', 'Benefits Realization Tracker', 'F6', 'Acompanhamento de resultados declarados'],
  ['AIRA_16', 'Matriz Valor × Viabilidade × Adoção', 'F3', 'Priorização e direcionamento'],
  ['AIRA_17', 'Business Case', 'F3', 'Interface com análise financeira competente'],
  ['AIRA_18', 'AI Data Readiness Check', 'F2–F4', 'Triagem de prontidão de dados'],
  ['AIRA_19', 'AI Adoption Risk Map', 'F3–F4', 'Riscos de adoção'],
  ['AIRA_20', 'AI Solution Blueprint', 'F4', 'Governança, requisitos e critérios'],
  ['AIRA_21', 'AI Adoption Scorecard', 'F6', 'Avaliação consolidada de adoção'],
  ['AIRA_22', 'AI Adoption Roadmap', 'F4–F6', 'Ondas e sequência de adoção'],
  ['AIRA_23', 'Custo de Operação', 'F3–F6', 'Visibilidade de consumo, unidade, limites e resposta'],
  ['AIRA_24', 'Classificação de Risco e Compliance Gate', 'F3–F6', 'Triagem e controle, sem parecer jurídico'],
  ['AIRA_25', 'Plano de Revisão Humana', 'F4–F6', 'Supervisão, autoridade e registro'],
  ['AIRA_26', 'RIPD', 'F4', 'Interface especializada de privacidade'],
  ['AIRA_27', 'Security Check e Enactment Gate', 'F3–F6', 'Checagem conceitual e gate de ação'],
].map(([id, name, phases, use]) => ({ id, name, phases, use }));

// §9.3: Prioridade = 3V + (6 − E) + (6 − R); faixas de referência.
export function gapPriority(gap) {
  const v = Number(gap?.valor), e = Number(gap?.esforco), r = Number(gap?.risco);
  if (!gap || gap.tipo !== 'operacional') return { score: null, band: null, reason: 'Gap de maturidade não passa pela mesma triagem de tarefa.' };
  if (!gap.dimensao_valor && gap.dimensao_valor !== 0) return { score: null, band: 'pendente', reason: 'Pendente de dimensionamento: fica fora do ranking.' };
  if (gap.tratamento === 'nao_agir') return { score: null, band: 'nao_agir', reason: 'Triagem concluiu por não agir: não recebe onda.' };
  if (![v, e, r].every(n => n >= 1 && n <= 5)) return { score: null, band: 'incompleto', reason: 'Informe Valor, Esforço e Risco de 1 a 5.' };
  const score = 3 * v + (6 - e) + (6 - r);
  const band = score >= 19 ? 'alta' : score >= 14 ? 'media' : score >= 9 ? 'baixa' : 'nao_atuar';
  return { score, band, reason: null };
}

export const PRIORITY_BANDS = {
  alta: { name: 'Alta', tone: 'green' },
  media: { name: 'Média', tone: 'amber' },
  baixa: { name: 'Baixa', tone: 'slate' },
  nao_atuar: { name: 'Não atuar', tone: 'red' },
  pendente: { name: 'Pendente de dimensionamento', tone: 'slate' },
  nao_agir: { name: 'Não agir', tone: 'slate' },
  incompleto: { name: 'Incompleto', tone: 'slate' },
};

// §0.3: o que o método não autoriza (exibido na proposta e no Dossiê)
export const LIMITS = [
  'Emitir parecer jurídico ou certificação de conformidade',
  'Executar auditoria técnica profunda, pentest, engenharia de segurança ou validação científica',
  'Definir arquitetura detalhada, desenvolver, integrar ou operar uma solução sem escopo especializado',
  'Calcular investimento, TCO, ROI ou payback como conclusão metodológica',
  'Aprovar despesa, contrato, risco residual ou entrada em produção em nome do cliente',
  'Presumir competência que não tenha sido contratada e comprovada',
];

// §21.1: revisão antes de gate ou entregável
export const QUALITY_REVIEW = [
  { id: 'pergunta', text: 'A pergunta decisória permanece válida' },
  { id: 'escopo', text: 'O escopo executado coincide com o contratado' },
  { id: 'evidencia', text: 'Toda conclusão possui evidência ou limitação' },
  { id: 'ausencias', text: 'Ausências não foram convertidas em zero' },
  { id: 'divergencias', text: 'Divergências estão visíveis' },
  { id: 'gates', text: 'Recomendações não contradizem gates' },
  { id: 'dependencias', text: 'Dependências críticas possuem responsável' },
  { id: 'especialistas', text: 'Especialistas foram acionados quando necessário' },
  { id: 'profundidade', text: 'O texto não promete profundidade não executada' },
  { id: 'autoridade', text: 'A autoridade de decisão está correta' },
  { id: 'handoff', text: 'O encerramento e o handoff estão preparados' },
];

export const HANDOFF_ITEMS = [
  { id: 'entregaveis', text: 'Entregáveis consolidados' },
  { id: 'revisao', text: 'Revisão de qualidade concluída' },
  { id: 'gates', text: 'Gates registrados' },
  { id: 'aceite', text: 'Aceite obtido' },
  { id: 'ressalvas', text: 'Ressalvas documentadas' },
  { id: 'acoes', text: 'Ações abertas atribuídas' },
  { id: 'transferencia', text: 'Documentos e acessos transferidos' },
  { id: 'responsabilidades', text: 'Responsabilidades futuras confirmadas' },
  { id: 'data', text: 'Data de fim registrada' },
  { id: 'arquivo', text: 'Repositório arquivado' },
];

export function defaultModules(mode) {
  return Object.fromEntries(MODULES.map(m => [m.id, {
    included: mode.core.includes(m.id),
    conditional: mode.conditional.includes(m.id),
    depth: mode.depth || 'padrao',
    state: 'nao_avaliado',
  }]));
}


export const phaseById = id => PHASES.find(p => p.id === id);
export const modeById = id => MODES.find(m => m.id === id);
export const nameOf = (list, id) => list.find(item => item.id === id)?.name || id || '';

export function exitCriteria(phaseId, sector) {
  const base = phaseById(phaseId)?.exit || [];
  return sector === 'publico' ? [...base, ...(PUBLIC_SECTOR_EXIT[phaseId] || [])] : base;
}

// Impressão digital do cânone (SHA-256 do conteúdo deste módulo)
const CANON_CONTENT = JSON.stringify({ CANON_VERSION, PHASES, PUBLIC_SECTOR_EXIT, KICKOFF_CONDITIONS, MODULES, MODES, OBJECT_TYPES, DEMAND_QUESTIONS, QUESTION_TESTS, CONCLUSIONS, GATES, GATE_RESULTS, CONFIDENCE, VERIFICATION_STATES, ROLES, GAP_TREATMENTS, INSTRUMENTS, LIMITS, QUALITY_REVIEW, HANDOFF_ITEMS, PRIORITY: '3V+(6-E)+(6-R);19-25 alta;14-18 media;9-13 baixa;<9 nao atuar' });

export async function canonHash() {
  const bytes = new TextEncoder().encode(CANON_CONTENT);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
