import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, TrendingUp, ImageIcon, ChevronRight, Layers, Plus } from 'lucide-react';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

// ─── Pure white + gold palette ────────────────────────────────────────────────
const C = {
  bg:         '#FFFFFF',
  surface:    '#F8F8F8',
  ink:        '#1C1C1C',
  gold:       '#D4A866',
  goldDeep:   '#B8893E',
  gold10:     'rgba(212,168,102,0.10)',
  goldBorder: 'rgba(212,168,102,0.22)',
  mid:        '#EBEBEB',
  muted:      '#999999',
  warm:       '#666666',
  white:      '#FFFFFF',
};

const card: React.CSSProperties = {
  background: C.white,
  border: `1.5px solid ${C.mid}`,
  borderRadius: 18,
  boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
};

// ── Mock data ─────────────────────────────────────────────────────────────────
type PhotoEntry = {
  id: string; date: string; style: string; isBaseline?: boolean;
  photos: { angle: 'front' | 'side' | 'nape'; url: string | null }[];
};
type CheckInEntry = {
  date: string; fullDate: string; score: number; label: string;
  triage: 'green' | 'amber' | 'red';
};

const mockPhotos: PhotoEntry[] = [
  { id: '1', date: 'Mar 10, 2026', style: 'Box braids', isBaseline: true,
    photos: [{ angle: 'front', url: null }, { angle: 'side', url: null }, { angle: 'nape', url: null }] },
  { id: '2', date: 'Feb 12, 2026', style: 'Wash and go',
    photos: [{ angle: 'front', url: null }, { angle: 'side', url: null }, { angle: 'nape', url: null }] },
  { id: '3', date: 'Jan 5, 2026',  style: 'Two-strand twists',
    photos: [{ angle: 'front', url: null }, { angle: 'side', url: null }, { angle: 'nape', url: null }] },
];

const mockCheckIns: CheckInEntry[] = [
  { date: 'Mar 10', fullDate: 'Mar 10, 2026', score: 82, label: 'Looking good',  triage: 'green' },
  { date: 'Feb 24', fullDate: 'Feb 24, 2026', score: 61, label: 'Mild concern',  triage: 'amber' },
  { date: 'Feb 12', fullDate: 'Feb 12, 2026', score: 74, label: 'Looking good',  triage: 'green' },
  { date: 'Jan 28', fullDate: 'Jan 28, 2026', score: 55, label: 'Watch closely', triage: 'amber' },
  { date: 'Jan 14', fullDate: 'Jan 14, 2026', score: 78, label: 'Looking good',  triage: 'green' },
  { date: 'Jan 5',  fullDate: 'Jan 5, 2026',  score: 60, label: 'Mild concern',  triage: 'amber' },
];

const triageColor: Record<string, string> = {
  green: '#5A9A50',
  amber: '#D4A866',
  red:   '#B05040',
};
const triageBg: Record<string, string> = {
  green: 'rgba(90,154,80,0.10)',
  amber: 'rgba(212,168,102,0.12)',
  red:   'rgba(176,80,64,0.10)',
};
const angleLabel: Record<string, string> = { front: 'Front', side: 'Side', nape: 'Nape' };

type Tab = 'photos' | 'health';

