import { useRef, useState, useEffect } from 'react';
import { PenLine, Trash2, CheckCircle2 } from 'lucide-react';
import { StepHeader, NavButtons } from '@/components/StepShell';

interface SignaturePadProps {
  signatureImage: string | null;
  onChange: (image: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SignaturePad({ signatureImage, onChange, onBack, onNext }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (signatureImage) {
      setConfirmed(true);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#131211';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#f5ecda';
    ctx.lineWidth = 2.5;
  }, [signatureImage]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (confirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || confirmed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint.current) return;
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#131211';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setConfirmed(false);
    onChange(null);
  };

  const handleConfirm = () => {
    if (!hasDrawn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    setConfirmed(true);
  };

  return (
    <div className="animate-slide-right">
      <StepHeader
        title="Signature"
        subtitle="Sign below with your finger. This will appear on the customs export document."
        icon={<PenLine className="h-5 w-5" />}
      />

      <div className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`w-full h-48 rounded-xl border-2 bg-ink-950 touch-none transition-colors ${
              confirmed ? 'border-success-500/40' : 'border-ink-600'
            }`}
            style={{ aspectRatio: '3 / 1' }}
          />
          {!hasDrawn && !confirmed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm text-ink-600 font-serif italic">Sign here...</span>
            </div>
          )}
          <div className="absolute bottom-3 left-4 right-4 border-b border-champagne-600/20" />
        </div>

        {confirmed ? (
          <div className="flex items-center gap-2 text-success-400 animate-check-pop">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Signature captured</span>
          </div>
        ) : (
          <p className="text-xs text-ink-500 leading-relaxed">
            Draw your signature in the box above. Tap "Confirm Signature" when done.
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={handleClear} className="btn-secondary flex-1" disabled={!hasDrawn && !confirmed}>
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          {!confirmed && (
            <button onClick={handleConfirm} className="btn-primary flex-1" disabled={!hasDrawn}>
              Confirm Signature
            </button>
          )}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!confirmed} />
    </div>
  );
}
