"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Cpu, MessageCircle, Shield } from "lucide-react";
import { AnthropicLogo, GeminiLogo, OpenAILogo } from "@/components/ProviderLogos";

const providers = [
  {
    name: "Anthropic",
    model: "Claude",
    icon: AnthropicLogo,
    colorClass: "text-[#CC785C]",
    glowClass: "from-[#CC785C]/15",
  },
  {
    name: "Google Gemini",
    model: "Gemini 2.0+",
    icon: GeminiLogo,
    colorClass: "text-[#8AB4FF]",
    glowClass: "from-[#8AB4FF]/15",
  },
  {
    name: "OpenAI GPT",
    model: "GPT-4.1 / GPT-5",
    icon: OpenAILogo,
    colorClass: "text-[#10A37F]",
    glowClass: "from-[#10A37F]/15",
  },
];

const infra = [
  { name: "OpenClaw Runtime", icon: Cpu },
  { name: "Telegram Native", icon: MessageCircle },
  { name: "Managed Security Layer", icon: Shield },
];

export function LogoCloud() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-8 md:py-10 bg-bg-void border-y border-line/40">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0.88, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-muted/80 mb-2">
            Powering your agent stack
          </p>
          <p className="text-sm md:text-base text-text-primary/90">
            Choose your model brain. We handle the deployment layer.
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0.86, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative rounded-2xl border border-line bg-surface/70 p-3 md:p-4 mb-4 overflow-hidden"
        >
          <div
            className="absolute inset-x-0 -top-16 h-24 bg-gradient-to-b from-accent/10 to-transparent blur-2xl"
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-3 gap-3">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={shouldReduceMotion ? {} : { opacity: 0.8, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                className="group relative rounded-xl border border-line bg-bg-void/70 px-3.5 py-3 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${provider.glowClass} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden="true"
                />

                <div className="relative flex items-center gap-3">
                  <span className={`inline-flex w-8 h-8 items-center justify-center ${provider.colorClass}`}>
                    <provider.icon className="w-5 h-5" />
                  </span>

                  <div>
                    <p className="text-sm font-medium text-text-primary leading-tight">{provider.name}</p>
                    <p className="text-xs text-muted">{provider.model}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {infra.map((item, index) => (
            <motion.div
              key={item.name}
              initial={shouldReduceMotion ? {} : { opacity: 0.9, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.12 + index * 0.08 }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-line bg-surface/70"
            >
              <item.icon className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-xs md:text-sm text-text-primary">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
