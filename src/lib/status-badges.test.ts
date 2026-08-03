import { describe, expect, it } from "vitest";

import {
  commentStatusBadgeProps,
  repoConfigBadgeProps,
  runStatusBadgeProps,
  runTriggerBadgeProps,
  serviceStateBadgeProps,
  severityBadgeProps,
} from "./status-badges";

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

describe("runStatusBadgeProps", () => {
  it.each([
    ["queued", { tone: "neutral", label: "Na fila" }],
    ["processing", { tone: "info", label: "Processando" }],
    ["completed", { tone: "success", label: "Concluída" }],
    ["failed", { tone: "danger", label: "Falhou" }],
  ] as const)("maps %s to %o", (status, expected) => {
    expect(runStatusBadgeProps(status)).toEqual(expected);
  });
});

describe("runTriggerBadgeProps", () => {
  it("maps both triggers to the neutral tone (color never distinguishes them, only the text)", () => {
    expect(runTriggerBadgeProps("action")).toEqual({ tone: "neutral", label: "Action" });
    expect(runTriggerBadgeProps("webhook")).toEqual({ tone: "neutral", label: "Webhook" });
  });
});

describe("severityBadgeProps", () => {
  it.each([
    ["critical", { tone: "danger", label: "Crítica" }],
    ["high", { tone: "warning", label: "Alta" }],
    ["medium", { tone: "warning", label: "Média" }],
    ["low", { tone: "neutral", label: "Baixa" }],
  ] as const)("maps %s to %o", (severity, expected) => {
    expect(severityBadgeProps(severity)).toEqual(expected);
  });
});

describe("commentStatusBadgeProps", () => {
  it.each([
    ["generated", { tone: "neutral", label: "Gerado" }],
    ["published", { tone: "success", label: "Publicado no GitHub" }],
    ["discarded", { tone: "neutral", label: "Descartado" }],
    ["outdated", { tone: "neutral", label: "Desatualizado" }],
  ] as const)("maps %s to %o", (status, expected) => {
    expect(commentStatusBadgeProps(status)).toEqual(expected);
  });
});
