import { describe, expect, it } from "vitest";

import { repoConfigBadgeProps, serviceStateBadgeProps } from "./status-badges";

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

describe("serviceStateBadgeProps", () => {
  it.each([
    ["active", { tone: "success", label: "Ativo" }],
    ["configuration_pending", { tone: "warning", label: "Configuração pendente" }],
    ["inactive", { tone: "neutral", label: "Inativo" }],
  ] as const)("maps %s to %o", (serviceState, expected) => {
    expect(serviceStateBadgeProps(serviceState)).toEqual(expected);
  });
});
