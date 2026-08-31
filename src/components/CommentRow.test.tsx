import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { resetMockData } from "../mocks/api-client";
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
  replyCount: 0,
};

function renderRow(overrides: Partial<Comment> = {}, props: Record<string, unknown> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CommentRow comment={{ ...BASE_COMMENT, ...overrides }} repoId="repo-1" {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetMockData();
});

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
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <CommentRow comment={{ ...BASE_COMMENT, status: "generated" }} repoId="repo-1" />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/nunca publicado no Pull Request/)).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <CommentRow comment={{ ...BASE_COMMENT, status: "published" }} repoId="repo-1" />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.queryByText(/nunca publicado no Pull Request/)).not.toBeInTheDocument();
  });

  describe("conversation section (PRD 21 F2)", () => {
    it("renders no reply badge/toggle when replyCount is 0 (unchanged from before this feature)", () => {
      renderRow({ replyCount: 0 });
      expect(screen.queryByRole("button", { name: /💬/ })).not.toBeInTheDocument();
    });

    it("shows a 💬 badge with the count when replyCount > 0", () => {
      renderRow({ replyCount: 3 });
      expect(screen.getByRole("button", { name: "💬 3" })).toBeInTheDocument();
    });

    it("expands on click and shows the fetched replies, in chronological order", async () => {
      renderRow(
        { id: "comment-bella-web-1", replyCount: 7 },
        { repoId: "repo-bella-web" },
      );

      const toggle = screen.getByRole("button", { name: "💬 7" });
      await userEvent.click(toggle);

      await screen.findByText(
        "Isso não quebra o fluxo de SSR, onde não existe `window` disponível pra checar a sessão?",
      );
      const text = document.body.textContent ?? "";
      const index1 = text.indexOf("Isso não quebra o fluxo de SSR");
      const index2 = text.indexOf("Discordo que isso seja high severity");
      const index3 = text.indexOf("Dá pra sugerir o trecho certo");
      expect(index1).toBeGreaterThanOrEqual(0);
      expect(index1).toBeLessThan(index2);
      expect(index2).toBeLessThan(index3);
    });

    it("renders a reply's bellaSuggestedCode as a code block", async () => {
      renderRow(
        { id: "comment-bella-web-1", replyCount: 7 },
        { repoId: "repo-bella-web" },
      );
      await userEvent.click(screen.getByRole("button", { name: "💬 7" }));

      await screen.findByText(/checagem adicional no guard/);
      const pre = document.querySelector("pre code");
      expect(pre?.textContent).toContain("redirectToLogin();");
    });

    it("shows the correct badge for each of the 4 non-null, non-'other' categories", async () => {
      renderRow(
        { id: "comment-bella-web-1", replyCount: 7 },
        { repoId: "repo-bella-web" },
      );
      await userEvent.click(screen.getByRole("button", { name: "💬 7" }));

      expect(await screen.findByText("❓ Dúvida")).toBeInTheDocument();
      expect(screen.getByText("⚠️ Discordância")).toBeInTheDocument();
      expect(screen.getByText("🔧 Fix")).toBeInTheDocument();
      expect(screen.getByText("👍 Confirmação")).toBeInTheDocument();
    });

    it("shows no category badge for 'other' or null category", async () => {
      renderRow(
        { id: "comment-bella-web-1", replyCount: 7 },
        { repoId: "repo-bella-web" },
      );
      await userEvent.click(screen.getByRole("button", { name: "💬 7" }));

      await screen.findByText(/Entendido, mantendo registrado/);
      // Nenhuma das 4 categorias com badge aparece perto da reply "other"/"queued"/"processing" —
      // já coberto por não haver um 5º/6º/7º badge de categoria na tela.
      expect(screen.getAllByText(/^(🔧|❓|⚠️|👍)/)).toHaveLength(4);
    });

    it("shows a 'Respondendo...' placeholder instead of a body for 'queued'/'processing' replies", async () => {
      renderRow(
        { id: "comment-bella-web-1", replyCount: 7 },
        { repoId: "repo-bella-web" },
      );
      await userEvent.click(screen.getByRole("button", { name: "💬 7" }));

      await screen.findByText(/checagem adicional no guard/);
      expect(screen.getAllByText("Respondendo...")).toHaveLength(2);
    });
  });
});