// ── Sparkline ─────────────────────────────────────────────────────────────────
const SparkLine = ({ data }: { data: CheckInEntry[] }) => {
  const W = 320, H = 100, PL = 6, PR = 6, PT = 12, PB = 26;
  const iW = W - PL - PR, iH = H - PT - PB;
  const pts = data.map((d, i) => ({
    x: PL + (i / (data.length - 1)) * iW,
    y: PT + (1 - d.score / 100) * iH,
    ...d,
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length-1].x},${PT+iH} L${pts[0].x},${PT+iH}Z`;
  const [hov, setHov] = useState<number | null>(null);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGradGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.gold} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(v => (
        <line key={v} x1={PL} x2={W-PR}
          y1={PT+(1-v/100)*iH} y2={PT+(1-v/100)*iH}
          stroke="#EBEBEB" strokeWidth={1} />
      ))}
      <path d={area} fill="url(#areaGradGold)" />
      <path d={line} fill="none" stroke={C.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'default' }}>
          <circle cx={p.x} cy={p.y} r={hov === i ? 5 : 3.5}
            fill={triageColor[p.triage]} stroke={C.white} strokeWidth={1.5} />
          {hov === i && (
            <>
              <rect x={p.x-36} y={p.y-30} width={72} height={20} rx={6} fill={C.ink} />
              <text x={p.x} y={p.y-16} fontSize={9} fill="#f5f5f5" textAnchor="middle" fontFamily={dm}>
                {p.score} · {p.label}
              </text>
            </>
          )}
          <text x={p.x} y={H-4} fontSize={8} fill={C.muted} textAnchor="middle" fontFamily={dm}>
            {p.date}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ── Photo card ────────────────────────────────────────────────────────────────
const PhotoCard = ({ entry }: { entry: PhotoEntry }) => {
  const [angleIdx, setAngleIdx] = useState(0);
  const photo = entry.photos[angleIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...card, overflow: 'hidden', marginBottom: 12, borderRadius: 20 }}
    >
      <div style={{
        height: 200,
        background: photo.url
          ? `url(${photo.url}) center/cover`
          : `linear-gradient(160deg, ${C.gold10} 0%, ${C.surface} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {!photo.url && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: C.gold10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
            }}>
              <ImageIcon size={20} color={C.goldDeep} />
            </div>
            <p style={{ fontFamily: dm, fontSize: 11, color: C.muted }}>{angleLabel[photo.angle]} photo</p>
          </div>
        )}
        {/* Baseline badge */}
        {entry.isBaseline && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: C.gold, borderRadius: 20, padding: '3px 10px',
            fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.ink,
          }}>
            Baseline
          </div>
        )}
        {/* Angle switcher */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
          background: 'rgba(255,255,255,0.88)',
          borderRadius: 20, padding: '4px 8px',
          backdropFilter: 'blur(6px)',
          border: `1px solid ${C.mid}`,
        }}>
          {entry.photos.map((_, i) => (
            <button key={i} onClick={() => setAngleIdx(i)} style={{
              fontFamily: dm, fontSize: 10, fontWeight: 600,
              color: angleIdx === i ? C.goldDeep : C.muted,
              background: 'none', border: 'none', cursor: 'pointer', padding: '1px 6px',
            }}>
              {angleLabel[entry.photos[i].angle]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: playfair, fontSize: 14, fontWeight: 500, color: C.ink, margin: 0 }}>{entry.date}</p>
          <p style={{ fontFamily: dm, fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{entry.style}</p>
        </div>
        <ChevronRight size={15} color={C.mid} />
      </div>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const HistoryPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>('photos');
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA]     = useState(0);
  const [compareB, setCompareB]     = useState(mockPhotos.length - 1);

  const avgScore = Math.round(mockCheckIns.reduce((a, c) => a + c.score, 0) / mockCheckIns.length);
  const latest   = mockCheckIns[0];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100, fontFamily: dm }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: C.ink, padding: '52px 20px 28px',
      }}>
        {/* Gold shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(212,168,102,0.12) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
        {/* Fade to white at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
          background: `linear-gradient(to top, ${C.bg}, transparent)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              FolliSense
            </span>
          </div>

          <h1 style={{ fontFamily: playfair, fontSize: 26, fontWeight: 500, color: '#f5f5f5', margin: '0 0 22px', lineHeight: 1.2 }}>
            Progress &<br />History
          </h1>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Check-ins', value: mockCheckIns.length, unit: 'total' },
              { label: 'Avg score',  value: avgScore,            unit: '/ 100' },
              { label: 'Latest',     value: latest.score,        unit: latest.label },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '12px 10px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <p style={{ fontFamily: playfair, fontSize: 22, fontWeight: 500, color: '#f5f5f5', margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: dm, fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.unit}</p>
                <p style={{ fontFamily: dm, fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4, padding: 4,
            background: 'rgba(255,255,255,0.07)', borderRadius: 14,
          }}>
            {([
              { id: 'photos' as Tab, label: 'Hair Photos',  icon: <Camera size={13} /> },
              { id: 'health' as Tab, label: 'Scalp Health', icon: <TrendingUp size={13} /> },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 10,
                fontFamily: dm, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.id ? C.gold : 'transparent',
                color: tab === t.id ? C.ink : 'rgba(255,255,255,0.4)',
                boxShadow: tab === t.id ? `0 2px 10px rgba(212,168,102,0.4)` : 'none',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 0' }}>
        <AnimatePresence mode="wait">

          {/* ── Photos tab ── */}
          {tab === 'photos' && (
            <motion.div key="photos"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {/* Compare toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontFamily: dm, fontSize: 12, color: C.muted }}>{mockPhotos.length} entries</p>
                <button onClick={() => setCompareMode(m => !m)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: dm, fontSize: 12, fontWeight: 600,
                  padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${C.mid}`,
                  cursor: 'pointer',
                  background: compareMode ? C.gold10 : C.surface,
                  color: compareMode ? C.goldDeep : C.muted,
                  transition: 'all 0.2s',
                }}>
                  <Layers size={12} /> {compareMode ? 'Exit compare' : 'Compare'}
                </button>
              </div>

              {/* Compare panel */}
              {compareMode && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ ...card, padding: 16, marginBottom: 16, borderRadius: 20 }}
                >
                  <p style={{ fontFamily: playfair, fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 12 }}>
                    Side-by-side
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    {[
                      { val: compareA, set: setCompareA, label: 'Earlier' },
                      { val: compareB, set: setCompareB, label: 'Later' },
                    ].map((s, idx) => (
                      <div key={idx} style={{ flex: 1 }}>
                        <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, marginBottom: 4 }}>{s.label}</p>
                        <select value={s.val} onChange={e => s.set(Number(e.target.value))}
                          style={{
                            width: '100%', fontFamily: dm, fontSize: 12, padding: '7px 10px', borderRadius: 10,
                            background: C.surface, color: C.ink,
                            border: `1.5px solid ${C.mid}`, outline: 'none',
                          }}
                        >
                          {mockPhotos.map((p, i) => <option key={i} value={i}>{p.date}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[compareA, compareB].map((idx, col) => (
                      <div key={col}>
                        <div style={{
                          height: 120, borderRadius: 14,
                          background: `linear-gradient(160deg, ${C.gold10}, ${C.surface})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${C.mid}`,
                        }}>
                          <ImageIcon size={18} color={C.gold} opacity={0.5} />
                        </div>
                        <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, marginTop: 6, textAlign: 'center' }}>
                          {mockPhotos[idx]?.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Photo timeline */}
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{
                  position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5,
                  background: `linear-gradient(to bottom, ${C.gold}, rgba(212,168,102,0.08))`,
                }} />
                {mockPhotos.map(entry => (
                  <div key={entry.id} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: -22, top: 20,
                      width: 10, height: 10, borderRadius: '50%',
                      background: entry.isBaseline ? C.gold : C.surface,
                      border: `2px solid ${entry.isBaseline ? C.gold : C.mid}`,
                      boxShadow: entry.isBaseline ? `0 0 8px rgba(212,168,102,0.45)` : 'none',
                    }} />
                    <PhotoCard entry={entry} />
                  </div>
                ))}
              </div>

              {/* Add photo CTA */}
              <button style={{
                width: '100%', height: 54,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRadius: 16, border: `1.5px dashed ${C.goldBorder}`,
                background: C.gold10,
                fontFamily: dm, color: C.goldDeep, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                marginTop: 4,
              }}>
                <Plus size={16} /> Add progress photos
              </button>
            </motion.div>
          )}

          {/* ── Health tab ── */}
          {tab === 'health' && (
            <motion.div key="health"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              {/* Chart card */}
              <div style={{ ...card, padding: '20px 16px 14px', marginBottom: 16, borderRadius: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: playfair, fontSize: 15, fontWeight: 500, color: C.ink, margin: 0 }}>
                      Scalp health score
                    </p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: '2px 0 0' }}>
                      Last 6 check-ins
                    </p>
                  </div>
                  <div style={{
                    background: C.gold10, borderRadius: 100, padding: '4px 12px',
                    fontFamily: dm, fontSize: 12, fontWeight: 700, color: C.goldDeep,
                    border: `1px solid ${C.goldBorder}`,
                  }}>
                    {avgScore} avg
                  </div>
                </div>
                <SparkLine data={[...mockCheckIns].reverse()} />
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  {[
                    { c: '#5A9A50', l: 'Good' },
                    { c: C.gold,   l: 'Watch' },
                    { c: '#B05040', l: 'Concern' },
                  ].map(x => (
                    <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
                      <span style={{ fontFamily: dm, fontSize: 10, color: C.muted }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check-in log label */}
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Check-in log
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mockCheckIns.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ ...card, padding: '13px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    {/* Score ring */}
                    <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0 }}>
                      <svg width={42} height={42} viewBox="0 0 42 42">
                        <circle cx={21} cy={21} r={17} fill="none" stroke={C.surface} strokeWidth={3} />
                        <circle cx={21} cy={21} r={17} fill="none"
                          stroke={triageColor[c.triage]} strokeWidth={3}
                          strokeDasharray={`${(c.score / 100) * 107} 107`}
                          strokeLinecap="round" transform="rotate(-90 21 21)"
                        />
                      </svg>
                      <span style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.ink,
                      }}>
                        {c.score}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: playfair, fontSize: 14, fontWeight: 500, color: C.ink, margin: 0 }}>
                        {c.fullDate}
                      </p>
                      <span style={{
                        fontFamily: dm, fontSize: 11, fontWeight: 600,
                        color: triageColor[c.triage],
                        background: triageBg[c.triage],
                        padding: '1px 9px', borderRadius: 100,
                        display: 'inline-block', marginTop: 3,
                      }}>
                        {c.label}
                      </span>
                    </div>

                    <ChevronRight size={14} color={C.mid} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryPage;