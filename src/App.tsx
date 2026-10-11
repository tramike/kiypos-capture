import { useState, useCallback, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import type {
  StepId,
  CustomerAddress,
  ConsentItem,
  MRZData,
  SessionInfo,
  DeviceType,
  SubmissionResponse,
} from '@/types';
import { createEmptyAddress } from '@/lib/address';
import { createDefaultConsents } from '@/lib/consents';
import { encryptPayload } from '@/lib/crypto';
import { submitEncryptedPayload } from '@/lib/submit';
import { detectDeviceType } from '@/lib/device';
import { ProgressBar, StepIndicator } from '@/components/Progress';
import { QRScanner } from '@/steps/QRScanner';
import { Welcome } from '@/steps/Welcome';
import { AddressForm } from '@/steps/AddressForm';
import { Consents } from '@/steps/Consents';
import { DocumentCapture } from '@/steps/DocumentCapture';
import { SignaturePad } from '@/steps/SignaturePad';
import { Review } from '@/steps/Review';
import { SubmittingScreen } from '@/steps/SubmittingScreen';
import { SuccessScreen } from '@/steps/SuccessScreen';
import { ErrorScreen } from '@/steps/ErrorScreen';

const WIZARD_STEPS: { id: StepId; label: string }[] = [
  { id: 'qr-scan', label: 'Scan' },
  { id: 'welcome', label: 'Welcome' },
  { id: 'address', label: 'Address' },
  { id: 'consents', label: 'Consents' },
  { id: 'document', label: 'Document' },
  { id: 'signature', label: 'Signature' },
  { id: 'review', label: 'Review' },
];

function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [address, setAddress] = useState<CustomerAddress>(createEmptyAddress());
  const [consents, setConsents] = useState<ConsentItem[]>(createDefaultConsents());
  const [mrzData, setMrzData] = useState<MRZData | null>(null);
  const [rectifiedImage, setRectifiedImage] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [deviceType] = useState<DeviceType>(detectDeviceType());
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [submissionError, setSubmissionError] = useState('');

  const [urlKey, setUrlKey] = useState<{ keyId: string; encryptionKey: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    if (key && key.length >= 16) {
      setUrlKey({ keyId: key, encryptionKey: key });
    }
  }, []);

  const currentStep = WIZARD_STEPS[stepIndex]?.id ?? 'qr-scan';

  const handleQRScan = useCallback((keyId: string, encryptionKey: string) => {
    setSession({
      keyId,
      encryptionKey,
      stationLabel: null,
      transactionRef: null,
      purchaseTotal: null,
      goodsDescription: null,
    });
    setStepIndex(1);
  }, []);

  const handleConsentToggle = useCallback((id: string) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              accepted: !c.accepted,
              acceptedAt: !c.accepted ? new Date().toISOString() : null,
            }
          : c
      )
    );
  }, []);

  const handleDocumentCapture = useCallback((mrz: MRZData | null, image: string | null) => {
    setMrzData(mrz);
    setRectifiedImage(image);
  }, []);

  const handleJump = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < WIZARD_STEPS.length) {
      setStepIndex(targetIndex);
    }
  }, []);

  const resetAll = useCallback(() => {
    setStepIndex(0);
    setSession(null);
    setAddress(createEmptyAddress());
    setConsents(createDefaultConsents());
    setMrzData(null);
    setRectifiedImage(null);
    setSignatureImage(null);
    setSubmissionResult(null);
    setSubmissionError('');
  }, []);

  const doSubmit = useCallback(async () => {
    if (!session) return;
    setStepIndex(WIZARD_STEPS.length);

    try {
      const payload = {
        customer: address,
        consents,
        mrzData,
        rectifiedDocumentImage: rectifiedImage,
        signatureImage,
        keyId: session.keyId,
        submittedAt: new Date().toISOString(),
        deviceType,
      };

      const encrypted = await encryptPayload(payload, session.encryptionKey, session.keyId);
      const result = await submitEncryptedPayload(encrypted, deviceType);

      if (result.status === 'accepted') {
        setSubmissionResult(result);
        setStepIndex(WIZARD_STEPS.length + 1);
      } else {
        setSubmissionError(result.reason || 'The server rejected the submission.');
        setStepIndex(WIZARD_STEPS.length + 2);
      }
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : 'An unexpected error occurred during submission.'
      );
      setStepIndex(WIZARD_STEPS.length + 2);
    }
  }, [session, address, consents, mrzData, rectifiedImage, signatureImage, deviceType]);

  const renderStep = () => {
    if (currentStep === 'submitting') return <SubmittingScreen />;
    if (currentStep === 'success')
      return (
        <SuccessScreen
          exportDocRef={submissionResult?.exportDocRef}
          crmRef={submissionResult?.crmRef}
          onReset={resetAll}
        />
      );
    if (currentStep === 'error')
      return (
        <ErrorScreen
          message={submissionError}
          onRetry={doSubmit}
          onReset={resetAll}
        />
      );

    switch (currentStep) {
      case 'qr-scan':
        return <QRScanner onScanComplete={handleQRScan} urlKey={urlKey} />;
      case 'welcome':
        return session ? (
          <Welcome session={session} onContinue={() => setStepIndex(2)} />
        ) : null;
      case 'address':
        return (
          <AddressForm
            address={address}
            onChange={setAddress}
            onBack={() => setStepIndex(1)}
            onNext={() => setStepIndex(3)}
          />
        );
      case 'consents':
        return (
          <Consents
            consents={consents}
            onToggle={handleConsentToggle}
            onBack={() => setStepIndex(2)}
            onNext={() => setStepIndex(4)}
          />
        );
      case 'document':
        return (
          <DocumentCapture
            mrzData={mrzData}
            rectifiedImage={rectifiedImage}
            onCapture={handleDocumentCapture}
            onBack={() => setStepIndex(3)}
            onNext={() => setStepIndex(5)}
          />
        );
      case 'signature':
        return (
          <SignaturePad
            signatureImage={signatureImage}
            onChange={setSignatureImage}
            onBack={() => setStepIndex(4)}
            onNext={() => setStepIndex(6)}
          />
        );
      case 'review':
        return session ? (
          <Review
            customer={address}
            consents={consents}
            mrzData={mrzData}
            rectifiedImage={rectifiedImage}
            signatureImage={signatureImage}
            session={session}
            onBack={() => setStepIndex(5)}
            onSubmit={doSubmit}
            onJump={handleJump}
          />
        ) : null;
      default:
        return null;
    }
  };

  const showProgress = !['submitting', 'success', 'error'].includes(currentStep);

  return (
    <div className="min-h-screen bg-ink-950 safe-top safe-bottom">
      <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur-md border-b border-ink-800">
        <div className="max-w-lg mx-auto px-4 py-3.5">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-lg bg-champagne-500/10 border border-champagne-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-champagne-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-serif font-medium text-ink-50 leading-none">KiyPos Capture</h1>
              <p className="text-[10px] text-ink-500 mt-1 tracking-wide uppercase">Swiss VAT Export</p>
            </div>
          </div>
          {showProgress && (
            <>
              <div className="mb-2.5">
                <ProgressBar currentStep={stepIndex} totalSteps={WIZARD_STEPS.length} />
              </div>
              <StepIndicator
                steps={WIZARD_STEPS}
                currentIndex={stepIndex}
                onJump={handleJump}
              />
            </>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <div className="step-card">{renderStep()}</div>
      </main>

      <footer className="max-w-lg mx-auto px-4 pb-5 pt-2 text-center">
        <p className="text-[10px] text-ink-600 tracking-wide">
          Encrypted end-to-end. Data is processed for Swiss customs export and CRM.
        </p>
      </footer>
    </div>
  );
}

export default App;
