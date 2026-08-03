import * as mockClient from "../mocks/api-client";
import * as realClient from "../api/api-client";

// Ponto único de alternância entre o mock (Fase 1) e o cliente HTTP real
// (Fase 2) — todo hook de src/data/ importa `apiClient` daqui, nunca direto
// de src/mocks/ ou src/api/. `import.meta.env.MODE === "test"` é exatamente
// o modo que o Vitest usa por padrão, então a suíte inteira continua rodando
// contra o mock sem precisar de nenhum alias de bundler nem de tocar em
// nenhum arquivo de teste — só troca em `vite dev`/`vite build`, onde MODE é
// "development"/"production".
//
// Exporta o objeto inteiro (`apiClient.listRepos(...)`), não uma constante
// por função (`export const listRepos = client.listRepos`) — isso último
// tira uma cópia estática da função no momento em que este módulo é
// avaliado, e quebra qualquer teste que faça `vi.spyOn(mockApiClient,
// "algumaFunção")` depois desse ponto (o spy substitui a propriedade no
// módulo do mock, mas a cópia estática já capturada aqui nunca veria essa
// substituição). Acessar `apiClient.listRepos` a cada chamada, no objeto de
// namespace original, preserva o binding vivo do ES module.
//
// `getRepoSettings` não está aqui de propósito: não existe endpoint real
// equivalente (ver PRD da Fase 2, "Tela 6 escreve às cegas") — quem ainda
// precisa dele importa `src/mocks/api-client.ts` diretamente, e essa última
// referência some quando a Tela 6 for adaptada.
export const apiClient = import.meta.env.MODE === "test" ? mockClient : realClient;
