import { handle, json, userContext } from '../_shared/context.ts';
import { companyWebsiteContext } from '../_shared/companyWebsite.ts';
import { AIRA_METHOD } from '../_shared/airaMethod.ts';
import { invokeClaude } from '../_shared/claude.ts';
import { downloadCaseFiles } from '../_shared/files.ts';

const stages = [
  { id: 'processes', title: 'Etapa 1. Retrato dos processos', instruction: 'Descreva somente o processo atual, atores, gatilhos, entradas, decisões, saídas e evidências disponíveis.' },
  { id: 'problems', title: 'Etapa 2. Identificação dos problemas', instruction: 'Identifique e classifique somente os gaps. Separe gaps operacionais de gaps de maturidade e diga se cada dor é confirmada ou apenas percebida.' },
  { id: 'dimensioning', title: 'Etapa 3. Dimensionamento', instruction: 'Dimensione somente os gaps operacionais com dados informados. Mostre a conta em reais por ano ou marque pendente de dimensionamento e informe o dado necessário.' },
  { id: 'triage', title: 'Etapa 4. Triagem de tratamento', instruction: 'Classifique somente cada prioridade como IA, melhoria de processo ou não agir por ora, aplicando repetição e volume, natureza da tarefa e custo de errar.' },
  { id: 'ranking', title: 'Etapa 5. Ranking por Valor, Esforço e Risco', instruction: 'Priorize somente as alternativas já triadas por Valor, Esforço e Risco. Feche com uma recomendação inicial e deixe explícita a fronteira com a implementação.' },
];

type Result = { opinion: string; stage_complete: boolean; next_question: string; gap_reason: string; files: { name: string; status: 'lido' | 'parcial' | 'nao_lido'; note: string }[] };

Deno.serve(handle(async (req) => {
  const ctx = await userContext(req);
  if (!ctx) return json({ error: 'Acesso não autorizado.' }, 401);
  const { db } = ctx;
  const input = await req.json();
  if (typeof input.caseId !== 'string' || input.caseId.length > 100 || !['initial', 'followup'].includes(input.mode)) return json({ error: 'Solicitação inválida.' }, 400);

  const { data: item } = await db.from('consulting_cases').select('*').eq('id', input.caseId).eq('created_by_id', ctx.user.id).maybeSingle();
  if (!item) return json({ error: 'Caso não encontrado.' }, 404);
  if (item.status === 'conducao_usuario') return json({ error: 'Devolva a condução ao AIra antes de continuar.' }, 400);
  const stage = stages.find(value => value.id === item.diagnostic_stage) || stages[0];

  const [{ data: documents = [] }, { data: entries = [] }] = await Promise.all([
    db.from('case_documents').select('*').eq('case_id', item.id).order('created_date', { ascending: false }).limit(30),
    db.from('case_entries').select('*').eq('case_id', item.id).order('created_date', { ascending: false }).limit(100),
  ]);
  if (documents!.length > 8) return json({ error: 'O limite para análise é de 8 arquivos.' }, 400);
  if (input.mode === 'followup' && !entries!.some(entry => entry.kind === 'resposta')) return json({ error: 'Responda à pergunta antes de continuar.' }, 400);

  const { files } = await downloadCaseFiles(db, documents!);
  const companyContext = await companyWebsiteContext(item.company_website);
  const history = [...entries!].reverse().map(entry => `[${entry.kind}${entry.justification ? '; justificativa: ' + entry.justification : ''}] ${String(entry.content).slice(0, 5000)}`).join('\n\n').slice(-25000);
  const prompt = `Você é AIra, consultor privado que conduz o Diagnóstico Express. Responda em português do Brasil.\n${AIRA_METHOD}\nConduza APENAS a etapa atual, sem antecipar as etapas posteriores. A decisão final é exclusivamente do usuário. Nunca trate alegações do objetivo ou dos documentos como fatos auditados. Diferencie declaração do usuário, documento, site e evidência verificável.\n\nCaso: ${item.title.slice(0, 200)}. Setor: ${item.sector}. Objetivo declarado: ${item.objective.slice(0, 12000)}.\n\nEtapa atual: ${stage.title}. ${stage.instruction}\n\nArquivos disponíveis: ${documents!.length ? documents!.map((document, index) => `${index + 1}. ${document.name}`).join(' | ') : 'nenhum'}. Só use arquivos realmente legíveis e reporte a leitura de cada arquivo.\nInformações institucionais públicas, não auditadas: ${companyContext}\nHistórico: ${history || 'Nenhum registro anterior.'}\n\nEscreva um registro curto em markdown com o título ## ${stage.title}, usando linguagem de negócio e informando a origem das informações. Se faltarem dados indispensáveis para esta etapa, explique a pendência e faça EXATAMENTE UMA pergunta objetiva em next_question. Se esta etapa puder ser encerrada com os dados atuais, marque stage_complete=true e deixe next_question vazia. Não produza parecer completo, ranking antecipado ou roteiro de implementação.`;

  const { result } = await invokeClaude<Result>({
    prompt, files,
    schema: { type: 'object', properties: { opinion: { type: 'string' }, stage_complete: { type: 'boolean' }, next_question: { type: 'string' }, gap_reason: { type: 'string' }, files: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, status: { type: 'string', enum: ['lido', 'parcial', 'nao_lido'] }, note: { type: 'string' } }, required: ['name', 'status', 'note'] } } }, required: ['opinion', 'stage_complete', 'next_question', 'gap_reason', 'files'] },
  });
  if (!result || typeof result.opinion !== 'string' || !result.opinion.trim() || typeof result.stage_complete !== 'boolean') throw new Error('Não foi possível registrar esta etapa.');

  for (const document of documents!) {
    const report = result.files?.find(file => file.name === document.name);
    await db.from('case_documents').update({ read_status: report?.status || 'nao_lido', read_note: (report?.note || 'Não foi possível confirmar a leitura deste arquivo.').slice(0, 800) }).eq('id', document.id);
  }
  const { error: entryError } = await db.from('case_entries').insert({ case_id: item.id, kind: 'parecer', content: result.opinion.trim().slice(0, 30000) });
  if (entryError) throw new Error(entryError.message);

  const stageIndex = stages.findIndex(value => value.id === stage.id);
  const nextStage = result.stage_complete ? stages[stageIndex + 1] : stage;
  const pendingQuestion = result.stage_complete ? '' : (result.next_question || 'Qual informação permite concluir esta etapa?').trim().slice(0, 1000);
  const complete = result.stage_complete && !nextStage;
  await db.from('consulting_cases').update({
    diagnostic_stage: complete ? 'complete' : nextStage.id,
    status: complete ? 'parecer_emitido' : pendingQuestion ? 'pendente' : 'em_analise',
    pending_question: pendingQuestion,
    pending_reason: pendingQuestion ? (result.gap_reason || `Informação necessária para concluir ${stage.title}.`).slice(0, 1500) : '',
  }).eq('id', item.id);
  return json({ ok: true, completedStage: stage.id, nextStage: complete ? 'complete' : nextStage.id });
}));
