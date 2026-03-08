import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ArrowRight, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

const starterQuestions: Record<string, string[]> = {
  default: [
    "My scalp has been really itchy lately",
    "I'm worried about my edges thinning",
    "How often should I wash in a protective style?",
    "What should I eat for healthier hair?",
  ],
  green: ["What does a green result mean?", "How do I maintain a healthy scalp?", "When is my next check-in?"],
  amber: ["Should I be worried?", "What can I do before my next wash day?", "Should I see someone about this?"],
  red: ["How do I find a specialist?", "What does this mean for my hair?", "Is this reversible?"],
  history: ["What are my trends showing?", "Am I getting better or worse?", "What changed since last cycle?"],
  learn: ["Tell me more about this topic", "Does this apply to me?", "What should I do about this?"],
};

const matchResponse = (userMessage: string): { text: string; suggestions: string[] } => {
  const lower = userMessage.toLowerCase();
  if (lower.includes('itch') || lower.includes('itchy')) return { text: "Itching under a protective style is really common, especially from week 2 onwards. Sweat, product buildup, and reduced washing all contribute.\n\nTry a scalp refresh spray or diluted apple cider vinegar rinse between washes. If the itching is constant or comes with soreness, that's worth flagging at your next check-in.", suggestions: ["Could this be seborrheic dermatitis?", "Best way to cleanse under braids?", "When is itching a red flag?"] };
  if (lower.includes('edge') || lower.includes('hairline') || lower.includes('thinning')) return { text: "Hairline thinning is one of the earliest signs of traction alopecia. The good news is it's reversible if caught early.\n\nReduce tension on those areas. If your current style is pulling, loosen the front or remove it. Give your edges a break between installations.", suggestions: ["Can my edges grow back?", "How do I know if it's traction?", "Should I stop wearing braids?"] };
  if (lower.includes('wash') || lower.includes('cleanse')) return { text: "If you're in braids or twists for 4+ weeks, aim to cleanse your scalp at least every 2 weeks. Dilute a gentle shampoo, apply directly to the scalp between braids, massage gently, and rinse.", suggestions: ["Can I just use water?", "Best way to dry after washing?", "What about co-washing?"] };
  if (lower.includes('green result') || lower.includes('green mean')) return { text: "A green result means your scalp and hair are looking healthy based on your check-in responses. No concerning patterns detected. Keep up your current routine!", suggestions: ["How do I maintain this?", "When is my next check-in?", "What should I watch for?"] };
  if (lower.includes('worried') || lower.includes('should i be')) return { text: "If you're seeing amber results, it means there are some patterns worth monitoring but nothing urgent. Keep tracking consistently — FolliSense will help you spot whether things are improving or getting worse over time.", suggestions: ["What can I do right now?", "Should I change my routine?", "When should I see someone?"] };
  if (lower.includes('specialist') || lower.includes('find')) return { text: "A trichologist specialises in hair and scalp conditions — they're the best first step. A dermatologist can investigate further. Your GP can run blood tests and refer you. We're building a directory of professionals who understand textured hair.", suggestions: ["What's the difference?", "How much does it cost?", "Can I do anything at home first?"] };
  if (lower.includes('trend') || lower.includes('better') || lower.includes('worse')) return { text: "Based on your check-in history, I can see some patterns forming. Your itch levels have been stable, but your hairline scores have trended slightly upward. Keeping up with regular check-ins will help us track this more accurately.", suggestions: ["What causes hairline thinning?", "Should I change my style?", "How long until I see improvement?"] };
  if (!lower.match(/hair|scalp|itch|style|braid|wash|shed|break|product|grow|thin|edge|dandruff|curl|loc|wig|wave|barber|routine|moisture|protein|dry|bump/)) return { text: "I'm best with scalp and hair questions — is there something about your hair I can help with?", suggestions: ["My scalp has been itchy", "I'm worried about thinning", "Help me build a routine"] };
  return { text: "Could you tell me a bit more about what you're experiencing? For example: are you dealing with a scalp issue, a hair concern, or looking for routine advice?", suggestions: ["My scalp has been itchy", "I'm worried about thinning", "Help me build a routine"] };
};

