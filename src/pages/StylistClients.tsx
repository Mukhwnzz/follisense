import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowLeft, Search, Plus, TrendingUp, TrendingDown, Minus, MapPin, Camera } from 'lucide-react';
import { useApp, ClientObservation } from '@/contexts/AppContext';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";
const green    = '#2d6e55';
const darkGreen= '#1a4d3a';
const greenLight = '#e8f4ef';
const greenBorder = 'rgba(45,110,85,0.18)';
const green10  = 'rgba(45,110,85,0.10)';

const riskColor = (risk: string) => {
  if (risk === 'green') return { bg: '#d3ede0', color: '#1e5c3f', label: 'Low' };
  if (risk === 'amber') return { bg: '#faeacc', color: '#7a5212', label: 'Monitor' };
  return { bg: '#fad9d7', color: '#7a2020', label: 'Refer' };
};

const trendColor = (t: string) => {
  if (t === 'Improving') return green;
  if (t === 'Worsening') return '#b05040';
  return '#9a7a40';
};

interface ClientSummary {
  name: string; observationCount: number; lastDate: string;
  lastLocation?: string; risk: 'green' | 'amber' | 'red';
  observations: ClientObservation[];
}

const StylistClients = () => {
  const navigate = useNavigate();
  const { clientObservations } = useApp();
  const [search, setSearch]             = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [expandedObs, setExpandedObs]   = useState<string | null>(null);

  const clients = useMemo(() => {
    const map = new Map<string, ClientSummary>();
    clientObservations.forEach(obs => {
      const existing = map.get(obs.clientName);
      if (existing) {
        existing.observationCount++;
        existing.observations.push(obs);
        if (!existing.lastDate || obs.date > existing.lastDate) {
          existing.lastDate = obs.date;
          existing.lastLocation = obs.location ? `${obs.location}${obs.locationCity ? `, ${obs.locationCity}` : ''}` : undefined;
          existing.risk = obs.risk;
        }
      } else {
        map.set(obs.clientName, {
          name: obs.clientName, observationCount: 1, lastDate: obs.date,
          lastLocation: obs.location ? `${obs.location}${obs.locationCity ? `, ${obs.locationCity}` : ''}` : undefined,
          risk: obs.risk, observations: [obs],
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [clientObservations]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q));
  }, [clients, search]);

  const client = selectedClient ? clients.find(c => c.name === selectedClient) : null;

  const computeTrends = (obs: ClientObservation[]) => {
    if (obs.length < 3) return null;
    const comparisons   = obs.filter(o => o.comparison).map(o => o.comparison!);
    const hairlineObs   = obs.filter(o => o.observations.some(x => x.includes('hairline') || x.includes('edges') || x.includes('traction')));
    const getOverallTrend = () => {
      const better = comparisons.filter(c => c.includes('Better')).length;
      const worse  = comparisons.filter(c => c.includes('Worse')).length;
      if (better > worse) return 'Improving';
      if (worse > better) return 'Worsening';
      return 'Stable';
    };
    return {
      hairline:    hairlineObs.length > 0 ? (hairlineObs.length > obs.length / 2 ? 'Worsening' : 'Worth monitoring') : 'Stable',
      scalpHealth: getOverallTrend(),
    };
  };

  // ── Client detail ────────────────────────────────────────────────────────────
  if (client) {
    const trends = computeTrends(client.observations);
    return (
      <div style={{ background: 'var(--color-background-tertiary)', minHeight: '100vh', paddingBottom: 100, fontFamily: dm }}>

        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

        {/* Dark header */}
        <div style={{ background: darkGreen, padding: '52px 20px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(45,110,85,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(to top, var(--color-background-tertiary), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSelectedClient(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 13, fontWeight: 500, color: '#d3ede0', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}
            >
              <ArrowLeft size={15} strokeWidth={2} /> Back
            </button>
            <h1 style={{ fontFamily: playfair, fontSize: 24, fontWeight: 500, color: '#f0f8f4', margin: '0 0 4px' }}>{client.name}</h1>
            <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(240,248,244,0.6)', margin: 0 }}>
              {client.observationCount} observation{client.observationCount !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ padding: '20px 20px 0' }}>

          {/* Trends */}
          {trends && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Hairline', value: trends.hairline,
                  icon: trends.hairline === 'Improving' ? <TrendingUp size={16} color={green} /> : trends.hairline === 'Worsening' ? <TrendingDown size={16} color="#b05040" /> : <Minus size={16} color="#9a7a40" /> },
                { label: 'Scalp health', value: trends.scalpHealth,
                  icon: trends.scalpHealth === 'Improving' ? <TrendingUp size={16} color={green} /> : trends.scalpHealth === 'Worsening' ? <TrendingDown size={16} color="#b05040" /> : <Minus size={16} color={green} /> },
              ].map(t => (
                <div key={t.label} style={{
                  background: 'var(--color-background-primary)',
                  border: `1.5px solid ${greenBorder}`, borderRadius: 16,
                  padding: '14px 16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>{t.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.icon}
                    <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: trendColor(t.value) }}>{t.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Observation history
          </p>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: 15, top: 20, bottom: 20, width: 1.5,
              background: `linear-gradient(to bottom, ${green}, rgba(45,110,85,0.08))`,
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {client.observations.map(obs => {
                const risk = riskColor(obs.risk);
                return (
                  <div key={obs.id} style={{ position: 'relative', paddingLeft: 40 }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute', left: 9, top: 18,
                      width: 12, height: 12, borderRadius: '50%',
                      background: obs.risk === 'green' ? green : obs.risk === 'amber' ? '#B07030' : '#b05040',
                      border: '2px solid var(--color-background-tertiary)',
                      boxShadow: `0 0 0 2px ${obs.risk === 'green' ? greenBorder : obs.risk === 'amber' ? 'rgba(176,112,48,0.3)' : 'rgba(176,80,64,0.3)'}`,
                    }} />
                    <button
                      onClick={() => setExpandedObs(expandedObs === obs.id ? null : obs.id)}
                      style={{
                        width: '100%', textAlign: 'left',
                        background: 'var(--color-background-primary)',
                        border: `1.5px solid ${greenBorder}`, borderRadius: 16,
                        padding: '14px 16px', cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        fontFamily: dm,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontFamily: playfair, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{obs.date}</p>
                        <ChevronDown size={15} color="var(--color-text-secondary)" style={{ transform: expandedObs === obs.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                      {obs.location && (
                        <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={10} /> {obs.location}{obs.locationCity ? `, ${obs.locationCity}` : ''}
                        </p>
                      )}
                      {obs.service && <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>{obs.service}</p>}

                      <AnimatePresence>
                        {expandedObs === obs.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ paddingTop: 12, marginTop: 12, borderTop: `1px solid ${greenBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <div>
                                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>Observations</p>
                                {obs.observations.map(o => (
                                  <div key={o} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: green, flexShrink: 0, marginTop: 5 }} />
                                    <p style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5 }}>{o}</p>
                                  </div>
                                ))}
                              </div>
                              {obs.comparison && (
                                <div>
                                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>Compared to last visit</p>
                                  <p style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-primary)', margin: 0 }}>{obs.comparison}</p>
                                </div>
                              )}
                              {obs.photoAreas && obs.photoAreas.length > 0 && (
                                <div>
                                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Photos</p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {obs.photoAreas.map(a => (
                                      <span key={a} style={{
                                        fontFamily: dm, fontSize: 10, fontWeight: 500,
                                        background: green10, color: green,
                                        border: `1px solid ${greenBorder}`,
                                        padding: '3px 10px', borderRadius: 100,
                                        display: 'flex', alignItems: 'center', gap: 4,
                                      }}>
                                        <Camera size={9} /> {a}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {obs.notes && (
                                <div>
                                  <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>Notes</p>
                                  <p style={{ fontFamily: dm, fontSize: 12, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5 }}>{obs.notes}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate(`/stylist/observation?client=${encodeURIComponent(client.name)}`)}
            style={{
              width: '100%', height: 52, borderRadius: 16, border: 'none',
              background: green, color: '#fff',
              fontFamily: dm, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(45,110,85,0.3)', marginBottom: 80,
            }}
          >
            <Plus size={17} strokeWidth={2.2} /> New observation for {client.name}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Client list ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--color-background-tertiary)', minHeight: '100vh', paddingBottom: 100, fontFamily: dm }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');`}</style>

      {/* Dark header */}
      <div style={{ background: darkGreen, padding: '52px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(45,110,85,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: 'linear-gradient(to top, var(--color-background-tertiary), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d3ede0' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: 'rgba(211,237,224,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>FolliSense</span>
            <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, background: '#d3ede0', color: '#1a5c3a', border: '1px solid rgba(45,110,85,0.22)', padding: '2px 8px', borderRadius: 100 }}>Stylist</span>
          </div>
          <h1 style={{ fontFamily: playfair, fontSize: 26, fontWeight: 500, color: '#f0f8f4', margin: '0 0 4px' }}>Your clients</h1>
          <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(240,248,244,0.6)', margin: 0 }}>{clients.length} client{clients.length !== 1 ? 's' : ''} on file</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ padding: '20px 20px 0' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            style={{
              width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
              borderRadius: 14, background: 'var(--color-background-primary)',
              border: `1.5px solid ${greenBorder}`, color: 'var(--color-text-primary)',
              fontFamily: dm, fontSize: 13, outline: 'none', boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 80 }}>
          {filteredClients.length === 0 ? (
            <p style={{ fontFamily: dm, fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center', padding: '48px 0' }}>No clients found</p>
          ) : (
            filteredClients.map((c, i) => {
              const risk = riskColor(c.risk);
              return (
                <motion.button
                  key={c.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedClient(c.name)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'var(--color-background-primary)',
                    border: `1.5px solid ${greenBorder}`, borderRadius: 16,
                    padding: '13px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    fontFamily: dm,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 13,
                    background: greenLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700, color: green, flexShrink: 0,
                  }}>
                    {c.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{c.name}</p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                      {c.observationCount} observation{c.observationCount !== 1 ? 's' : ''} · Last: {c.lastDate}
                    </p>
                    {c.lastLocation && (
                      <p style={{ fontFamily: dm, fontSize: 11, color: 'var(--color-text-secondary)', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={9} /> {c.lastLocation}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, background: risk.bg, color: risk.color }}>
                      {risk.label}
                    </span>
                    <ChevronRight size={14} color="var(--color-text-secondary)" />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StylistClients;