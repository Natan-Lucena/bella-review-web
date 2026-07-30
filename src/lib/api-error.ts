// Espelha o formato de erro da API real (código estável em `error.code`, ver
// frontend-especificacao-telas.md) — vive em `lib/`, não em `mocks/`, porque é
// o contrato de erro que sobrevive à Fase 2 (o `fetch` real lança o mesmo tipo
// a partir do corpo de erro HTTP): páginas podem importar isto para checar
// `error.code` sem violar "nenhuma página importa de src/mocks/ diretamente".
export class ApiError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
  }
}