const FloatingChat = () => {
  const location = useLocation();
  const { userName } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipShown, setTooltipShown] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on auth/onboarding/checkin/stylist screens
  const hiddenPaths = ['/', '/signup', '/login', '/forgot-password', '/onboarding', '/mid-cycle', '/wash-day', '/stylist'];
  const shouldHide = hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith('/stylist'));
  
  // Show tooltip on first Home visit
  useEffect(() => {
    if (location.pathname === '/home' && !tooltipShown && !isOpen) {
      const timer = setTimeout(() => { setShowTooltip(true); setTooltipShown(true); }, 1500);
      const dismiss = setTimeout(() => setShowTooltip(false), 6500);
      return () => { clearTimeout(timer); clearTimeout(dismiss); };
    }
  }, [location.pathname, tooltipShown, isOpen]);

  useEffect(() => { if (!hasPulsed) { const t = setTimeout(() => setHasPulsed(true), 3000); return () => clearTimeout(t); } }, [hasPulsed]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  // Contextual suggestions based on route
  const getSuggestions = (): string[] => {
    const path = location.pathname;
    if (path === '/results') {
      const params = new URLSearchParams(location.search);
      const risk = params.get('risk');
      if (risk === 'green') return starterQuestions.green;
      if (risk === 'red') return starterQuestions.red;
      return starterQuestions.amber;
    }
    if (path === '/history') return starterQuestions.history;
    if (path === '/learn') return starterQuestions.learn;
    return starterQuestions.default;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const { text: responseText, suggestions } = matchResponse(text);
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: responseText, suggestions }]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-[148px] right-6 z-50 max-w-[220px]"
            onClick={() => setShowTooltip(false)}
          >
            <div className="bg-card rounded-2xl p-3.5 shadow-lg border border-border">
              <p className="text-sm text-foreground">Hi {userName || 'there'}, ask me anything about your scalp or hair</p>
            </div>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => { setIsOpen(true); setShowTooltip(false); }}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'hsl(155, 12%, 55%)', boxShadow: '0 4px 12px rgba(45,45,45,0.15)' }}
        initial={!hasPulsed ? { scale: 1 } : false}
        animate={!hasPulsed ? { scale: [1, 1.1, 1, 1.1, 1] } : { scale: 1 }}
        transition={!hasPulsed ? { duration: 2, ease: 'easeInOut' } : {}}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={24} className="text-white" strokeWidth={1.8} />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/30 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center"
            >
              <div className="bg-card rounded-t-3xl w-full max-w-[430px] flex flex-col" style={{ height: '85vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Leaf size={18} className="text-primary" strokeWidth={1.8} />
                    <h3 className="font-semibold text-foreground">FolliSense Chat</h3>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1"><X size={22} className="text-muted-foreground" strokeWidth={1.8} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {messages.length === 0 ? (
                    <div>
                      <div className="card-elevated p-4 mb-5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Leaf size={16} className="text-primary" strokeWidth={1.8} />
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            Hi! I'm here to help with your scalp and hair health questions. I'm not a doctor, but I'm grounded in clinical evidence and I know your profile.
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 font-medium">Try asking...</p>
                      <div className="space-y-2">
                        {getSuggestions().map(q => (
                          <button key={q} onClick={() => sendMessage(q)} className="w-full text-left card-elevated p-3.5 flex items-center gap-3 btn-press">
                            <span className="text-sm text-foreground">{q}</span>
                            <ArrowRight size={14} className="text-muted-foreground ml-auto flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          {msg.role === 'user' ? (
                            <div className="flex justify-end">
                              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="card-elevated rounded-2xl rounded-bl-md px-4 py-3 max-w-[90%]">
                                <div className="prose prose-sm text-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                          {msg.role === 'assistant' && idx === messages.length - 1 && msg.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.suggestions.slice(0, 3).map(q => (
                                <button key={q} onClick={() => sendMessage(q)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground btn-press">{q}</button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="card-elevated rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                              {[0, 1, 2].map(i => (<motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={e => { e.preventDefault(); sendMessage(inputValue); }} className="px-6 py-4 border-t border-border">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Ask about your scalp or hair..."
                      className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <button type="submit" disabled={!inputValue.trim()} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${inputValue.trim() ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
                      <Send size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
