import type { ReactNode } from 'react';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function StepHeader({ title, subtitle, icon }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-champagne-500/10 text-champagne-400 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-medium text-ink-50 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-ink-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="divider-gold mt-4" />
    </div>
  );
}

interface NavButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
}

export function NavButtons({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  backLabel = 'Back',
}: NavButtonsProps) {
  return (
    <div className="flex gap-3 mt-7">
      {onBack && (
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          {backLabel}
        </button>
      )}
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled} className="btn-primary flex-1">
          {nextLabel}
        </button>
      )}
    </div>
  );
}
