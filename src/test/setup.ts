import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.ts usa globals: false (mesmo padrão do backend) — sem isso, o
// afterEach(cleanup) que @testing-library/react registra sozinho quando `globals`
// está ligado não é acionado, e o DOM de um teste vaza pro próximo.
afterEach(() => {
  cleanup();
});

// O mock (`src/mocks/api-client.ts`) usa `setTimeout` real (300-500ms) pra
// simular latência de rede — o default de 1000ms do `findBy*`/`waitFor` do
// RTL já é justo mesmo em execução isolada, mas fica curto quando as ~36
// suites do projeto rodam em paralelo (contenção de CPU real). Alargar aqui
// evita flakiness puramente de agendamento, sem mudar o que cada teste
// verifica.
configure({ asyncUtilTimeout: 3000 });
