import { Step } from "../types";

interface StepProgressProps {
  step: Step;
  stepTitle: string;
}

export function StepProgress({ step, stepTitle }: StepProgressProps) {
  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Build Flow</p>
          <h1 className="mt-2 text-3xl font-bold">{stepTitle}</h1>
        </div>
        <div className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
          Step {step + 1} of 5
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((step + 1) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
