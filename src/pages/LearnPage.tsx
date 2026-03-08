import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Droplets, Stethoscope, Sparkles, Info, ChevronDown, Search } from 'lucide-react';

const articles = [
  { icon: AlertTriangle, title: 'What is traction alopecia?', preview: 'How tight hairstyles can affect your hairline over time', content: 'Traction alopecia is a form of hair loss caused by prolonged tension on hair follicles. It commonly affects the hairline, temples, and edges — areas where tight styles pull the most. The good news: it\'s reversible if caught early. Adjusting tension, taking breaks between protective styles, and allowing your edges to rest can help. Research suggests it affects up to 1 in 3 women who regularly wear tight hairstyles.' },
  { icon: Droplets, title: 'Understanding your wash cycle', preview: 'Why cycle-aware monitoring matters for protective styles', content: 'When you wear a protective style for weeks at a time, your scalp is largely hidden from view. This creates a visibility gap — symptoms can develop and progress without being noticed. Wash day is a natural checkpoint because it\'s when you take your style down (or at least access your scalp). By tracking symptoms at these consistent intervals, you can spot patterns that would otherwise go unnoticed.' },
  { icon: Stethoscope, title: 'When to see a professional', preview: 'Signs that it\'s time to seek expert advice', content: 'Seek professional advice if you notice: persistent or worsening scalp pain, visible hairline recession that doesn\'t recover, significant hair loss during washing, or scalp inflammation that doesn\'t resolve. A trichologist specialises in hair and scalp conditions. A dermatologist can investigate skin-related causes. Your GP can provide referrals and rule out systemic causes. Early action consistently leads to better outcomes.' },
  { icon: Sparkles, title: 'Scalp care between wash days', preview: 'Simple steps to keep your scalp healthy under protective styles', content: 'Keep your scalp healthy between washes with these tips: Apply a lightweight, non-comedogenic scalp oil to soothe dryness. Avoid re-tightening loose edges — this increases tension damage. Use a gentle, sulphate-free scalp rinse mid-cycle if itching increases. Sleep with a satin bonnet or pillowcase to reduce friction. Most importantly, listen to discomfort signals — pain means something needs to change.' },
  { icon: Info, title: 'How ScalpSense works', preview: 'Your monitoring cycle explained', content: 'ScalpSense follows your protective style cycle, prompting check-ins at two key moments: mid-cycle (a quick 3-question check) and wash day (a more thorough 5-question assessment). Your responses are scored to identify patterns: green means your routine is working, amber suggests areas to watch, and red recommends professional consultation. The clinician summary feature creates a structured report you can share with a healthcare provider. ScalpSense doesn\'t diagnose — it helps you notice patterns and know when to act.' },
];

const LearnPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="page-container pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-semibold mb-1">Learn</h1>
        <p className="text-muted-foreground mb-6">Understanding your scalp health</p>

        <div className="space-y-3 mb-8">
          {articles.map((article, i) => (
            <button key={i} onClick={() => setExpanded(expanded === i ? null : i)} className="card-elevated p-5 w-full text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <article.icon size={20} className="text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-[15px]">{article.title}</h3>
                    <ChevronDown size={18} className={`text-muted-foreground transition-transform flex-shrink-0 ml-2 ${expanded === i ? 'rotate-180' : ''}`} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{article.preview}</p>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <p className="text-sm text-foreground mt-4 leading-relaxed">{article.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Find a specialist card */}
        <button onClick={() => navigate('/find-specialist')} className="card-elevated p-5 w-full text-left mb-20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
            <Search size={20} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-[15px]">Find a specialist</h3>
            <p className="text-sm text-muted-foreground mt-1">Professionals who understand textured hair</p>
          </div>
          <ChevronDown size={18} className="text-muted-foreground -rotate-90" />
        </button>
      </motion.div>
    </div>
  );
};

export default LearnPage;
