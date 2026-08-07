// Compartilhado por DashboardPage ("Custo estimado") e AcceptanceMetricsSection
// ("Custo por sugestão aplicada") — os dois cards derivam do mesmo cálculo do
// backend (tarifa paga padrão do Gemini, sempre, independente do tier real da
// chave configurada — ver backend-prds/22-calculo-real-de-custo.md, "Nota —
// tier gratuito vs. pago"). Centralizado aqui pra não divergir a redação entre
// os dois lugares.
export const ESTIMATED_COST_TOOLTIP =
  "Valor projetado pela tarifa paga padrão do Gemini — não é necessariamente o que você está pagando. Uma chave no tier gratuito do Google AI Studio tem custo real zero.";
