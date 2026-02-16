"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Clock, AlertTriangle, Check, X, Zap } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const traditionalSteps = [
  { label: "Purchase VPS server", time: "15 min" },
  { label: "SSH key setup", time: "10 min" },
  { label: "Server connection", time: "5 min" },
  { label: "Install Node.js", time: "5 min" },
  { label: "Install OpenClaw", time: "7 min" },
  { label: "Configure OpenClaw", time: "10 min" },
  { label: "AI provider setup", time: "5 min" },
  { label: "Telegram bot pairing", time: "5 min" },
];

export function Comparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  const totalMinutes = traditionalSteps.reduce((acc, step) => acc + parseInt(step.time), 0);

  return (
    <section 
      ref={ref}
      id="comparison" 
      className="py-24 md:py-32 bg-surface/30"
      aria-labelledby="comparison-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="comparison-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            <AnimatedWords text="DIY vs SimpleClaw" accentWords={["SimpleClaw"]} startDelay={0.04} />
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            See how we eliminate all the setup headaches and get you running in under a minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Traditional Setup Column */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -28 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-bg-void border border-line rounded-2xl p-6 lg:p-8 h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-line">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Traditional Setup</h3>
                  <p className="text-sm text-muted">Do everything yourself</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {traditionalSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.3 + index * 0.05,
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-line/50 flex items-center justify-center text-xs text-muted">
                        {index + 1}
                      </span>
                      <span className="text-sm text-text-primary">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {step.time}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-line">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Total time</span>
                  <span className="text-lg font-bold text-red-500">{totalMinutes}+ minutes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-500/80">
                  <AlertTriangle className="w-4 h-4" />
                  <span>If you're non-technical, multiply by 10</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SimpleClaw Column */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 28 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-bg-void border-2 border-accent/30 rounded-2xl p-6 lg:p-8 h-full relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-accent/20 relative">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">SimpleClaw</h3>
                  <p className="text-sm text-accent">We handle everything</p>
                </div>
              </div>

              <div className="relative">
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 22, scale: 0.96 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-accent/5 border border-accent/20 rounded-xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-5xl font-bold text-accent mb-2">&lt;1 minute</div>
                  <p className="text-muted mb-6">
                    Pick a model, connect Telegram, deploy
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2 text-text-primary">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Choose AI model (Claude, GPT, Gemini)</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-text-primary">
                      <Check className="w-4 h-4 text-accent" />
                      <span>Connect Telegram bot</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-text-primary">
                      <Check className="w-4 h-4 text-accent" />
                      <span>We deploy and manage everything</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-accent/80">
                    ✨ No servers. No SSH. No configuration files.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
