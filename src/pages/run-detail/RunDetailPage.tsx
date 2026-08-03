import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { CommentRow } from "../../components/CommentRow";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { useReviewRunDetail } from "../../data/reviewRuns";
import { ApiError } from "../../lib/api-error";
import { formatNumber } from "../../lib/format-number";
import { runStatusBadgeProps } from "../../lib/status-badges";
import type { ReviewRunStatus, ReviewRunTurn } from "../../types/review-run";

// Tela 9 — Detalhe da Execução. Diferente do cabeçalho comum (RepoAreaLayout,
// que já trata repo_not_found), o 404 aqui é específico desta tela: um
// runId inválido ou de outro repositório mostra uma mensagem dedicada, sem
// redirecionar silenciosamente (ver PRD 09, "Estados").
export function RunDetailPage() {
  const { id, runId } = useParams<{ id: string; runId: string }>();
  const repoId = id ?? "";
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = useReviewRunDetail(repoId, runId ?? "");

  const notFound = error instanceof ApiError && error.code === "review_run_not_found";

  return (
    <div className="flex flex-col gap-4">
      <Link to={`/repos/${repoId}/runs`} className="text-sm text-ink-muted hover:text-ink">
        ‹ Voltar para execuções
      </Link>

      {isPending && (
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="block" height="7rem" />
          <Skeleton shape="block" height="4.5rem" />
        </div>
      )}

      {!isPending && isError && notFound && (
        <EmptyState
          title="Execução não encontrada"
          description="Ela pode ter sido removida, ou não pertence a este repositório."
          action={{
            label: "Voltar para execuções",
            onClick: () => navigate(`/repos/${repoId}/runs`),
          }}
        />
      )}

      {!isPending && isError && !notFound && (
        <EmptyState
          title="Não foi possível carregar esta execução"
          description="Algo deu errado ao buscar os dados. Tente novamente."
          action={{ label: "Tentar novamente", onClick: () => refetch() }}
        />
      )}

      {!isPending && !isError && data && (
        <>
          <RunHeader
            prNumber={data.prNumber}
            commitSha={data.commitSha}
            status={data.status}
            errorReason={data.errorReason}
          />

          <h2 className="mb-3.5 mt-8 text-base font-medium tracking-tight text-ink">Turnos</h2>
          {data.turns.length === 0 ? (
            <Card padding="lg">
              <p className="text-center text-sm text-ink-muted">Nenhum turno registrado ainda.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.turns.map((turn) => (
                <TurnCard key={turn.index} turn={turn} />
              ))}
            </div>
          )}

          <h2 className="mb-3.5 mt-8 text-base font-medium tracking-tight text-ink">
            Comentários gerados
          </h2>
          {data.comments.length === 0 ? (
            <Card padding="lg">
              <p className="text-center text-sm text-ink-muted">
                Esta execução não gerou nenhum comentário.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  repoId={repoId}
                  showPr={false}
                  clampable={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

type RunHeaderProps = {
  prNumber: number;
  commitSha: string;
  status: ReviewRunStatus;
  errorReason: string | null;
};

function RunHeader({ prNumber, commitSha, status, errorReason }: RunHeaderProps) {
  const badge = runStatusBadgeProps(status);
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-mono text-[22px] font-normal text-accent">PR #{prNumber}</span>
        <span title={commitSha} className="font-mono text-sm text-ink-muted">
          {commitSha.slice(0, 7)}
        </span>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      {status === "failed" && errorReason && (
        <div className="mt-4.5 rounded-xl bg-severity-critical/10 px-4.5 py-4">
          <div className="mb-1.5 text-xs uppercase tracking-wide text-severity-critical">
            Motivo da falha
          </div>
          <div className="font-mono text-[14.5px] leading-relaxed text-ink">{errorReason}</div>
        </div>
      )}
    </Card>
  );
}

function TurnCard({ turn }: { turn: ReviewRunTurn }) {
  return (
    <Card padding="lg">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-5">
        <div className="text-[13.5px] text-ink-muted">Turno {turn.index}</div>
        <TokenStat label="entrada" value={turn.inputTokens} />
        <TokenStat label="saída" value={turn.outputTokens} />
        <TokenStat label="raciocínio" value={turn.reasoningTokens} />
        <Badge tone="neutral">{turn.source}</Badge>
      </div>
      {turn.errorReason && (
        <div className="mt-3 text-[12.5px] text-severity-critical">{turn.errorReason}</div>
      )}
    </Card>
  );
}

function TokenStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="mt-1 font-mono text-[14.5px] text-ink">{formatNumber(value)}</div>
    </div>
  );
}
