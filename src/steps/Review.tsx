import { FileText, MapPin, ShieldCheck, ScanLine, PenLine, AlertCircle, Check } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';
import type { CustomerAddress, ConsentItem, MRZData, SessionInfo } from '@/types';
import { getCountryList } from '@/lib/address';

interface ReviewProps {
  customer: CustomerAddress;
  consents: ConsentItem[];
  mrzData: MRZData | null;
  rectifiedImage: string | null;
  signatureImage: string | null;
  session: SessionInfo;
  onBack: () => void;
  onSubmit: () => void;
  onJump: (stepIndex: number) => void;
}

export function Review({
  customer,
  consents,
  mrzData,
  rectifiedImage,
  signatureImage,
  session,
  onBack,
  onSubmit,
  onJump,
}: ReviewProps) {
  const countries = getCountryList();
  const countryName =
    countries.find((c) => c.code === customer.country)?.name || customer.country;

  const requiredConsents = consents.filter((c) => c.required);
  const optionalConsents = consents.filter((c) => !c.required);

  return (
    <div className="animate-slide-right">
      <StepHeader
        title="Review & Submit"
        subtitle="Please verify all information before submitting"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="space-y-4">
        <ReviewSection icon={<MapPin className="h-4 w-4" />} title="Customer Address" onEdit={() => onJump(2)}>
          <dl className="space-y-1 text-sm">
            <div><span className="text-ink-500">Name: </span><span className="font-medium text-ink-100">{customer.fullName}</span></div>
            <div><span className="text-ink-500">Address: </span><span className="font-medium text-ink-100">{customer.street} {customer.houseNumber}, {customer.postalCode} {customer.city}</span></div>
            {customer.stateRegion && <div><span className="text-ink-500">Region: </span><span className="font-medium text-ink-100">{customer.stateRegion}</span></div>}
            <div><span className="text-ink-500">Country: </span><span className="font-medium text-ink-100">{countryName}</span></div>
            <div><span className="text-ink-500">Phone: </span><span className="font-medium text-ink-100">{customer.phone}</span></div>
            <div><span className="text-ink-500">Email: </span><span className="font-medium text-ink-100">{customer.email}</span></div>
          </dl>
        </ReviewSection>

        <ReviewSection icon={<ShieldCheck className="h-4 w-4" />} title="Consents" onEdit={() => onJump(3)}>
          <div className="space-y-1.5">
            {requiredConsents.map((c) => (
              <ConsentStatus key={c.id} consent={c} />
            ))}
            {optionalConsents.map((c) => (
              <ConsentStatus key={c.id} consent={c} />
            ))}
          </div>
        </ReviewSection>

        <ReviewSection icon={<ScanLine className="h-4 w-4" />} title="Travel Document" onEdit={() => onJump(4)}>
          {rectifiedImage ? (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-ink-700">
                <img src={rectifiedImage} alt="Document" className="w-full max-h-40 object-contain" />
              </div>
              {mrzData && (
                <dl className="text-sm space-y-0.5">
                  {mrzData.documentNumber && <div><span className="text-ink-500">Doc No: </span><span className="font-medium text-ink-100">{mrzData.documentNumber}</span></div>}
                  {mrzData.name && <div><span className="text-ink-500">Name: </span><span className="font-medium text-ink-100">{mrzData.name}</span></div>}
                  {mrzData.expiryDate && <div><span className="text-ink-500">Expiry: </span><span className="font-medium text-ink-100">{mrzData.expiryDate}</span></div>}
                </dl>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No document captured</p>
          )}
        </ReviewSection>

        <ReviewSection icon={<PenLine className="h-4 w-4" />} title="Signature" onEdit={() => onJump(5)}>
          {signatureImage ? (
            <div className="rounded-lg overflow-hidden border border-ink-700 bg-ink-950">
              <img src={signatureImage} alt="Signature" className="w-full max-h-20 object-contain" />
            </div>
          ) : (
            <p className="text-sm text-ink-500">No signature captured</p>
          )}
        </ReviewSection>

        {session.transactionRef && (
          <div className="rounded-xl bg-ink-800/40 border border-ink-700 p-3.5 text-sm">
            <span className="text-ink-500">Transaction: </span>
            <span className="font-medium text-ink-100">{session.transactionRef}</span>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl bg-champagne-500/10 border border-champagne-500/20 p-3.5">
          <AlertCircle className="h-4 w-4 text-champagne-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-champagne-200 leading-relaxed">
            By tapping Submit, you confirm that all information is accurate. The data will be
            encrypted and sent for processing.
          </p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onSubmit} nextLabel="Submit" />
    </div>
  );
}

function ReviewSection({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-ink-200">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <button onClick={onEdit} className="text-xs font-medium text-champagne-500 hover:text-champagne-400 transition-colors">
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ConsentStatus({ consent }: { consent: ConsentItem }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {consent.accepted ? (
        <Check className="h-4 w-4 text-success-400 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-ink-500 flex-shrink-0" />
      )}
      <span className={consent.accepted ? 'text-ink-200' : 'text-ink-500'}>
        {consent.title}
      </span>
      {consent.required && !consent.accepted && (
        <span className="text-[10px] text-champagne-500 font-bold uppercase">Required</span>
      )}
    </div>
  );
}
