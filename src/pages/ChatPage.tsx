import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowRight, Leaf, Scissors, Paperclip } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabaseClient';
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const starterQuestions = [
  "My scalp has been really itchy lately",
  "I'm worried about my edges thinning",
  "How often should I wash in a protective style?",
  "What should I eat for healthier hair?",
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ConsumerProfile {
  hair_texture?: string;
  current_styles?: string[];
  protective_style_frequency?: string;
  style_duration?: string;
  top_concerns?: string[];
  chemical_processing?: string;
}

interface Checkin {
  type?: string;
  symptoms?: Record<string,  string | number | boolean>;
  triage_result?: string;
  notes?: string;
}

interface UserProfile {
  full_name?: string;
  age?: number | string;
  gender?: string;
  scalp_type?: string;
  hair_type?: string;
  hair_concerns?: string;
  concerns?: string;

  consumer?: ConsumerProfile;
  checkin?: Checkin;
}

const ChatPage = () => {
  const { userName } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSession = useMutation(api.chat.createSession);
  const sendMessageAction = useAction(api.chatAction.sendMessage);
  const [sessionId, setSessionId] = useState<Id<"chatSessions"> | null>(null);

const generateUploadUrl = useMutation(api.files.generateUploadUrl);

const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Supabase profile
  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Base profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, age, gender, scalp_type, hair_type, hair_concerns, concerns")
        .eq("id", user.id)
        .single();

      // 2. Consumer profile
      const { data: consumerProfile } = await supabase
        .from("consumer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // 3. Latest checkin
      const { data: latestCheckin } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setUserProfile({
        ...profile,
        consumer: consumerProfile,
        checkin: latestCheckin,
      });

    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  fetchUserData();
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
    const consumer = userProfile?.consumer;
    const checkin = userProfile?.checkin;

    return `You are Folli — a warm, knowledgeable scalp and hair health assistant for FolliSense.

You are speaking with ${displayName}.

Supabase Profile:
- Name: ${userProfile?.full_name || 'User'}
- Age: ${userProfile?.age || 'N/A'}
- Gender: ${userProfile?.gender || 'N/A'}
- Scalp type: ${userProfile?.scalp_type || 'Unknown'}
- Hair type: ${userProfile?.hair_type || 'Unknown'}
- Concerns: ${userProfile?.hair_concerns || userProfile?.concerns || 'None'}

CONSUMER PROFILE:
- Hair texture: ${consumer?.hair_texture || 'Unknown'}
- Current styles: ${consumer?.current_styles?.join(', ') || 'None'}
- Protective styling: ${consumer?.protective_style_frequency || 'Unknown'}
- Style duration: ${consumer?.style_duration || 'Unknown'}
- Top concerns: ${consumer?.top_concerns?.join(', ') || 'None'}
- Chemical processing: ${consumer?.chemical_processing || 'Unknown'}

LATEST CHECK-IN:
- Type: ${checkin?.type || 'None'}
- Symptoms: ${JSON.stringify(checkin?.symptoms || {})}
- Triage: ${checkin?.triage_result || 'None'}

Core rules:
- Personalize advice based on ALL data above
- Prioritize recent check-in symptoms over general profile
- Be helpful, empathetic, friendly, and clear. Never diagnose medical conditions.
- Respond based on proven information from reliable medical sources (e.g., Mayo Clinic, American Academy of Dermatology).
- ALWAYS recommend seeing a dermatologist or professional when appropriate.
- Keep EVERY response SHORT and scannable: Use 1-3 short sentences max. Prefer bullet points or numbered lists when listing tips/options.
- Avoid long paragraphs. Get straight to the point. One idea per sentence.
- Use simple, everyday language.
- Never mention "database" or "checkin" explicitly to the user.

Conversation style:
- After the user's FIRST message in the conversation, FIRST ask 1-2 relevant follow-up questions to understand better, THEN give a short helpful response.
- In later turns, answer directly but still ask clarifying follow-ups if needed.
- End most responses with a short follow-up question to continue the conversation naturally (e.g., "Does that help?" or "What else are you noticing?").

Example good response:
"Itchy scalp can often come from dryness or product buildup.
Try washing 2-3 times a week with a gentle shampoo.
What symptoms are you seeing — flakes, redness, or something else?"`;
};

  const sendMessage = async (text: string) => {
  if ((!text.trim() && !selectedFile) || isTyping || !sessionId) return;

  setIsTyping(true);
  setUploading(true);

  let storageId: string | null = null;

  // Upload file if any
  if (selectedFile) {
    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId: uploadedId } = await result.json();
      storageId = uploadedId;
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload the file. Please try again.");
      setUploading(false);
      setIsTyping(false);
      return;
    }
  }

  // Add user message to chat UI
  const userContent = text.trim() 
    ? text.trim() 
    : (selectedFile?.type.startsWith("image/") ? "📸 Shared a photo of my scalp/hair" : "📄 Shared a document");

  const userMsg: Message = { 
    id: `user-${Date.now()}`, 
    role: 'user', 
    content: userContent 
  };

  setMessages(prev => [...prev, userMsg]);
  setInputValue('');
  setSelectedFile(null);

  // Send to your AI action
  try {
    const conversationHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const assistantText = await sendMessageAction({
      sessionId,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...conversationHistory,
      ],
      fileStorageId: storageId || undefined,   // ← Important for vision models
      fileType: selectedFile?.type || undefined,
    });

    setMessages(prev => [...prev, { 
      id: `assistant-${Date.now()}`, 
      role: 'assistant', 
      content: assistantText 
    }]);
  } catch (err) {
    console.error("AI response error:", err);
    // Optional: add error message to chat
  } finally {
    setIsTyping(false);
    setUploading(false);
  }
};

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">Hi {displayName}!</p>
            <p className="text-sm text-muted-foreground mt-2">I'm Folli, your personal scalp and hair assistant.<br />How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-900'}`}>
                {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
<div className="border-t p-4 bg-white">
  <form 
    onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
    className="flex gap-2"
  >
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="h-12 w-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl flex items-center justify-center"
      disabled={isTyping || uploading}
    >
      <Paperclip size={20} />
    </button>

    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*,.pdf" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 15 * 1024 * 1024) { // 15MB limit
            alert("File is too large (max 15MB)");
            return;
          }
          setSelectedFile(file);
        }
      }}
    />

    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={selectedFile ? "Add message (optional)..." : "Ask about your scalp or hair..."}
      className="flex-1 h-12 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-sm"
      disabled={isTyping || uploading}
    />

    <button
      type="submit"
      disabled={(!inputValue.trim() && !selectedFile) || isTyping || uploading}
      className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
    >
      {uploading ? "↑" : <Send size={20} />}
    </button>
  </form>

  {selectedFile && (
    <p className="text-xs text-muted-foreground mt-2 pl-14 flex items-center gap-2">
      📎 {selectedFile.name}
      <button 
        onClick={() => setSelectedFile(null)}
        className="text-red-500 hover:underline text-[10px]"
      >
        remove
      </button>
    </p>
  )}
</div>
</div>
  );
};

export default ChatPage;     