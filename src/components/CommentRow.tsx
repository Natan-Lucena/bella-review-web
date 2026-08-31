import { useState } from "react";
import { Link } from "react-router-dom";

import { useCommentReplies } from "../data/comment-replies";
import { formatRelativeTime } from "../lib/format-relative-time";
import {
  commentReplyCategoryBadgeProps,
  commentStatusBadgeProps,
  severityBadgeProps,
} from "../lib/status-badges";
import type { Comment } from "../types/comment";
import type { CommentReply } from "../types/comment-reply";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { CodeBlock } from "./CodeBlock";
import { Skeleton } from "./Skeleton";

// Estrutural, não `Comment` direto: GET .../review-runs/:runId (Tela 9)
// devolve comentários num shape mais estreito, sem reviewRunId/prNumber/
// createdAt (a execução já está implícita no contexto da tela) — ver
// types/review-run.ts, ReviewRunComment. `Comment` (Tela 10) continua
// satisfazendo isto normalmente, por tipagem estrutural.
// `replyCount` entra no grupo `Partial` (não no `Pick` obrigatório): a Tela 9
// (ReviewRunComment) ainda não expõe esse campo — tratado como 0/sem seção de
// conversa lá, sem exigir plumbing nova fora do escopo da PRD 21 F2.
type CommentRowData = Pick<Comment, "id" | "file" | "line" | "category" | "severity" | "body" | "status"> &
  Partial<Pick<Comment, "reviewRunId" | "prNumber" | "createdAt" | "replyCount">>;

// Uma "reply" é o par humano -> Bella; a resposta da Bella ainda não chegou
// enquanto `status` for "queued"/"processing" (bellaBody/category/
// suggestedCode são null até lá — ver types/comment-reply.ts).
function BellaReplyBody({ reply }: { reply: CommentReply }) {
  if (reply.status === "queued" || reply.status === "processing") {
    return <p className="text-[13px] italic text-ink-muted">Respondendo...</p>;
  }

  const categoryBadge = reply.category ? commentReplyCategoryBadgeProps(reply.category) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] font-medium text-ink">Bella</span>
        {categoryBadge && <Badge tone={categoryBadge.tone}>{categoryBadge.label}</Badge>}
      </div>
      {reply.bellaBody && <p className="mt-0.5 text-[13px] text-ink-muted">{reply.bellaBody}</p>}
      {reply.bellaSuggestedCode && (
        <div className="mt-2">
          <CodeBlock code={reply.bellaSuggestedCode} showDots={false} />
        </div>
      )}
    </div>
  );
}

function ReplyThread({ reply }: { reply: CommentReply }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-[13px] font-medium text-ink">{reply.humanAuthor}</span>
        <p className="mt-0.5 text-[13px] text-ink-muted">{reply.humanBody}</p>
      </div>
      <BellaReplyBody reply={reply} />
    </div>
  );
}

type CommentRowProps = {
  comment: CommentRowData;
  repoId: string;
  // Tela 9 (detalhe de uma execução já filtrada, PRD 09 — único consumidor
  // hoje) omite o link do PR e o truncamento, já que a execução já está
  // implícita no contexto da tela. Tela 10 (histórico entre execuções, PRD
  // 10 — ainda não implementada) vai precisar dos dois de volta: mesma lista
  // compacta, sem repetir informação já visível no cabeçalho. Ver PRD 09,
  // "considerar extrair um CommentRow compartilhado entre os dois PRDs".
  showPr?: boolean;
  clampable?: boolean;
};

// O link do PR aqui navega para a Tela 9 (detalhe da execução), não para o
// GitHub — diferente da coluna de PR da Tela 8 (ver
// frontend-especificacao-telas.md, Tela 10, coluna `prNumber`).
export function CommentRow({ comment, repoId, showPr = true, clampable = true }: CommentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const severity = severityBadgeProps(comment.severity);
  const status = commentStatusBadgeProps(comment.status);
  const clamped = clampable && !expanded;
  // Ver nota no `Partial` de CommentRowData acima — comentários da Tela 9
  // (sem replyCount ainda) caem em 0, mesmo comportamento do "sem replies".
  const replyCount = comment.replyCount ?? 0;
  const { data: repliesData } = useCommentReplies(repoId, comment.id, conversationOpen);

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
        {replyCount > 0 && (
          <button
            type="button"
            onClick={() => setConversationOpen((value) => !value)}
            aria-expanded={conversationOpen}
            className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-muted transition-colors hover:brightness-110"
          >
            💬 {replyCount}
          </button>
        )}
        {comment.createdAt && (
          <span className="ml-auto text-xs text-ink-muted">
            {formatRelativeTime(comment.createdAt)}
          </span>
        )}
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
      {conversationOpen && (
        <div className="mt-3 flex flex-col gap-3 border-t border-surface-border pt-3">
          {repliesData === undefined ? (
            <>
              <Skeleton shape="block" height="3.5rem" />
              <Skeleton shape="block" height="3.5rem" />
            </>
          ) : (
            repliesData.replies.map((reply) => <ReplyThread key={reply.id} reply={reply} />)
          )}
        </div>
      )}
    </Card>
  );
}
