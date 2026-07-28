import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest.config.ts usa globals: false (mesmo padrão do backend) — sem isso, o
// afterEach(cleanup) que @testing-library/react registra sozinho quando `globals`
// está ligado não é acionado, e o DOM de um teste vaza pro próximo.
afterEach(() => {
  cleanup();
});
