type LogoProps = {
  size?: number;
};

// Mascote (Bella, a dálmata) — ver frontend-especificacao-telas.md,
// "Identidade visual". Sempre decorativo: aria-hidden, nunca alt/role="img".
// Arquivo em public/logo.png (servido em /logo.png), também usado como
// favicon (ver index.html).
export function Logo({ size = 120 }: LogoProps) {
  return <img src="/logo.png" width={size} height={size} alt="" aria-hidden="true" />;
}
