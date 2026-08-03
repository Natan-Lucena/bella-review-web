import { createContext } from "react";
import type { User } from "../types/user";

export type SessionContextValue = {
  isAuthenticated: boolean;
  // Verdadeiro só durante a checagem inicial de sessão (GET /auth/me em voo,
  // sem nenhum dado em cache ainda) — RequireAuth precisa disso pra não
  // redirecionar pro login por um instante mesmo com um cookie válido. Ver
  // PRD da Fase 2.
  isPending: boolean;
  login: (user: User) => void;
  logout: () => void;
};

// Split from SessionProvider.tsx/useSession.ts on purpose — a file exporting
// both a context/hook and a component breaks React Fast Refresh (it can't
// tell which parts are safe to hot-swap).
export const SessionContext = createContext<SessionContextValue | null>(null);

// Também fica aqui (não em SessionProvider.tsx) pelo mesmo motivo — só
// constantes/hooks, nenhum componente. query-client.ts (o handler global de
// 401) importa isto sem precisar importar o componente SessionProvider.
export const SESSION_QUERY_KEY = ["auth", "me"] as const;
