import { describe, expect, it } from "vitest";

import { formatCurrency, formatNumber, formatPercent } from "./format-number";

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

describe("formatPercent", () => {
  it("formats with a trailing % sign and pt-BR decimal comma", () => {
    expect(formatPercent(75)).toBe("75%");
    expect(formatPercent(87.5)).toBe("87,5%");
  });

  it("rounds to a single decimal place", () => {
    expect(formatPercent(66.666666)).toBe("66,7%");
  });

  it("formats 0 as 0%, distinct from the null case callers handle themselves", () => {
    expect(formatPercent(0)).toBe("0%");
  });
});
