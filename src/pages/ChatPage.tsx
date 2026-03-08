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
  suggestions?: string[];
}

const starterQuestions = [
  "My scalp has been really itchy lately",
  "I'm worried about my edges thinning",
  "How often should I wash in a protective style?",
  "What should I eat for healthier hair?",
];

const shouldSuggestCheckIn = (content: string): boolean => {
  const lower = content.toLowerCase();
  return lower.includes('concerned') || lower.includes('worried') || lower.includes('getting worse') || lower.includes('significant') || lower.includes('professional') || lower.includes('trichologist') || lower.includes('dermatologist');
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

interface MatchedResponse {
  text: string;
  suggestions: string[];
}

const matchResponse = (userMessage: string): MatchedResponse => {
  const lower = userMessage.toLowerCase();

  if (lower.includes('itch') || lower.includes('itchy') || lower.includes('itching')) {
    return {
      text: "Itching under a protective style is really common, especially from week 2 onwards. Sweat, product buildup, and reduced washing all contribute. The key question is whether it's mild and manageable or getting worse over time.\n\nTry a scalp refresh spray or diluted apple cider vinegar rinse between washes. If the itching is constant or comes with soreness, that's worth flagging at your next check-in.",
      suggestions: ["Could this be seborrheic dermatitis?", "Best way to cleanse under braids?", "When is itching a red flag?"],
    };
  }

  if (lower.includes('edge') || lower.includes('hairline') || lower.includes('thinning')) {
    return {
      text: "Hairline thinning is one of the earliest signs of traction alopecia, which happens when styles pull too tightly on the follicles around your temples and edges. The good news is it's reversible if caught early.\n\nThe most important thing right now: reduce tension on those areas. If your current style is pulling, loosen the front or remove it. Give your edges a break between installations. If you've noticed progressive thinning over several months, a trichologist can assess whether the follicles are still active.",
      suggestions: ["Can my edges grow back?", "How do I know if it's traction?", "Should I stop wearing braids?"],
    };
  }

  if (lower.includes('breakage') || lower.includes('breaking')) {
    return {
      text: "Breakage happens for a few different reasons and the fix depends on the cause. If your hair is snapping and feels dry and brittle, it's probably a moisture issue. Deep condition and seal with a butter or cream. If it feels mushy or stretchy when wet, you might need protein. If the breakage is concentrated where your style grips, that's mechanical damage from tension.\n\nCheck where it's breaking: at the ends (normal wear), along the length (moisture or protein issue), or at the root (tension problem).",
      suggestions: ["Moisture vs protein: how to tell?", "Best deep conditioner for breakage?", "Is root breakage serious?"],
    };
  }

  if (lower.includes('wash') || lower.includes('cleanse') || lower.includes('shampoo')) {
    return {
      text: "How often to wash depends on your style and your scalp. If you're in braids or twists for 4+ weeks, aim to cleanse your scalp at least every 2 weeks. You don't need to do a full wash.\n\nDilute a gentle shampoo, apply it directly to the scalp between braids, massage gently, and rinse. Some people use a scalp applicator bottle to get product directly to the scalp without disturbing the style. The goal is removing buildup without unravelling your installation.",
      suggestions: ["Can I just use water?", "Best way to dry after washing?", "What about co-washing?"],
    };
  }

  if (lower.includes('shedding') || lower.includes('hair loss') || lower.includes('losing hair') || lower.includes('falling out')) {
    return {
      text: "First, let's separate shedding from breakage. Shedding is full strands falling from the root — with a small white bulb at the end. That's your hair's natural cycle and 50–100 strands a day is normal.\n\nAfter a protective style, several weeks of shedding comes out at once during wash day, which looks alarming but is usually just accumulated normal shed. If you're seeing significantly more than usual, or if it's happening outside of wash day, it could be telogen effluvium from stress, hormonal changes, or nutritional deficiency. Track it over your next 2–3 wash cycles to see if there's a pattern.",
      suggestions: ["Is this normal after braids?", "Could it be telogen effluvium?", "Should I get blood work done?"],
    };
  }

  if (lower.includes('dandruff') || lower.includes('flaking') || lower.includes('flakes')) {
    return {
      text: "Flaking has two main causes and they need different treatments. Dandruff (seborrheic dermatitis) produces oily, yellowish flakes and is caused by yeast overgrowth. It responds to antifungal shampoos like ketoconazole or zinc pyrithione.\n\nDry scalp produces smaller, white, dry flakes and needs gentle moisturising and less frequent washing. Under protective styles, buildup from products can also look like flaking but is actually residue. If you're not sure which you have, try a medicated shampoo for 2–3 washes. If it helps, it was dandruff. If not, focus on hydration.",
      suggestions: ["How to treat under braids?", "Is dandruff worse in winter?", "Could it be psoriasis?"],
    };
  }

  if (lower.includes('oil') || lower.includes('oils') || lower.includes('castor')) {
    return {
      text: "This might be an unpopular opinion, but most scalp oils have very limited clinical evidence behind them. Heavy oils like castor oil can actually clog follicles and worsen buildup, especially under protective styles where the scalp isn't being regularly cleansed.\n\nThe two with some research support are rosemary oil and peppermint oil — both diluted — and the evidence is still modest. If you're using oil on your scalp and it feels good, keep it light and infrequent. But if you're dealing with a scalp issue, adding oil is often not the answer and can make things worse.",
      suggestions: ["What about rosemary oil specifically?", "What should I use instead?", "Can oil clog hair follicles?"],
    };
  }

  if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('eat') || lower.includes('food') || lower.includes('vitamin')) {
    return {
      text: "Your hair is built from protein and fuelled by nutrients delivered through your blood supply to the follicle. The big ones for hair health: iron (carries oxygen to follicles — low iron is a top cause of shedding in women), vitamin D (low levels linked to hair loss, common in people with darker skin), zinc (supports growth and repair), B12 (essential for the red blood cells that feed follicles), and protein itself.\n\nBefore buying supplements, get a blood test. Supplements fix deficiencies but they don't override genetics, hormones, or mechanical damage.",
      suggestions: ["Should I take biotin?", "Best foods for hair growth?", "How do I get tested?"],
    };
  }

  if (lower.includes('exercise') || lower.includes('sweat') || lower.includes('gym') || lower.includes('workout')) {
    return {
      text: "Sweat itself isn't harmful to your scalp. The problem is when sweat mixes with product and buildup and sits under a style for days or weeks. You don't need to wash after every workout.\n\nQuick options: a scalp refresh spray, blotting with a microfibre cloth, or a water-only rinse focusing on the scalp. If you exercise daily and wear protective styles, consider a mid-cycle scalp cleanse to prevent irritation from accumulated sweat.",
      suggestions: ["Best scalp spray after gym?", "Should I avoid working out in braids?", "Sweat causing bumps on scalp?"],
    };
  }

  if (lower.includes('locs') || lower.includes('dreadlocks') || lower.includes('retwist')) {
    return {
      text: "The most common scalp issue with locs is traction from retwists that are too tight. Your retwist should never hurt. If it does, your loctician is going too tight and that's damaging your follicles, especially along the hairline and part lines.\n\nYou can and should wash your scalp with locs. Diluted shampoo or a scalp-specific cleanser applied between locs works well. Avoid heavy waxes or products that create buildup at the root. And give your loc line some breathing room — consistently tight retwists in the same spots will cause thinning over time.",
      suggestions: ["How often should I retwist?", "Best way to wash with locs?", "Thinning at my part line"],
    };
  }

  if (lower.includes('durag') || lower.includes('waves') || lower.includes('wave cap')) {
    return {
      text: "Durags and wave caps work by compressing your hair to train the curl pattern. That compression — especially if it's tight and worn for long hours every day — applies constant low-level tension to your hairline.\n\nIf you're noticing your temples looking thinner, the durag might be contributing. Try loosening the tie so there's less pressure on the hairline. Give your scalp a break from compression for a few hours each day. And if you're seeing consistent recession, it's worth getting assessed — because catching it early makes the difference between reversible and permanent.",
      suggestions: ["How tight is too tight?", "Am I losing hair from my durag?", "Waves vs hairline health"],
    };
  }

  // Off-topic check
  if (!lower.match(/hair|scalp|itch|style|braid|wash|shed|break|product|grow|thin|edge|dandruff|flak|curl|loc|wig|wave|barber|routine|moisture|protein|dry|brittle|bump|follicle/)) {
    return {
      text: "I'm best with scalp and hair questions — is there something about your hair I can help with?",
      suggestions: ["My scalp has been itchy", "I'm worried about thinning", "Help me build a routine"],
    };
  }

  // Default
  return {
    text: "I'm not sure I have a specific answer for that, but I'd love to help. Could you tell me a bit more about what you're experiencing? For example: are you dealing with a scalp issue like itching or tenderness, a hair concern like breakage or thinning, or looking for advice on your routine?",
    suggestions: ["My scalp has been itchy", "I'm worried about thinning", "Help me build a routine"],
  };
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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      // Build context from previous messages for follow-up awareness
      const prevMessages = [...messages, userMsg];
      const lastAssistant = [...prevMessages].reverse().find(m => m.role === 'assistant');
      const lastUserBefore = prevMessages.filter(m => m.role === 'user').slice(-2, -1)[0];
      
      let { text: responseText, suggestions } = matchResponse(text);
      
      // If this is a follow-up, reference previous context
      if (lastAssistant && lastUserBefore) {
        const prevTopic = lastUserBefore.content.toLowerCase();
        const currentTopic = text.toLowerCase();
        const isFollowUp = prevMessages.length >= 3;
        
        if (isFollowUp) {
          // Add contextual prefix referencing what they previously said
          if (prevTopic.includes('itch') && (currentTopic.includes('worse') || currentTopic.includes('still'))) {
            responseText = `Since you mentioned itching earlier — if it's persisting or getting worse, that's a signal worth paying attention to.\n\n${responseText}`;
          } else if (prevTopic.includes('edge') && currentTopic.includes('grow')) {
            responseText = `Building on what we discussed about your edges — ${responseText}`;
          } else if (prevTopic.includes('shed') && currentTopic.includes('normal')) {
            responseText = `Given what you told me about your shedding — ${responseText}`;
          } else if (isFollowUp && !currentTopic.match(/^(my scalp|i'm worried|how often)/)) {
            // Generic follow-up awareness
            responseText = `Good follow-up question. ${responseText}`;
          }
        }
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        suggestions,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const checkInSuggestion = lastAssistantMessage ? shouldSuggestCheckIn(lastAssistantMessage.content) : false;
  const learnLink = lastAssistantMessage ? shouldLinkLearn(lastAssistantMessage.content) : { show: false, topic: '' };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[430px] mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-xl font-semibold text-foreground">Ask FolliSense</h1>
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
                {starterQuestions.map(q => (
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

                      {/* Dynamic follow-up suggestion chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.suggestions.slice(0, 3).map(q => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              className="px-3 py-2 rounded-xl border-2 border-primary/30 text-xs font-medium text-primary bg-card btn-press"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
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
