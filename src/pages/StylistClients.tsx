import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowLeft, Search, Plus, TrendingUp, TrendingDown, Minus, Eye, MapPin, Camera } from 'lucide-react';
import { useApp, ClientObservation } from '@/contexts/AppContext';

interface ClientSummary {
  name: string;
  observationCount: number;
  lastDate: string;
  lastLocation?: string;
  risk: 'green' | 'amber' | 'red';
  observations: ClientObservation[];
}

const StylistClients = () => {
  const navigate = useNavigate();
  const { clientObservations } = useApp();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [expandedObs, setExpandedObs] = useState<string | null>(null);

  const clients = useMemo(() => {
    const map = new Map<string, ClientSummary>();
    clientObservations.forEach(obs => {
      const existing = map.get(obs.clientName);
      if (existing) {
        existing.observationCount++;
        existing.observations.push(obs);
        // Keep most recent
        if (!existing.lastDate || obs.date > existing.lastDate) {
          existing.lastDate = obs.date;
          existing.lastLocation = obs.location ? `${obs.location}${obs.locationCity ? `, ${obs.locationCity}` : ''}` : undefined;
          existing.risk = obs.risk;
        }
      } else {
        map.set(obs.clientName, {
          name: obs.clientName,
          observationCount: 1,
          lastDate: obs.date,
          lastLocation: obs.location ? `${obs.location}${obs.locationCity ? `, ${obs.locationCity}` : ''}` : undefined,
          risk: obs.risk,
          observations: [obs],
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

  // Compute trends for client with 3+ observations
  const computeTrends = (obs: ClientObservation[]) => {
    if (obs.length < 3) return null;
    const comparisons = obs.filter(o => o.comparison).map(o => o.comparison!);
    const hairlineObs = obs.filter(o => o.observations.some(x => x.includes('hairline') || x.includes('edges') || x.includes('traction')));
    const scalpObs = obs.filter(o => !o.observations.includes('General check, nothing concerning'));

    const getOverallTrend = () => {
      const better = comparisons.filter(c => c.includes('Better')).length;
      const worse = comparisons.filter(c => c.includes('Worse')).length;
      if (better > worse) return 'Improving';
      if (worse > better) return 'Worsening';
      return 'Stable';
    };

    return {
      hairline: hairlineObs.length > 0 ? (hairlineObs.length > obs.length / 2 ? 'Worsening' : 'Worth monitoring') : 'Stable',
      scalpHealth: getOverallTrend(),
    };
  };

  // Client detail view
  if (client) {
    const trends = computeTrends(client.observations);
    return (
      <div className="page-container pt-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <button onClick={() => setSelectedClient(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 btn-press">
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="text-2xl font-semibold mb-0.5">{client.name}</h1>
          <p className="text-sm text-muted-foreground mb-6">{client.observationCount} observation{client.observationCount !== 1 ? 's' : ''} recorded</p>

          {/* Trends */}
          {trends && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">Hairline</p>
                <div className="flex items-center gap-1.5">
                  {trends.hairline === 'Improving' && <TrendingUp size={16} className="text-primary" />}
                  {trends.hairline === 'Worsening' && <TrendingDown size={16} className="text-destructive" />}
                  {(trends.hairline === 'Stable' || trends.hairline === 'Worth monitoring') && <Minus size={16} className="text-warning" />}
                  <span className="text-sm font-medium text-foreground">{trends.hairline}</span>
                </div>
              </div>
              <div className="card-elevated p-4">
                <p className="text-xs text-muted-foreground mb-1">Scalp health</p>
                <div className="flex items-center gap-1.5">
                  {trends.scalpHealth === 'Improving' && <TrendingUp size={16} className="text-primary" />}
                  {trends.scalpHealth === 'Worsening' && <TrendingDown size={16} className="text-destructive" />}
                  {trends.scalpHealth === 'Stable' && <Minus size={16} className="text-primary" />}
                  <span className="text-sm font-medium text-foreground">{trends.scalpHealth}</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <h3 className="font-semibold text-foreground mb-3">Observation history</h3>
          <div className="relative mb-6">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
            <div className="space-y-3">
              {client.observations.map(obs => (
                <div key={obs.id} className="relative pl-10">
                  <div className={`absolute left-[9px] top-5 w-3 h-3 rounded-full border-2 border-card ${obs.risk === 'green' ? 'bg-primary' : obs.risk === 'amber' ? 'bg-warning' : 'bg-destructive'}`} />
                  <button onClick={() => setExpandedObs(expandedObs === obs.id ? null : obs.id)} className="card-elevated p-4 w-full text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground text-sm">{obs.date}</p>
                      <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expandedObs === obs.id ? 'rotate-180' : ''}`} />
                    </div>
                    {obs.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin size={10} />{obs.location}{obs.locationCity ? `, ${obs.locationCity}` : ''}</p>
                    )}
                    {obs.service && <p className="text-xs text-muted-foreground mb-1">{obs.service}</p>}

                    <AnimatePresence>
                      {expandedObs === obs.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="pt-3 mt-2 border-t border-border space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Observations</p>
                              <ul className="mt-1 space-y-0.5">
                                {obs.observations.map(o => (<li key={o} className="text-sm text-foreground">• {o}</li>))}
                              </ul>
                            </div>
                            {obs.comparison && (
                              <div>
                                <p className="text-xs text-muted-foreground">Compared to last visit</p>
                                <p className="text-sm text-foreground">{obs.comparison}</p>
                              </div>
                            )}
                            {obs.photoAreas && obs.photoAreas.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">Photos</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {obs.photoAreas.map(a => (
                                    <span key={a} className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Camera size={10} />{a}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {obs.notes && (
                              <div>
                                <p className="text-xs text-muted-foreground">Notes</p>
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
            </div>
          </div>

          <button onClick={() => navigate(`/stylist/observation?client=${encodeURIComponent(client.name)}`)} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-base btn-press flex items-center justify-center gap-2 mb-20">
            <Plus size={18} /> New observation for {client.name}
          </button>
        </motion.div>
      </div>
    );
  }

  // Client list view
  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-4">Your clients</h1>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or initials"
            className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Client list */}
        <div className="space-y-2 mb-20">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No clients found</p>
            </div>
          ) : (
            filteredClients.map(c => (
              <button key={c.name} onClick={() => setSelectedClient(c.name)} className="card-elevated p-4 w-full text-left flex items-center justify-between btn-press">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground">{c.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.observationCount} observation{c.observationCount !== 1 ? 's' : ''} · Last: {c.lastDate}</p>
                    {c.lastLocation && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} />{c.lastLocation}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${c.risk}`} />
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StylistClients;
