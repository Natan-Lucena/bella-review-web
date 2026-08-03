import { describe, expect, it } from "vitest";

import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("formats sub-minute durations as seconds", () => {
    expect(formatDuration(48000)).toBe("48s");
  });

  it("formats minute-plus durations as minutes and seconds", () => {
    expect(formatDuration(72000)).toBe("1m 12s");
  });

  it("shows an em dash for a null duration (not finished, or failed before startedAt)", () => {
    expect(formatDuration(null)).toBe("—");
  });

  it("rounds sub-second durations", () => {
    expect(formatDuration(1200)).toBe("1s");
  });
});
