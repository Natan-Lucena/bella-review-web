import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders an h2 by default", () => {
    render(<PageHeader title="Nome do repositório" description="Passo 1 de 5" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Nome do repositório" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Passo 1 de 5")).toBeInTheDocument();
  });

  it("renders an h1 when level='h1'", () => {
    render(<PageHeader title="Bella Reviewer" level="h1" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
