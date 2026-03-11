import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Droplets, Sun, Moon, Sparkles, Lightbulb } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductSearch from '@/components/ProductSearch';

interface PhaseProduct {
  name: string;
  frequency: string;
}

const RoutineTracker = () => {
  const navigate = useNavigate();
  const { onboardingData } = useApp();

  const scalpProducts = onboardingData.scalpProducts.filter(p => p !== 'None' && p !== "I don't use anything specific");
  const hairProducts = onboardingData.hairProducts.filter(p => p !== 'None' && p !== "I don't use anything specific");
  const betweenCare = onboardingData.betweenWashCare.filter(p => p !== 'Nothing - I leave it alone until wash day' && p !== 'Other');

  const [phases, setPhases] = useState<Record<string, PhaseProduct[]>>({
    'Wash Day': [
      ...scalpProducts.map(p => ({ name: p, frequency: 'Every cycle' })),
      ...hairProducts.map(p => ({ name: p, frequency: 'Every cycle' })),
    ],
    'Days 1-3': hairProducts.slice(0, 2).map(p => ({ name: p, frequency: 'Every cycle' })),
    'Mid-cycle': betweenCare.map(p => ({ name: p, frequency: 'Most cycles' })),
    'Pre-wash': [],
  });

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addingProducts, setAddingProducts] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('Every cycle');

  const phaseIcons: Record<string, typeof Droplets> = {
    'Wash Day': Droplets,
    'Days 1-3': Sun,
    'Mid-cycle': Moon,
    'Pre-wash': Sparkles,
  };

  const phaseColors: Record<string, string> = {
    'Wash Day': 'bg-primary/10',
    'Days 1-3': 'bg-accent',
    'Mid-cycle': 'bg-secondary',
    'Pre-wash': 'bg-primary/5',
  };

  const handleAddProduct = (phase: string) => {
    if (addingProducts.length > 0) {
      setPhases(prev => ({
        ...prev,
        [phase]: [...prev[phase], ...addingProducts.map(p => ({ name: p, frequency }))],
      }));
    }
    setAddingTo(null);
    setAddingProducts([]);
    setFrequency('Every cycle');
  };

  // Gap identification
  const gaps: { message: string }[] = [];
  if (phases['Mid-cycle'].length === 0) {
    gaps.push({ message: "Most people don't use anything between washes. That's a gap worth watching: buildup and itch tend to peak mid-cycle." });
  }
  const hasScalpProductOnWashDay = phases['Wash Day'].some(p => scalpProducts.includes(p.name));
  if (!hasScalpProductOnWashDay && phases['Wash Day'].length > 0) {
    gaps.push({ message: "You're washing your hair but not treating your scalp separately. That's common: most products aren't designed for both." });
  }
  const midCycleOnlyOils = phases['Mid-cycle'].length > 0 && phases['Mid-cycle'].every(p =>
    p.name.toLowerCase().includes('oil')
  );
  if (midCycleOnlyOils) {
    gaps.push({ message: "Oils work well for the hair shaft, but your scalp might benefit from something lighter between washes, especially under protective styles." });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto px-6 pb-24">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-foreground" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Your Routine</h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Timeline */}
          <div className="overflow-x-auto pb-2 mb-6 -mx-6 px-6">
            <div className="flex gap-3 min-w-max">
              {Object.keys(phases).map(phase => {
                const Icon = phaseIcons[phase] || Droplets;
                return (
                  <div key={phase} className="w-[140px] flex-shrink-0">
                    <div className={`rounded-xl ${phaseColors[phase]} p-3 mb-2 flex flex-col items-center`}>
                      <Icon size={20} className="text-primary mb-1" strokeWidth={1.5} />
                      <p className="text-xs font-semibold text-foreground text-center">{phase}</p>
                    </div>
                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: phases[phase].length > 0 ? '100%' : '0%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase details */}
          <div className="space-y-4">
            {Object.entries(phases).map(([phase, products]) => {
              const Icon = phaseIcons[phase] || Droplets;
              return (
                <div key={phase} className="card-elevated overflow-hidden">
                  <div className="p-4 flex items-center gap-2">
                    <Icon size={16} className="text-primary" strokeWidth={1.8} />
                    <h3 className="text-sm font-semibold text-foreground">{phase}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{products.length} product{products.length !== 1 ? 's' : ''}</span>
                  </div>
                  {products.length > 0 && (
                    <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                      {products.map((p, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent text-xs text-foreground font-medium">
                          {p.name}
                          <span className="text-muted-foreground ml-1 text-[10px]">({p.frequency})</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {addingTo === phase ? (
                    <div className="p-4 border-t border-border space-y-3">
                      <ProductSearch category="scalp" selectedProducts={addingProducts} onProductsChange={setAddingProducts} />
                      {addingProducts.length > 0 && (
                        <>
                          <p className="text-xs font-medium text-foreground">How often do you use this during {phase}?</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['Every cycle', 'Most cycles', 'Sometimes', 'Just tried it'].map(f => (
                              <button key={f} onClick={() => setFrequency(f)} className={`pill-option text-xs ${frequency === f ? 'selected' : ''}`}>{f}</button>
                            ))}
                          </div>
                          <button onClick={() => handleAddProduct(phase)} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                            Add to {phase}
                          </button>
                        </>
                      )}
                      <button onClick={() => { setAddingTo(null); setAddingProducts([]); }} className="w-full text-center text-xs text-muted-foreground py-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingTo(phase)} className="w-full p-3 border-t border-border flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
                      <Plus size={14} /> Add product
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gap Identification */}
          {gaps.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lightbulb size={16} className="text-primary" strokeWidth={1.8} /> Things worth knowing
              </h3>
              {gaps.map((gap, i) => (
                <div key={i} className="rounded-2xl bg-sage-light p-4">
                  <p className="text-sm text-foreground leading-relaxed">{gap.message}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RoutineTracker;
