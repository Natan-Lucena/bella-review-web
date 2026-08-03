import { describe, expect, it } from "vitest";

import { formatCurrency, formatNumber } from "./format-number";

describe("formatNumber", () => {
  it("formats with pt-BR thousand separators", () => {
    expect(formatNumber(1842900)).toBe("1.842.900");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatCurrency", () => {
  it("formats as pt-BR BRL", () => {
    expect(formatCurrency(1.23)).toBe("R$ 1,23");
  });
});
