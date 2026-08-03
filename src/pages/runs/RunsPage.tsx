import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { DataTable, type Column } from "../../components/DataTable";
import { EmptyState } from "../../components/EmptyState";
import { LoadMoreButton } from "../../components/LoadMoreButton";
import { PageHeader } from "../../components/PageHeader";
import { Skeleton } from "../../components/Skeleton";
import { useRepo } from "../../data/repos";
import { useReviewRuns } from "../../data/reviewRuns";
import { formatDuration } from "../../lib/format-duration";
import { formatExactDateTime, formatRelativeTime } from "../../lib/format-relative-time";
import { formatNumber } from "../../lib/format-number";
import { pullRequestUrl } from "../../lib/github-url";
import { runStatusBadgeProps, runTriggerBadgeProps } from "../../lib/status-badges";
import type { ReviewRunSummary } from "../../types/review-run";
import { StatusFilter, type StatusFilterValue } from "./StatusFilter";

const PAGE_SIZE = 20;

export function RunsPage() {
  const { id } = useParams<{ id: string }>();
  const repoId = id ?? "";
  const navigate = useNavigate();
  const { data: repo } = useRepo(repoId);
  const [status, setStatus] = useState<StatusFilterValue>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isPending, isError, isFetching, refetch } = useReviewRuns(repoId, {
    status: status === "all" ? undefined : status,
    limit,
  });

  function handleStatusChange(value: StatusFilterValue) {
    setStatus(value);
    setLimit(PAGE_SIZE);
  }

  const runs = data?.reviewRuns ?? [];
  const total = data?.total ?? 0;
  const hasMore = runs.length < total;
  const isRefetching = isFetching && !isPending;

  const columns: Column<ReviewRunSummary>[] = [
    {
      header: "PR",
      render: (run) => (
        <a
          href={repo ? pullRequestUrl(repo.fullName, run.prNumber) : undefined}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="font-mono text-accent hover:underline"
        >
          PR #{run.prNumber}
        </a>
      ),
    },
    {
      header: "Commit",
      render: (run) => (
        <span title={run.commitSha} className="font-mono text-[13px] text-ink-muted">
          {run.commitSha.slice(0, 7)}
        </span>
      ),
    },
    {
      header: "Origem",
      render: (run) => {
        const trigger = runTriggerBadgeProps(run.trigger);
        return <Badge tone={trigger.tone}>{trigger.label}</Badge>;
      },
    },
    {
      header: "Status",
      render: (run) => {
        const badge = runStatusBadgeProps(run.status);
        return (
          <div>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            {run.status === "failed" && run.errorReason && (
              <div title={run.errorReason} className="mt-1.5 text-[11.5px] text-severity-critical">
                {run.errorReason}
              </div>
            )}
          </div>
        );
      },
    },
    { header: "Duração", render: (run) => formatDuration(run.durationMs) },
    { header: "Comentários", render: (run) => run.commentCount },
    { header: "Tokens", render: (run) => formatNumber(run.totalTokens) },
    {
      header: "Iniciada",
      render: (run) =>
        run.startedAt ? (
          <span title={formatExactDateTime(run.startedAt)}>
            {formatRelativeTime(run.startedAt)}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Execuções" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusFilter value={status} onChange={handleStatusChange} />
          {!isPending && !isError && (
            <span className="text-[13px] text-ink-muted">
              {total} execuç{total === 1 ? "ão" : "ões"}
            </span>
          )}
        </div>
        <Button variant="secondary" onClick={() => refetch()} loading={isRefetching}>
          Atualizar
        </Button>
      </div>

      {isPending && (
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="block" height="4.5rem" />
          <Skeleton shape="block" height="4.5rem" />
          <Skeleton shape="block" height="4.5rem" />
        </div>
      )}

      {!isPending && isError && (
        <EmptyState
          title="Não foi possível carregar as execuções"
          description="Algo deu errado ao buscar a lista. Tente novamente."
          action={{ label: "Tentar novamente", onClick: () => refetch() }}
        />
      )}

      {!isPending && !isError && runs.length === 0 && status === "all" && (
        <EmptyState
          title="Nenhuma execução ainda"
          description="Assim que a Action rodar em um Pull Request deste repositório, ela aparece aqui."
        />
      )}

      {!isPending && !isError && runs.length === 0 && status !== "all" && (
        <EmptyState
          title="Nenhuma execução com esse status"
          description="Troque o filtro de status para ver as outras execuções."
          action={{ label: "Ver todas as execuções", onClick: () => handleStatusChange("all") }}
        />
      )}

      {!isPending && !isError && runs.length > 0 && (
        <>
          <DataTable
            columns={columns}
            rows={runs}
            getRowKey={(run) => run.id}
            onRowClick={(run) => navigate(`/repos/${repoId}/runs/${run.id}`)}
          />
          <LoadMoreButton
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
            loading={isRefetching}
            hasMore={hasMore}
          />
        </>
      )}
    </div>
  );
}
