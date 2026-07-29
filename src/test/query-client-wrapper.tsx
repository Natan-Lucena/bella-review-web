import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Uma QueryClient nova por teste, sem retry — evita testes lentos/flakey ao
// exercitar caminhos de erro do mock (ver react.md, "TanStack Query v5").
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// TanStack Query só re-renderiza um `useQuery` quando uma propriedade
// efetivamente LIDA durante o render muda ("tracked properties"). Um teste que
// só repassa o objeto inteiro (`return useRepos()`) sem tocar em `data`/
// `isSuccess` não conta como leitura, então uma invalidação disparada por outro
// hook nunca é notificada a esse observer. Telas de verdade sempre leem `data`/
// `isSuccess` dentro do JSX, então isso nunca aparece fora de teste — mas
// qualquer teste que invalide de um hook e verifique o resultado em OUTRO
// precisa forçar essa leitura explicitamente.
export function trackQueryResult<T>(query: UseQueryResult<T>): UseQueryResult<T> {
  void query.data;
  void query.isSuccess;
  void query.isFetching;
  return query;
}
