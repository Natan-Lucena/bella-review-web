export type CredentialType = "llm" | "scm";

// Nunca inclui o valor real (chave/PAT) — o backend nunca devolve isso depois
// de salvo, nem mascarado (ver frontend-especificacao-telas.md, Tela 6, bloco 6.1).
export type Credential = {
  type: CredentialType;
  provider: string;
  configured: boolean;
  lastValidatedAt: string | null;
  updatedAt: string;
};

export type ActionTokenResponse = {
  type: "action_token";
  token: string;
  warning: string;
};

export type WebhookSecretResponse = {
  type: "webhook_secret";
  secret: string;
  webhookUrl: string;
  warning: string;
};
