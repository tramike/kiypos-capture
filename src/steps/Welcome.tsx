import { Store, Receipt, CheckCircle2, Lock } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';
import type { SessionInfo } from '@/types';

interface WelcomeProps {
  session: SessionInfo;
  onContinue: () => void;
}

export function Welcome({ session, onContinue }: WelcomeProps) {
  return (
    <div className="animate-fade-in">
      <StepHeader
        title="Welcome"
        subtitle="Please review your session details before continuing"
        icon={<Store className="h-5 w-5" />}
      />

      <div className="space-y-4">
        <div className="rounded-xl bg-ink-800/60 border border-ink-700 p-5">
          <div className="flex items-center gap-2 text-champagne-400 mb-3">
            <Receipt className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Session Details</span>
          </div>
          <dl className="space-y-2.5">
            {session.stationLabel && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-400">Station</dt>
                <dd className="text-sm font-medium text-ink-100">{session.stationLabel}</dd>
              </div>
            )}
            {session.transactionRef && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-400">Transaction</dt>
                <dd className="text-sm font-medium text-ink-100">{session.transactionRef}</dd>
              </div>
            )}
            {session.purchaseTotal && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-400">Purchase Total</dt>
                <dd className="text-sm font-medium text-ink-100">{session.purchaseTotal}</dd>
              </div>
            )}
            {session.goodsDescription && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-400">Goods</dt>
                <dd className="text-sm font-medium text-ink-100 text-right">{session.goodsDescription}</dd>
              </div>
            )}
            {!session.stationLabel && !session.transactionRef && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-400">Session Key</dt>
                <dd className="text-sm font-mono text-ink-300 truncate max-w-[180px]">
                  {session.keyId.substring(0, 16)}...
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl bg-ink-800/40 border border-ink-700 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-champagne-400 mb-3">What happens next</h3>
          <ul className="space-y-2.5">
            {[
              'Enter your residential address (must be outside Switzerland)',
              'Review and accept the consent declarations',
              'Scan your passport or ID card',
              'Sign to confirm the export declaration',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-ink-300">
                <CheckCircle2 className="h-4 w-4 text-champagne-500/60 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-glacier-900/30 border border-glacier-700/30 p-4">
          <Lock className="h-4 w-4 text-glacier-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-glacier-200 leading-relaxed">
            Your data will be encrypted on this device before transmission. Only the intended
            recipient can decrypt it.
          </p>
        </div>
      </div>

      <NavButtons onNext={onContinue} nextLabel="Begin" />
    </div>
  );
}
