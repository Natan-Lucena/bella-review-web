import { useActionState, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FormField } from "../../components/FormField";
import { Logo } from "../../components/Logo";
import { PasswordField } from "../../components/PasswordField";
import { SubmitButton } from "../../components/SubmitButton";
import { useSignup } from "../../data/auth";
import { ApiError } from "../../lib/api-error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignupActionState = {
  emailError?: string;
  formError?: string;
};

// Tela 2 — Cadastro (frontend-especificacao-telas.md). Sem campo de "confirmar
// senha" no contrato do backend, mas mantido só no frontend (nunca enviado à
// API) — ver o doc de telas, é uma adição de UX sancionada explicitamente ali.
export function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailValid = EMAIL_RE.test(email);
  const passwordValid = password.length >= 8;
  const confirmValid = confirmPassword === password;
  const canSubmit = emailValid && passwordValid && confirmValid;

  const [state, formAction] = useActionState<SignupActionState>(async () => {
    if (!canSubmit) {
      return {};
    }
    try {
      await signup.mutateAsync({ email, password });
      navigate(`/login?notice=account-created&email=${encodeURIComponent(email)}`);
      return {};
    } catch (error) {
      if (error instanceof ApiError && error.code === "email_already_registered") {
        return { emailError: "Este email já está cadastrado." };
      }
      return { formError: "Não foi possível criar a conta agora. Tente novamente." };
    }
  }, {});

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Link to="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[17px] font-medium text-ink">Bella Reviewer</span>
      </Link>

      <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-lg shadow-black/25">
        <h1 className="text-[26px] font-normal tracking-tight text-ink">Criar conta</h1>
        <p className="mt-2 text-sm text-ink-muted">Email e senha — é só isso que precisamos.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-5">
          <div>
            <FormField label="Email" htmlFor="signup-email">
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                aria-invalid={state.emailError ? true : undefined}
                aria-describedby={state.emailError ? "signup-email-error" : undefined}
                className={`w-full rounded-[12px] border ${state.emailError ? "border-[#8a5c5c]" : "border-surface-border"} bg-background px-[15px] py-[13px] text-[15px] text-ink`}
              />
            </FormField>
            {state.emailError && (
              <p
                id="signup-email-error"
                role="alert"
                className="mt-2.5 text-[13.5px] text-severity-critical"
              >
                {state.emailError}{" "}
                <Link to="/login" className="underline">
                  Entrar
                </Link>
              </p>
            )}
          </div>

          <PasswordField
            label="Senha"
            htmlFor="signup-password"
            placeholder="mínimo 8 caracteres"
            value={password}
            onChange={setPassword}
            error={
              password && !passwordValid
                ? "A senha precisa ter pelo menos 8 caracteres."
                : undefined
            }
          />

          <PasswordField
            label="Confirmar senha"
            htmlFor="signup-confirm-password"
            placeholder="repita a senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={confirmPassword && !confirmValid ? "As senhas não coincidem." : undefined}
          />

          {state.formError && (
            <p role="alert" className="text-sm text-severity-critical">
              {state.formError}
            </p>
          )}

          <SubmitButton disabled={!canSubmit}>Criar conta</SubmitButton>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          Já tem conta?{" "}
          <Link to="/login" className="text-accent">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
