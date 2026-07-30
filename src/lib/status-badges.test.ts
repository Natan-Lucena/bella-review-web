import { describe, expect, it } from "vitest";

import { repoConfigBadgeProps } from "./status-badges";

describe("repoConfigBadgeProps", () => {
  it("maps true to a success tone labeled 'Pronto para revisar'", () => {
    expect(repoConfigBadgeProps(true)).toEqual({ tone: "success", label: "Pronto para revisar" });
  });

  it("maps false to a warning tone labeled 'Configuração pendente' (never 'incompleto')", () => {
    expect(repoConfigBadgeProps(false)).toEqual({
      tone: "warning",
      label: "Configuração pendente",
    });
  });
});
