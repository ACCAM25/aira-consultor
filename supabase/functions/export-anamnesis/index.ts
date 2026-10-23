import { jsPDF } from 'npm:jspdf@4.0.0';
import { handle, json, userContext } from '../_shared/context.ts';

Deno.serve(handle(async (req) => {
  const ctx = await userContext(req);
  if (!ctx) return json({ error: 'Acesso não autorizado.' }, 401);
  const { db } = ctx;
  const { caseId } = await req.json();
  if (typeof caseId !== 'string' || !/^[a-f0-9]{24}$/i.test(caseId)) return json({ error: 'Projeto inválido.' }, 400);
  const { data: project } = await db.from('consulting_cases').select('*').eq('id', caseId).eq('created_by_id', ctx.user.id).maybeSingle();
  if (!project) return json({ error: 'Projeto não encontrado.' }, 404);
  const { data: entries = [] } = await db.from('case_entries').select('*').eq('case_id', caseId).order('created_date', { ascending: true }).limit(200);
  const report = entries!.filter(e => ['parecer', 'pergunta', 'resposta', 'correcao', 'nota', 'decisao'].includes(e.kind));
  if (!report.length) return json({ error: 'Ainda não há anamnese registrada neste projeto.' }, 400);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20, width = 170;
  let y = 22;
  const nextPage = (height: number) => { if (y + height > 275) { doc.addPage(); y = 22; } };
  const text = (value: unknown, size = 10, bold = false, gap = 5) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(value || ''), width);
    const lineHeight = size * 0.47;
    for (const line of lines) { nextPage(lineHeight); doc.text(line, margin, y); y += lineHeight; }
    y += gap;
  };
  text('AIra Consultor', 11, true, 3);
  text('Anamnese do projeto', 20, true, 8);
  text(project.title, 13, true, 4);
  text(`Setor: ${project.sector === 'publico' ? 'Público' : 'Privado'}`, 10, false, 2);
  text(`Objetivo: ${project.objective}`, 10, false, 4);
  text('Histórico da análise e anamnese. Pareceres são prévios; a decisão final pertence ao usuário.', 9, false, 8);
  nextPage(12);
  doc.setDrawColor(200, 210, 207);
  doc.line(margin, y, 190, y);
  y += 9;
  let questionNumber = 0, opinionNumber = 0;
  for (const entry of report) {
    if (entry.kind === 'pergunta') questionNumber++;
    if (entry.kind === 'parecer') opinionNumber++;
    const heading = entry.kind === 'parecer' ? `Parecer prévio ${opinionNumber} · AIra` : entry.kind === 'pergunta' ? `Pergunta ${questionNumber} · AIra` : entry.kind === 'resposta' ? 'Resposta do usuário' : entry.kind === 'correcao' ? 'Correção registrada' : entry.kind === 'decisao' ? 'Decisão do usuário' : 'Informação adicional';
    nextPage(18);
    text(heading, 11, true, 2);
    text(String(entry.content).replace(/^#{1,6}\s+/gm, '').replace(/\*\*/g, ''), 10, false, 7);
    if (entry.justification) text(`Justificativa: ${entry.justification}`, 9, false, 5);
  }
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`AIra Consultor  |  ${page} / ${totalPages}`, margin, 290);
  }
  return json({ filename: `anamnese-${caseId}.pdf`, pdfBase64: doc.output('datauristring').split(',')[1] });
}));
