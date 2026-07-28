import { NavLink } from "react-router-dom";

import { cn } from "../lib/cn";

type RepoAreaTabsProps = {
  repoId: string;
};

// Navegação entre as 4 visões de um repositório, via rota real (NavLink) — o
// protótipo faz isso com <a onClick> sem navegação de verdade. Ver
// 00-component-library.md, "RepoAreaTabs".
export function RepoAreaTabs({ repoId }: RepoAreaTabsProps) {
  const tabs = [
    { label: "Painel", to: `/repos/${repoId}`, end: true },
    { label: "Execuções", to: `/repos/${repoId}/runs` },
    { label: "Comentários", to: `/repos/${repoId}/comments` },
    { label: "Configurações", to: `/repos/${repoId}/settings` },
  ];

  return (
    <nav className="flex gap-4 border-b border-surface-border">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "border-b-2 px-1 py-2 text-sm font-medium",
              isActive ? "border-accent text-ink" : "border-transparent text-ink-muted",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
