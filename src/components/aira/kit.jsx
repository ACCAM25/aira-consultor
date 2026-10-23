import React from 'react';
import { cn } from '@/lib/utils';

const TONE = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-rose-50 text-rose-800 ring-rose-200',
  blue: 'bg-blue-50 text-blue-800 ring-blue-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Pill({ tone = 'slate', children, className }) {
  if (!children) return null;
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', TONE[tone] || TONE.slate, className)}>{children}</span>;
}

export function Panel({ title, description, action, children, className, id }) {
  return (
    <section id={id} className={cn('rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[.16em] text-blue-700">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Btn({ variant = 'primary', size = 'md', className, ...props }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    outline: 'border border-border bg-card hover:bg-muted text-foreground',
    ghost: 'hover:bg-muted text-foreground',
    danger: 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
    soft: 'bg-blue-50 text-blue-900 hover:bg-blue-100',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-sm' };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0', styles[variant], sizes[size], className)} {...props} />;
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />}
      <p className="font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// group: o conteúdo é um grupo de controles (botões, várias caixas); não usa <label> para não acionar o primeiro controle.
export function Field({ label, hint, required, children, className, group }) {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className={cn('block', className)} {...(group ? { role: 'group', 'aria-label': label } : {})}>
      <span className="mb-1.5 block text-sm font-medium">{label}{required && <span className="text-rose-600"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </Tag>
  );
}

const inputBase = 'w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60';
export const TextInput = React.forwardRef(({ className, ...props }, ref) => <input ref={ref} className={cn(inputBase, 'h-10', className)} {...props} />);
TextInput.displayName = 'TextInput';
export const TextArea = React.forwardRef(({ className, rows = 3, ...props }, ref) => <textarea ref={ref} rows={rows} className={cn(inputBase, 'py-2 leading-6', className)} {...props} />);
TextArea.displayName = 'TextArea';
export function Select({ options = [], placeholder = 'Selecione', className, value, ...props }) {
  return (
    <select className={cn(inputBase, 'h-10 pr-8', className)} value={value ?? ''} {...props}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}

export function CheckRow({ checked, onChange, disabled, children, note }) {
  return (
    <label className={cn('flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors', !disabled && 'cursor-pointer hover:bg-muted', checked && 'bg-emerald-50/60')}>
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" checked={!!checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} />
      <span className="min-w-0 text-sm leading-5">
        <span className={cn(checked && 'text-muted-foreground line-through decoration-emerald-600/40')}>{children}</span>
        {note && <span className="mt-0.5 block text-xs text-muted-foreground no-underline">{note}</span>}
      </span>
    </label>
  );
}

export function ProgressBar({ value, total, className }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ErrorNote({ error }) {
  if (!error) return null;
  return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error.message || String(error)}</div>;
}

export function Loading({ label = 'Carregando…' }) {
  return <div className="flex items-center gap-3 py-16 text-sm text-muted-foreground justify-center"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />{label}</div>;
}

export const fmtDate = d => (d ? new Date(String(d).length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('pt-BR') : '');
export const fmtDateTime = d => (d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');
