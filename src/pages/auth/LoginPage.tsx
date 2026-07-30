import { useActionState, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { FormField } from "../../components/FormField";
import { Logo } from "../../components/Logo";
import { PasswordField } from "../../components/PasswordField";
import { SubmitButton } from "../../components/SubmitButton";
import { useLogin } from "../../data/auth";
import { useSession } from "../../data/useSession";

type LoginActionState = {
  error?: string;
};

// Tela 3 — Login (frontend-especificacao-telas.md). Sem link "Esqueci minha
// senha" de propósito — não existe esse fluxo no backend (ver o doc de telas,
// "Notas para produto/design", item 9).
export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: markAuthenticated } = useSession();
  const login = useLogin();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const showAccountCreatedNotice = searchParams.get("notice") === "account-created";
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const [state, formAction] = useActionState<LoginActionState>(async () => {
    if (!canSubmit) {
      return {};
    }
    try {
      await login.mutateAsync({ email, password });
      markAuthenticated();
      const redirectTo = searchParams.get("redirect");
      navigate(redirectTo || "/repos", { replace: true });
      return {};
    } catch {
      return { error: "Email ou senha incorretos." };
    }
  }, {});

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Link to="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[17px] font-medium text-ink">Bella Reviewer</span>
      </Link>

      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-lg shadow-black/25">
        {showAccountCreatedNotice && (
          <div className="mb-6 rounded-xl bg-status-completed/15 px-4 py-3 text-sm text-status-completed">
            Conta criada — faça login para continuar.
          </div>
        )}

        <h1 className="text-2xl font-normal tracking-tight text-ink">Entrar</h1>
        <p className="mt-2 text-sm text-ink-muted">Bem-vinda de volta.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-5">
          <FormField label="Email" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded border border-surface-border bg-background px-3 py-2 text-ink"
            />
          </FormField>

          <PasswordField
            label="Senha"
            htmlFor="login-password"
            value={password}
            onChange={setPassword}
          />

          {state.error && (
            <p role="alert" className="text-sm text-severity-critical">
              {state.error}
            </p>
          )}

          <SubmitButton disabled={!canSubmit}>Entrar</SubmitButton>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          Não tem conta?{" "}
          <Link to="/signup" className="text-accent">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
