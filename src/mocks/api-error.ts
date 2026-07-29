// Espelha o formato de erro da API real (código estável em `error.code`, ver
// frontend-especificacao-telas.md) — na Fase 2, o cliente `fetch` real lança o
// mesmo tipo a partir do corpo de erro HTTP, sem exigir mudança nos hooks/telas
// que já tratam `error.code`.
export class ApiError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
  }
}
