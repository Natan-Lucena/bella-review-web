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

const KEY_VALUE_LINE = /^(\s*(?:- )?)([\w-]+):(.*)$/;

function highlightLine(line: string, index: number) {
  const match = KEY_VALUE_LINE.exec(line);
  if (!match) {
    return <span key={index}>{"\n"}</span>;
  }

  const [, indent, key, rest] = match;
  return (
    <span key={index}>
      {indent}
      <span className="text-accent">{key}</span>
      <span className="text-ink-muted">:</span>
      <span className="text-ink">{rest}</span>
      {"\n"}
    </span>
  );
}

export function WorkflowYamlBlock() {
  return (
    <pre className="overflow-x-auto rounded-lg border border-surface-border bg-surface p-4 text-sm">
      <code className="font-mono">{WORKFLOW_YAML_LINES.map(highlightLine)}</code>
    </pre>
  );
}
