import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Eye, ArrowUpRight, AlertTriangle, Shield, BookOpen } from 'lucide-react';
import { stylistConditions, StylistCondition, getConditionById } from '@/data/stylistConditions';
import ScalpIllustration from '@/components/ScalpIllustration';

const tagColor = (tag: string) => {
  switch (tag) {
    case 'Common': return 'bg-secondary text-foreground';
    case 'Less common': return 'bg-accent text-foreground';
    case 'Urgent': return 'bg-destructive/15 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

const ConditionDetail = ({ condition, onBack }: { condition: StylistCondition; onBack: () => void }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
    <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 btn-press">
      <ArrowLeft size={16} /> Back
    </button>

    <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full mb-2 ${tagColor(condition.tag)}`}>
      {condition.tag}
    </span>
    <h2 className="text-xl font-semibold text-foreground mb-1">{condition.name}</h2>
    <p className="text-sm text-muted-foreground mb-5">{condition.summary}</p>

    {/* Illustration carousel */}
    <div className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
      {condition.stages.map((stage, i) => (
        <div key={i} className="flex-shrink-0 w-[160px]">
          <div className="w-[160px] h-[160px] rounded-xl overflow-hidden mb-2">
            <ScalpIllustration conditionId={condition.id} stageIndex={i} />
          </div>
          <p className="text-xs font-medium text-foreground">{stage.label}</p>
          <p className="text-[11px] text-muted-foreground">{stage.annotation}</p>
        </div>
      ))}
    </div>

    {/* Detail sections */}
    <div className="space-y-5 mb-20">
      <DetailSection icon={<Eye size={16} />} title="What it looks like" content={condition.whatItLooksLike} />
      <DetailSection icon={<Shield size={16} />} title="Where to look" content={condition.whereToLook} />
      <DetailSection icon={<BookOpen size={16} />} title="What to tell your client" content={condition.whatToTell} italic />
      <DetailSection icon={<ArrowUpRight size={16} />} title="What you can do" content={condition.whatYouCanDo} />
      <DetailSection icon={<AlertTriangle size={16} />} title="Severity guide" content={condition.severityGuide} />
    </div>
  </motion.div>
);

const DetailSection = ({ icon, title, content, italic }: { icon: React.ReactNode; title: string; content: string; italic?: boolean }) => (
  <div className="card-elevated p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-primary">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <p className={`text-sm text-muted-foreground leading-relaxed ${italic ? 'italic' : ''}`}>{content}</p>
  </div>
);

const ReferralGuide = () => (
  <div className="space-y-5 mb-20">
    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">Your role</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        As a stylist, you see scalps more regularly and more closely than anyone else in your client's life. You're not a doctor and nobody expects you to diagnose anything. But you're in the best position to notice changes early, and early notice is what makes conditions treatable.
      </p>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">When to say something</h3>
      <p className="text-sm text-muted-foreground mb-3">Speak up when you see:</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {[
          'Thinning that wasn\'t there before, especially at the hairline, temples, or crown',
          'Smooth, shiny patches with no hair at all',
          'Redness, bumps, or pimples that don\'t go away',
          'Unusual flaking that\'s different from normal dryness',
          'Patches of broken or missing hair with black dots',
          'Any open wounds, scabbing, or signs of burns',
          'Anything the client asks you about or seems worried about',
        ].map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">How to say it</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Keep it simple, honest, and kind. You don't need to name a condition. Just describe what you see and suggest they get it looked at.
      </p>
      <p className="text-xs font-medium text-foreground mb-2">Good examples:</p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
        <li className="italic">"I've noticed your edges look a bit thinner than last time. Have you noticed that? It might be worth getting it checked."</li>
        <li className="italic">"There's some irritation on your scalp that looks like it might need attention. I'd recommend seeing a dermatologist or trichologist."</li>
        <li className="italic">"I'm seeing a patch here that looks different from usual. I'm not sure what it is, but I think you should show it to a doctor."</li>
      </ul>
      <p className="text-xs font-medium text-destructive mb-2">Don't say:</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>"You have traction alopecia" <span className="text-xs text-muted-foreground">(that's a diagnosis)</span></li>
        <li>"This looks really bad" <span className="text-xs text-muted-foreground">(alarming without being helpful)</span></li>
        <li>"Just use some oil on it" <span className="text-xs text-muted-foreground">(not your role and potentially harmful)</span></li>
      </ul>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">How to refer using ScalpSense</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">When you document an observation in ScalpSense:</p>
      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        <li>Capture what you see (photos and notes)</li>
        <li>Share the observation with your client through the app</li>
        <li>The client receives it in their personal timeline alongside their own check-in data</li>
        <li>If they decide to see a professional, they already have a documented history with photos to bring to the appointment</li>
      </ol>
      <p className="text-sm text-muted-foreground mt-3">
        You don't need to manage the referral. Your job is to notice, document, and encourage. ScalpSense handles the rest.
      </p>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">Who to suggest they see</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">Trichologist:</span> specialises in hair and scalp conditions. Best first point of contact for hair loss concerns.
        </li>
        <li>
          <span className="font-medium text-foreground">Dermatologist:</span> a skin specialist who can diagnose and treat scalp conditions medically. Usually requires a referral from a GP in the UK.
        </li>
        <li>
          <span className="font-medium text-foreground">GP:</span> can do initial assessment, blood tests, and refer onwards. Good starting point if the client doesn't know where to go.
        </li>
        <li>
          <span className="font-medium text-foreground">In the US:</span> dermatologists can be seen directly. The Skin of Color Society has a directory of dermatologists experienced with darker skin.
        </li>
      </ul>
    </div>
  </div>
);

const StylistLearnPage = () => {
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'conditions' | 'refer'>('conditions');

  const selectedCondition = selectedConditionId ? getConditionById(selectedConditionId) : null;

  if (selectedCondition) {
    return (
      <div className="page-container pt-6">
        <ConditionDetail condition={selectedCondition} onBack={() => setSelectedConditionId(null)} />
      </div>
    );
  }

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-1">Stylist Reference Guide</h1>
        <p className="text-muted-foreground text-sm mb-5">Spot it, understand it, refer it</p>

        {/* Section toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection('conditions')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeSection === 'conditions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            What am I looking at?
          </button>
          <button
            onClick={() => setActiveSection('refer')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeSection === 'refer'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            How to refer
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'conditions' ? (
            <motion.div key="conditions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1">Common scalp and hair conditions</h2>
              <p className="text-sm text-muted-foreground mb-4">Tap any condition to see what it looks like and what to do</p>

              <div className="space-y-2.5 mb-20">
                {stylistConditions.map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => setSelectedConditionId(condition.id)}
                    className="card-elevated p-4 w-full text-left flex items-center justify-between gap-3 btn-press"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-foreground">{condition.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagColor(condition.tag)}`}>
                          {condition.tag}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.summary}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="refer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1">When and how to refer</h2>
              <p className="text-sm text-muted-foreground mb-4">You're not expected to diagnose. You're expected to notice and act.</p>
              <ReferralGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default StylistLearnPage;
