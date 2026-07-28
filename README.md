# Bella Reviewer — Web

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dGhyZTRkeW0zczY1NnlmZTRsaTdjOW8yNmNhZ3I2bnloZDIzMmthOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mEmDQAm7mjoC4/giphy.gif" alt="Bella" width="280">
</p>

Painel web da [Bella Reviewer](https://github.com/Natan-Lucena/bella-reviewer-api) — a
plataforma de code review assistido por IA. É aqui que o usuário cria conta, cadastra
repositórios, configura credenciais (chave do Gemini, PAT do GitHub), gera o token que a
[GitHub Action](https://github.com/Natan-Lucena/bella-review-action) usa para se
autenticar, e acompanha o histórico de execuções, comentários e consumo de tokens.

## Stack

- React 19 + TypeScript, Vite.
- Tailwind CSS (tema escuro/suave próprio, não a paleta padrão).
- React Router para navegação.
- TanStack Query para todo o estado de servidor.
- Vitest + React Testing Library.

## Rodando localmente

```bash
pnpm install
pnpm dev
```

- `pnpm build` — build de produção.
- `pnpm test` — testes.
- `pnpm lint` / `pnpm format` — lint (ESLint) e formatação (Prettier).

## Estado do projeto

Em desenvolvimento inicial: a biblioteca de componentes compartilhados está sendo
construída primeiro, para servir de base a todas as telas. A aplicação hoje roda com
dados mockados — a integração com a API real do backend é uma etapa posterior.
