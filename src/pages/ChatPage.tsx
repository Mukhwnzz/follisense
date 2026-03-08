import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mic, ArrowRight, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  "Why is my scalp itchy?",
  "Is it normal to shed more on wash day?",
  "How do I know if I have traction alopecia?",
  "What should I look for between wash days?",
];

const getFollowUps = (content: string): string[] => {
  const lower = content.toLowerCase();
  if (lower.includes('traction alopecia') || lower.includes('edges')) {
    return ["Is traction alopecia reversible?", "How can I protect my edges?", "When should I see a specialist?"];
  }
  if (lower.includes('shedding') || lower.includes('shed')) {
    return ["How much shedding is normal?", "Could this be telogen effluvium?", "Should I change my routine?"];
  }
  if (lower.includes('wash') || lower.includes('cleanse')) {
    return ["How often should I wash?", "What's the best shampoo for my scalp?", "Can I co-wash instead?"];
  }
  if (lower.includes('itch') || lower.includes('irritat')) {
    return ["What causes scalp itching?", "Could it be a product reaction?", "When should I see a dermatologist?"];
  }
  return ["Tell me about scalp care routines", "What are signs of hair damage?", "How do protective styles affect my scalp?"];
};

const shouldSuggestCheckIn = (content: string): boolean => {
  const lower = content.toLowerCase();
  return lower.includes('concerned') || lower.includes('worried') || lower.includes('getting worse') || lower.includes('significant') || lower.includes('professional');
};

const shouldLinkLearn = (content: string): { show: boolean; topic: string } => {
  const lower = content.toLowerCase();
  if (lower.includes('traction alopecia')) return { show: true, topic: 'Traction alopecia: the basics' };
  if (lower.includes('telogen effluvium')) return { show: true, topic: 'Telogen effluvium' };
  if (lower.includes('wash cycle') || lower.includes('wash day')) return { show: true, topic: 'Understanding your wash cycle' };
  if (lower.includes('professional') || lower.includes('specialist') || lower.includes('trichologist')) return { show: true, topic: 'When to see a professional' };
  if (lower.includes('porosity')) return { show: true, topic: 'Understanding hair porosity' };
  if (lower.includes('protein') || lower.includes('moisture balance')) return { show: true, topic: 'Protein-moisture balance' };
  return { show: false, topic: '' };
};

interface UserContext {
  gender: string;
  hairType: string;
  chemicalProcessing: string;
  lastChemicalTreatment: string;
  styles: string[];
  cycleLength: string;
  washFrequency: string;
  betweenWashCare: string[];
  scalpProducts: string[];
  hairProducts: string[];
  goals: string[];
  baselineItch: string;
  baselineTenderness: string;
  baselineHairline: string;
  baselineHairHealth: string;
  lastCheckInRisk: string;
  medicalConditions: string[];
  teTriggers: string[];
  menstrualTracking: string;
  isWornOutOnly: boolean;
}

