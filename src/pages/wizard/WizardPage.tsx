import { PageHeader } from "../../components/PageHeader";

// Conteúdo real: PRD 06 (frontend-prds/06-tela-wizard-configuracao.md).
// Rota "/repos/new" — tela cheia, fora do AppLayout (sem header/abas), ver a
// própria PRD ("Apresentação e navegação do wizard").
export function WizardPage() {
  return (
    <div className="mx-auto max-w-xl p-8">
      <PageHeader level="h1" title="Adicionar repositório" description="Wizard — PRD 06" />
    </div>
  );
}
