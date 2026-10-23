export const diagnosticStages = [
  { id: 'processes', shortLabel: 'Retrato', label: 'Retrato dos processos' },
  { id: 'problems', shortLabel: 'Gaps', label: 'Identificação dos problemas' },
  { id: 'dimensioning', shortLabel: 'Dimensão', label: 'Dimensionamento' },
  { id: 'triage', shortLabel: 'Triagem', label: 'Triagem de tratamento' },
  { id: 'ranking', shortLabel: 'Prioridades', label: 'Ranking por Valor, Esforço e Risco' },
];

export function currentDiagnosticStage(stage) {
  return diagnosticStages.find(item => item.id === stage) || diagnosticStages[0];
}

export function nextDiagnosticStage(stage) {
  const index = diagnosticStages.findIndex(item => item.id === stage);
  return diagnosticStages[index + 1] || null;
}