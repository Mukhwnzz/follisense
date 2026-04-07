"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const SYSTEM_PROMPT = `You are Folli, the official AI hair and scalp care assistant for FolliSense Smart Scalp Care.

You are warm, friendly and helpful. Personalize answers using the user's name, gender, hair type and concerns when available.

Always be encouraging and practical.`;

export const sendMessage = action({
  args: {
    sessionId: v.id("chatSessions"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    fileStorageId: v.optional(v.string()),   // ← Add this line
    fileType: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const llmMessages = [...args.messages];   // We'll modify a copy for the LLM

    // === Convert image if uploaded ===
    if (args.fileStorageId) {
      const imageUrl = await ctx.storage.getUrl(args.fileStorageId);

      if (imageUrl) {
        // Find the LAST user message
        const lastUserIndex = llmMessages.findLastIndex(m => m.role === "user");

        if (lastUserIndex !== -1) {
          const originalText = llmMessages[lastUserIndex].content;

          // Replace with array format for vision
          llmMessages[lastUserIndex]  = {
            role:"user",
            content: [
              {
              type: "text", text: originalText || "Please analyze this photo of my scalp/hair."},
              {
                type: "image_url",
                image_url: {  url: imageUrl },
                },
            ], 
            };
        }
      }
    }
       
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,           // ← changed
      baseURL: "https://api.groq.com/openai/v1",  // ← Groq endpoint
    });

    try {
      const finalMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...args.messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",        // fast & good free model
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const assistantContent =
        response.choices[0]?.message?.content ??
        "Sorry, I couldn't respond right now. Try again!";

      await ctx.runMutation(api.chat.addAssistantMessage, {
        sessionId: args.sessionId,
        content: assistantContent,
      });

      return assistantContent;
    } catch (error ) {
      console.error("🚨 Groq Error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      throw new Error("Failed to get AI response. Please try again.");
    }
  },
});