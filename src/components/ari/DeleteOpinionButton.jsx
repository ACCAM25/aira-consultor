import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

export default function DeleteOpinionButton({ onDelete, busy }) {
  const [open, setOpen] = useState(false);
  return <AlertDialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
    <AlertDialogTrigger asChild><button type="button" disabled={busy} className="flex items-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive disabled:opacity-50"><Trash2 size={15}/>Excluir parecer</button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Excluir o parecer inteiro?</AlertDialogTitle><AlertDialogDescription>O parecer será removido do caso. Perguntas, respostas, correções e demais registros serão preservados. Esta ação não pode ser desfeita por aqui.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel type="button" disabled={busy}>Cancelar</AlertDialogCancel><AlertDialogAction type="button" disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async event => { event.preventDefault(); if (await onDelete()) setOpen(false); }}>{busy ? 'Excluindo…' : 'Confirmar exclusão'}</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}