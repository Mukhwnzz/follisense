import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageIcon } from 'lucide-react';

import scalpFrontFemale from '@/assets/scalp-front-female.jpeg';
import scalpSideFemale from '@/assets/scalp-side-female.jpeg';
import scalpBackFemale from '@/assets/scalp-back-female.jpeg';
import scalpTopFemale from '@/assets/scalp-top-female.jpeg';
import scalpSideMaleA from '@/assets/scalp-side-male-a.jpeg';
import scalpSideMaleB from '@/assets/scalp-side-male-b.jpeg';
import scalpBackMale from '@/assets/scalp-back-male.png';
import scalpTopMale from '@/assets/scalp-top-male.png';

interface ScalpStep {
  title: string;
  instruction: string;
  referenceImage: string;
}

const getScalpSteps = (gender: string): ScalpStep[] => {
  const isMale = gender === 'man';

  if (isMale) {
    return [
      {
        title: 'Front hairline',
        instruction: 'Keep your forehead visible. Pull hair back to show your hairline and temples.',
        referenceImage: scalpSideMaleA,
      },
      {
        title: 'Side view',
        instruction: 'Show your temple area and the hairline around your ear.',
        referenceImage: scalpSideMaleB,
      },
      {
        title: 'Back and nape',
        instruction: 'Show the back of your head and your nape. Use a mirror or ask someone to help.',
        referenceImage: scalpBackMale,
      },
      {
        title: 'Top of head',
        instruction: 'Tilt your head forward. Hold your phone above and point down at your crown.',
        referenceImage: scalpTopMale,
      },
    ];
  }

  return [
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
      referenceImage: scalpBackFemale,
    },
    {
      title: 'Top of head',
      instruction: 'Tilt your head forward. Hold your phone above and point down at your crown.',
      referenceImage: scalpTopFemale,
    },
  ];
};

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

  const handleSkipStep = () => {
    if (currentStep < scalpSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(capturedPhotos);
    }
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        Step {currentStep + 1} of {scalpSteps.length}
      </p>
      <h2 className="text-lg font-semibold text-foreground mb-1">{step.title}</h2>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {currentStep === 2
          ? "Show the back of your head and your nape. This one's tricky on your own."
          : step.instruction}
      </p>

      {!previewUrl ? (
        <>
          <div className="rounded-xl overflow-hidden border border-border mb-5 bg-accent/30">
            <img
              src={step.referenceImage}
              alt={`Reference: ${step.title}`}
              style={{ width: '100%', height: '240px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.2)' }}
            />
          </div>

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

          {currentStep === 2 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkipStep}
                className="text-sm font-medium text-primary underline underline-offset-2"
              >
                Skip this one for now
              </button>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                You can add this later, or ask someone to help next time you're at the salon.
              </p>
            </div>
          )}

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
          <div className="rounded-xl overflow-hidden border border-border mb-5">
            <img
              src={previewUrl}
              alt={`Preview: ${step.title}`}
              style={{ width: '100%', height: '280px', objectFit: 'contain', display: 'block', background: 'hsl(var(--accent) / 0.1)' }}
            />
          </div>

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
