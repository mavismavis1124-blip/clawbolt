"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Rocket, MessageCircle, Play, ExternalLink, X } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const steps = [
  {
    id: 1,
    eyebrow: "STEP 01",
    icon: MessageCircle,
    title: "Get Your Token",
    description: "Talk to @BotFather on Telegram to create your bot and receive your API token.",
    helper: "Usually takes under 20 seconds once BotFather opens.",
    action: {
      type: "link",
      href: "https://t.me/botfather",
      label: "Open @BotFather",
    },
    hasDemo: true,
  },
  {
    id: 2,
    eyebrow: "STEP 02",
    icon: Send,
    title: "Send It To Us",
    description: "Share your bot token securely. We'll handle the OpenClaw setup and hosting.",
    helper: "Secure handoff. We configure and deploy everything for you.",
    action: {
      type: "email",
      href: "mailto:hello@simpleclaw.dev?subject=My%20Bot%20Token&body=Hi%20SimpleClaw%20team,%0A%0AHere's%20my%20Telegram%20bot%20token:%0A%0A[ paste your token here ]%0A%0AReady%20to%20go%20live!",
      label: "Send Token",
    },
  },
  {
    id: 3,
    eyebrow: "STEP 03",
    icon: Rocket,
    title: "Your Bot Goes Live",
    description: "We host OpenClaw 24/7. You just chat with your AI agent — we'll handle the rest.",
    helper: "No SSH, no server management, no deployment headaches.",
    badge: "Live in under 1 minute",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section 
      ref={ref}
      id="how-it-works" 
      className="py-24 md:py-32 bg-bg-void"
      aria-labelledby="howitworks-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="howitworks-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            <AnimatedWords
              text="From Token to Live Bot in 3 Steps"
              accentWords={["Live"]}
              startDelay={0.04}
            />
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            No servers to maintain. No code to write. Just your AI agent, always on.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.62,
                delay: index * 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative group"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-9 left-[56%] w-[88%] pointer-events-none" aria-hidden="true">
                  <div className="h-px bg-gradient-to-r from-accent/40 via-accent/20 to-transparent" />
                  <div className="absolute -right-1.5 -top-1.5 w-3 h-3 rounded-full border border-accent/40 bg-bg-void" />
                </div>
              )}

              <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface to-bg-void/95 p-6 lg:p-7 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent/55 group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,30,45,0.16),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between mb-5">
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-accent/90">
                    {step.eyebrow}
                  </span>
                  <span className="text-sm font-semibold text-muted/70">0{step.id}</span>
                </div>

                <div className="relative flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary leading-tight mt-1">{step.title}</h3>
                </div>

                <p className="relative text-muted mb-4 leading-relaxed">{step.description}</p>
                <p className="relative text-xs text-muted/85 mb-6">{step.helper}</p>

                {/* Action */}
                {step.action && step.action.type === "link" && (
                  <div className="relative flex flex-col gap-3 mt-auto">
                    <a
                      href={step.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0A9CE3] to-[#0078B6] text-white font-medium rounded-xl hover:brightness-110 transition-all focus-ring"
                    >
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                      {step.action.label}
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                    {step.hasDemo && (
                      <button
                        onClick={() => setShowDemo(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface text-text-primary font-medium rounded-xl border border-line hover:bg-bg-void/50 transition-all focus-ring"
                      >
                        <Play className="w-4 h-4" aria-hidden="true" />
                        Watch how
                      </button>
                    )}
                  </div>
                )}

                {step.action && step.action.type === "email" && (
                  <a
                    href={step.action.href}
                    className="relative mt-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-2 transition-all focus-ring"
                  >
                    <Send className="w-5 h-5" aria-hidden="true" />
                    {step.action.label}
                  </a>
                )}

                {step.badge && (
                  <div className="relative mt-auto inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-medium self-start">
                    <Rocket className="w-4 h-4" aria-hidden="true" />
                    {step.badge}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust line */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.54 }}
          className="text-center text-muted mt-12 max-w-xl mx-auto"
        >
          We run the OpenClaw infrastructure. You just connect your Telegram bot. 
          Your bot is live in under 1 minute.
        </motion.p>
      </div>

      {/* Demo Video Modal */}
      {showDemo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-void/90 backdrop-blur-sm p-4"
          onClick={() => setShowDemo(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Demo video"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute -top-12 right-0 p-2 text-muted hover:text-text-primary transition-colors focus-ring rounded-lg"
              aria-label="Close demo"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="aspect-video bg-surface rounded-2xl overflow-hidden border border-line">
              <video
                controls
                autoPlay
                poster="/videos/demo-poster.jpg"
                preload="metadata"
                className="w-full h-full"
                aria-label="BotFather setup demo"
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
