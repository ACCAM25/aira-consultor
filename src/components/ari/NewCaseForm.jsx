import React, { useState } from 'react';
import { X } from 'lucide-react';
export default function NewCaseForm({ onSave, onClose, busy, initial }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [sector, setSector] = useState(initial?.sector || 'publico');
  const [objective, setObjective] = useState(initial?.objective || '');
  const [website, setWebsite] = useState(initial?.company_website || '');
  return <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial ? 'Editar projeto' : 'Novo projeto'}>
    <form onSubmit={e => { e.preventDefault(); onSave({title: title.trim(), sector, objective: objective.trim(), company_website: website.trim()}); }} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold tracking-[.2em] uppercase text-blue-700">{initial ? 'Projeto salvo' : 'Novo projeto'}</p><h2 className="text-2xl font-semibold mt-1">{initial ? 'Editar projeto' : 'Comece pela decisão'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="p-2 rounded-lg hover:bg-stone-100"><X size={19}/></button></div>
      <label className="block text-sm font-medium">Título do caso<input autoFocus required maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Governança do uso de IA" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-700/30"/></label>
      <label className="block text-sm font-medium">Setor<select value={sector} onChange={e=>setSector(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="publico">Público</option><option value="privado">Privado</option></select></label>
      <div><label className="block text-sm font-medium" htmlFor="company-website">Site oficial da empresa (opcional)</label><input id="company-website" type="url" maxLength={2048} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://www.empresa.com.br" aria-describedby="company-website-help" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"/><p id="company-website-help" className="mt-2 text-xs text-muted-foreground">O AIra consultará informações públicas desse site ao elaborar o parecer e indicará as fontes ou limitações da consulta.</p></div>
      <label className="block text-sm font-medium">Objetivo da avaliação<textarea required maxLength={12000} rows={4} value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Que decisão você quer apoiar com esta análise?" className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-700/30"/></label>
      <button disabled={busy} className="w-full rounded-xl bg-primary text-white py-3 font-semibold disabled:opacity-50">{busy ? 'Salvando…' : initial ? 'Salvar projeto' : 'Criar projeto'}</button>
    </form>
  </div>;
}