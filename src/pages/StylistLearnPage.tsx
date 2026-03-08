import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Eye, ArrowUpRight, AlertTriangle, Shield, BookOpen, Play, Flame, Star, Info, Heart, ExternalLink, Camera } from 'lucide-react';
import { stylistConditions, StylistCondition, getConditionById } from '@/data/stylistConditions';
import ScalpIllustration from '@/components/ScalpIllustration';
import { toast } from '@/hooks/use-toast';

const tagColor = (tag: string) => {
  switch (tag) {
    case 'Common': return 'bg-secondary text-foreground';
    case 'Less common': return 'bg-accent text-foreground';
    case 'Urgent': return 'bg-destructive/15 text-destructive';
    default: return 'bg-muted text-muted-foreground';
  }
};

const dermnetLinks: Record<string, { name: string; url: string }> = {
  'traction-alopecia': { name: 'Traction alopecia', url: 'https://dermnetnz.org/topics/traction-alopecia' },
  'ccca': { name: 'CCCA', url: 'https://dermnetnz.org/topics/central-centrifugal-cicatricial-alopecia' },
  'seborrheic-dermatitis': { name: 'Seborrheic dermatitis', url: 'https://dermnetnz.org/topics/seborrhoeic-dermatitis' },
  'scalp-psoriasis': { name: 'Scalp psoriasis', url: 'https://dermnetnz.org/topics/scalp-psoriasis' },
  'alopecia-areata': { name: 'Alopecia areata', url: 'https://dermnetnz.org/topics/alopecia-areata' },
  'folliculitis': { name: 'Folliculitis', url: 'https://dermnetnz.org/topics/folliculitis' },
  'tinea-capitis': { name: 'Tinea capitis', url: 'https://dermnetnz.org/topics/tinea-capitis' },
  'chemical-damage': { name: 'Chemical burns', url: 'https://dermnetnz.org/topics/chemical-burn' },
};

