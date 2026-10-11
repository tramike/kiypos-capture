import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  steps: { id: string; label: string }[];
  currentIndex: number;
  onJump?: (index: number) => void;
}

export function StepIndicator({ steps, currentIndex, onJump }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const clickable = onJump && i <= currentIndex;
        return (
          <button
            key={step.id}
            disabled={!clickable}
            onClick={() => clickable && onJump?.(i)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isCurrent
                ? 'bg-champagne-500 text-ink-900'
                : isDone
                  ? 'bg-champagne-500/10 text-champagne-400'
                  : 'bg-ink-800 text-ink-500'
            } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {isDone ? (
              <Check className="h-3 w-3" strokeWidth={3} />
            ) : (
              <span className="h-3 w-3 flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
            )}
            <span className="whitespace-nowrap">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}
