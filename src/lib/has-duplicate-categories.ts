// Usado pelo validador do formulário de categorias habilitadas (Tela 6) —
// impede salvar a mesma categoria duas vezes na lista.
export function hasDuplicateCategories(categories: string[]): boolean {
  for (let i = 0; i < categories.length; i++) {
    for (let j = 0; j < categories.length; j++) {
      if (i !== j && categories[i] === categories[j]) {
        return true;
      }
    }
  }
  return false;
}
