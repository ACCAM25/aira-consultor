// Motor de orientação: lê o estado do projeto e indica o próximo passo e as não conformidades.
// Não decide nada pelo usuário; aponta o que o cânone pede a seguir.
import { KICKOFF_CONDITIONS, PHASES, QUESTION_TESTS, exitCriteria, gapPriority, modeById, phaseById } from './aira';

export const active = (records, kind) => records.filter(r => r.kind === kind && !r.archived);

export function projectPhases(project) {
  const ids = project?.config?.phases?.length ? project.config.phases : modeById(project?.config?.mode)?.phases || [];
  return PHASES.filter(p => ids.includes(p.id));
}

export function phaseProgress(project, phaseId) {
  const criteria = exitCriteria(phaseId, project.sector);
  const checks = project.phase_checks?.[phaseId] || {};
  const done = criteria.filter(c => checks[c.id]).length;
  return { done, total: criteria.length, complete: criteria.length > 0 && done === criteria.length, criteria, checks };
}

export function kickoffProgress(project) {
  const checks = project.config?.kickoff || {};
  const done = KICKOFF_CONDITIONS.filter(c => checks[c.id]).length;
  return { done, total: KICKOFF_CONDITIONS.length, complete: done === KICKOFF_CONDITIONS.length, checks };
}

export function questionScore(project) {
  const checks = project.config?.question_checks || {};
  return { done: QUESTION_TESTS.filter(t => checks[t.id]).length, total: QUESTION_TESTS.length };
}

const isOverdue = date => date && new Date(date + 'T23:59:59') < new Date();

/** Lista ordenada de próximos passos. O primeiro é o recomendado. */
export function nextSteps(project, records) {
  const steps = [];
  const base = `/projetos/${project.id}`;
  const people = active(records, 'papel');
  const q = questionScore(project);

  if (!project.executive_question?.trim()) {
    steps.push({ id: 'pergunta', title: 'Defina a pergunta executiva', why: 'Sem pergunta decisória, o trabalho ainda está em pré-venda ou enquadramento (§2.1).', to: `${base}/configuracao`, action: 'Definir pergunta' });
  } else if (q.done < q.total) {
    steps.push({ id: 'teste', title: 'Complete o teste de qualidade da pergunta', why: `${q.done} de ${q.total} critérios atendidos (§3.2).`, to: `${base}/configuracao`, action: 'Revisar pergunta' });
  }
  const roles = new Set(people.map(p => p.data?.papel));
  if (!roles.has('sponsor') || !roles.has('autoridade')) {
    steps.push({ id: 'papeis', title: 'Nomeie o sponsor e a autoridade decisória', why: 'Não se inicia a coleta principal sem sponsor e autoridade (§4.4).', to: `${base}/pessoas`, action: 'Registrar pessoas' });
  }
  if (!project.end_date) {
    steps.push({ id: 'fim', title: 'Defina a data de encerramento', why: 'Todo projeto declara início, marcos e data de fim (§2.5).', to: `${base}/configuracao`, action: 'Definir datas' });
  }
  if (project.status === 'configuracao') {
    const k = kickoffProgress(project);
    steps.push({ id: 'kickoff', title: k.complete ? 'Inicie a execução do projeto' : 'Conclua as condições do kickoff', why: k.complete ? 'Condições mínimas atendidas. A coleta principal pode começar.' : `${k.done} de ${k.total} condições para iniciar a execução (§4.4).`, to: `${base}/configuracao#kickoff`, action: k.complete ? 'Iniciar execução' : 'Ver condições' });
    return steps;
  }
  if (project.status === 'encerrado') {
    return [{ id: 'encerrado', title: 'Projeto encerrado', why: 'O Termo de Conclusão e Handoff foi registrado.', to: `${base}/dossie`, action: 'Ver Dossiê' }];
  }

  const overdue = active(records, 'pendencia').filter(p => ['aberta', 'andamento'].includes(p.status) && isOverdue(p.data?.prazo));
  if (overdue.length) steps.push({ id: 'atrasos', title: `${overdue.length} pendência(s) com prazo vencido`, why: 'Bloqueios e pendências vencidos ameaçam a entrega e o encerramento.', to: `${base}/pendencias`, action: 'Ver pendências', tone: 'red' });

  const phase = phaseById(project.current_phase);
  if (phase) {
    const pending = active(records, 'gap').filter(g => g.data?.tipo === 'operacional' && gapPriority(g.data).band === 'pendente');
    if (['F2', 'F3'].includes(phase.id) && pending.length) steps.push({ id: 'dimensionar', title: `${pending.length} gap(s) pendente(s) de dimensionamento`, why: 'Gap sem dimensionamento fica fora do ranking. Solicite o dado; não estime para preencher.', to: `${base}/gaps`, action: 'Ver gaps' });
    const deliverables = active(records, 'entregavel').filter(d => d.phase === phase.id);
    if (!deliverables.length) steps.push({ id: 'entregavel', title: `Registre o entregável de ${phase.id}: ${phase.deliverable}`, why: 'Cada fase termina com um entregável mínimo e critério de aceite.', to: `${base}/entregaveis`, action: 'Criar entregável' });
    const progress = phaseProgress(project, phase.id);
    if (!progress.complete) {
      const next = progress.criteria.find(c => !progress.checks[c.id]);
      steps.push({ id: 'criterios', title: `${phase.id} ${phase.name}: ${next.text}`, why: `${progress.done} de ${progress.total} critérios de saída da fase atendidos.`, to: `${base}/jornada`, action: 'Ver critérios' });
    } else {
      const phases = projectPhases(project);
      const idx = phases.findIndex(p => p.id === phase.id);
      const following = phases[idx + 1];
      steps.push(following
        ? { id: 'avancar', title: `Avance para ${following.id} ${following.name}`, why: 'Todos os critérios de saída da fase atual foram atendidos.', to: `${base}/jornada`, action: 'Avançar fase' }
        : { id: 'dossie', title: 'Consolide o Dossiê e faça o handoff', why: 'Última fase concluída. Encerrar exige aceite, ressalvas e responsabilidades futuras (§23).', to: `${base}/dossie`, action: 'Abrir Dossiê' });
    }
  }
  return steps;
}

