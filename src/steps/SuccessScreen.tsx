import { CheckCircle2, RotateCcw } from 'lucide-react';

interface SuccessScreenProps {
  exportDocRef?: string;
  crmRef?: string;
  onReset: () => void;
}

export function SuccessScreen({ exportDocRef, crmRef, onReset }: SuccessScreenProps) {
  return (
    <div className="animate-fade-in text-center py-8">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center animate-check-pop">
          <CheckCircle2 className="h-12 w-12 text-success-400" strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="text-2xl font-serif font-medium text-ink-50 mb-1.5">Submission Complete</h2>
      <p className="text-sm text-ink-400 mb-6">
        Your data has been encrypted and submitted successfully.
      </p>

      {(exportDocRef || crmRef) && (
        <div className="rounded-xl bg-ink-800/60 border border-ink-700 p-4 mb-6 text-left">
          {exportDocRef && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-500">Export Document Ref</span>
              <span className="font-mono font-medium text-champagne-400">{exportDocRef}</span>
            </div>
          )}
          {crmRef && (
            <div className="flex justify-between text-sm">
              <span className="text-ink-500">CRM Ref</span>
              <span className="font-mono font-medium text-champagne-400">{crmRef}</span>
            </div>
          )}
        </div>
      )}

      <div className="divider-gold mb-6" />

      <button onClick={onReset} className="btn-primary w-full">
        <RotateCcw className="h-4 w-4" /> Done — Next Customer
      </button>
    </div>
  );
}
