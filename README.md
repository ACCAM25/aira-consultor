# AIra Consultor

Sistema de gestão de projetos conduzidos com o método AIra (cânone 3.0, Manual de Implementação 3.0).

## O que o sistema faz

- **Assistente de criação**: qualificação da demanda (passo 1), pergunta executiva com teste de qualidade (passo 2), modo de aplicação sugerido pelo tipo de objeto (passo 3) e prazo.
- **Próximo passo**: o painel lê o estado do projeto e indica o que o método pede a seguir.
- **Jornada F0–F6**: critérios de saída por fase, entregável mínimo, instrumentos e gates de referência; avançar com critérios em aberto exige exceção registrada.
- **Registros (§24)**: evidências com grau de confiança, gaps com ranking 3V + (6 − E) + (6 − R), decisões, atas de gate, pendências, mudanças, encaminhamentos, papéis, instrumentos e entregáveis. Nada é apagado: arquivar mantém o histórico.
- **Saúde metodológica**: verificação automática das não conformidades graves (§21.3).
- **Dossiê e handoff**: montado a partir dos registros, com revisão de qualidade, Termo de Conclusão e encerramento formal. Imprime ou salva em PDF.
- **Equipe**: líder, consultor, revisor e cliente (somente leitura), por projeto.
- **Perfil setor público**: critérios adicionais (autoridade formal, controle externo, LGPD, Lei 14.133) sobre o mesmo cânone.
- **Assistente AIra (Claude)**: revisão da pergunta executiva e rascunho do entregável da fase.

## Onde está cada regra

| Arquivo | Conteúdo |
|---|---|
| `src/canon/aira.js` | Fases, critérios, módulos, modos, gates, instrumentos, fórmula de prioridade e impressão digital SHA-256 |
| `src/canon/registers.js` | Campos de cada registro |
| `src/canon/engine.js` | Próximo passo e saúde metodológica |

Mudou o cânone? Altere esses arquivos: a impressão digital muda e projetos antigos passam a exibir o alerta.

## Infraestrutura

| Camada | Onde roda | Pasta |
|---|---|---|
| Front-end (React + Vite + Tailwind) | Vercel | `src/` |
| Banco, login, arquivos e RLS | Supabase `aira-consultor` (São Paulo) | `supabase/migrations/` |
| Assistente de IA | Supabase Edge Function `aira-assist` | `supabase/functions/` |

Secrets do Supabase (Edge Functions > Secrets): `ANTHROPIC_API_KEY` (obrigatório para o assistente) e `ANTHROPIC_MODEL` (opcional).

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Cada push na `main` publica na Vercel.
