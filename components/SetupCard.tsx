"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Terminal, Check, Copy, ChevronRight } from "lucide-react";

const setupSteps = [
  { id: 1, command: "npm install -g simpleclaw", description: "Install the CLI" },
  { id: 2, command: "simpleclaw init my-agent", description: "Initialize your agent" },
  { id: 3, command: "simpleclaw deploy", description: "Deploy to the cloud" },
];

export function SetupCard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section 
      ref={ref}
      id="setup" 
      className="py-24 md:py-32"
      aria-labelledby="setup-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="setup-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Setup in <span className="text-accent">3 Commands</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            No complex configuration files. No Docker. No Kubernetes. 
            Just install, initialize, and deploy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {setupSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="group"
            >
              <div className="bg-surface border border-line rounded-2xl p-6 hover:border-accent/50 transition-colors h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Step {step.id}</span>
                    {index < setupSteps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted hidden md:block" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted mb-3">{step.description}</p>

                <div className="relative bg-bg-void rounded-xl p-4 font-mono text-sm">
                  <code className="text-text-primary">{step.command}</code>
                  <button
                    onClick={() => handleCopy(step.command, step.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-text-primary transition-colors focus-ring rounded-lg"
                    aria-label={copiedId === step.id ? "Copied" : `Copy command: ${step.command}`}
                  >
                    {copiedId === step.id ? (
                      <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
