import React, { useState } from 'react';
import { FileText, CircleAlert, Check, Clock3, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';

export default function CaseDocuments({ documents, busy, onDownload, onRemove }) {
  const [selected, setSelected] = useState(null);
  return <>
    <div className="space-y-3">{documents.length ? documents.map(doc => <div key={doc.id} className="flex items-start gap-2.5 text-sm">
      <FileText size={17} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1"><button disabled={busy} onClick={() => onDownload(doc)} className="text-left font-medium break-all hover:underline">{doc.name}</button>
        <p className="mt-0.5 text-xs text-muted-foreground">{doc.read_status === 'lido' ? <><Check size={12} className="inline" /> Leitura indicada</> : ['parcial', 'nao_lido'].includes(doc.read_status) ? <><CircleAlert size={12} className="inline" />{doc.read_status === 'parcial' ? ' Leitura parcial' : ' Não lido'}</> : <><Clock3 size={12} className="inline" /> Aguardando análise</>}</p>
        {doc.read_note && <p className="mt-1 text-xs text-muted-foreground">{doc.read_note}</p>}
      </div>
      <button type="button" disabled={busy} onClick={() => setSelected(doc)} aria-label={`Remover ${doc.name}`} className="shrink-0 rounded-lg p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-40"><Trash2 size={16} /></button>
    </div>) : <p className="text-sm text-muted-foreground">Nenhum arquivo recebido.</p>}</div>
    <AlertDialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Remover documento?</AlertDialogTitle><AlertDialogDescription>O arquivo {selected?.name} deixará de participar das próximas análises deste caso. Pareceres anteriores serão preservados. Após remover, revalide o objetivo.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel><button type="button" disabled={busy} onClick={async () => { if (selected && await onRemove(selected)) setSelected(null); }} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50">{busy ? 'Removendo…' : 'Remover arquivo'}</button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}