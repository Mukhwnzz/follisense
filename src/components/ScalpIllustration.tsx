import React from 'react';

interface ScalpIllustrationProps {
  conditionId: string;
  stageIndex: number;
  className?: string;
}

const SKIN = '#8B6914' ;
const SKIN_MID = '#7A5C2E';
const SKIN_DARK = '#5C4420';
const HAIR = '#1a1a1a';
const SAND_BG = '#E8DED1';
const INFLAM_MILD = '#6B3A4A';
const INFLAM_MOD = '#7A3050';
const INFLAM_SEV = '#8B2252';
const FLAKE = '#D4C9A8';
const SCALE_SILVER = '#C8C0B0';
const SCAR_SMOOTH = '#9B7B4A';

const HeadOutline = ({ children }: { children?: React.ReactNode }) => (
  <g>
    {/* Top-down scalp oval */}
    <ellipse cx="100" cy="100" rx="72" ry="82" fill={SKIN} stroke={SKIN_DARK} strokeWidth="1.5" />
    {/* Hair around edges */}
    <path d="M 32 75 Q 28 100 32 130 Q 35 90 40 75 Z" fill={HAIR} opacity="0.7" />
    <path d="M 168 75 Q 172 100 168 130 Q 165 90 160 75 Z" fill={HAIR} opacity="0.7" />
    <path d="M 50 30 Q 100 15 150 30 Q 145 25 100 18 Q 55 25 50 30 Z" fill={HAIR} opacity="0.7" />
    {/* Hairline fringe */}
    {Array.from({ length: 30 }).map((_, i) => {
      const angle = -60 + (i * 4);
      const rad = (angle * Math.PI) / 180;
      const x1 = 100 + 65 * Math.cos(rad);
      const y1 = 95 + 75 * Math.sin(rad) * 0.3 - 55;
      const len = 6 + Math.random() * 4;
      return (
        <line key={`h-${i}`} x1={x1} y1={y1} x2={x1 + Math.cos(rad) * len} y2={y1 - len * 0.8}
          stroke={HAIR} strokeWidth="1" opacity="0.6" />
      );
    })}
    {children}
  </g>
);

const HairStrands = ({ x, y, count = 8, length = 12, sparse = false }: { x: number; y: number; count?: number; length?: number; sparse?: boolean }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const offsetX = (i - count / 2) * 3;
      const opacity = sparse ? 0.2 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3;
      return (
        <line key={i} x1={x + offsetX} y1={y} x2={x + offsetX + (Math.random() - 0.5) * 3} y2={y - length}
          stroke={HAIR} strokeWidth="0.8" opacity={opacity} />
      );
    })}
  </g>
);

const Bumps = ({ cx, cy, count = 3, color = INFLAM_MILD, size = 2.5 }: { cx: number; cy: number; count?: number; color?: string; size?: number }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 6 + Math.random() * 4;
      return (
        <circle key={i} cx={cx + Math.cos(angle) * r} cy={cy + Math.sin(angle) * r} r={size}
          fill={color} opacity="0.7" stroke={SKIN_DARK} strokeWidth="0.3" />
      );
    })}
  </g>
);

const Flakes = ({ cx, cy, count = 5, color = FLAKE }: { cx: number; cy: number; count?: number; color?: string }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = cx + (Math.random() - 0.5) * 20;
      const y = cy + (Math.random() - 0.5) * 15;
      const size = 1.5 + Math.random() * 2;
      return (
        <ellipse key={i} cx={x} cy={y} rx={size} ry={size * 0.6}
          fill={color} opacity="0.8" transform={`rotate(${Math.random() * 360} ${x} ${y})`} />
      );
    })}
  </g>
);

const PartLine = ({ x1 = 100, y1 = 40, x2 = 100, y2 = 160 }: { x1?: number; y1?: number; x2?: number; y2?: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SKIN_MID} strokeWidth="1.5" opacity="0.5" />
);