/** Não conformidades graves e alertas (§21.3), verificados automaticamente. */
export function healthIssues(project, records, currentHash) {
  const issues = [];
  const evidences = new Map(active(records, 'evidencia').map(e => [e.id, e]));
  for (const d of active(records, 'decisao')) {
    if (d.data?.excecao) continue; // exceção registrada é decisão de governança, não conclusão analítica
    if (!d.data?.evidencias?.length) issues.push({ level: 'grave', text: `${d.code}: decisão sem evidência vinculada`, to: 'decisoes' });
    else if (d.data.evidencias.every(id => evidences.get(id)?.status === 'baixo')) issues.push({ level: 'alerta', text: `${d.code}: decisão sustentada apenas por evidência de confiança baixa`, to: 'decisoes' });
  }
  for (const g of active(records, 'gap')) {
    if (g.data?.tratamento === 'ia' && !g.data?.alternativas?.trim()) issues.push({ level: 'grave', text: `${g.code}: recomendação de IA sem comparação com processo e automação convencional`, to: 'gaps' });
    if (g.data?.dimensao_valor === 0 && !g.data?.dimensao_conta) issues.push({ level: 'alerta', text: `${g.code}: dimensão zero sem memória de cálculo (ausência não é zero)`, to: 'gaps' });
  }
  for (const gt of active(records, 'gate')) {
    if (!gt.data?.autoridade) issues.push({ level: 'grave', text: `${gt.code}: gate sem autoridade decisória`, to: 'gates' });
  }
  for (const e of evidences.values()) {
    if (e.data?.divergencias?.trim() && e.status === 'alto') issues.push({ level: 'alerta', text: `${e.code}: evidência com divergência registrada e confiança alta`, to: 'evidencias' });
  }
  if (!project.end_date) issues.push({ level: 'grave', text: 'Projeto sem critério de encerramento (data de fim)', to: 'configuracao' });
  const exclusions = project.config?.exclusions || [];
  if (exclusions.some(x => x.item && !x.efeito)) issues.push({ level: 'alerta', text: 'Exclusão de escopo sem efeito declarado', to: 'configuracao' });
  if (currentHash && project.canon_hash && project.canon_hash !== currentHash) issues.push({ level: 'alerta', text: 'Projeto criado com outra versão das regras do cânone; revise a configuração', to: 'configuracao' });
  return issues;
}
