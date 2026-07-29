import { Outlet } from "react-router-dom";

// Sem header fixo de app — a landing tem seu próprio header, as telas de auth
// têm só o card centralizado. Ver frontend-especificacao-telas.md, "Navegação
// — mapa geral".
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <Outlet />
    </div>
  );
}
