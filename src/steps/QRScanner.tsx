import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { QrCode, Camera, RefreshCw, AlertCircle, KeyRound } from 'lucide-react';
import { StepHeader } from '@/components/StepShell';

interface QRScannerProps {
  onScanComplete: (keyId: string, encryptionKey: string) => void;
  urlKey?: { keyId: string; encryptionKey: string } | null;
}

export function QRScanner({ onScanComplete, urlKey }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error' | 'permission-denied'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [showManual, setShowManual] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code && code.data) {
        stopCamera();
        const parsed = parseKeyString(code.data);
        if (parsed) {
          onScanComplete(parsed.keyId, parsed.encryptionKey);
          return;
        }
      }
    } catch {
      /* keep scanning */
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, [onScanComplete, stopCamera]);

  const startCamera = useCallback(async () => {
    setStatus('scanning');
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      scanLoop();
    } catch (err) {
      const error = err as DOMException;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatus('permission-denied');
        setErrorMessage('Camera access was denied. Please allow camera access to scan the QR code.');
      } else {
        setStatus('error');
        setErrorMessage('Could not access the camera. You can enter the key manually below.');
      }
    }
  }, [scanLoop]);

  useEffect(() => {
    if (urlKey) {
      onScanComplete(urlKey.keyId, urlKey.encryptionKey);
      return;
    }
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = () => {
    const trimmed = manualKey.trim();
    if (!trimmed) return;
    const parsed = parseKeyString(trimmed);
    if (parsed) {
      stopCamera();
      onScanComplete(parsed.keyId, parsed.encryptionKey);
    } else {
      setStatus('error');
      setErrorMessage('Invalid key format. Please check and try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <StepHeader
        title="Scan QR Code"
        subtitle="Point the camera at the QR code on the POS display or sticker"
        icon={<QrCode className="h-5 w-5" />}
      />

      {status === 'permission-denied' || status === 'error' ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-error-500/10 border border-error-500/30 p-4">
            <AlertCircle className="h-5 w-5 text-error-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error-300">{errorMessage}</p>
          </div>
          <div className="space-y-3">
            <button onClick={startCamera} className="btn-secondary w-full">
              <RefreshCw className="h-4 w-4" /> Try Camera Again
            </button>
            <div className="divider-gold" />
            <button onClick={() => setShowManual(!showManual)} className="btn-ghost w-full">
              <KeyRound className="h-4 w-4" /> Enter Key Manually
            </button>
            {showManual && (
              <div className="mt-3 space-y-2 animate-slide-up">
                <input
                  type="text"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  placeholder="Paste the session key here..."
                  className="input-field"
                />
                <button onClick={handleManualSubmit} className="btn-primary w-full">
                  Submit Key
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-ink-950 border border-ink-700">
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-champagne-400/60 rounded-xl" />
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-champagne-400/70 animate-scan-line" />
            </div>
            {status === 'scanning' && (
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/80 px-3 py-1.5 text-xs text-champagne-400">
                  <Camera className="h-3 w-3" /> Scanning...
                </span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button onClick={() => setShowManual(!showManual)} className="btn-ghost w-full">
            <KeyRound className="h-4 w-4" /> Enter Key Manually
          </button>
          {showManual && (
            <div className="space-y-2 animate-slide-up">
              <input
                type="text"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste the session key here..."
                className="input-field"
              />
              <button onClick={handleManualSubmit} className="btn-primary w-full">
                Submit Key
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function parseKeyString(raw: string): { keyId: string; encryptionKey: string } | null {
  try {
    if (raw.startsWith('http')) {
      const url = new URL(raw);
      const key = url.searchParams.get('key');
      if (key) return { keyId: key, encryptionKey: key };
    }
    if (raw.includes(':')) {
      const [id, key] = raw.split(':');
      if (id && key) return { keyId: id.trim(), encryptionKey: key.trim() };
    }
    if (raw.length >= 16) {
      return { keyId: raw, encryptionKey: raw };
    }
  } catch {
    /* invalid */
  }
  return null;
}
