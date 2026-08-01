type StepProgressProps = {
  step: number;
  total: number;
  stepName: string;
};

// Indicador "Passo X de Y" + nome do passo + barra decorativa — só o Wizard
// (Passos 1-5) usa hoje. A barra é puramente visual (aria-hidden): o texto já
// comunica o progresso pra leitor de tela, então não duplicamos isso com
// role="progressbar" — ver 00-component-library.md, "StepProgress".
export function StepProgress({ step, total, stepName }: StepProgressProps) {
  const percentage = Math.min(100, (step / total) * 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-[13px] text-ink-muted">
        <span>
          Passo {step} de {total}
        </span>
        <span>{stepName}</span>
      </div>
      <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-surface-border">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
