import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Microscope,
  ShieldCheck,
  Users,
  Sparkles,
  ChevronRight,
  Droplets,
  Heart,
  PhoneCall,
  Star,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Microscope,
    title: "Medically Informed",
    description:
      "Folli is trained on trichology and dermatology knowledge — providing science-backed answers grounded in real clinical understanding.",
  },
  {
    icon: Users,
    title: "For Women & Men",
    description:
      "Whether you are dealing with postpartum shedding, male-pattern baldness, scalp psoriasis, or anything in between — Folli understands your unique needs.",
  },
  {
    icon: PhoneCall,
    title: "Customer Care Escalation",
    description:
      "When Folli cannot answer, it seamlessly connects you to the FolliSense support team so you are never left without help.",
  },
  {
    icon: Sparkles,
    title: "Instant & Personal",
    description:
      "Get tailored, real-time guidance day or night — no waiting rooms, no appointments, no judgment.",
  },
];

const conditions = [
  "Male Pattern Baldness",
  "Female Pattern Hair Loss",
  "Alopecia Areata",
  "Scalp Psoriasis",
  "Dandruff & Seborrheic Dermatitis",
  "Postpartum Hair Loss",
  "Traction Alopecia",
  "Telogen Effluvium",
  "Folliculitis",
  "Dry & Itchy Scalp",
  "Oily Scalp",
  "Hair Breakage & Damage",
  "Scalp Eczema",
  "Hormonal Hair Loss (PCOS)",
  "Thyroid-Related Hair Loss",
];

const testimonials = [
  {
    name: "Amara O.",
    text: "Folli helped me understand that my postpartum hair loss was telogen effluvium — and gave me a clear plan. I finally felt heard.",
    rating: 5,
  },
  {
    name: "James K.",
    text: "I asked about minoxidil vs finasteride and got a detailed, unbiased breakdown. Better than searching Google for an hour.",
    rating: 5,
  },
  {
    name: "Priya S.",
    text: "My scalp eczema questions were answered so thoroughly. When it got complex, Folli connected me to the care team straight away.",
    rating: 5,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg leading-none text-foreground">FolliSense</span>
              <p className="text-[10px] text-muted-foreground leading-none tracking-wide uppercase">Smart Scalp Care</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:support@follisense.com" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              support@follisense.com
            </a>
            <Link to="/chat">
              <Button size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat with Folli
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-28 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/5 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              <Heart className="h-3.5 w-3.5" />
              FolliSense Smart Scalp Care Assistant
            </div>

            <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight text-balance text-foreground">
              Meet{" "}
              <span className="text-primary italic">Folli</span>
              {" "}— Your Personal Scalp & Hair Expert
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Get accurate, medically-informed answers to your scalp and hair concerns — anytime, for free. Designed for both women and men. Powered by FolliSense.
            </p>

            <ul className="space-y-2.5">
              {[
                "Covers 15+ scalp & hair conditions",
                "Gender-specific guidance",
                "Escalates to customer care when needed",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/chat">
                <Button size="lg" className="gap-2 text-base px-8 w-full sm:w-auto">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Folli
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="mailto:support@follisense.com">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-8 w-full sm:w-auto">
                  <PhoneCall className="h-4 w-4" />
                  Contact Support
                </Button>
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              For informational guidance only. Always consult a qualified dermatologist or trichologist for clinical diagnosis.
            </p>
          </motion.div>

          {/* Chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
              {/* Chat header */}
              <div className="bg-primary px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground text-sm">Folli</p>
                  <p className="text-primary-foreground/70 text-xs">FolliSense Scalp Care Assistant</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-primary-foreground/70">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  Online
                </div>
              </div>

              {/* Chat messages */}
              <div className="p-5 space-y-4 bg-secondary/20">
                {[
                  { role: "assistant", text: "Hi! I am Folli, your FolliSense scalp care assistant. What hair or scalp concern can I help you with today?" },
                  { role: "user", text: "I have been losing a lot of hair since having my baby 3 months ago. Is this normal?" },
                  {
                    role: "assistant",
                    text: "Yes, this is very common and completely normal. What you are experiencing is called **postpartum telogen effluvium**. During pregnancy, elevated oestrogen keeps more hair in the growth phase. After delivery, hormone levels drop rapidly — triggering a mass shedding phase. Most women see significant improvement by 6–12 months postpartum. I can walk you through what helps. Would you like to know more?",
                  },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.3 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Droplets className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border rounded-tl-sm text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border flex gap-2 items-center bg-card">
                <div className="flex-1 bg-secondary rounded-xl px-3 py-2 text-xs text-muted-foreground">
                  Ask Folli anything about your scalp or hair...
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 space-y-3"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Why FolliSense Users Love Folli
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              More than a chatbot — a dedicated scalp care companion built for real concerns.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-shadow space-y-4"
              >
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section id="conditions" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 space-y-3"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Conditions Folli Can Help With
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From everyday scalp concerns to complex hair conditions — Folli has you covered.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {conditions.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-default"
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-3"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">What Users Are Saying</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-2xl p-6 border border-border space-y-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{`"${t.text}"`}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Start Your Scalp Health Journey
            </h2>
            <p className="text-muted-foreground text-lg">
              Chat with Folli now — no sign-up required. Real answers, real care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/chat">
                <Button size="lg" className="gap-2 text-base px-10 w-full sm:w-auto">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Folli — Free
                </Button>
              </Link>
              <a href="mailto:support@follisense.com">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-10 w-full sm:w-auto">
                  <PhoneCall className="h-4 w-4" />
                  Contact Care Team
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Droplets className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-foreground">FolliSense</span>
            <span className="text-xs">Smart Scalp Care</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
            <a href="mailto:support@follisense.com" className="hover:text-foreground transition-colors">
              support@follisense.com
            </a>
            <span className="hidden sm:inline">|</span>
            <span>For informational purposes only. Not a substitute for medical advice.</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} FolliSense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}