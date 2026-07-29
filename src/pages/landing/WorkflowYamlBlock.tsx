// O mesmo YAML documentado no README real da Action (ver
// frontend-especificacao-telas.md, Tela 1) — precisa continuar sendo texto
// real selecionável/copiável, então o "highlight" é feito com spans manuais
// por linha em vez de puxar uma biblioteca de syntax highlight só para este
// bloco estático (ver 03-tela-landing.md, "Composição").
const WORKFLOW_YAML_LINES = [
  "name: Bella Reviewer",
  "",
  "on:",
  "  pull_request:",
  "    types: [opened, synchronize, reopened]",
  "",
  "jobs:",
  "  bella-review:",
  "    runs-on: ubuntu-latest",
  "    permissions:",
  "      pull-requests: read",
  "    steps:",
  "      - uses: Natan-Lucena/bella-review-action@v1",
  "        with:",
  "          bella-token: ${{ secrets.BELLA_TOKEN }}",
];

const KEY_VALUE_LINE = /^(\s*)(- )?([\w-]+):(.*)$/;

// As duas chaves cujo valor "parece uma referência" (o uses: da action e o
// placeholder do token) ganham a cor de string do protótipo — as outras
// (ubuntu-latest, read, [opened, ...], etc.) ficam na cor padrão do bloco.
const STRING_VALUE_KEYS = new Set(["uses", "bella-token"]);

function highlightLine(line: string, index: number) {
  const match = KEY_VALUE_LINE.exec(line);
  if (!match) {
    return <span key={index}>{"\n"}</span>;
  }

  const [, indent, dash, key, rest] = match;
  const valueClassName = STRING_VALUE_KEYS.has(key) ? "text-code-string" : "text-code-text";

  return (
    <span key={index}>
      {indent}
      {dash && <span className="text-code-punctuation">{dash}</span>}
      <span className="text-code-key">{key}</span>
      <span className="text-code-punctuation">:</span>
      <span className={valueClassName}>{rest}</span>
      {"\n"}
    </span>
  );
}

// Réplica visual do cartão do protótipo (../../../claude-design/pages/Bella
// Reviewer.dc.html): barra de "janela" com o nome do arquivo, simulando que é
// literalmente o arquivo que a pessoa vai colar no repositório dela.
export function WorkflowYamlBlock() {
  return (
    <div className="overflow-hidden rounded-lg border border-surface-border bg-surface shadow-lg shadow-black/20">
      <div className="flex items-center gap-2.5 border-b border-surface-border px-4 py-3">
        <div aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
        </div>
        <span className="font-mono text-xs text-ink-muted">.github/workflows/bella.yml</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className="font-mono">{WORKFLOW_YAML_LINES.map(highlightLine)}</code>
      </pre>
      <p className="border-t border-surface-border px-4 py-3 text-sm text-ink-muted">
        Cole isso, gere um token no painel, e pronto — a partir do próximo Pull Request, a Bella já
        está revisando.
      </p>
    </div>
  );
}
