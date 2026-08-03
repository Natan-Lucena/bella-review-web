import { ApiError } from "../lib/api-error";

// Cliente HTTP real da Fase 2 — cada função de api-client.ts passa por aqui.
// Autenticação via cookie httpOnly, nunca lido/manipulado pelo JS (ver
// frontend-especificacao-telas.md, "Comportamentos transversais"): toda
// chamada precisa de `credentials: "include"` pro navegador enviar/receber o
// cookie de sessão cross-origin (frontend e backend são domínios diferentes
// na Vercel).
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

type ErrorEnvelope = { error?: { code?: string; message?: string } };

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// Formato de erro padrão do backend: `{ error: { code, message } }` (ver
// backend-prds/README.md, "Convenções usadas em todos os PRDs") — `code` vira
// `ApiError.code`, o mesmo contrato que src/mocks/api-client.ts já lança, por
// isso nenhuma página precisa saber se está falando com o mock ou com isto.
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // Mensagem pro usuário é sempre genérica, mas o erro real (timeout, CORS,
    // DNS, etc.) vale logar pra depuração — só o texto exibido é opaco.
    console.error(`Network request failed (${method} ${path}):`, error);
    throw new ApiError("network_error", "Não foi possível conectar ao servidor.");
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = (payload ?? {}) as ErrorEnvelope;
    throw new ApiError(envelope.error?.code ?? "unknown_error", envelope.error?.message);
  }

  return payload as T;
}
