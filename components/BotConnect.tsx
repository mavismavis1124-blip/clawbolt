"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { MessageCircle, ArrowRight, Shield, Zap, Clock } from "lucide-react";

const benefits = [
  { icon: Zap, text: "Instant notifications" },
  { icon: Shield, text: "Secure connection" },
  { icon: Clock, text: "24/7 monitoring" },
];

export function BotConnect() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      ref={ref}
      id="connect" 
      className="py-24 md:py-32"
      aria-labelledby="connect-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 id="connect-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              Connect via <span className="text-accent">Telegram</span>
            </h2>
            <p className="text-muted text-lg mb-8">
              Control your agents and receive updates directly in Telegram. 
              No additional apps needed — just message your agent and it responds.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {benefits.map((benefit) => (
                <div 
                  key={benefit.text}
                  className="flex items-center gap-2 px-4 py-2 bg-surface rounded-full border border-line"
                >
                  <benefit.icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  <span className="text-sm text-text-primary">{benefit.text}</span>
                </div>
              ))}
            </div>

            <a
              href="https://t.me/simpleclaw_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white font-medium rounded-xl hover:bg-[#0077b3] transition-colors focus-ring"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Open in Telegram
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="bg-surface border border-line rounded-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">SimpleClaw Bot</p>
                  <p className="text-xs text-muted">@simpleclaw_bot</p>
                </div>
                <span className="ml-auto text-xs text-green-500">● Online</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-accent text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">Deploy a new agent for market monitoring</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-surface border border-line px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-text-primary">Sure! What markets should I monitor?</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-accent text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">Crypto, specifically BTC and ETH prices</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-surface border border-line px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-text-primary">
                      ✅ Agent "crypto-watcher" deployed!
                      <br />
                      <span className="text-muted">Monitoring: BTC, ETH</span>
                      <br />
                      <span className="text-muted">Updates every: 5 minutes</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line">
                <div className="flex items-center gap-2 px-4 py-2 bg-bg-void rounded-full">
                  <span className="text-sm text-muted flex-1">Type a message...</span>
                  <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white" aria-label="Send message">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
