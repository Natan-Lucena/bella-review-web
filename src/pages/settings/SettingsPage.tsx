import { useState } from "react";
import { useParams } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { SecretRevealModal } from "../../components/SecretRevealModal";
import { Skeleton } from "../../components/Skeleton";
import {
  useGenerateActionToken,
  useGenerateWebhookSecret,
  useRepoSettings,
  useSetLlmCredential,
  useSetScmCredential,
  useUpdateRepoConfig,
} from "../../data/repos";
import { formatDate } from "../../lib/format-date";
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
export function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const repoId = id ?? "";

  const { data: settings, isPending } = useRepoSettings(repoId);
  const setLlmCredential = useSetLlmCredential(repoId);
  const setScmCredential = useSetScmCredential(repoId);
  const generateActionToken = useGenerateActionToken(repoId);
  const generateWebhookSecret = useGenerateWebhookSecret(repoId);
  const updateRepoConfig = useUpdateRepoConfig(repoId);
  const [modal, setModal] = useState<RevealedModal | null>(null);

  if (isPending || !settings) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton shape="block" height="6rem" />
        <Skeleton shape="block" height="6rem" />
        <Skeleton shape="block" height="10rem" />
      </div>
    );
  }

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
        status={settings.llm}
        fieldLabel="Chave da API"
        htmlForPrefix="settings-llm"
        placeholder="cole sua chave de API do Gemini"
        hint="A chave nunca é devolvida pela API depois de salva — só sabemos que existe e quando foi atualizada."
        saveLabelNew="Salvar chave"
        saveLabelReplace="Substituir chave"
        isPending={setLlmCredential.isPending}
        onSave={(apiKey) => setLlmCredential.mutateAsync(apiKey)}
      />

      <CredentialSection
        title="Credencial do GitHub · PAT"
        status={settings.scm}
        fieldLabel="Personal Access Token"
        htmlForPrefix="settings-scm"
        placeholder="ghp_..."
        hint="Usado pelo backend para publicar os comentários de revisão diretamente no seu Pull Request — é o backend que publica, não a Action. Precisa de permissão de leitura e escrita em Pull Requests."
        saveLabelNew="Salvar PAT"
        saveLabelReplace="Substituir PAT"
        isPending={setScmCredential.isPending}
        onSave={(pat) => setScmCredential.mutateAsync(pat)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SecretCard
          title="GitHub Action"
          statusText={
            settings.actionToken.generated && settings.actionToken.generatedAt
              ? `Token gerado em ${formatDate(settings.actionToken.generatedAt)}`
              : "Nenhum token gerado ainda"
          }
          generateLabel={settings.actionToken.generated ? "Gerar novo token" : "Gerar token"}
          rotateWarningText="Gerar um novo token invalida o anterior imediatamente."
          alreadyGenerated={settings.actionToken.generated}
          isPending={generateActionToken.isPending}
          onGenerate={handleGenerateAction}
        />
        <SecretCard
          title="Webhook nativo"
          statusText={
            settings.webhookSecret.generated && settings.webhookSecret.generatedAt
              ? `Segredo gerado em ${formatDate(settings.webhookSecret.generatedAt)}`
              : "Nenhum segredo gerado ainda"
          }
          generateLabel={settings.webhookSecret.generated ? "Gerar novo segredo" : "Gerar segredo"}
          rotateWarningText="Gerar um novo segredo invalida o anterior imediatamente."
          helpText="Só necessário se você quiser integrar via webhook nativo do GitHub, além de (ou em vez de) usar a Action."
          alreadyGenerated={settings.webhookSecret.generated}
          isPending={generateWebhookSecret.isPending}
          onGenerate={handleGenerateWebhook}
        />
      </div>

      <ReviewParamsSection
        config={settings.config}
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
