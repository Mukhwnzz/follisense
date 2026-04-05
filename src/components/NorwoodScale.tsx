import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import stage1 from '@/assets/norwood/stage-1.png';
import stage2 from '@/assets/norwood/stage-2.png';
import stage3 from '@/assets/norwood/stage-3.png';
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
  { id: '3', label: 'Stage 3', desc: 'Deeper recession, M shape forming', image: stage3 },
  { id: '4', label: 'Stage 4', desc: 'Noticeable recession and crown thinning', image: stage4 },
  { id: '5', label: 'Stage 5', desc: 'Front and crown thinning significantly', image: stage5 },
  { id: '6', label: 'Stage 6', desc: 'Front and crown merging', image: stage6 },
  { id: '7', label: 'Stage 7', desc: 'Hair only on sides and back', image: stage7 },
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
              className="text-left relative rounded-xl overflow-hidden cursor-pointer"
              style={{
                border: isSelected ? '2px solid hsl(var(--primary))' : '1.5px solid hsl(var(--border))',
                background: isSelected ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--card))',
                padding: 0,
              }}
            >
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
              <img
                src={stage.image}
                alt={stage.label}
                className="w-full rounded-t-lg"
                style={{ objectFit: 'cover', display: 'block' }}
              />
              <div className="px-2.5 py-2">
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
