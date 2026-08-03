import { useState } from "react";
import { Link } from "react-router-dom";

import { formatRelativeTime } from "../lib/format-relative-time";
import { commentStatusBadgeProps, severityBadgeProps } from "../lib/status-badges";
import type { Comment } from "../types/comment";
import { Badge } from "./Badge";
import { Card } from "./Card";

type CommentRowProps = {
  comment: Comment;
  repoId: string;
  // Tela 10 (histórico entre execuções) mostra o link do PR e trunca o corpo;
  // Tela 9 (detalhe de uma execução já filtrada) omite os dois — mesma lista
  // compacta, sem repetir informação já visível no cabeçalho da tela. Ver
  // PRD 09, "considerar extrair um CommentRow compartilhado entre os dois PRDs".
  showPr?: boolean;
  clampable?: boolean;
};

// O link do PR aqui navega para a Tela 9 (detalhe da execução), não para o
// GitHub — diferente da coluna de PR da Tela 8 (ver
// frontend-especificacao-telas.md, Tela 10, coluna `prNumber`).
export function CommentRow({ comment, repoId, showPr = true, clampable = true }: CommentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const severity = severityBadgeProps(comment.severity);
  const status = commentStatusBadgeProps(comment.status);
  const clamped = clampable && !expanded;

  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center gap-2.5">
        {showPr && (
          <Link
            to={`/repos/${repoId}/runs/${comment.reviewRunId}`}
            className="font-mono text-[13.5px] text-accent hover:underline"
          >
            {comment.prNumber === null ? "—" : `PR #${comment.prNumber}`}
          </Link>
        )}
        <span className="font-mono text-[13.5px] text-ink-muted">
          {comment.file}:{comment.line}
        </span>
        <Badge tone="neutral">{comment.category}</Badge>
        <Badge tone={severity.tone}>{severity.label}</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
        <span className="ml-auto text-xs text-ink-muted">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>
      <p
        onClick={clampable ? () => setExpanded((value) => !value) : undefined}
        className={`mt-3 text-[14.5px] leading-relaxed text-ink ${clampable ? "cursor-pointer" : ""} ${clamped ? "line-clamp-2" : ""}`}
      >
        {comment.body}
      </p>
      {comment.status === "generated" && (
        <div className="mt-3 rounded-md bg-severity-medium/[0.08] px-3.5 py-2.5 text-xs leading-relaxed text-severity-medium">
          Gerado, mas nunca publicado no Pull Request — ninguém vai ver este comentário no GitHub.
        </div>
      )}
    </Card>
  );
}
