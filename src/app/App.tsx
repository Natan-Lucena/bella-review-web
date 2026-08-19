import { Route, Routes } from "react-router-dom";

import { CommentsPage } from "../pages/comments/CommentsPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/landing/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PromptsPage } from "../pages/prompts/PromptsPage";
import { ReposListPage } from "../pages/repos-list/ReposListPage";
import { RunDetailPage } from "../pages/run-detail/RunDetailPage";
import { RunsPage } from "../pages/runs/RunsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { WizardPage } from "../pages/wizard/WizardPage";
import { AppLayout } from "./layouts/AppLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { RepoAreaLayout } from "./layouts/RepoAreaLayout";
import { RequireAuth } from "./RequireAuth";

// Espelha frontend-especificacao-telas.md, "Navegação — mapa geral". Ver
// frontend-prds/01-app-shell-roteamento-design-tokens.md para a árvore
// completa e a justificativa de cada layout.
export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Tela cheia, fora do AppLayout (sem header/abas) — ver
          frontend-especificacao-telas.md, Tela 5. Ainda atrás da guarda de
          autenticação, como qualquer outra rota de /repos/*. */}
      <Route
        path="/repos/new"
        element={
          <RequireAuth>
            <WizardPage />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/repos" element={<ReposListPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/repos/:id" element={<RepoAreaLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="runs/:runId" element={<RunDetailPage />} />
          <Route path="comments" element={<CommentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
