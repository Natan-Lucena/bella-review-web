import { describe, expect, it } from "vitest";

import { dedupeSeverities } from "./dedupe-severities";

describe("dedupeSeverities", () => {
  it("removes repeated entries while keeping the first-seen order", () => {
    expect(dedupeSeverities(["high", "low", "high", "critical"])).toEqual([
      "high",
      "low",
      "critical",
    ]);
  });
});
