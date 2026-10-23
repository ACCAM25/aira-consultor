# AIra Consultor

Plataforma para conduzir projetos com o método AIra (Diagnóstico Express em cinco etapas, por enquanto).
Migrada do Base44 em outubro de 2026.

## Arquitetura

| Camada | Onde roda | Pasta |
|---|---|---|
| Front-end (React + Vite + Tailwind) | Vercel | `src/` |
| Banco, login e arquivos | Supabase (`aira-consultor`, região São Paulo) | `supabase/migrations/` |
| Funções de análise com IA (Claude) | Supabase Edge Functions | `supabase/functions/` |

- `src/api/client.js` concentra o acesso a dados; as telas não falam com o Supabase diretamente.
- Todas as leituras e gravações passam por RLS: cada usuário vê só os próprios casos; administradores veem a lista de todos os casos.
- As funções usam o token do usuário (não a chave de serviço), então também respeitam o RLS.
- Arquivos dos casos ficam no bucket privado `case-files`, em pastas por usuário.

## Funções

| Função | O que faz |
|---|---|
| `analyze-case` | Conduz a etapa atual do Diagnóstico Express e grava o parecer |
| `revalidate-objective` | Confronta o objetivo com documentos e informações novas |
| `export-anamnesis` | Gera o PDF da anamnese |

Secrets necessários no Supabase (Edge Functions > Secrets):
- `ANTHROPIC_API_KEY` (obrigatório)
- `ANTHROPIC_MODEL` (opcional; padrão `claude-sonnet-5-5`)

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Publicar

- Front-end: cada push na branch `main` publica na Vercel automaticamente.
- Banco: novas migrations em `supabase/migrations/` (aplicar com `supabase db push` ou pelo painel).
- Funções: `supabase functions deploy <nome>`.
