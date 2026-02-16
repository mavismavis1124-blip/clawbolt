"use client";

import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const faqs = [
  {
    question: "What is SimpleClaw?",
    answer: "SimpleClaw is a managed OpenClaw hosting service. We run the OpenClaw infrastructure 24/7 — you just connect your Telegram bot by sending us your token, and your AI agent goes live in under a minute. No servers to manage, no code to write.",
  },
  {
    question: "Do I need to set up OpenClaw myself?",
    answer: "Not at all! That's the whole point. You don't need to buy a VPS, install Node.js, configure webhooks, or manage any infrastructure. Just create a bot with @BotFather, send us the token, and we handle everything else.",
  },
  {
    question: "How does pricing work?",
    answer: "We offer simple monthly plans: Starter ($29/month for 1 bot, 1K messages), Pro ($49/month for unlimited bots with $15 AI credits included), and Enterprise (custom pricing). No hidden fees, no surprise bills.",
  },
  {
    question: "Is my bot token secure?",
    answer: "Yes. We treat your token with the same security standards as API keys. It's encrypted at rest, only used to communicate with Telegram's servers, and you can regenerate it anytime via @BotFather if needed.",
  },
  {
    question: "Can I migrate to self-hosted later?",
    answer: "Absolutely. Since we run standard OpenClaw, you can always export your configuration and self-host later if you prefer. No vendor lock-in — your bot logic and conversations belong to you.",
  },
  {
    question: "What AI models are available?",
    answer: "We support all popular models through our managed OpenClaw infrastructure — GPT-4, Claude, local models, and more. Pro plans include $15 in AI credits monthly, and you can add more as needed.",
  },
];

function AccordionItem({ 
  item, 
  isOpen, 
  onClick 
}: { 
  item: typeof faqs[0]; 
  isOpen: boolean; 
  onClick: () => void;
}) {
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-6 text-left focus-ring rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-text-primary pr-4">{item.question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-muted flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="pb-6 text-muted leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section 
      ref={ref}
      id="faq" 
      className="py-24 md:py-32 bg-surface/30"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="faq-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            <AnimatedWords text="Frequently Asked" accentWords={["Asked"]} startDelay={0.04} />
          </h2>
          <p className="text-muted text-lg">
            Everything you need to know about SimpleClaw
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.62, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="bg-surface border border-line rounded-2xl px-6 md:px-8"
          role="region"
          aria-label="Frequently asked questions"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