const renderCondition = (conditionId: string, stageIndex: number) => {
  switch (conditionId) {
    case 'traction-alopecia':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <>
              {/* Sparse temples */}
              <HairStrands x={50} y={55} count={5} sparse />
              <HairStrands x={150} y={55} count={5} sparse />
              <HairStrands x={60} y={45} count={6} />
              <HairStrands x={140} y={45} count={6} />
            </>
          )}
          {stageIndex === 1 && (
            <>
              {/* More recession */}
              <ellipse cx={48} cy={55} rx={12} ry={8} fill={SKIN} />
              <ellipse cx={152} cy={55} rx={12} ry={8} fill={SKIN} />
              <HairStrands x={50} y={55} count={3} sparse length={6} />
              <HairStrands x={150} y={55} count={3} sparse length={6} />
            </>
          )}
          {stageIndex === 2 && (
            <>
              {/* Smooth bare patches */}
              <ellipse cx={48} cy={55} rx={16} ry={12} fill={SCAR_SMOOTH} opacity="0.6" />
              <ellipse cx={152} cy={55} rx={16} ry={12} fill={SCAR_SMOOTH} opacity="0.6" />
              {/* Shiny highlight */}
              <ellipse cx={48} cy={53} rx={6} ry={3} fill="white" opacity="0.15" />
              <ellipse cx={152} cy={53} rx={6} ry={3} fill="white" opacity="0.15" />
            </>
          )}
        </HeadOutline>
      );

    case 'ccca':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <>
              <circle cx={100} cy={85} r={10} fill={SKIN} opacity="0.5" />
              <HairStrands x={100} y={80} count={4} sparse length={8} />
            </>
          )}
          {stageIndex === 1 && (
            <>
              <circle cx={100} cy={85} r={20} fill={SKIN} opacity="0.5" />
              <HairStrands x={100} y={80} count={3} sparse length={6} />
              {/* Spreading pattern */}
              <circle cx={100} cy={85} r={20} fill="none" stroke={SKIN_DARK} strokeWidth="0.5" strokeDasharray="3 2" opacity="0.4" />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <circle cx={100} cy={85} r={28} fill={SCAR_SMOOTH} opacity="0.5" />
              <ellipse cx={100} cy={82} rx={10} ry={5} fill="white" opacity="0.12" />
            </>
          )}
        </HeadOutline>
      );

    case 'seborrheic-dermatitis':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && <Flakes cx={100} cy={70} count={6} />}
          {stageIndex === 1 && (
            <>
              <Flakes cx={100} cy={70} count={10} />
              <ellipse cx={95} cy={75} rx={12} ry={8} fill={INFLAM_MILD} opacity="0.3" />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <Flakes cx={80} cy={40} count={8} />
              <Flakes cx={100} cy={70} count={10} />
              {/* Crusting at hairline */}
              <path d="M 55 38 Q 100 30 145 38" stroke={FLAKE} strokeWidth="3" fill="none" opacity="0.7" />
              <ellipse cx={100} cy={50} rx={20} ry={12} fill={INFLAM_MOD} opacity="0.25" />
            </>
          )}
        </HeadOutline>
      );

    case 'scalp-psoriasis':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <>
              <ellipse cx={85} cy={80} rx={10} ry={8} fill={INFLAM_MILD} opacity="0.4" stroke={SCALE_SILVER} strokeWidth="1.5" />
              <Flakes cx={85} cy={80} count={4} color={SCALE_SILVER} />
            </>
          )}
          {stageIndex === 1 && (
            <>
              <ellipse cx={85} cy={75} rx={12} ry={9} fill={INFLAM_MILD} opacity="0.4" stroke={SCALE_SILVER} strokeWidth="1.5" />
              <ellipse cx={115} cy={95} rx={10} ry={7} fill={INFLAM_MILD} opacity="0.4" stroke={SCALE_SILVER} strokeWidth="1.5" />
              <Flakes cx={85} cy={75} count={5} color={SCALE_SILVER} />
              <Flakes cx={115} cy={95} count={4} color={SCALE_SILVER} />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <ellipse cx={90} cy={35} rx={15} ry={12} fill={INFLAM_MILD} opacity="0.4" stroke={SCALE_SILVER} strokeWidth="1.5" />
              <Flakes cx={90} cy={35} count={6} color={SCALE_SILVER} />
              {/* Beyond hairline */}
              <ellipse cx={90} cy={22} rx={10} ry={6} fill={INFLAM_MILD} opacity="0.3" stroke={SCALE_SILVER} strokeWidth="1" />
            </>
          )}
        </HeadOutline>
      );

    case 'alopecia-areata':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <circle cx={80} cy={85} r={12} fill={SKIN_MID} opacity="0.5" />
          )}
          {stageIndex === 1 && (
            <>
              <circle cx={75} cy={80} r={10} fill={SKIN_MID} opacity="0.5" />
              <circle cx={120} cy={95} r={8} fill={SKIN_MID} opacity="0.5" />
              <circle cx={95} cy={110} r={6} fill={SKIN_MID} opacity="0.5" />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <circle cx={90} cy={90} r={14} fill={SKIN_MID} opacity="0.5" />
              {/* Exclamation point hairs */}
              {[0, 1, 2, 3, 4].map(i => {
                const angle = (i / 5) * Math.PI * 2;
                const ex = 90 + Math.cos(angle) * 14;
                const ey = 90 + Math.sin(angle) * 14;
                return (
                  <g key={i}>
                    <line x1={ex} y1={ey} x2={ex} y2={ey - 6} stroke={HAIR} strokeWidth="0.5" opacity="0.6" />
                    <circle cx={ex} cy={ey - 6} r="0.8" fill={HAIR} opacity="0.7" />
                  </g>
                );
              })}
            </>
          )}
        </HeadOutline>
      );

    case 'folliculitis':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && <Bumps cx={80} cy={45} count={4} size={2} />}
          {stageIndex === 1 && (
            <>
              {/* Along a braid line */}
              <line x1={60} y1={50} x2={100} y2={130} stroke={SKIN_DARK} strokeWidth="1" opacity="0.3" />
              <Bumps cx={70} cy={65} count={3} size={2} />
              <Bumps cx={80} cy={90} count={3} size={2} />
              <Bumps cx={90} cy={115} count={2} size={2} />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <Bumps cx={80} cy={50} count={5} color={INFLAM_SEV} size={3} />
              {/* White heads */}
              {[0, 1, 2].map(i => (
                <circle key={i} cx={78 + i * 5} cy={48 + i * 3} r="1" fill="#E8DED1" opacity="0.8" />
              ))}
              <ellipse cx={80} cy={50} rx={14} ry={10} fill={INFLAM_MILD} opacity="0.2" />
            </>
          )}
        </HeadOutline>
      );

    case 'tinea-capitis':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <>
              <ellipse cx={90} cy={85} rx={14} ry={12} fill={SKIN_MID} opacity="0.4" />
              {/* Black dots */}
              {Array.from({ length: 8 }).map((_, i) => (
                <circle key={i} cx={85 + (i % 3) * 4} cy={80 + Math.floor(i / 3) * 4} r="1" fill={HAIR} opacity="0.8" />
              ))}
            </>
          )}
          {stageIndex === 1 && (
            <>
              <ellipse cx={90} cy={85} rx={16} ry={14} fill={SKIN_MID} opacity="0.4" />
              <Flakes cx={90} cy={85} count={6} color={FLAKE} />
              {Array.from({ length: 6 }).map((_, i) => (
                <circle key={i} cx={86 + (i % 3) * 3} cy={82 + Math.floor(i / 3) * 4} r="1" fill={HAIR} opacity="0.7" />
              ))}
            </>
          )}
          {stageIndex === 2 && (
            <>
              <circle cx={95} cy={90} r={16} fill="none" stroke={INFLAM_MILD} strokeWidth="2" opacity="0.5" />
              <circle cx={95} cy={90} r={12} fill={SKIN_MID} opacity="0.3" />
              <Flakes cx={95} cy={90} count={4} />
            </>
          )}
        </HeadOutline>
      );

    case 'chemical-damage':
      return (
        <HeadOutline>
          <PartLine />
          {stageIndex === 0 && (
            <>
              {/* Irritation along hairline */}
              <path d="M 55 40 Q 100 32 145 40" stroke="none" fill={INFLAM_MILD} opacity="0.35" />
              <path d="M 60 38 Q 100 32 140 38 Q 100 45 60 38 Z" fill={INFLAM_MILD} opacity="0.25" />
            </>
          )}
          {stageIndex === 1 && (
            <>
              <ellipse cx={85} cy={42} rx={10} ry={6} fill={INFLAM_SEV} opacity="0.4" />
              {/* Blistering dots */}
              <circle cx={82} cy={40} r="2" fill={INFLAM_MOD} opacity="0.5" />
              <circle cx={88} cy={43} r="1.5" fill={INFLAM_MOD} opacity="0.5" />
            </>
          )}
          {stageIndex === 2 && (
            <>
              <ellipse cx={90} cy={45} rx={14} ry={8} fill={SCAR_SMOOTH} opacity="0.5" />
              <ellipse cx={90} cy={43} rx={5} ry={2.5} fill="white" opacity="0.12" />
            </>
          )}
        </HeadOutline>
      );

    default:
      return <HeadOutline />;
  }
};

const ScalpIllustration: React.FC<ScalpIllustrationProps> = ({ conditionId, stageIndex, className = '' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full ${className}`}
      style={{ backgroundColor: SAND_BG, borderRadius: '12px' }}
    >
      {renderCondition(conditionId, stageIndex)}
    </svg>
  );
};

export default ScalpIllustration;
