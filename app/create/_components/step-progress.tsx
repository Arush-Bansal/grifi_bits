import { Step } from "../types";

interface StepProgressProps {
  step: Step;
  stepTitle: string;
}

export function StepProgress({ step, stepTitle }: StepProgressProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">BUILD FLOW</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {stepTitle}
          </h1>
        </div>
        <div className="inline-flex items-center self-start rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm sm:self-auto">
          Step {step + 1} of 3
        </div>
      </div>

      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--primary),0.4)]"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}
