import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useSession } from "../data/useSession";

type RequireAuthProps = {
  children: ReactNode;
};

// Guarda de autenticação — 401 (ou, na Fase 1, sessão ausente) redireciona
// silenciosamente para /login, preservando a rota pretendida via ?redirect=
// para voltar exatamente para lá depois do login. Ver
// frontend-especificacao-telas.md, "Comportamentos transversais".
export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isPending } = useSession();
  const location = useLocation();

  // Checagem inicial de sessão (GET /auth/me) ainda em voo — sem isto,
  // redirecionaria pro login por um instante mesmo com um cookie de sessão
  // válido, já que `isAuthenticated` começa `false` até a resposta chegar.
  if (isPending) {
    return null;
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return <>{children}</>;
}
