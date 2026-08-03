import { useState } from "react";
import { useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { SecretRevealModal } from "../../components/SecretRevealModal";
import {
  useGenerateActionToken,
  useGenerateWebhookSecret,
  useSetLlmCredential,
  useSetScmCredential,
  useUpdateRepoConfig,
} from "../../data/repos";
import { GITHUB_TOKEN_URL } from "../../lib/github-url";
import { CredentialSection } from "./CredentialSection";
import { ReviewParamsSection } from "./ReviewParamsSection";
import { SecretCard } from "./SecretCard";

type RevealedModal =
  | { kind: "action_token"; value: string }
  | { kind: "webhook_secret"; value: string; webhookUrl: string };

// Tela 6 — Configurações do Repositório (frontend-especificacao-telas.md).
// Mesmas mutations do Wizard (PRD 06), mas fora de sequência: cada bloco é
// independente, com seu próprio botão de salvar — não existe uma ordem
// obrigatória nem um estado compartilhado entre eles. Ver PRD 07.
//
// Fase 2: sem endpoint de leitura de credenciais/config (ver PRD da Fase 2,
// "Tela 6 escreve às cegas"), não há nada pra buscar antes de renderizar —
// os blocos nascem direto, sem skeleton nem status pré-preenchido.
export function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const repoId = id ?? "";

  const setLlmCredential = useSetLlmCredential(repoId);
  const setScmCredential = useSetScmCredential(repoId);
  const generateActionToken = useGenerateActionToken(repoId);
  const generateWebhookSecret = useGenerateWebhookSecret(repoId);
  const updateRepoConfig = useUpdateRepoConfig(repoId);
  const [modal, setModal] = useState<RevealedModal | null>(null);

  async function handleGenerateAction() {
    const response = await generateActionToken.mutateAsync();
    setModal({ kind: "action_token", value: response.token });
  }

  async function handleGenerateWebhook() {
    const response = await generateWebhookSecret.mutateAsync();
    setModal({ kind: "webhook_secret", value: response.secret, webhookUrl: response.webhookUrl });
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader level="h2" title="Configurações" />

      <CredentialSection
        title="Credencial do LLM · Gemini"
        fieldLabel="Chave da API"
        htmlForPrefix="settings-llm"
        placeholder="cole sua chave de API do Gemini"
        hint="A chave nunca é devolvida pela API depois de salva — e, sem endpoint de leitura, nem esta tela sabe se já existe uma configurada. Salvar aqui sempre substitui a atual, se houver."
        saveLabel="Salvar chave"
        isPending={setLlmCredential.isPending}
        onSave={(apiKey) => setLlmCredential.mutateAsync(apiKey)}
      />

      <CredentialSection
        title="Credencial do GitHub · PAT"
        fieldLabel="Personal Access Token"
        htmlForPrefix="settings-scm"
        placeholder="ghp_..."
        hint="Usado pelo backend para publicar os comentários de revisão diretamente no seu Pull Request — é o backend que publica, não a Action. Precisa de permissão de leitura e escrita em Pull Requests. Salvar aqui sempre substitui o PAT atual, se houver."
        saveLabel="Salvar PAT"
        isPending={setScmCredential.isPending}
        onSave={(pat) => setScmCredential.mutateAsync(pat)}
        helpLink={{ label: "Gerar token no GitHub", href: GITHUB_TOKEN_URL }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SecretCard
          title="GitHub Action"
          statusText="Sem endpoint de leitura, não sabemos se já existe um token gerado."
          generateLabel="Gerar novo token"
          rotateWarningText="Se já existir um token gerado, esta ação invalida o anterior imediatamente."
          alreadyGenerated
          isPending={generateActionToken.isPending}
          onGenerate={handleGenerateAction}
        />
        <SecretCard
          title="Webhook nativo"
          statusText="Sem endpoint de leitura, não sabemos se já existe um segredo gerado."
          generateLabel="Gerar novo segredo"
          rotateWarningText="Se já existir um segredo gerado, esta ação invalida o anterior imediatamente."
          helpText="Só necessário se você quiser integrar via webhook nativo do GitHub, além de (ou em vez de) usar a Action."
          alreadyGenerated
          isPending={generateWebhookSecret.isPending}
          onGenerate={handleGenerateWebhook}
        />
      </div>

      <ReviewParamsSection
        isPending={updateRepoConfig.isPending}
        onSave={(patch) => updateRepoConfig.mutateAsync(patch)}
      />

      {modal && (
        <SecretRevealModal
          open
          kind={modal.kind}
          value={modal.value}
          webhookUrl={modal.kind === "webhook_secret" ? modal.webhookUrl : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
