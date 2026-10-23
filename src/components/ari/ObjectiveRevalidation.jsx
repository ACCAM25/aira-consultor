import React from 'react';
import { ScanSearch } from 'lucide-react';

export default function ObjectiveRevalidation({ required, unread, result, error, validating, busy, onRevalidate, onApprove, onDismiss }) {
  return <section className="border-t pt-5 space-y-3" aria-label="Revalidar objetivo">
    {(required || unread) && <div role="status" className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm text-foreground"><p className="font-semibold text-primary">{required ? 'Documentos alterados: revalide o objetivo' : 'Leitura não confirmada: revise o objetivo'}</p><p className="mt-1 text-xs leading-relaxed">{required ? 'Arquivos foram incluídos ou removidos. Use o botão abaixo para revalidar o objetivo antes de solicitar outro parecer.' : 'Há arquivos não lidos ou parcialmente lidos. Revalide o objetivo e, se necessário, remova ou substitua esses arquivos e solicite um novo parecer.'}</p></div>}
    <button type="button" disabled={validating || busy} onClick={onRevalidate} className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary px-3 py-2.5 text-sm font-semibold text-blue-900 disabled:opacity-50">
      <ScanSearch size={16}/>{validating ? 'Revalidando objetivo…' : 'Revalidar objetivo'}
    </button>
    <p className="text-xs text-stone-500">Confronte o objetivo com documentos e informações adicionais. Nenhuma alteração será feita sem sua aprovação.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {result && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3 text-sm text-slate-800">
      <p className="font-semibold">{result.changed ? 'Atualização sugerida' : 'Objetivo mantido'}</p>
      <p className="whitespace-pre-wrap">{result.reason}</p>
      {result.changed && <><p className="font-semibold">Objetivo proposto</p><p className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-3 border">{result.suggestion}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={onApprove} className="rounded-lg bg-primary px-3 py-2 text-white font-semibold disabled:opacity-50">{busy ? 'Salvando…' : 'Aprovar alteração'}</button><button type="button" disabled={busy} onClick={onDismiss} className="rounded-lg border px-3 py-2 font-medium disabled:opacity-50">Descartar proposta</button></div></>}
    </div>}
  </section>;
}