const ConditionDetail = ({ condition, onBack }: { condition: StylistCondition; onBack: () => void }) => {
  const link = dermnetLinks[condition.id];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 btn-press">
        <ArrowLeft size={16} /> Back
      </button>

      <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full mb-2 ${tagColor(condition.tag)}`}>
        {condition.tag}
      </span>
      <h2 className="text-xl font-semibold text-foreground mb-1">{condition.name}</h2>
      <p className="text-sm text-muted-foreground mb-5">{condition.summary}</p>

      {/* Illustrated guide */}
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Illustrated guide</h3>
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
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

      {/* Darker skin note */}
      <div className="rounded-xl bg-secondary/60 border border-secondary p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={14} className="text-primary" />
          <h4 className="text-xs font-semibold text-foreground">How it presents on darker skin</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{condition.darkerSkinNote}</p>
      </div>

      {/* Clinical reference link */}
      {link && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Clinical reference photos</h3>
          <p className="text-xs text-muted-foreground italic mb-3">
            These clinical photos are sourced from medical references and may not reflect how conditions present on darker skin tones. Use the descriptions and illustrations above as your primary guide for your clients.
          </p>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="card-elevated p-4 flex items-center gap-3">
            <Camera size={18} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{link.name}</p>
              <p className="text-xs text-muted-foreground">View clinical reference photos on DermNet NZ</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
          </a>
        </div>
      )}

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
};

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
  <div className="space-y-5 mb-6">
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
          <li key={i} className="flex gap-2"><span className="text-primary mt-1">•</span><span>{item}</span></li>
        ))}
      </ul>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">How to say it</h3>
      <p className="text-sm text-muted-foreground mb-3">Keep it simple, honest, and kind.</p>
      <p className="text-xs font-medium text-foreground mb-2">Good examples:</p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
        <li className="italic">"I've noticed your edges look a bit thinner than last time. Have you noticed that?"</li>
        <li className="italic">"There's some irritation on your scalp that looks like it might need attention."</li>
        <li className="italic">"I'm seeing a patch here that looks different from usual."</li>
      </ul>
      <p className="text-xs font-medium text-destructive mb-2">Don't say:</p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>"You have traction alopecia" <span className="text-xs text-muted-foreground">(that's a diagnosis)</span></li>
        <li>"This looks really bad" <span className="text-xs text-muted-foreground">(alarming)</span></li>
        <li>"Just use some oil on it" <span className="text-xs text-muted-foreground">(not your role)</span></li>
      </ul>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">How to refer using FolliSense</h3>
      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        <li>Capture what you see (photos and notes)</li>
        <li>Share the observation with your client</li>
        <li>The client receives it in their personal timeline</li>
        <li>They'll have documented history to bring to a professional</li>
      </ol>
    </div>

    <div className="card-elevated p-5">
      <h3 className="font-semibold text-foreground mb-2">Who to suggest they see</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li><span className="font-medium text-foreground">Trichologist:</span> specialises in hair and scalp conditions.</li>
        <li><span className="font-medium text-foreground">Dermatologist:</span> a skin specialist who can diagnose and treat.</li>
        <li><span className="font-medium text-foreground">GP:</span> can do initial assessment and refer onwards.</li>
      </ul>
    </div>
  </div>
);

const StylistLearnPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'conditions' | 'refer'>('conditions');

  useEffect(() => {
    const conditionParam = searchParams.get('condition');
    if (conditionParam && getConditionById(conditionParam)) {
      setSelectedConditionId(conditionParam);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
        <p className="text-muted-foreground text-sm mb-4">Spot it, understand it, refer it</p>

        {/* Disclaimer */}
        <div className="rounded-xl bg-secondary/50 border border-secondary p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">A note on images</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                High-quality clinical images of scalp conditions on darker skin tones are still significantly underrepresented in medical resources. Focus on the descriptions and illustrations. Your eyes on a real scalp will always be more accurate than any reference image.
              </p>
            </div>
          </div>
        </div>

        {/* Quiz card */}
        {(() => {
          let quiz = { totalPoints: 0, currentStreak: 0 };
          try { const s = localStorage.getItem('follisense-quiz'); if (s) quiz = JSON.parse(s); } catch {}
          return (
            <button onClick={() => navigate('/stylist/quiz')} className="card-elevated p-4 w-full text-left flex items-center justify-between mb-5 btn-press">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Scalp Quiz</h3>
                <p className="text-xs text-muted-foreground">Test your eye. Build your confidence.</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Flame size={11} className="text-primary" />{quiz.currentStreak}</span>
                  <span className="flex items-center gap-1"><Star size={11} className="text-primary" />{quiz.totalPoints} pts</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Play size={15} className="text-primary ml-0.5" />
              </div>
            </button>
          );
        })()}

        {/* Section toggle */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveSection('conditions')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === 'conditions' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            What am I looking at?
          </button>
          <button onClick={() => setActiveSection('refer')} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === 'refer' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            How to refer
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'conditions' ? (
            <motion.div key="conditions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-semibold text-foreground mb-1">Common scalp and hair conditions</h2>
              <p className="text-sm text-muted-foreground mb-4">Tap any condition to see what it looks like and what to do</p>

              <div className="space-y-2.5 mb-8">
                {stylistConditions.map((condition) => (
                  <button key={condition.id} onClick={() => setSelectedConditionId(condition.id)} className="card-elevated p-4 w-full text-left flex items-center justify-between gap-3 btn-press">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-semibold text-foreground">{condition.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagColor(condition.tag)}`}>{condition.tag}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.summary}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Clinical photo resources */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3">More clinical references</h3>
                <div className="space-y-2">
                  {[
                    { name: 'DermNet NZ', desc: 'Comprehensive dermatology image library', url: 'https://dermnetnz.org' },
                    { name: 'VisualDx', desc: 'Clinical decision support with diverse skin images', url: 'https://www.visualdx.com' },
                    { name: 'Skin Deep by VisualDx', desc: 'Dermatology images across skin tones', url: 'https://www.visualdx.com/skindeep' },
                    { name: 'Brown Skin Matters', desc: 'Dermatology on darker skin tones', url: 'https://brownskinmatters.com' },
                  ].map(r => (
                    <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="card-elevated p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                      <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic mt-3">
                  DermNet NZ is a free, trusted dermatology resource used by medical professionals worldwide. Images are provided for educational reference only.
                </p>
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

        {/* Why representation matters */}
        <div className="card-elevated p-5 mb-20 border-l-4 border-l-primary">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={15} className="text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Why representation matters in clinical education</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Most medical training materials show skin conditions on lighter skin. FolliSense is working to change this.
          </p>
          <button
            onClick={() => toast({ title: 'Thank you', description: "We'll be in touch." })}
            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium btn-press"
          >
            I'd like to help
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StylistLearnPage;
