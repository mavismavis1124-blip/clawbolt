"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Shield, Rocket, Workflow, Sparkles } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const cards = [
  {
    icon: Rocket,
    title: "Deploy in 60 seconds",
    text: "From bot token to live OpenClaw assistant without touching servers.",
  },
  {
    icon: Workflow,
    title: "Ready-made agent workflows",
    text: "Email, reminders, reports, social posting — run from one chat interface.",
  },
  {
    icon: Shield,
    title: "Managed and monitored",
    text: "We maintain runtime health, updates, and guardrails so you stay focused on outcomes.",
  },
];

export function FeatureHighlights() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-14 md:py-16 bg-bg-void">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-muted mb-3">
            Why this feels different
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary inline-flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
            <AnimatedWords
              text="Built for non-technical speed, not setup pain"
              className="text-shimmer"
              startDelay={0.05}
            />
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="group rounded-2xl border border-line bg-surface/75 backdrop-blur p-5 md:p-6 hover:border-accent/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <card.icon className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
