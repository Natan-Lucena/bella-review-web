import { useActionState, useEffect, useState } from "react";
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
  const { isAuthenticated, login: markAuthenticated } = useSession();
  const login = useLogin();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const showAccountCreatedNotice = searchParams.get("notice") === "account-created";
  const canSubmit = email.trim().length > 0 && password.length > 0;

  // A navegação pós-login mora num efeito reativo a `isAuthenticated`, não
  // dentro da action: o `setQueryData` do `login()` (SessionProvider) notifica
  // os observers do TanStack Query de forma assíncrona (`notifyManager`), então
  // chamar `navigate()` logo depois de `markAuthenticated(user)`, no mesmo
  // bloco síncrono, corre pra rota de destino ANTES do contexto de sessão
  // propagar `isAuthenticated: true` — o `RequireAuth` de lá leria o valor
  // antigo (`false`) e voltaria pro login (bounce), só percebido numa jornada
  // completa (login → rota protegida), nunca num teste isolado de tela.
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirect");
      navigate(redirectTo || "/repos", { replace: true });
    }
  }, [isAuthenticated, searchParams, navigate]);

  const [state, formAction] = useActionState<LoginActionState>(async () => {
    if (!canSubmit) {
      return {};
    }
    try {
      const user = await login.mutateAsync({ email, password });
      markAuthenticated(user);
      return {};
    } catch (error) {
      // A mensagem pro usuário é sempre genérica (nunca distinguir "senha
      // errada" de "usuário não existe"), mas o erro real (com `code`, ver
      // ApiError) vale logar pra depuração — só o texto exibido é opaco.
      console.error(error);
      return { error: "Email ou senha incorretos." };
    }
  }, {});

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Link to="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[17px] font-medium text-ink">Bella Reviewer</span>
      </Link>

      <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-lg shadow-black/25">
        {showAccountCreatedNotice && (
          <div className="mb-6 rounded-xl bg-status-completed/10 px-3.5 py-3 text-[13.5px] text-status-completed">
            Conta criada — faça login para continuar.
          </div>
        )}

        <h1 className="text-[26px] font-normal tracking-tight text-ink">Entrar</h1>
        <p className="mt-2 text-sm text-ink-muted">Bem-vinda de volta.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-5">
          <FormField label="Email" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-[12px] border border-surface-border bg-background px-[15px] py-[13px] text-[15px] text-ink"
            />
          </FormField>

          <PasswordField
            label="Senha"
            htmlFor="login-password"
            placeholder="sua senha"
            value={password}
            onChange={setPassword}
          />

          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-severity-critical/10 px-3.5 py-3 text-[13.5px] text-severity-critical"
            >
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
