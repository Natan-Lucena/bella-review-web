import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { RepoAreaTabs } from "./RepoAreaTabs";

describe("RepoAreaTabs", () => {
  it("renders the 4 tabs as real links to their routes", () => {
    render(
      <MemoryRouter initialEntries={["/repos/abc"]}>
        <RepoAreaTabs repoId="abc" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Painel" })).toHaveAttribute("href", "/repos/abc");
    expect(screen.getByRole("link", { name: "Execuções" })).toHaveAttribute(
      "href",
      "/repos/abc/runs",
    );
    expect(screen.getByRole("link", { name: "Comentários" })).toHaveAttribute(
      "href",
      "/repos/abc/comments",
    );
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/repos/abc/settings",
    );
  });

  it("marks the current route's tab as active", () => {
    render(
      <MemoryRouter initialEntries={["/repos/abc/runs"]}>
        <RepoAreaTabs repoId="abc" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Execuções" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Painel" })).not.toHaveAttribute("aria-current");
  });
});
