import { Loader2, Lock } from 'lucide-react';

export function SubmittingScreen() {
  return (
    <div className="animate-fade-in text-center py-10">
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-champagne-500/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-champagne-500" />
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 h-8 w-8 text-champagne-500 animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-serif font-medium text-ink-50 mb-1.5">Encrypting & Sending</h2>
      <p className="text-sm text-ink-400">
        Your data is being encrypted and securely transmitted...
      </p>
      <div className="mt-7 space-y-2.5 text-left max-w-xs mx-auto">
        <SubmitStep label="Encrypting payload" />
        <SubmitStep label="Uploading to server" delay={500} />
        <SubmitStep label="Awaiting confirmation" delay={1000} />
      </div>
    </div>
  );
}

function SubmitStep({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <div
      className="flex items-center gap-2.5 text-sm text-ink-400 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="w-4 h-4 rounded-full border-2 border-ink-600 border-t-champagne-500 animate-spin flex-shrink-0" />
      {label}
    </div>
  );
}
