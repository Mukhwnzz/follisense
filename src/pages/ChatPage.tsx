import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mic, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';

const dm       = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', serif";

const C = {
  bg:         '#FAF8F5',
  surface:    '#F5F0EB',
  ink:        '#1C1C1C',
  gold:       '#C9A84C',
  goldDeep:   '#B8893E',
  goldLight:  '#E8C96A',
  gold10:     'rgba(201,168,76,0.10)',
  goldBorder: 'rgba(201,168,76,0.28)',
  mid:        '#EBEBEB',
  muted:      '#999999',
  warm:       '#666666',
  white:      '#FFFFFF',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const starterQuestions = [
  "My scalp has been really itchy lately",
  "I'm worried about my edges thinning",
  "How often should I wash in a protective style?",
  "What should I eat for healthier hair?",
];

const shouldSuggestCheckIn = (content: string) => {
  const lower = content.toLowerCase();
  return lower.includes('concerned') || lower.includes('worried') ||
    lower.includes('getting worse') || lower.includes('significant') ||
    lower.includes('professional') || lower.includes('trichologist') ||
    lower.includes('dermatologist');
};

const shouldLinkLearn = (content: string): { show: boolean; topic: string } => {
  const lower = content.toLowerCase();
  if (lower.includes('traction alopecia'))  return { show: true, topic: 'Traction alopecia: the basics' };
  if (lower.includes('telogen effluvium'))  return { show: true, topic: 'Telogen effluvium' };
  if (lower.includes('wash cycle') || lower.includes('wash day')) return { show: true, topic: 'Understanding your wash cycle' };
  if (lower.includes('professional') || lower.includes('trichologist')) return { show: true, topic: 'When to see a professional' };
  if (lower.includes('porosity'))           return { show: true, topic: 'Understanding hair porosity' };
  if (lower.includes('protein') || lower.includes('moisture balance')) return { show: true, topic: 'Protein-moisture balance' };
  return { show: false, topic: '' };
};

// ─── Foli Avatar ──────────────────────────────────────────────────────────────
const FoliAvatar = ({ size = 32 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: `linear-gradient(135deg, ${C.ink} 0%, #3A3020 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1.5px solid ${C.goldBorder}`,
  }}>
    <Sparkles size={size * 0.42} color={C.gold} strokeWidth={1.5} />
  </div>
);

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    onboardingData, currentCheckIn, healthProfile,
    baselineRisk, checkInHistory, userName,
  } = useApp();

  const [messages, setMessages]     = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Build Foli system prompt from full user profile ───────────────────────
  const buildSystemPrompt = () => {
    const isMale        = onboardingData.gender === 'man';
    const latestCheckIn = checkInHistory?.[0];
    const recentHistory = checkInHistory?.slice(0, 3) ?? [];

    return `You are Foli, FolliSense's AI scalp and hair health specialist. You speak like a trusted specialist who genuinely gets it — professional but warm, never clinical or generic.

PERSONALITY RULES — follow these strictly:
- Never say "As an AI", "Great question!", "Certainly!", "Absolutely!", or "I understand"
- Never give generic advice — every response must reference this user's specific profile
- Speak directly and warmly, like a knowledgeable friend who knows their hair
- Keep responses under 150 words unless the user asks for detail or a full routine
- Short paragraphs or 2–3 bullet points max — no walls of text
- Use plain language. Explain medical terms when you use them
- You never diagnose — use language like "this could be consistent with..." or "worth getting assessed"
- If a question is unrelated to scalp/hair health, gently redirect
- Always end with one clear action the user can take today
- Reference the user's actual data naturally (e.g. "Given that you're in braids..." or "Since you flagged itching as a concern...")

USER PROFILE:
- Name: ${userName || 'there'}
- Gender: ${onboardingData.gender || 'not specified'}
- Hair type: ${onboardingData.hairType || 'not set'}
- Current/usual styles: ${onboardingData.protectiveStyles?.join(', ') || 'not set'}
- Chemical processing: ${onboardingData.chemicalProcessing || 'not set'}
- Wash frequency: ${onboardingData.washFrequency || onboardingData.washFrequencyPerCycle || 'not set'}
- Between-wash care: ${onboardingData.betweenWashCare?.join(', ') || 'not set'}
- Scalp products: ${onboardingData.scalpProducts?.filter((p: string) => p !== 'None').join(', ') || 'none logged'}
- Hair products: ${onboardingData.hairProducts?.filter((p: string) => p !== 'None').join(', ') || 'none logged'}
- Goals: ${onboardingData.goals?.join(', ') || 'not set'}
${isMale
  ? `- Barber frequency: ${onboardingData.barberFrequency || 'not set'}`
  : `- Menstrual tracking: ${onboardingData.menstrualTracking || 'off'}`}

RECENT CHECK-IN DATA:
${latestCheckIn ? `- Latest check-in: ${latestCheckIn.date}
  • Itch: ${latestCheckIn.itch || 'not recorded'}
  • Tenderness: ${latestCheckIn.tenderness || 'not recorded'}
  • Hairline: ${latestCheckIn.hairline || 'not recorded'}
  • Hair concern: ${latestCheckIn.hairConcern || 'not recorded'}
  • Overall risk: ${baselineRisk || 'not assessed'}` : '- No check-in data recorded yet'}
${recentHistory.length > 1
  ? `- Previous check-ins: ${recentHistory.slice(1).map((c: any) => `${c.date} (risk: ${baselineRisk || 'unknown'})`).join(', ')}`
  : ''}

HEALTH CONTEXT:
${healthProfile?.medicalConditions?.length > 0 ? `- Medical conditions: ${healthProfile.medicalConditions.join(', ')}` : ''}
${healthProfile?.medications ? `- Medications: ${healthProfile.medications}` : ''}
${healthProfile?.previousHairLoss ? `- Previous hair loss: ${healthProfile.previousHairLoss}` : ''}
${healthProfile?.familyHistory ? `- Family history: ${healthProfile.familyHistory}` : ''}`;
  };

  // ── Call Anthropic API ────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: conversationHistory,
        }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);

      const data = await response.json();
      const assistantText = data.content?.find((b: any) => b.type === 'text')?.text
        ?? "Sorry, I didn't get a response. Please try again.";

      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const lastAssistantMsg  = [...messages].reverse().find(m => m.role === 'assistant');
  const checkInSuggestion = lastAssistantMsg ? shouldSuggestCheckIn(lastAssistantMsg.content) : false;
  const learnLink         = lastAssistantMsg ? shouldLinkLearn(lastAssistantMsg.content) : { show: false, topic: '' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: dm, display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        input::placeholder { color: #BBBBBB; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ padding: '52px 20px 16px', borderBottom: `1px solid ${C.mid}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <FoliAvatar size={36} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: C.ink }}>Foli</span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', background: C.gold10,
                  border: `1px solid ${C.goldBorder}`, borderRadius: 100,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold }} />
                  <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: C.goldDeep, letterSpacing: '0.04em' }}>AI</span>
                </div>
              </div>
              <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: 0 }}>FolliSense scalp specialist</p>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 8px' }}>
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

              {/* Intro card */}
              <div style={{
                background: C.white, border: `1.5px solid ${C.mid}`,
                borderRadius: 20, padding: '16px 18px', marginBottom: 20,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FoliAvatar size={34} />
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 13, color: C.ink, lineHeight: 1.6, margin: '0 0 6px' }}>
                      Hey{userName ? ` ${userName}` : ''}! Ask me anything about your scalp and hair — I know your profile and I'll give you a straight answer.
                    </p>
                    {onboardingData.hairType && (
                      <p style={{ fontFamily: dm, fontSize: 11, color: C.muted, margin: 0 }}>
                        {onboardingData.hairType} hair
                        {onboardingData.protectiveStyles?.length > 0 ? ` · ${onboardingData.protectiveStyles.slice(0, 2).join(', ')}` : ''}
                        {onboardingData.goals?.length > 0 ? ` · ${onboardingData.goals[0].toLowerCase()}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10 }}>
                Try asking…
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {starterQuestions.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    width: '100%', textAlign: 'left',
                    background: C.white, border: `1.5px solid ${C.mid}`,
                    borderRadius: 16, padding: '13px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', fontFamily: dm,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'border 0.15s, background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${C.goldBorder}`; e.currentTarget.style.background = C.gold10; }}
                    onMouseLeave={e => { e.currentTarget.style.border = `1.5px solid ${C.mid}`; e.currentTarget.style.background = C.white; }}
                  >
                    <span style={{ fontFamily: dm, fontSize: 13, color: C.ink, flex: 1 }}>{q}</span>
                    <ArrowRight size={14} color={C.muted} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, idx) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

                  {msg.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        background: C.ink, color: '#F5F5F5',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '12px 16px', maxWidth: '85%',
                        fontFamily: dm, fontSize: 13, lineHeight: 1.55,
                        boxShadow: '0 2px 8px rgba(28,28,28,0.15)',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10, alignItems: 'flex-end' }}>
                      <FoliAvatar size={28} />
                      <div style={{
                        background: C.white, border: `1.5px solid ${C.mid}`,
                        borderRadius: '18px 18px 18px 4px',
                        padding: '12px 16px', maxWidth: '85%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}>
                        <div style={{ fontFamily: dm, fontSize: 13, color: C.ink, lineHeight: 1.65 }}>
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p style={{ margin: '0 0 8px', fontFamily: dm, fontSize: 13, color: C.ink, lineHeight: 1.65 }}>{children}</p>,
                              strong: ({ children }) => <strong style={{ fontWeight: 600, color: C.ink }}>{children}</strong>,
                              ul: ({ children }) => <ul style={{ margin: '4px 0 8px', paddingLeft: 18 }}>{children}</ul>,
                              li: ({ children }) => <li style={{ fontFamily: dm, fontSize: 13, color: C.ink, marginBottom: 3 }}>{children}</li>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart CTAs after last assistant message */}
                  {msg.role === 'assistant' && idx === messages.length - 1 && (
                    <div style={{ marginTop: 10, marginLeft: 38, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {checkInSuggestion && (
                        <div style={{
                          background: C.gold10, border: `1.5px solid ${C.goldBorder}`,
                          borderLeft: `3px solid ${C.gold}`,
                          borderRadius: 14, padding: '12px 14px',
                        }}>
                          <p style={{ fontFamily: dm, fontSize: 12, color: C.warm, margin: '0 0 6px', lineHeight: 1.5 }}>
                            Based on what you're describing, it might be worth doing a check-in.
                          </p>
                          <button onClick={() => navigate('/wash-day')} style={{
                            fontFamily: dm, fontSize: 12, fontWeight: 700,
                            color: C.goldDeep, background: 'none', border: 'none',
                            cursor: 'pointer', padding: 0,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            Start a check-in <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                      {learnLink.show && (
                        <button onClick={() => navigate('/learn')} style={{
                          fontFamily: dm, fontSize: 12, fontWeight: 700,
                          color: C.goldDeep, background: 'none', border: 'none',
                          cursor: 'pointer', padding: '4px 0', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          Read more → {learnLink.topic}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}
                >
                  <FoliAvatar size={28} />
                  <div style={{
                    background: C.white, border: `1.5px solid ${C.mid}`,
                    borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay }}
                          style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(176,80,64,0.08)', border: '1px solid rgba(176,80,64,0.2)',
                }}>
                  <AlertCircle size={14} color="#B05040" style={{ flexShrink: 0 }} />
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#B05040', margin: 0 }}>{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div style={{ padding: '12px 20px 90px', background: C.bg, borderTop: `1px solid ${C.mid}`, flexShrink: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask Foli anything…"
                disabled={isTyping}
                style={{
                  width: '100%', height: 48, paddingLeft: 16, paddingRight: 48,
                  borderRadius: 16, border: `1.5px solid ${C.mid}`,
                  background: C.surface, fontFamily: dm, fontSize: 13, color: C.ink,
                  outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s',
                }}
                onFocus={e => (e.target.style.border = `1.5px solid ${C.goldBorder}`)}
                onBlur={e => (e.target.style.border = `1.5px solid ${C.mid}`)}
              />
              <button type="button" style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex',
              }}>
                <Mic size={18} strokeWidth={1.8} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              style={{
                width: 48, height: 48, borderRadius: 16, border: 'none',
                background: inputValue.trim() && !isTyping ? C.ink : C.mid,
                color: inputValue.trim() && !isTyping ? '#F5F5F5' : C.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <Send size={18} strokeWidth={1.8} />
            </button>
          </form>
          <p style={{ fontFamily: dm, fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 8 }}>
            Foli is an AI — always check with a trichologist for medical concerns
          </p>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;