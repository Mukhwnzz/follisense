import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Minus, ArrowUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const HistoryPage = () => {
  const { history } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const trends = [
    { label: 'Itch', status: 'Stable', icon: Minus, color: 'text-primary' },
    { label: 'Tenderness', status: 'Increasing', icon: ArrowUp, color: 'text-warning' },
    { label: 'Hairline', status: 'Worth monitoring', icon: ArrowUp, color: 'text-warning' },
    { label: 'Shedding', status: 'Normal range', icon: Minus, color: 'text-primary' },
  ];

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-6">Your Scalp History</h1>

        {/* Timeline */}
        <div className="relative mb-8">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
          <div className="space-y-3">
            {[...history].reverse().map(entry => (
              <div key={entry.id} className="relative pl-10">
                <div className={`absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card ${
                  entry.risk === 'green' ? 'bg-primary' : entry.risk === 'amber' ? 'bg-warning' : 'bg-destructive'
                }`} />
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="card-elevated p-4 w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{entry.style}</p>
                      <p className="text-xs text-muted-foreground">{entry.startDate} – {entry.endDate} · {entry.days} days</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <AnimatePresence>
                    {expanded === entry.id && entry.checkIn && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-border space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Itch</span>
                            <span className="text-foreground">{entry.checkIn.itch}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tenderness</span>
                            <span className="text-foreground">{entry.checkIn.tenderness}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hairline</span>
                            <span className="text-foreground">{entry.checkIn.hairline}</span>
                          </div>
                          {entry.checkIn.flaking && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Flaking</span>
                              <span className="text-foreground">{entry.checkIn.flaking}</span>
                            </div>
                          )}
                          {entry.checkIn.shedding && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shedding</span>
                              <span className="text-foreground">{entry.checkIn.shedding}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <h3 className="font-semibold mb-4">Trends across your last 5 cycles</h3>
        <div className="grid grid-cols-2 gap-3">
          {trends.map(t => (
            <div key={t.label} className="card-elevated p-4">
              <p className="text-xs text-muted-foreground mb-1">{t.label}</p>
              <div className="flex items-center gap-1.5">
                <t.icon size={16} className={t.color} strokeWidth={2} />
                <span className="text-sm font-medium text-foreground">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
