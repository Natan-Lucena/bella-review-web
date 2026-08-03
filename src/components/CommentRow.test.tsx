import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { Comment } from "../types/comment";
import { CommentRow } from "./CommentRow";

const BASE_COMMENT: Comment = {
  id: "comment-1",
  reviewRunId: "run-1",
  prNumber: 42,
  file: "src/app.ts",
  line: 41,
  category: "security",
  severity: "critical",
  body: "Um comentário de exemplo sobre este trecho.",
  status: "published",
  externalId: "gh-comment-1",
  createdAt: "2026-07-21T10:00:00.000Z",
};

function renderRow(overrides: Partial<Comment> = {}, props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      <CommentRow comment={{ ...BASE_COMMENT, ...overrides }} repoId="repo-1" {...props} />
    </MemoryRouter>,
  );
}

describe("CommentRow", () => {
  it("renders file:line, category, severity and status badges", () => {
    renderRow();
    expect(screen.getByText("src/app.ts:41")).toBeInTheDocument();
    expect(screen.getByText("security")).toBeInTheDocument();
    expect(screen.getByText("Crítica")).toBeInTheDocument();
    expect(screen.getByText("Publicado no GitHub")).toBeInTheDocument();
  });

  it("links the PR number to the run detail page (not to GitHub) by default", () => {
    renderRow();
    expect(screen.getByRole("link", { name: "PR #42" })).toHaveAttribute(
      "href",
      "/repos/repo-1/runs/run-1",
    );
  });

  it("shows an em dash for a null prNumber, but still links to the run", () => {
    renderRow({ prNumber: null });
    expect(screen.getByRole("link", { name: "—" })).toHaveAttribute(
      "href",
      "/repos/repo-1/runs/run-1",
    );
  });

  it("omits the PR link when showPr is false", () => {
    renderRow({}, { showPr: false });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("clamps the body and expands it on click by default", async () => {
    renderRow();
    const body = screen.getByText("Um comentário de exemplo sobre este trecho.");
    expect(body).toHaveClass("line-clamp-2");

    await userEvent.click(body);
    expect(body).not.toHaveClass("line-clamp-2");
  });

  it("never clamps the body when clampable is false", () => {
    renderRow({}, { clampable: false });
    const body = screen.getByText("Um comentário de exemplo sobre este trecho.");
    expect(body).not.toHaveClass("line-clamp-2");
  });

  it("shows the orphan warning only for 'generated' (not published) comments", () => {
    const { rerender } = render(
      <MemoryRouter>
        <CommentRow comment={{ ...BASE_COMMENT, status: "generated" }} repoId="repo-1" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/nunca publicado no Pull Request/)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CommentRow comment={{ ...BASE_COMMENT, status: "published" }} repoId="repo-1" />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/nunca publicado no Pull Request/)).not.toBeInTheDocument();
  });
});
