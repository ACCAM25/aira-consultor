import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export function BrandLogo({ className = 'h-9 w-[72px]' }) {
  return <img src="/logo-branco.jpg" alt="AIra" className={`${className} shrink-0 object-contain`} />;
}

export default function AppShell({ children, crumb }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <BrandLogo />
              <span className="hidden font-semibold tracking-tight sm:inline">Consultor</span>
            </Link>
            {crumb && <><span className="text-muted-foreground">/</span><span className="truncate text-sm font-medium">{crumb}</span></>}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-xs text-muted-foreground md:inline">{user?.email}</span>
            <button onClick={logout} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sair</span></button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