const buildContextAwareResponse = (userMessage: string, ctx: UserContext, history: Message[]): string => {
  const lower = userMessage.toLowerCase();
  const stylesStr = ctx.styles.length > 0 ? ctx.styles.join(', ').toLowerCase() : '';
  const hasProtective = stylesStr.includes('braid') || stylesStr.includes('cornrow') || stylesStr.includes('wig') || stylesStr.includes('weave') || stylesStr.includes('loc') || stylesStr.includes('twist') || stylesStr.includes('crochet');
  const hasWaves = stylesStr.includes('wave');
  const primaryStyle = ctx.styles[0] || 'your current style';

  // Itchy scalp — personalised
  if (lower.includes('itch') || lower.includes('itchy') || lower.includes('itching')) {
    let response = '';
    if (ctx.baselineItch && ctx.baselineItch !== 'None') {
      response += `You mentioned ${ctx.baselineItch.toLowerCase()} itching when you first set up ScalpSense, so this is something we're already tracking for you.\n\n`;
    }

    response += 'Scalp itching can come from a few different things:\n\n';

    if (hasProtective || hasWaves) {
      response += `- **Product buildup under your style** — since you wear ${primaryStyle.toLowerCase()}, sweat and product can accumulate between washes. ${ctx.washFrequency ? `You wash ${ctx.washFrequency.toLowerCase()}, which` : 'Your wash frequency'} affects how much buildup sits on your scalp.\n`;
    }

    if (ctx.scalpProducts.some(p => p.toLowerCase().includes('oil') || p.toLowerCase().includes('grease') || p.toLowerCase().includes('pomade'))) {
      response += `- **Your scalp products** — oils and pomades can sometimes clog follicles if applied too heavily or too often, especially under an installed style. Most scalp oils have limited clinical evidence, and heavy oils like castor oil or coconut oil can worsen buildup.\n`;
    }

    response += '- **Dry scalp** — if your scalp feels tight and the flakes are small and white, it might just need moisture, not medicated treatment.\n';
    response += '- **Seborrheic dermatitis** — if the flakes are yellowish and oily, that\'s a different condition that responds to antifungal shampoos.\n\n';

    if (ctx.betweenWashCare.length > 0) {
      response += `You mentioned you ${ctx.betweenWashCare.map(c => c.toLowerCase()).join(', ')} between washes — that\'s good. `;
    }

    response += 'If the itching is getting worse or doesn\'t improve with gentle cleansing, it\'s worth mentioning to a dermatologist.';
    return response;
  }

  // Edges / hairline
  if (lower.includes('edge') || lower.includes('hairline') || lower.includes('thinning')) {
    let response = '';
    if (ctx.baselineHairline && ctx.baselineHairline !== 'No concerns') {
      response += `You flagged ${ctx.baselineHairline === 'Slight concern' ? 'some concern' : ctx.baselineHairline === 'Noticeable change' ? 'noticeable changes' : 'concerns'} about your hairline during setup, so this is definitely something we\'re watching.\n\n`;
    }

    response += 'Edge thinning is one of the most common concerns — and the most common cause is **traction alopecia**, where repeated tension on the follicles gradually weakens them.\n\n';

    if (hasProtective) {
      response += `Since you wear ${primaryStyle.toLowerCase()}, the key question is how tight your installations are, especially around the hairline and temples. `;
      if (ctx.cycleLength) {
        response += `With a ${ctx.cycleLength.toLowerCase()} cycle length, your follicles are under tension for a significant period each time.\n\n`;
      }
    }

    if (hasWaves) {
      response += `If you\'re wearing your durag tightly for waves, that constant compression can contribute to hairline recession too. Try loosening the tie — your wave pattern won\'t disappear from slightly less pressure.\n\n`;
    }

    if (ctx.goals.some(g => g.toLowerCase().includes('hairline') || g.toLowerCase().includes('edge'))) {
      response += 'Since protecting your hairline is one of your goals, your check-ins are specifically designed to track changes there. ';
    }

    response += 'The good news: if caught early, traction alopecia is often reversible. The key is reducing tension now, not later.\n\n';
    response += 'If you\'re seeing active recession, it\'s worth seeing a trichologist or dermatologist sooner rather than later.';
    return response;
  }

  // Shedding / hair loss
  if (lower.includes('shed') || lower.includes('hair loss') || lower.includes('falling out') || lower.includes('losing hair')) {
    let response = 'Some shedding is completely normal — most people lose 50 to 100 hairs a day. ';

    if (hasProtective) {
      response += `With ${primaryStyle.toLowerCase()}, you might not notice daily shedding while the style is in, so it can seem like a lot comes out on wash day. That\'s usually just accumulated normal shedding.\n\n`;
    } else {
      response += 'What matters is whether the amount has changed significantly from your normal.\n\n';
    }

    response += 'Things that can increase temporary shedding:\n\n';

    if (ctx.menstrualTracking) {
      response += '- **Hormonal shifts** — shedding can increase around your period or with changes to contraception\n';
    }
    response += '- **Stress** — physical or emotional stress can trigger telogen effluvium, a temporary increase in shedding 2–4 months later\n';
    response += '- **Nutritional deficiencies** — especially iron, vitamin D, and B12\n';
    response += '- **Seasonal changes** — many people shed more in autumn\n\n';

    if (ctx.medicalConditions.length > 0) {
      response += `Since you\'ve noted some medical history, it\'s worth considering whether any of those factors might be contributing.\n\n`;
    }

    if (ctx.goals.some(g => g.toLowerCase().includes('hair loss') || g.toLowerCase().includes('thinning'))) {
      response += 'Understanding your hair loss is one of your goals — your regular check-ins will help you track whether the shedding is changing over time.\n\n';
    }

    response += 'If the shedding seems excessive or you\'re seeing patches, it\'s worth seeing a trichologist or dermatologist.';
    return response;
  }

  // Wash day / between washes
  if (lower.includes('wash') && (lower.includes('how often') || lower.includes('between') || lower.includes('look for'))) {
    let response = '';

    if (hasProtective) {
      response += `Between wash days with ${primaryStyle.toLowerCase()}, your scalp is doing a lot of work — producing oil, shedding skin cells, and potentially reacting to products or tension.\n\n`;
      if (ctx.washFrequency) {
        response += `You currently wash ${ctx.washFrequency.toLowerCase()}. `;
      }
    }

    response += 'Here\'s what to watch for:\n\n';
    response += '- **Itching** — occasional mild itch is normal, but persistent or worsening itching could signal buildup or a reaction\n';
    response += '- **Tenderness** — if your scalp hurts, especially around your hairline, your style might be too tight\n';
    response += '- **Flaking** — light flakes can be normal buildup, but heavy flaking could indicate a condition\n';
    response += '- **Smell** — a musty or unusual smell can indicate bacterial or fungal buildup\n\n';

    if (ctx.hairType) {
      response += `With ${ctx.hairType} hair, `;
    } else {
      response += 'With textured hair, ';
    }
    response += 'keeping your scalp clean between washes doesn\'t mean you need to fully wash — a scalp refresh spray or water rinse can help.\n\n';
    response += 'If anything concerns you, it\'s worth doing a mid-cycle check-in to log it.';
    return response;
  }

  // Traction alopecia
  if (lower.includes('traction alopecia')) {
    let response = '**Traction alopecia** is hair loss caused by repeated pulling or tension on the hair. ';

    if (ctx.gender === 'A man' || ctx.gender === 'man') {
      response += 'It affects men too — especially those who wear cornrows, braids, locs, or tight durags regularly.\n\n';
    } else {
      response += 'It\'s particularly common among women who regularly wear tight hairstyles.\n\n';
    }

    response += '**Key facts:**\n';
    response += '- Early stages are **reversible** — the hair can grow back if tension is removed\n';
    response += '- Late stages can cause **permanent scarring** of follicles\n';
    response += '- It affects up to 1 in 3 people who regularly wear tight styles\n\n';

    response += '**Warning signs:**\n';
    response += '- Thinning or recession at the hairline, especially around temples\n';
    response += '- Small bumps around the hairline after installation\n';
    response += '- Tenderness where the hair is pulled tight\n\n';

    if (hasProtective) {
      response += `Since you wear ${primaryStyle.toLowerCase()}, the key prevention is making sure your installations aren't too tight — especially around the hairline.\n\n`;
    }

    response += 'If you\'re concerned, seeing a trichologist or dermatologist early gives you the best chance of recovery.';
    return response;
  }

  // Products
  if (lower.includes('product') || lower.includes('shampoo') || lower.includes('conditioner') || lower.includes('oil')) {
    let response = '';

    if (ctx.scalpProducts.length > 0 || ctx.hairProducts.length > 0) {
      response += 'Based on your profile, here\'s what I\'d note about your current routine:\n\n';

      if (ctx.scalpProducts.length > 0) {
        response += `**Scalp products you use:** ${ctx.scalpProducts.join(', ')}\n`;
      }
      if (ctx.hairProducts.length > 0) {
        response += `**Hair products you use:** ${ctx.hairProducts.join(', ')}\n\n`;
      }
    }

    response += 'The most important thing with products isn\'t using more — it\'s using the right ones for your specific needs:\n\n';

    if (ctx.hairType) {
      const isHighPorosity = ctx.chemicalProcessing && ctx.chemicalProcessing !== 'No, fully natural';
      response += `With ${ctx.hairType} hair${isHighPorosity ? ' that\'s been chemically processed' : ''}, ${isHighPorosity ? 'your hair is likely higher porosity, so heavier creams and butters sealed with oil work well' : 'focus on lightweight products that won\'t weigh your curls down'}.\n\n`;
    }

    response += 'If you\'re experiencing specific issues like itching, flaking, or breakage, let me know and I can give more targeted suggestions.';
    return response;
  }

  // Breakage
  if (lower.includes('break') || lower.includes('brittle') || lower.includes('snap') || lower.includes('dry')) {
    let response = 'Hair breaks for a few different reasons, and the fix depends on which one you\'re dealing with:\n\n';

    if (ctx.chemicalProcessing && ctx.chemicalProcessing !== 'No, fully natural') {
      response += `Since your hair has been chemically processed${ctx.lastChemicalTreatment ? ` (last treated ${ctx.lastChemicalTreatment.toLowerCase()})` : ''}, the internal structure may be weakened. **Bond repair treatments** like K18 or Olaplex can help restore some of that strength.\n\n`;
    }

    if (ctx.baselineHairHealth && ctx.baselineHairHealth.includes('dry')) {
      response += `You mentioned dryness during your baseline assessment, which suggests a **moisture deficit**. Deep conditioning and sealing with an oil or butter can help.\n\n`;
    }

    response += '- **Mechanical breakage** — from tight styling or rough handling. Fix: gentler detangling, satin accessories.\n';
    response += '- **Moisture deficit** — hair feels dry and snaps. Fix: deep conditioning, leave-in conditioner.\n';
    response += '- **Protein deficit** — hair feels mushy and stretchy when wet. Fix: protein treatment.\n';
    response += '- **Heat damage** — unfortunately permanent. Damaged sections need to be trimmed.\n\n';
    response += 'If your hair snaps when you gently stretch it, you need moisture. If it stretches and doesn\'t bounce back, you need protein.';
    return response;
  }

  // Off-topic
  if (!lower.includes('hair') && !lower.includes('scalp') && !lower.includes('itch') && !lower.includes('style') && !lower.includes('braid') && !lower.includes('wash') && !lower.includes('shed') && !lower.includes('break') && !lower.includes('product') && !lower.includes('grow') && !lower.includes('thin') && !lower.includes('edge') && !lower.includes('dandruff') && !lower.includes('flak') && !lower.includes('curl') && !lower.includes('loc') && !lower.includes('wig')) {
    return 'I\'m best at scalp and hair health questions — that\'s where I can give you the most helpful, personalised advice. Is there something about your hair or scalp I can help with?';
  }

  // Default personalised response
  let response = 'That\'s a great question! ';

  if (ctx.hairType) {
    response += `With your ${ctx.hairType} hair type, `;
  }

  response += 'here are some general principles for healthy hair and scalp:\n\n';
  response += '- **Listen to your scalp** — symptoms like persistent itching, tenderness, or flaking are worth investigating\n';
  response += '- **Track patterns** — your regular check-ins help spot trends that might be hard to notice day to day\n';
  response += '- **Be gentle** — less tension and manipulation is usually better\n';
  response += '- **Stay consistent** — a simple, regular routine is often more effective than complex treatments\n\n';

  if (ctx.goals.length > 0) {
    response += `Since your goals include ${ctx.goals[0].toLowerCase()}, your check-ins are designed to track what matters most to you.\n\n`;
  }

  response += 'Can you tell me more specifically what you\'d like to know? The more specific your question, the more helpful I can be.';
  return response;
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { onboardingData, currentCheckIn, healthProfile, baselineRisk, history } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Build user context from app state
  const userContext: UserContext = {
    gender: onboardingData.gender,
    hairType: onboardingData.hairType,
    chemicalProcessing: onboardingData.chemicalProcessing,
    lastChemicalTreatment: onboardingData.lastChemicalTreatment,
    styles: onboardingData.protectiveStyles,
    cycleLength: onboardingData.cycleLength,
    washFrequency: onboardingData.washFrequency || onboardingData.wornOutWashFrequency,
    betweenWashCare: onboardingData.betweenWashCare,
    scalpProducts: onboardingData.scalpProducts,
    hairProducts: onboardingData.hairProducts,
    goals: onboardingData.goals,
    baselineItch: onboardingData.baselineItch,
    baselineTenderness: onboardingData.baselineTenderness,
    baselineHairline: onboardingData.baselineHairline,
    baselineHairHealth: onboardingData.baselineHairHealth,
    lastCheckInRisk: currentCheckIn ? 'Completed' : baselineRisk || 'No check-ins yet',
    medicalConditions: healthProfile.medicalConditions,
    teTriggers: healthProfile.recentStressors,
    menstrualTracking: onboardingData.menstrualTracking,
    isWornOutOnly: onboardingData.isWornOutOnly,
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    // Generate context-aware response
    setTimeout(() => {
      const response = buildContextAwareResponse(text, userContext, updatedMessages);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const followUps = lastAssistantMessage ? getFollowUps(lastAssistantMessage.content) : [];
  const checkInSuggestion = lastAssistantMessage ? shouldSuggestCheckIn(lastAssistantMessage.content) : false;
  const learnLink = lastAssistantMessage ? shouldLinkLearn(lastAssistantMessage.content) : { show: false, topic: '' };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-semibold text-foreground">Ask ScalpSense</h1>
          <p className="text-sm text-muted-foreground">Your personal scalp and hair health guide</p>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
              <div className="card-elevated p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf size={16} className="text-primary" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Hi! I'm here to help with your scalp and hair health questions. I'm not a doctor, but I'm grounded in clinical evidence and I know your profile.
                    </p>
                    {onboardingData.hairType && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {onboardingData.hairType} hair · {onboardingData.protectiveStyles.slice(0, 2).join(', ') || 'No styles set'}{onboardingData.goals.length > 0 ? ` · Goal: ${onboardingData.goals[0].toLowerCase()}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 font-medium">Try asking...</p>
              <div className="space-y-2">
                {suggestedQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left card-elevated p-3.5 flex items-center gap-3 btn-press"
                  >
                    <span className="text-sm text-foreground">{q}</span>
                    <ArrowRight size={14} className="text-muted-foreground ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 pt-2">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="card-elevated rounded-2xl rounded-bl-md px-4 py-3 max-w-[90%]">
                        <div className="prose prose-sm text-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2 [&_li]:text-sm [&_strong]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:my-1 [&_ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' && idx === messages.length - 1 && (
                    <div className="mt-3 space-y-2">
                      {checkInSuggestion && (
                        <div className="card-elevated p-3 border-l-4 border-l-primary">
                          <p className="text-xs text-muted-foreground mb-2">Based on what you're describing, it might be worth doing a check-in.</p>
                          <button
                            onClick={() => navigate('/wash-day')}
                            className="text-xs font-medium text-primary flex items-center gap-1"
                          >
                            Start a check-in <ArrowRight size={12} />
                          </button>
                        </div>
                      )}

                      {learnLink.show && (
                        <button
                          onClick={() => navigate('/learn')}
                          className="text-xs text-primary font-medium flex items-center gap-1"
                        >
                          Read more in Learn → {learnLink.topic}
                        </button>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {followUps.slice(0, 3).map(q => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="px-3 py-2 rounded-xl border-2 border-primary/30 text-xs font-medium text-primary bg-card btn-press"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="card-elevated rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-6 pb-24 pt-2 bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about your scalp or hair..."
                className="w-full h-12 pl-4 pr-12 rounded-2xl border-2 border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                disabled={isTyping}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                aria-label="Voice input (coming soon)"
              >
                <Mic size={18} strokeWidth={1.8} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center btn-press transition-colors ${
                inputValue.trim() && !isTyping
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-border text-muted-foreground'
              }`}
            >
              <Send size={18} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
