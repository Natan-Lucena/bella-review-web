import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkflowYamlBlock } from "./WorkflowYamlBlock";

const EXPECTED_YAML = [
  "name: Bella Reviewer",
  "",
  "on:",
  "  pull_request:",
  "    types: [opened, synchronize, reopened]",
  "",
  "jobs:",
  "  bella-review:",
  "    runs-on: ubuntu-latest",
  "    permissions:",
  "      pull-requests: read",
  "    steps:",
  "      - uses: Natan-Lucena/bella-review-action@v1",
  "        with:",
  "          bella-token: ${{ secrets.BELLA_TOKEN }}",
].join("\n");

describe("WorkflowYamlBlock", () => {
  it("renders the exact, copyable YAML text (real <pre><code>, no image)", () => {
    const { container } = render(<WorkflowYamlBlock />);

    const pre = container.querySelector("pre");
    const code = container.querySelector("code");
    expect(pre).toBeInTheDocument();
    expect(code).toBeInTheDocument();
    expect(code?.textContent).toBe(`${EXPECTED_YAML}\n`);
  });
});
