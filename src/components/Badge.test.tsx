import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it.each([
    ["neutral", "Na fila"],
    ["success", "Concluída"],
    ["warning", "Configuração pendente"],
    ["danger", "Crítico"],
    ["info", "Processando"],
  ] as const)("renders the %s tone with its text", (tone, text) => {
    render(<Badge tone={tone}>{text}</Badge>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
