import { Link } from "react-router-dom";

import { PageHeader } from "../components/PageHeader";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <PageHeader level="h1" title="Página não encontrada" />
      <Link to="/" className="text-sm text-accent hover:underline">
        Voltar para o início
      </Link>
    </div>
  );
}
