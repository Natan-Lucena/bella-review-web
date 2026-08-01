/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    // A paralelização padrão entre arquivos demonstrou (diagnosticado com
    // logging temporário, cross-referenciando timestamps) compartilhar o
    // registro de módulos sob carga pesada — dois arquivos usando
    // `src/mocks/api-client.ts` (estado mutável em nível de módulo,
    // resetado via `resetMockData()` no `beforeEach` de cada um) acabavam
    // lendo/resetando o MESMO array `repos`, causando `repo_not_found`
    // intermitente quando uma mutation de um arquivo ainda estava em voo
    // (delay real de 500ms) no momento em que outro arquivo chamava
    // `resetMockData()`. `pool: "forks"` sozinho não eliminou — o cache de
    // transformação do vite-node parece sobreviver mesmo entre processos
    // reaproveitados do pool. `fileParallelism: false` roda os arquivos
    // estritamente em sequência, eliminando a corrida por completo (testado
    // repetidamente sem flakiness, contra paralelismo padrão que falhava
    // intermitentemente).
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.tsx", "src/mocks/**", "src/test/**"],
    },
  },
});
