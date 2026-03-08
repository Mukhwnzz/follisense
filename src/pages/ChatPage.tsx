import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, ArrowRight, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQuestions = [
  "Why are my edges thinning?",
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

const shouldLinkLearn = (content: string): { show: boolean; topic: string; } => {
  const lower = content.toLowerCase();
  if (lower.includes('traction alopecia')) return { show: true, topic: 'What is traction alopecia?' };
  if (lower.includes('telogen effluvium')) return { show: true, topic: 'Understanding telogen effluvium' };
  if (lower.includes('wash cycle') || lower.includes('wash day')) return { show: true, topic: 'Understanding your wash cycle' };
  if (lower.includes('professional') || lower.includes('specialist') || lower.includes('trichologist')) return { show: true, topic: 'When to see a professional' };
  return { show: false, topic: '' };
};

// Mock AI responses for prototype (will be replaced with real AI when Cloud is enabled)
const getMockResponse = (userMessage: string, context: { hairType: string; goals: string[] }): string => {
  const lower = userMessage.toLowerCase();

  if (lower.includes('edge') || lower.includes('hairline') || lower.includes('thinning')) {
    return `Edge thinning is one of the most common concerns for women with textured hair, and it's really good that you're paying attention to it.

The most common cause is **traction alopecia** — gradual hair loss caused by repeated tension on the hair follicles. This can happen from tight braids, ponytails, lace front wigs, or any style that pulls consistently on the hairline.

The good news? If caught early, traction alopecia is often **reversible**. Here are a few things that can help:

- **Reduce tension** around your edges — ask your stylist to keep the hairline loose
- **Avoid heavy edge control products** that can clog follicles
- **Give your hairline regular breaks** between installed styles
- **Try a lightweight scalp oil** (rosemary or castor) to support circulation

If you're noticing the thinning getting worse despite changes, it's worth speaking to a trichologist or dermatologist who can assess you in person.`;
  }

  if (lower.includes('shed') || lower.includes('hair loss') || lower.includes('falling out')) {
    return `Some shedding is completely normal — most people lose 50–100 hairs per day. With textured hair, especially in protective styles, you might not notice daily shedding, so it can seem like a lot comes out on wash day.

What matters is whether the amount has **changed significantly** from your normal. A few things that can increase temporary shedding:

- **Seasonal changes** — many people shed more in autumn
- **Hormonal shifts** — around your period, postpartum, or starting/stopping contraception
- **Stress** — physical or emotional stress can trigger telogen effluvium, a temporary increase in shedding
- **Nutritional deficiencies** — especially iron, vitamin D, and B12

${context.goals.some(g => g.includes('hair loss')) ? "Since understanding hair loss is one of your goals, tracking your shedding patterns at each check-in will help you spot trends over time.\n\n" : ""}If the shedding seems excessive or you're seeing patches, it's worth speaking to a trichologist or dermatologist who can assess you in person.`;
  }

  if (lower.includes('traction alopecia')) {
    return `**Traction alopecia** is hair loss caused by repeated pulling or tension on the hair. It's particularly common among women who regularly wear tight hairstyles like braids, cornrows, ponytails, or wigs.

**Key facts:**
- It affects up to **1 in 3 women** who regularly wear tight styles
- Early stages are **reversible** — the hair can grow back if the tension is removed
- Late stages can cause **permanent damage** to follicles, making regrowth difficult

**Warning signs to watch for:**
- Thinning or recession at the hairline, especially around temples
- Small bumps or pimples around the hairline
- Tenderness or soreness where the hair is pulled tight
- A widening part line

**What you can do:**
- Alternate between tighter and looser styles
- Ask your stylist to keep the hairline loose during installation
- Take breaks between installed styles
- Avoid re-tightening styles as they loosen

If you're concerned, it's worth speaking to a trichologist or dermatologist who can assess you in person.`;
  }

  if (lower.includes('wash') && (lower.includes('how often') || lower.includes('between') || lower.includes('look for'))) {
    return `Between wash days, your scalp is doing a lot of work — producing oil, shedding skin cells, and potentially reacting to products or tension from your style.

Here are some things to keep an eye on:

- **Itching** — occasional mild itch is normal, but persistent or worsening itching could signal buildup, dryness, or a reaction
- **Tenderness** — if your scalp hurts, especially around your hairline, your style might be too tight
- **Flaking** — light flakes can be normal buildup, but heavy flaking could indicate seborrheic dermatitis
- **Smell** — a musty or unusual smell can indicate bacterial or fungal buildup

${context.hairType ? `With your ${context.hairType} hair type, ` : ""}keeping your scalp clean between washes doesn't mean you need to fully wash — a scalp refresh spray or diluted apple cider vinegar rinse can help.

If you're concerned, it's worth speaking to a trichologist or dermatologist who can assess you in person.`;
  }

  // Default response
  return `That's a great question! While I can share general guidance about scalp and hair health, every person's situation is unique.

Based on what we know about textured hair care, here are some general principles:

- **Listen to your scalp** — symptoms like persistent itching, tenderness, or flaking are worth investigating
- **Track patterns** — your regular check-ins help spot trends that might be hard to notice day to day
- **Be gentle** — whether it's styling, washing, or detangling, less tension and manipulation is usually better
- **Stay consistent** — a simple, regular routine is often more effective than complex treatments

${context.goals.length > 0 ? `Since your goals include ${context.goals[0].toLowerCase()}, your check-ins are designed to track the things that matter most to you.\n\n` : ""}Is there something more specific about your scalp or hair health I can help with?

If you're concerned about any symptoms, it's worth speaking to a trichologist or dermatologist who can assess you in person.`;
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { onboardingData, currentCheckIn, healthProfile, baselineRisk } = useApp();
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

    // Simulate AI response delay
    setTimeout(() => {
      const response = getMockResponse(text, {
        hairType: onboardingData.hairType,
        goals: onboardingData.goals,
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
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
              {/* Welcome message */}
              <div className="card-elevated p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf size={16} className="text-primary" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Hi! I'm here to help with your scalp and hair health questions. I'm not a doctor, but I'm grounded in clinical evidence and I know your profile.
                  </p>
                </div>
              </div>

              {/* Suggested questions */}
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

                  {/* Show follow-ups, check-in suggestion, learn link after last assistant message */}
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

              {/* Typing indicator */}
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
