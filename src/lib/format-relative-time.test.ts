import { describe, expect, it } from "vitest";

import { formatExactDateTime, formatRelativeTime } from "./format-relative-time";

const NOW = new Date("2026-07-21T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it("shows 'agora mesmo' for less than a minute ago", () => {
    expect(formatRelativeTime("2026-07-21T11:59:30.000Z", NOW)).toBe("agora mesmo");
  });

  it("shows minutes ago, singular for exactly 1", () => {
    expect(formatRelativeTime("2026-07-21T11:59:00.000Z", NOW)).toBe("há 1 minuto");
    expect(formatRelativeTime("2026-07-21T11:48:00.000Z", NOW)).toBe("há 12 minutos");
  });

  it("shows hours ago, singular for exactly 1", () => {
    expect(formatRelativeTime("2026-07-21T11:00:00.000Z", NOW)).toBe("há 1 hora");
    expect(formatRelativeTime("2026-07-21T10:00:00.000Z", NOW)).toBe("há 2 horas");
  });

  it("shows 'ontem' between 1 and 2 days ago", () => {
    expect(formatRelativeTime("2026-07-20T09:00:00.000Z", NOW)).toBe("ontem");
  });

  it("shows days ago up to the 30-day cutoff", () => {
    expect(formatRelativeTime("2026-07-16T12:00:00.000Z", NOW)).toBe("há 5 dias");
  });

  it("falls back to an absolute date past the 30-day cutoff", () => {
    expect(formatRelativeTime("2026-06-01T12:00:00.000Z", NOW)).toBe("01/06/2026");
  });
});

describe("formatExactDateTime", () => {
  it("formats as dd/mm/aaaa HH:mm", () => {
    expect(formatExactDateTime("2026-07-21T09:12:00.000Z")).toBe("21/07/2026, 09:12");
  });
});
