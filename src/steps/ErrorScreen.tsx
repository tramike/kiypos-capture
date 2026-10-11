import { AlertTriangle, RotateCw, Home } from 'lucide-react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorScreen({ message, onRetry, onReset }: ErrorScreenProps) {
  return (
    <div className="animate-fade-in text-center py-8">
      <div className="flex justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-error-500/10 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-error-400" strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="text-2xl font-serif font-medium text-ink-50 mb-1.5">Submission Failed</h2>
      <p className="text-sm text-ink-400 mb-3">
        Something went wrong while submitting your data.
      </p>
      <div className="rounded-xl bg-error-500/10 border border-error-500/30 p-3.5 mb-6">
        <p className="text-sm text-error-300">{message}</p>
      </div>

      <div className="divider-gold mb-6" />

      <div className="flex gap-3">
        <button onClick={onReset} className="btn-secondary flex-1">
          <Home className="h-4 w-4" /> Start Over
        </button>
        <button onClick={onRetry} className="btn-primary flex-1">
          <RotateCw className="h-4 w-4" /> Retry
        </button>
      </div>
    </div>
  );
}
