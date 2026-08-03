import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { SESSION_QUERY_KEY } from "../data/session-context";
import { ApiError } from "../lib/api-error";

// 401 em qualquer chamada (não só GET /auth/me) precisa derrubar a sessão em
// cache, pra RequireAuth reagir e redirecionar pro login preservando a rota
// atual (ver frontend-especificacao-telas.md, "Comportamentos transversais":
// "401 em qualquer chamada → redirecionar para /login"). Sem isto, uma
// sessão expirada só seria percebida na próxima vez que algo re-consultasse
// GET /auth/me especificamente, não na primeira chamada que já falhou.
function handleGlobalError(error: unknown): void {
  if (error instanceof ApiError && error.code === "not_authenticated") {
    // `null`, não `undefined` — ver o mesmo comentário em SessionProvider.tsx.
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  }
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleGlobalError }),
  mutationCache: new MutationCache({ onError: handleGlobalError }),
});
