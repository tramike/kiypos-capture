import { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, RefreshCw, CheckCircle2, AlertCircle, FileText, Camera, Loader2, X } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';
import { scanDocument, isMRZScannerAvailable } from '@/lib/mrz-scanner';
import type { MRZData } from '@/types';

interface DocumentCaptureProps {
  mrzData: MRZData | null;
  rectifiedImage: string | null;
  onCapture: (mrz: MRZData | null, rectifiedImage: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export function DocumentCapture({
  mrzData,
  rectifiedImage,
  onCapture,
  onBack,
  onNext,
}: DocumentCaptureProps) {
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'idle' | 'scanning' | 'captured' | 'error' | 'manual'>('idle');
  const [error, setError] = useState('');
  const [manualMrz, setManualMrz] = useState<MRZData>({
    documentType: 'P',
    documentNumber: '',
    name: '',
    nationality: '',
    dateOfBirth: '',
    expiryDate: '',
    gender: '',
    issuingState: '',
  });

  const hasLicense = isMRZScannerAvailable();

  useEffect(() => {
    if (rectifiedImage) {
      setMode('captured');
    }
    return () => {
      if (scannerContainerRef.current) {
        scannerContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  const handleScan = useCallback(async () => {
    if (!scannerContainerRef.current) return;
    setMode('scanning');
    setError('');

    try {
      const result = await scanDocument(scannerContainerRef.current);
      if (!result) {
        setMode('idle');
        return;
      }
      onCapture(result.mrz, result.rectifiedImage);
      setMode('captured');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scanner failed to initialize.';
      setError(msg);
      setMode('error');
    }
  }, [onCapture]);

  const handleRetake = () => {
    onCapture(null, null);
    setMode('idle');
    setError('');
  };

  const handleManualSave = () => {
    onCapture(manualMrz, rectifiedImage);
    setMode('captured');
  };

  const canProceed = !!rectifiedImage;

  return (
    <div className="animate-slide-right">
      <StepHeader
        title="Scan Travel Document"
        subtitle={
          hasLicense
            ? 'Position your passport or ID card within the frame. The document will be auto-detected and perspective-corrected.'
            : 'Position your passport or ID card within the frame. A photo will be captured for customs.'
        }
        icon={<ScanLine className="h-5 w-5" />}
      />

      {mode === 'captured' && rectifiedImage ? (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-ink-700 bg-ink-800">
            <img
              src={rectifiedImage}
              alt="Captured document"
              className="w-full object-contain max-h-72"
            />
          </div>

          {mrzData && (
            <div className="rounded-xl bg-ink-800/60 border border-ink-700 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-champagne-400 mb-3">Extracted Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {mrzData.documentType && (
                  <div>
                    <dt className="text-ink-500 text-xs">Type</dt>
                    <dd className="font-medium text-ink-100">{mrzData.documentType}</dd>
                  </div>
                )}
                {mrzData.documentNumber && (
                  <div>
                    <dt className="text-ink-500 text-xs">Document No.</dt>
                    <dd className="font-medium text-ink-100">{mrzData.documentNumber}</dd>
                  </div>
                )}
                {mrzData.name && (
                  <div className="col-span-2">
                    <dt className="text-ink-500 text-xs">Name</dt>
                    <dd className="font-medium text-ink-100">{mrzData.name}</dd>
                  </div>
                )}
                {mrzData.nationality && (
                  <div>
                    <dt className="text-ink-500 text-xs">Nationality</dt>
                    <dd className="font-medium text-ink-100">{mrzData.nationality}</dd>
                  </div>
                )}
                {mrzData.expiryDate && (
                  <div>
                    <dt className="text-ink-500 text-xs">Expiry</dt>
                    <dd className="font-medium text-ink-100">{mrzData.expiryDate}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="flex items-center gap-2 text-success-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Document captured</span>
          </div>

          <NavButtons onBack={handleRetake} backLabel="Retake" onNext={onNext} nextLabel="Continue" />
        </div>
      ) : mode === 'scanning' ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-800/60 border border-ink-700 p-8 text-center">
            <Loader2 className="h-10 w-10 text-champagne-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-ink-300 mb-1">Camera scanner is active.</p>
            <p className="text-xs text-ink-500">Position the document within the on-screen guide and hold steady.</p>
          </div>
          <button
            onClick={() => { setMode('idle'); setError(''); }}
            className="btn-ghost w-full"
          >
            <X className="h-4 w-4" /> Cancel Scan
          </button>
        </div>
      ) : mode === 'error' ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-error-500/10 border border-error-500/30 p-4">
            <AlertCircle className="h-5 w-5 text-error-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-300">{error}</p>
          </div>
          <button onClick={handleScan} className="btn-secondary w-full">
            <RefreshCw className="h-4 w-4" /> Try Scanner Again
          </button>
          <button onClick={() => setMode('manual')} className="btn-ghost w-full">
            <FileText className="h-4 w-4" /> Enter Document Details Manually
          </button>
        </div>
      ) : mode === 'manual' ? (
        <div className="space-y-3 animate-slide-up">
          <p className="text-sm text-ink-400">
            Enter the document details from the passport or ID card.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Document Type</label>
              <select
                value={manualMrz.documentType}
                onChange={(e) => setManualMrz({ ...manualMrz, documentType: e.target.value })}
                className="input-field"
              >
                <option value="P">Passport (P)</option>
                <option value="I">ID Card (I)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Document Number</label>
              <input
                type="text"
                value={manualMrz.documentNumber}
                onChange={(e) => setManualMrz({ ...manualMrz, documentNumber: e.target.value })}
                className="input-field"
                placeholder="X12345678"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              value={manualMrz.name}
              onChange={(e) => setManualMrz({ ...manualMrz, name: e.target.value })}
              className="input-field"
              placeholder="As shown on document"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Nationality</label>
              <input
                type="text"
                value={manualMrz.nationality}
                onChange={(e) => setManualMrz({ ...manualMrz, nationality: e.target.value })}
                className="input-field"
                placeholder="DEU"
              />
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select
                value={manualMrz.gender}
                onChange={(e) => setManualMrz({ ...manualMrz, gender: e.target.value })}
                className="input-field"
              >
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="X">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Date of Birth</label>
              <input
                type="text"
                value={manualMrz.dateOfBirth}
                onChange={(e) => setManualMrz({ ...manualMrz, dateOfBirth: e.target.value })}
                className="input-field"
                placeholder="YYMMDD"
              />
            </div>
            <div>
              <label className="input-label">Expiry Date</label>
              <input
                type="text"
                value={manualMrz.expiryDate}
                onChange={(e) => setManualMrz({ ...manualMrz, expiryDate: e.target.value })}
                className="input-field"
                placeholder="YYMMDD"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Issuing State</label>
            <input
              type="text"
              value={manualMrz.issuingState}
              onChange={(e) => setManualMrz({ ...manualMrz, issuingState: e.target.value })}
              className="input-field"
              placeholder="DEU"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMode('idle')} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={handleManualSave} className="btn-primary flex-1">
              Save Details
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-800/40 border border-ink-700 p-8 text-center">
            <ScanLine className="h-14 w-14 text-champagne-500/40 mx-auto mb-4" />
            <p className="text-sm text-ink-300 mb-1">
              {hasLicense
                ? 'Tap below to open the scanner. It will automatically detect the document, correct perspective, and extract MRZ data.'
                : 'Tap below to start the camera and capture the document.'}
            </p>
            <p className="text-xs text-ink-500">
              {hasLicense
                ? 'Supports passports, TD1 and TD2 ID cards.'
                : 'Manual entry is available as fallback.'}
            </p>
          </div>
          <button onClick={handleScan} className="btn-primary w-full">
            <Camera className="h-5 w-5" /> {hasLicense ? 'Start Scanner' : 'Start Camera'}
          </button>
          <button onClick={() => setMode('manual')} className="btn-ghost w-full">
            <FileText className="h-4 w-4" /> Enter Manually Instead
          </button>
        </div>
      )}

      <div ref={scannerContainerRef} className="hidden" />

      {mode === 'captured' && !canProceed && (
        <p className="text-sm text-error-400 mt-2">Please capture a document image to continue.</p>
      )}
    </div>
  );
}
