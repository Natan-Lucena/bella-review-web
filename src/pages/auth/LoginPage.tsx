import { PageHeader } from "../../components/PageHeader";

// Conteúdo real: PRD 04 (frontend-prds/04-tela-auth-cadastro-login.md) — essa
// PRD também é quem consome o query param ?redirect= (ver RequireAuth) para
// voltar à rota pretendida depois do login de verdade.
export function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-8">
      <PageHeader level="h1" title="Entrar" description="Login — PRD 04" />
    </div>
  );
}
