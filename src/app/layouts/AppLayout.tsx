import { Link, Outlet } from "react-router-dom";

import { Logo } from "../../components/Logo";

// Header fixo comum a toda tela autenticada — Logo + link "Meus
// repositórios". Ver frontend-especificacao-telas.md, "Navegação — mapa
// geral". A guarda de autenticação em si é responsabilidade de RequireAuth,
// aplicada na definição das rotas, não deste componente.
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-20 border-b border-surface-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Logo className="h-11 w-11 sm:h-[120px] sm:w-[120px]" />
          <Link to="/repos" className="text-sm font-medium text-ink hover:text-accent">
            Meus repositórios
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
