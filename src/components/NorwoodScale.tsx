import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface NorwoodScaleProps {
  selected: string;
  onSelect: (stage: string) => void;
}

const stages = [
  { id: '1', label: 'Stage 1', desc: 'Full hairline, no recession' },
  { id: '2', label: 'Stage 2', desc: 'Slight recession at temples' },
  { id: '3', label: 'Stage 3', desc: 'Deeper temple recession, M shape forming' },
  { id: '3v', label: 'Stage 3 Vertex', desc: 'Temple recession plus crown thinning' },
  { id: '4', label: 'Stage 4', desc: 'Further recession and crown thinning' },
  { id: '5', label: 'Stage 5', desc: 'Band between front and crown thinning' },
  { id: '6', label: 'Stage 6', desc: 'Front and crown merging' },
  { id: '7', label: 'Stage 7', desc: 'Only hair on sides and back' },
];

// SVG line-drawing illustrations for each Norwood stage
const NorwoodIllustration = ({ stageId }: { stageId: string }) => {
  const size = 72;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head outline */}
      <ellipse cx="36" cy="38" rx="22" ry="26" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.2" />
      {/* Ears */}
      <path d="M14 38 C12 34, 12 42, 14 38" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.15" />
      <path d="M58 38 C60 34, 60 42, 58 38" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.15" />
      {/* Eyes */}
      <circle cx="29" cy="40" r="1.5" fill="hsl(var(--foreground))" opacity="0.2" />
      <circle cx="43" cy="40" r="1.5" fill="hsl(var(--foreground))" opacity="0.2" />
      {/* Nose */}
      <line x1="36" y1="44" x2="36" y2="48" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.15" />
      
      {/* Hairline patterns per stage */}
      {stageId === '1' && (
        <path d="M16 28 C20 14, 32 10, 36 10 C40 10, 52 14, 56 28" 
          stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {stageId === '2' && (
        <>
          <path d="M18 28 C22 16, 30 13, 36 12 C42 13, 50 16, 54 28" 
            stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M18 28 C20 24, 22 22, 24 20" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
          <path d="M54 28 C52 24, 50 22, 48 20" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
        </>
      )}
      {stageId === '3' && (
        <>
          <path d="M20 30 C24 20, 30 16, 36 14 C42 16, 48 20, 52 30" 
            stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 30 C22 24, 26 18, 28 16" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
          <path d="M52 30 C50 24, 46 18, 44 16" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
        </>
      )}
      {stageId === '3v' && (
        <>
          <path d="M20 30 C24 20, 30 16, 36 14 C42 16, 48 20, 52 30" 
            stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 30 C22 24, 26 18, 28 16" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
          <path d="M52 30 C50 24, 46 18, 44 16" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="2 2" />
          <circle cx="36" cy="18" r="4" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="2 2" />
        </>
      )}
      {stageId === '4' && (
        <>
          <path d="M22 32 C26 24, 32 20, 36 18 C40 20, 46 24, 50 32" 
            stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M22 32 C24 26, 28 20, 30 18" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="2 2" />
          <path d="M50 32 C48 26, 44 20, 42 18" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="2 2" />
          <circle cx="36" cy="16" r="5" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="2 2" />
          <path d="M31 19 L41 19" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.25" />
        </>
      )}
      {stageId === '5' && (
        <>
          <path d="M24 34 C28 26, 33 22, 36 20 C39 22, 44 26, 48 34" 
            stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="15" r="6" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.35" strokeDasharray="2 2" />
          <path d="M30 18 L42 18" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.2" strokeDasharray="1 2" />
        </>
      )}
      {stageId === '6' && (
        <>
          <path d="M16 36 C16 32, 18 30, 20 30" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M56 36 C56 32, 54 30, 52 30" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M20 30 C28 28, 44 28, 52 30" stroke="hsl(var(--foreground))" strokeWidth="1" fill="none" opacity="0.2" strokeDasharray="2 2" />
        </>
      )}
      {stageId === '7' && (
        <>
          <path d="M14 40 C14 36, 16 34, 18 34" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M58 40 C58 36, 56 34, 54 34" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M18 56 C26 60, 46 60, 54 56" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        </>
      )}
    </svg>
  );
};

const NorwoodScale = ({ selected, onSelect }: NorwoodScaleProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Where would you place your hairline right now?</h2>
      <p className="text-sm text-muted-foreground mb-5">This helps us track any changes over time.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {stages.map(stage => {
          const isSelected = selected === stage.id;
          return (
            <motion.button
              key={stage.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(stage.id)}
              className={`selection-card text-left relative ${isSelected ? 'selected' : ''}`}
              style={{ padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Check size={14} className="text-primary" strokeWidth={2.5} />
                </motion.div>
              )}
              <NorwoodIllustration stageId={stage.id} />
              <p className="font-semibold text-foreground text-xs text-center">{stage.label}</p>
              <p className="text-xs text-muted-foreground text-center leading-tight" style={{ fontSize: '10px' }}>{stage.desc}</p>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect('1')}
        className="w-full text-center text-sm text-muted-foreground py-2 underline underline-offset-2"
      >
        Not sure — default to Stage 1
      </button>
    </div>
  );
};

export default NorwoodScale;
