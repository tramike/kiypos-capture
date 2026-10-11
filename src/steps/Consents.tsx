import { ShieldCheck, Check, Lock } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';
import type { ConsentItem } from '@/types';
import { allRequiredAccepted, remainingRequiredCount } from '@/lib/consents';

interface ConsentsProps {
  consents: ConsentItem[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Consents({ consents, onToggle, onBack, onNext }: ConsentsProps) {
  const remaining = remainingRequiredCount(consents);
  const canProceed = allRequiredAccepted(consents);

  return (
    <div className="animate-slide-right">
      <StepHeader
        title="Consents"
        subtitle="Please review and accept the following declarations to continue"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      {remaining > 0 && (
        <div className="mb-4 rounded-xl bg-champagne-500/10 border border-champagne-500/20 px-4 py-2.5 text-sm text-champagne-400">
          {remaining} required consent{remaining !== 1 ? 's' : ''} remaining
        </div>
      )}

      <div className="space-y-3">
        {consents.map((consent) => (
          <div
            key={consent.id}
            className={`rounded-xl border p-4 transition-colors ${
              consent.accepted
                ? 'border-success-500/30 bg-success-500/5'
                : 'border-ink-700 bg-ink-800/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggle(consent.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  consent.accepted
                    ? 'bg-champagne-500 border-champagne-500 text-ink-900'
                    : 'border-ink-500 bg-ink-800'
                }`}
                aria-label={consent.accepted ? 'Accepted' : 'Not accepted'}
              >
                {consent.accepted && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-ink-100">{consent.title}</h3>
                  {consent.required ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-500">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-400 mt-1 leading-relaxed">
                  {consent.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-ink-800/40 border border-ink-700 p-3.5">
        <Lock className="h-4 w-4 text-ink-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-ink-400 leading-relaxed">
          All consents are encrypted together with your data and cannot be modified after submission.
        </p>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  );
}
