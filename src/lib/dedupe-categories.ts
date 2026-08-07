// Normaliza a lista de categorias habilitadas antes de enviar pro backend —
// remove repetições mantendo a ordem em que o usuário digitou.
export function dedupeCategories(categories: string[]): string[] {
  return categories.filter((category, index) => categories.indexOf(category) === index);
}
