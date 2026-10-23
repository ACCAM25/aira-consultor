import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { askAira } from '@/api/data';
import { Btn, ErrorNote } from './kit';

/** Botão que pede apoio ao assistente AIra. O resultado é sugestão: nada é gravado sem ação do usuário. */
export default function AiraAssist({ action, projectId, extra, label = 'Pedir apoio ao AIra', title, onUse, useLabel = 'Usar este texto', disabled }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function run() {
    setOpen(true); setBusy(true); setError(null); setResult(null);
    try { setResult(await askAira(action, projectId, extra)); } catch (e) { setError(e); } finally { setBusy(false); }
  }

  return (
    <>
      <Btn type="button" variant="soft" size="sm" onClick={run} disabled={disabled}><Sparkles />{label}</Btn>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title || label}</DialogTitle>
            <DialogDescription>Sugestão do assistente com base nos registros do projeto. Revise antes de usar; a decisão é sua.</DialogDescription>
          </DialogHeader>
          {busy && <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Analisando o projeto…</div>}
          <ErrorNote error={error} />
          {result?.text && <div className="prose prose-sm max-w-none text-sm leading-6 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc [&_p]:my-2"><ReactMarkdown>{result.text}</ReactMarkdown></div>}
          {result?.text && (
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Btn variant="outline" onClick={() => navigator.clipboard?.writeText(result.text)}>Copiar</Btn>
              {onUse && <Btn onClick={async () => { await onUse(result); setOpen(false); }}>{useLabel}</Btn>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
