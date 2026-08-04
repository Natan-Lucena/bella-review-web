type LogoProps = {
  size?: number;
  // Classes Tailwind (ex.: breakpoints h-*/w-*) pra sobrescrever o tamanho
  // renderizado por CSS — as dimensões de `size` continuam nos atributos
  // width/height do <img> (só a proporção/intrinsic size), mas uma classe
  // aqui vence na hora de pintar a tela. Usado pelos cabeçalhos (header),
  // onde o mesmo Logo precisa ser menor em telas estreitas e maior a partir
  // de um breakpoint — ver AppLayout/LandingPage/LoginPage/SignupPage.
  className?: string;
};

// Mascote (Bella, a dálmata) — ver frontend-especificacao-telas.md,
// "Identidade visual". Sempre decorativo: aria-hidden, nunca alt/role="img".
// Arquivo em public/logo.png (servido em /logo.png), também usado como
// favicon (ver index.html).
export function Logo({ size = 120, className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}
