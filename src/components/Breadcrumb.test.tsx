import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders every item before the last as a link, and the last as the current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          items={[
            { label: "Repositórios", to: "/repos" },
            { label: "Natan-Lucena/bella-reviewer-api" },
          ]}
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Repositórios" });
    expect(link).toHaveAttribute("href", "/repos");

    const current = screen.getByText("Natan-Lucena/bella-reviewer-api");
    expect(current).toHaveAttribute("aria-current", "page");
  });
});
