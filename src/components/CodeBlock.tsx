type CodeBlockProps = {
  code: string;
  filename?: string;
  footer?: string;
  showDots?: boolean;
};

const KEY_VALUE_LINE = /^(\s*)(- )?([\w-]+):(.*)$/;

// Chaves cujo valor "parece uma referência" (o `uses:` da action e o
// placeholder do token) ganham a cor de string do protótipo — as outras ficam
// na cor padrão do bloco. Ver 00-component-library.md, "CodeBlock".
const STRING_VALUE_KEYS = new Set(["uses", "bella-token"]);

function highlightLine(line: string, index: number) {
  const match = KEY_VALUE_LINE.exec(line);
  if (!match) {
    return (
      <span key={index}>
        {line}
        {"\n"}
      </span>
    );
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

// Cartão de "arquivo" com highlight manual span-por-span (nunca uma lib de
// syntax highlight — ver 00-component-library.md, "Não fazer") — reaproveitado
// entre a Landing (workflow completo) e o Passo 6 do Wizard (só o trecho que
// falta colar). Generaliza o que a PRD 03 implementou como `WorkflowYamlBlock`
// (hardcoded, só pra Landing).
export function CodeBlock({
  code,
  filename = ".github/workflows/bella.yml",
  footer,
  showDots = true,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border bg-surface shadow-lg shadow-black/20">
      <div className="flex items-center gap-2.5 border-b border-surface-border px-4 py-3">
        {showDots && (
          <div aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
          </div>
        )}
        <span className="font-mono text-xs text-ink-muted">{filename}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className="font-mono">{lines.map(highlightLine)}</code>
      </pre>
      {footer && (
        <p className="border-t border-surface-border px-4 py-3 text-sm text-ink-muted">{footer}</p>
      )}
    </div>
  );
}
