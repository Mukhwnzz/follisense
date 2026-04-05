import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import stage1 from '@/assets/norwood/stage-1.png';
import stage2 from '@/assets/norwood/stage-2.png';
import stage3 from '@/assets/norwood/stage-3.png';
import stage3v from '@/assets/norwood/stage-3v.png';
import stage4 from '@/assets/norwood/stage-4.png';
import stage5 from '@/assets/norwood/stage-5.png';
import stage6 from '@/assets/norwood/stage-6.png';
import stage7 from '@/assets/norwood/stage-7.png';

interface NorwoodScaleProps {
  selected: string;
  onSelect: (stage: string) => void;
}

const stages = [
  { id: '1', label: 'Stage 1', desc: 'Full hairline, no recession', image: stage1 },
  { id: '2', label: 'Stage 2', desc: 'Slight recession at temples', image: stage2 },
  { id: '3', label: 'Stage 3', desc: 'Deeper temple recession, M shape forming', image: stage3 },
  { id: '3v', label: 'Stage 3 Vertex', desc: 'Temple recession plus crown thinning', image: stage3v },
  { id: '4', label: 'Stage 4', desc: 'Further recession and crown thinning', image: stage4 },
  { id: '5', label: 'Stage 5', desc: 'Band between front and crown thinning', image: stage5 },
  { id: '6', label: 'Stage 6', desc: 'Front and crown merging', image: stage6 },
  { id: '7', label: 'Stage 7', desc: 'Only hair on sides and back', image: stage7 },
];

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
              className="text-left relative rounded-[14px] overflow-hidden cursor-pointer"
              style={{
                border: isSelected ? '2px solid #7C9A8E' : '1.5px solid #E8DED1',
                background: isSelected ? 'rgba(124,154,142,0.08)' : '#F5F0EB',
                padding: 0,
              }}
            >
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#7C9A8E', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
              <img
                src={stage.image}
                alt={stage.label}
                style={{
                  width: '100%',
                  aspectRatio: '341/384',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{ padding: '8px 10px 10px' }}>
                <p className="font-semibold text-foreground text-xs">{stage.label}</p>
                <p className="text-muted-foreground leading-tight" style={{ fontSize: '10px' }}>{stage.desc}</p>
              </div>
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
