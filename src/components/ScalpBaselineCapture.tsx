import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageIcon } from 'lucide-react';

interface ScalpStep {
  title: string;
  instruction: string;
  referenceImage: string;
}

const scalpSteps: ScalpStep[] = [
  {
    title: 'Front hairline',
    instruction: 'Keep your forehead visible. Pull hair back to show your hairline and temples.',
    referenceImage: 'https://i.pinimg.com/736x/8a/1e/6b/8a1e6b2f5c7d8e9f0a1b2c3d4e5f6a7b.jpg',
  },
  {
    title: 'Side',
    instruction: 'Show your temple area and the hairline around your ear.',
    referenceImage: 'https://i.pinimg.com/736x/9b/2f/7c/9b2f7c3e6d8a1b4c5d6e7f8a9b0c1d2e.jpg',
  },
  {
    title: 'Back and nape',
    instruction: 'Show the back of your head and your nape.',
    referenceImage: 'https://i.pinimg.com/736x/0c/3a/8d/0c3a8d4f7e9b2c5d6e7f8a9b0c1d2e3f.jpg',
  },
  {
    title: 'Top of head',
    instruction: 'Tilt your head forward and take a photo from above showing your crown and parting.',
    referenceImage: 'https://i.pinimg.com/736x/1d/4b/9e/1d4b9e5a8c0d3f6e7a8b9c0d1e2f3a4b.jpg',
  },
];

interface ScalpBaslineCaptureProps {
  onComplete: (photos: { area: string; dataUrl: string }[]) => void;
  onBack: () => void;
}

const ScalpBaselineCapture = ({ onComplete, onBack }: ScalpBaslineCaptureProps) => {
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
            <div className="w-full h-48 flex items-center justify-center bg-accent/20">
              <div className="text-center px-6">
                <Camera size={32} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Reference: {step.title}</p>
              </div>
            </div>
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
            capture="environment"
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
              className="w-full h-64 object-contain bg-accent/10"
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
