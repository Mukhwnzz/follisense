import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageIcon } from 'lucide-react';

import scalpFrontFemale from '@/assets/scalp-front-female.jpeg';
import scalpSideFemale from '@/assets/scalp-side-female.jpeg';

interface ScalpStep {
  title: string;
  instruction: string;
  referenceImage: string;
}

const getScalpSteps = (_gender: string): ScalpStep[] => [
  {
    title: 'Front hairline',
    instruction: 'Keep your forehead visible. Pull hair back to show your hairline and temples.',
    referenceImage: scalpFrontFemale,
  },
  {
    title: 'Side view',
    instruction: 'Show your temple area and the hairline around your ear.',
    referenceImage: scalpSideFemale,
  },
  {
    title: 'Back and nape',
    instruction: 'Show the back of your head and your nape. Use a mirror or ask someone to help.',
    referenceImage: '', // placeholder - will show icon
  },
  {
    title: 'Top of head',
    instruction: 'Tilt your head forward. Hold your phone above and point down at your crown.',
    referenceImage: '', // placeholder - will show icon
  },
];

interface ScalpBaselineCaptureProps {
  onComplete: (photos: { area: string; dataUrl: string }[]) => void;
  onBack: () => void;
  gender?: string;
}

const ScalpBaselineCapture = ({ onComplete, onBack, gender = 'woman' }: ScalpBaselineCaptureProps) => {
  const scalpSteps = getScalpSteps(gender);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ area: string; dataUrl: string }[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const step = scalpSteps[currentStep];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUsePhoto = () => {
    if (!previewUrl) return;
    const newPhotos = [...capturedPhotos, { area: step.title, dataUrl: previewUrl }];
    setCapturedPhotos(newPhotos);
    setPreviewUrl(null);

    if (currentStep < scalpSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newPhotos);
    }
  };

  const handleRetake = () => {
    setPreviewUrl(null);
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        Step {currentStep + 1} of {scalpSteps.length}
      </p>
      <h2 className="text-lg font-semibold text-foreground mb-1">{step.title}</h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{step.instruction}</p>

      {!previewUrl ? (
        <>
          {/* Reference image */}
          <div className="rounded-xl overflow-hidden border border-border mb-5 bg-accent/30">
            {step.referenceImage ? (
              <img
                src={step.referenceImage}
                alt={`Reference: ${step.title}`}
                style={{ width: '100%', height: '240px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.2)' }}
              />
            ) : (
              <div className="w-full flex items-center justify-center bg-accent/20" style={{ height: '240px' }}>
                <div className="text-center px-6">
                  <Camera size={32} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">Reference: {step.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Image coming in next upload</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press flex items-center justify-center gap-2"
            >
              <Camera size={18} strokeWidth={1.8} /> Take photo
            </button>
            <button
              onClick={() => galleryRef.current?.click()}
              className="w-full h-14 rounded-xl border-2 border-border font-semibold text-sm text-foreground btn-press flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} strokeWidth={1.8} /> Choose from gallery
            </button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Photo preview */}
          <div className="rounded-xl overflow-hidden border border-border mb-5">
            <img
              src={previewUrl}
              alt={`Preview: ${step.title}`}
              style={{ width: '100%', height: '280px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.1)' }}
            />
          </div>

          {/* Confirm / Retake */}
          <div className="space-y-3">
            <button
              onClick={handleUsePhoto}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-press"
            >
              Use this photo
            </button>
            <button
              onClick={handleRetake}
              className="w-full h-14 rounded-xl border-2 border-border font-semibold text-sm text-foreground btn-press"
            >
              Retake
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScalpBaselineCapture;
