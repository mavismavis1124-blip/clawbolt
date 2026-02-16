"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroSimple() {
  const shouldReduceMotion = useReducedMotion();

  const scrollToWidget = () => {
    document.getElementById('the-widget')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="relative min-h-[60vh] flex items-center justify-center pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.h1
          id="hero-heading"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6"
        >
          Deploy OpenClaw
          <br />
          <span className="text-accent">under 1 minute</span>
        </motion.h1>

        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8"
        >
          Avoid all technical complexity and one-click deploy your own 24/7 active OpenClaw instance.
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={scrollToWidget}
        >
          <span className="text-sm text-muted">Get started below</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-line flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
