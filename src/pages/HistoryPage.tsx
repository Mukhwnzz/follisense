import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Minus, ArrowUp, Scissors, Eye, AlertTriangle, MapPin, ClipboardCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SalonCheckInEntry {
  id: string;
  date: string;
  photos: number;
  observations: string[];
  note?: string;
}

const HistoryPage = () => {
  const { history, salonVisits, stylistObservations, quickLogs } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [salonCheckIns, setSalonCheckIns] = useState<SalonCheckInEntry[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('follisense-salon-checkins');
      if (saved) setSalonCheckIns(JSON.parse(saved));
    } catch {}
  }, []);

  const trends = [
    { label: 'Itch', status: 'Stable', icon: Minus, color: 'text-primary' },
    { label: 'Tenderness', status: 'Increasing', icon: ArrowUp, color: 'text-warning' },
    { label: 'Hairline', status: 'Worth monitoring', icon: ArrowUp, color: 'text-warning' },
    { label: 'Shedding', status: 'Normal range', icon: Minus, color: 'text-primary' },
    { label: 'Hair condition', status: 'Stable', icon: Minus, color: 'text-primary' },
  ];

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-6">Your Scalp History</h1>

        {/* Timeline */}
        <div className="relative mb-8">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
          <div className="space-y-3">
            {/* Cycle entries */}
            {[...history].reverse().map(entry => (
              <div key={entry.id} className="relative pl-10">
                <div className={`absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card ${entry.risk === 'green' ? 'bg-primary' : entry.risk === 'amber' ? 'bg-warning' : 'bg-destructive'}`} />
                <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="card-elevated p-4 w-full text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{entry.style}</p>
                      <p className="text-xs text-muted-foreground">{entry.startDate} – {entry.endDate} · {entry.days} days</p>
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expanded === entry.id && entry.checkIn && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-t border-border space-y-1.5">
                          {[
                            { label: 'Itch', val: entry.checkIn.itch },
                            { label: 'Tenderness', val: entry.checkIn.tenderness },
                            { label: 'Hairline', val: entry.checkIn.hairline },
                            { label: 'Flaking', val: entry.checkIn.flaking },
                            { label: 'Shedding', val: entry.checkIn.shedding },
                          ].filter(r => r.val).map(r => (
                            <div key={r.label} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{r.label}</span>
                              <span className="text-foreground">{r.val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}

            {/* Quick log entries */}
            {quickLogs.map(log => (
              <div key={log.id} className="relative pl-10">
                <div className="absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card bg-warning" />
                <div className="card-elevated p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-warning flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Quick log: {log.symptoms.join(', ').toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">{log.date} · {log.severity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Stylist observation entries */}
            {stylistObservations.map(obs => (
              <div key={obs.id} className="relative pl-10">
                <div className={`absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card ${obs.risk === 'green' ? 'bg-primary' : obs.risk === 'amber' ? 'bg-warning' : 'bg-destructive'}`} />
                <button onClick={() => setExpanded(expanded === obs.id ? null : obs.id)} className="card-elevated p-4 w-full text-left border-l-4 border-l-warning">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye size={16} className="text-warning flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium text-foreground text-sm">Stylist observation by {obs.stylistName}{obs.location ? ` at ${obs.location}` : ''}</p>
                        <p className="text-xs text-muted-foreground">{obs.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${obs.risk}`} />
                      <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded === obs.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === obs.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-t border-border space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">What was observed</p>
                            <ul className="mt-1 space-y-0.5">
                              {obs.observations.map(o => (<li key={o} className="text-sm text-foreground">• {o}</li>))}
                            </ul>
                          </div>
                          {obs.comparison && (
                            <div>
                              <p className="text-xs text-muted-foreground">Compared to last visit</p>
                              <p className="text-sm text-foreground">Your stylist noted things are {obs.comparison.toLowerCase()}</p>
                            </div>
                          )}
                          {obs.notes && (
                            <div>
                              <p className="text-xs text-muted-foreground">Stylist notes</p>
                              <p className="text-sm text-foreground">{obs.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}

            {/* Salon check-in entries */}
            {salonCheckIns.map(checkin => (
              <div key={checkin.id} className="relative pl-10">
                <div className="absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card bg-primary" />
                <button onClick={() => setExpanded(expanded === checkin.id ? null : checkin.id)} className="card-elevated p-4 w-full text-left border-l-4 border-l-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck size={16} className="text-primary flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium text-foreground text-sm">Salon check-in</p>
                        <p className="text-xs text-muted-foreground">{checkin.date}</p>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded === checkin.id ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expanded === checkin.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-t border-border space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Photos</span>
                            <span className="text-foreground">{checkin.photos} captured</span>
                          </div>
                          {checkin.observations.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground">Observations</p>
                              <ul className="mt-1 space-y-0.5">
                                {checkin.observations.map(o => (<li key={o} className="text-sm text-foreground">• {o}</li>))}
                              </ul>
                            </div>
                          )}
                          {checkin.note && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Notes</span>
                              <span className="text-foreground text-right">{checkin.note}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ))}

            {/* Salon visit entries */}
            {salonVisits.map(visit => (
              <div key={visit.id} className="relative pl-10">
                <div className="absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card bg-secondary" />
                <button onClick={() => setExpanded(expanded === visit.id ? null : visit.id)} className="card-elevated p-4 w-full text-left border-l-4 border-l-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Scissors size={16} className="text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium text-foreground">Salon visit</p>
                        <p className="text-xs text-muted-foreground">{visit.date}{visit.stylistName ? ` · ${visit.stylistName}` : ''}</p>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform ${expanded === visit.id ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expanded === visit.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-t border-border space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Services</span>
                            <span className="text-foreground text-right">{visit.services.join(', ')}</span>
                          </div>
                          {visit.notes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Notes</span>
                              <span className="text-foreground text-right">{visit.notes}</span>
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
        <div className="grid grid-cols-2 gap-3 mb-20">
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
