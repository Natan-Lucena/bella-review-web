import { useState } from "react";
import type { ReactNode } from "react";

import { SessionContext } from "./session-context";
import type { SessionContextValue } from "./session-context";

// Fase 1 (mockada): a sessão é só uma flag em memória, setada pelas páginas de
// auth mockadas ao "logar". Não existe leitura de localStorage/cookie aqui de
// propósito — a sessão real (Fase 2) é um cookie httpOnly que o frontend nunca
// lê diretamente (ver frontend-especificacao-telas.md, "Comportamentos
// transversais"); o formato externo deste hook (isAuthenticated/login/logout,
// ver useSession.ts) já antecipa isso, só a implementação interna muda quando
// a Fase 2 passar a checar `GET /auth/me` de verdade via TanStack Query.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value: SessionContextValue = {
    isAuthenticated,
    login: () => setIsAuthenticated(true),
    logout: () => setIsAuthenticated(false),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
