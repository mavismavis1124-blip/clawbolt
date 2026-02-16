"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Check, Zap, ArrowRight } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const features = [
  "1 Telegram bot",
  "Unlimited messages",
  "Your own AI API keys",
  "Dedicated VM on deploy",
  "Runtime telemetry",
  "Priority support",
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      id="pricing"
      className="py-24 md:py-32 bg-surface/30"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2
            id="pricing-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
          >
            <AnimatedWords
              text="Simple Pricing"
              accentWords={["Pricing"]}
              startDelay={0.04}
            />
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            One plan. No tiers. No hidden fees. Just reliable bot hosting.
          </p>
        </motion.div>

        {/* Single Pricing Card */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.62,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative rounded-2xl p-8 lg:p-10 bg-surface border-2 border-accent mx-auto max-w-lg"
        >
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-sm font-semibold rounded-full flex items-center gap-1">
            <Zap className="w-4 h-4" aria-hidden="true" />
            Everything Included
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-accent" aria-hidden="true" />
              <h3 className="text-2xl font-bold text-text-primary">Pro</h3>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-text-primary">$49</span>
              <span className="text-muted text-lg">/month</span>
            </div>
            <p className="text-sm text-muted mt-2">
              VM spins up only after payment. Cancel anytime.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8" aria-label="Plan features">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-text-primary">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="mailto:hello@simpleclaw.dev?subject=SimpleClaw%20Signup"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 font-semibold rounded-xl bg-accent text-white hover:bg-accent-2 transition-all focus-ring"
          >
            Get Started
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </motion.div>

        {/* Trust notes */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="text-center mt-12 space-y-2"
        >
          <p className="text-muted">
            You bring your Telegram bot token and AI API keys.
          </p>
          <p className="text-muted text-sm">
            We handle the infrastructure. Messages unlimited — your API key is
            the only limit.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
