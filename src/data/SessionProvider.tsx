import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";

import type { User } from "../types/user";
import { apiClient } from "./api-client";
import { SESSION_QUERY_KEY, SessionContext } from "./session-context";
import type { SessionContextValue } from "./session-context";

const STALE_TIME_MS = 60_000;

// Sessão real via cookie httpOnly, nunca lido/escrito diretamente pelo
// frontend (ver frontend-especificacao-telas.md, "Comportamentos
// transversais") — só `GET /auth/me` diz se há uma sessão válida. `login()`
// escreve o resultado da mutation de login direto no cache em vez de esperar
// um round-trip extra pra /auth/me logo em seguida. `logout()` só limpa o
// cache local: não existe endpoint de logout real (ver
// frontend-especificacao-telas.md, "Notas para produto/design", item 8, "sem
// uma ação de 'Sair' real para desenhar") — usado internamente quando um 401
// em qualquer chamada precisa derrubar a sessão (ver query-client.ts).
export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    staleTime: STALE_TIME_MS,
  });

  // `useCallback`/`useMemo` aqui não são só uma otimização: `setQueryData`
  // notifica os observers da query mesmo quando o valor não muda (diferente
  // do bail-out do `useState` do React em valores idênticos) — sem uma
  // referência estável, `login`/`logout` novos a cada render fariam qualquer
  // consumidor com `useEffect([login])` reexecutar o efeito, chamar login()
  // de novo, re-renderizar de novo, e entrar num loop infinito.
  const login = useCallback(
    (user: User) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    // `null`, não `undefined`: o TanStack Query trata um valor (ou retorno
    // de updater) `undefined` como "não faça nada" — um jeito de abortar a
    // atualização, não de limpar o dado. `null` é um valor de verdade, seta
    // o cache imediatamente e notifica os observers na hora (diferente de
    // `removeQueries`, que só marca a query como "precisa buscar de novo" e
    // depende do observer ativo decidir refazer a busca sozinho).
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
  }, [queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({ isAuthenticated: !!data, isPending, login, logout }),
    [data, isPending, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
