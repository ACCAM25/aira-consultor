import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, UserPlus } from 'lucide-react';
import RegisterView from '@/components/aira/RegisterView';
import { Btn, ErrorNote, Field, Panel, Pill, Select, TextInput } from '@/components/aira/kit';
import { useInviteMember, useMembers, useRemoveMember } from '@/api/data';
import { ROLES } from '@/canon/aira';
import { active } from '@/canon/engine';

const ACCESS = [
  { id: 'lider', name: 'Líder (edita e gerencia a equipe)' },
  { id: 'consultor', name: 'Consultor (edita)' },
  { id: 'revisor', name: 'Revisor metodológico (edita)' },
  { id: 'cliente', name: 'Cliente (somente leitura)' },
];

function Team({ project, readOnly, role }) {
  const members = useMembers(project.id);
  const invite = useInviteMember(project.id);
  const remove = useRemoveMember(project.id);
  const [form, setForm] = useState({ email: '', role: 'consultor' });
  const [error, setError] = useState(null);
  const isLead = role === 'lider';

  async function submit(e) {
    e.preventDefault(); setError(null);
    try { await invite.mutateAsync(form); setForm({ email: '', role: 'consultor' }); } catch (err) { setError(err.message.includes('duplicate') ? new Error('Essa pessoa já está na equipe.') : err); }
  }

  return (
    <Panel title="Equipe com acesso ao sistema" description="Quem pode abrir este projeto. Convidados sem conta passam a ter acesso assim que se cadastrarem com o mesmo e-mail.">
      <ul className="divide-y divide-border">
        {(members.data || []).map(m => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
            <span className="min-w-0 truncate">{m.email}</span>
            <span className="flex items-center gap-2">
              <Pill tone={m.role === 'cliente' ? 'amber' : 'blue'}>{ACCESS.find(a => a.id === m.role)?.name.split(' (')[0]}</Pill>
              {!m.user_id && <Pill>convite pendente</Pill>}
              {isLead && !readOnly && m.role !== 'lider' && <button onClick={() => remove.mutate(m.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remover"><Trash2 className="h-4 w-4" /></button>}
            </span>
          </li>
        ))}
      </ul>
      {isLead && !readOnly && (
        <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_240px_auto] sm:items-end">
          <Field label="E-mail"><TextInput type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="pessoa@organizacao.com" /></Field>
          <Field label="Acesso"><Select options={ACCESS} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Acesso" /></Field>
          <Btn type="submit" disabled={invite.isPending}><UserPlus />Convidar</Btn>
        </form>
      )}
      <div className="mt-3"><ErrorNote error={error} /></div>
    </Panel>
  );
}

export default function People() {
  const { project, records, readOnly, role } = useOutletContext();
  const people = active(records, 'papel');
  const missing = ['sponsor', 'autoridade', 'lider'].filter(r => !people.some(p => p.data?.papel === r));
  return (
    <div className="space-y-8">
      <RegisterView kind="papel" project={project} records={records} readOnly={readOnly}>
        {() => missing.length > 0 && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Papéis mínimos ainda não nomeados: {missing.map(id => ROLES.find(r => r.id === id).name).join(', ')}.</p>
        )}
      </RegisterView>
      <Team project={project} readOnly={readOnly} role={role} />
    </div>
  );
}
