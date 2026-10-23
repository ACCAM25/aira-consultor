import React, { useState } from 'react';
import { PenLine } from 'lucide-react';

export default function ObjectiveEditor({ objective, busy, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(objective || '');
  function cancel() { setEditing(false); setValue(objective || ''); }
  return <div>
    <p className="text-[11px] font-bold tracking-[.15em] uppercase text-stone-500 mb-2">Objetivo</p>
    {editing ? <form onSubmit={async e => { e.preventDefault(); if (await onSave(value.trim())) setEditing(false); }} className="space-y-3">
      <label className="sr-only" htmlFor="objective-correction">Objetivo da avaliação</label>
      <textarea id="objective-correction" required maxLength={12000} rows={4} value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-700/30" />
      <div className="flex flex-wrap gap-2"><button type="submit" disabled={busy} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Salvando…' : 'Salvar objetivo'}</button><button type="button" disabled={busy} onClick={cancel} className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50">Cancelar</button></div>
    </form> : <><p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{objective}</p><button type="button" disabled={busy} onClick={() => { setValue(objective || ''); setEditing(true); }} className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"><PenLine size={14}/>Corrigir objetivo</button></>}
  </div>;
}