import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowRight, Leaf, Scissors } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabaseClient';
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const starterQuestions = [
  "Clent Experiencing Itchy Sclap?",
  "Dandruff Issues",
  "What should i recommend for a client with Scalp Sores",
  "What should client observe for longer healthier hair",
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const StylistChatPage = () => {
  const { userName } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSession = useMutation(api.chat.createSession);
  const sendMessageAction = useAction(api.chatAction.sendMessage);
  const [sessionId, setSessionId] = useState<Id<"chatSessions"> | null>(null);

    // Fetch Supabase profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
  
  const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
  
  setUserProfile(profile);
     } catch (err) {
        console.error("Failed to load profile:", err);
        }
      };
  
      fetchUserProfile();
    }, []);
  
    // Create session
  useEffect(() => {
        const initSession = async () => {
          const id = await createSession({});
          setSessionId(id);
        };
        initSession();
      }, [createSession]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages, isTyping]);
    
    const displayName = userProfile?.full_name?.split(" ")[0] || userName || "there";
       
      
    const buildSystemPrompt = (): string => {
       return `You are Folli Pro — an expert, educational hair stylist and scalp care assistant for professional hairstylists.

 You are speaking with ${displayName}, a professional stylist.

  Supabase Profile:
- Name: ${userProfile?.full_name || 'User'}

Core Guidelines:
- Be highly educational, practical, and professional.
- Always explain "why" behind recommendations (science-based where possible, without diagnosing).
- Use clear, short paragraphs + bullet points for easy reading in a busy salon.
- Teach stylists how to educate their clients.
- Recommend safe salon practices, product types, and when to refer to a dermatologist/trichologist.
- Never give medical diagnoses. Always say "consult a dermatologist" when appropriate.
- Keep responses informative but concise (max 4-6 bullet points or short paragraphs).

Response Style:
- Start with empathy and understanding.
- Give clear, actionable advice.
- Use clear, short paragraphs + bullet points for easy reading in a busy salon.  
- Include educational tips the stylist can share with clients.
- End with 1-2 smart follow-up questions to gather more details.

Focus areas: scalp health, dandruff, dryness, buildup, thinning edges, protective styles, hair washing frequency, safe chemical services, client education, etc.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || !sessionId) return;

   const userMsg = { id: `user-${Date.now()}`, role: 'user' as const, content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

  
    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const fullMessages = [
        { role: "system" as const, content: buildSystemPrompt() },
        ...conversationHistory,
      ];

      const assistantText = await sendMessageAction({
        sessionId,
        messages: fullMessages,
      })

      setMessages(prev => [...prev, { 
        id: `assistant-${Date.now()}`, 
        role: 'assistant' as const, 
        content: assistantText 
      }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Simple Header */}
      <div className="p-4 border-b bg-violet-50 flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center">
          <Scissors className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold">Folli Pro</p>
          <p className="text-xs text-violet-600">Stylist Assistant</p>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center mt-20">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-primary" />
              </div>
            <p className="text-lg font-medium">Hello {displayName}!</p>
            <p className="text-sm text-gray-500 mt-2">Ask me anything about client scalp care or treatments.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" 
                  ? "bg-violet-600 text-white" 
                  : "bg-gray-100 text-gray-900"}`}>
                {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown>: msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about a client's scalp issue..."
            className="flex-1 h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
            disabled={isTyping}
          />
           <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StylistChatPage;     
       