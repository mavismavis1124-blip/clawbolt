"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Check, Zap, Building2, ArrowRight } from "lucide-react";
import { AnimatedWords } from "@/components/AnimatedWords";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for personal projects and early experiments",
    features: [
      "1 Telegram bot",
      "1,000 messages/month",
      "Standard AI models",
      "Email support",
      "Basic monitoring",
    ],
    cta: "Get Started",
    href: "mailto:hello@simpleclaw.dev?subject=Starter%20Plan%20Signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For creators and small teams building with AI",
    features: [
      "Unlimited bots",
      "Unlimited messages",
      "$15 AI credits included",
      "Priority support",
      "Advanced monitoring",
      "Custom AI models",
    ],
    cta: "Go Pro",
    href: "mailto:hello@simpleclaw.dev?subject=Pro%20Plan%20Signup",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure for organizations",
    features: [
      "Everything in Pro",
      "Dedicated hosting",
      "SLA guarantee",
      "Custom integrations",
      "White-glove onboarding",
      "Dedicated support channel",
    ],
    cta: "Contact Sales",
    href: "mailto:hello@simpleclaw.dev?subject=Enterprise%20Inquiry",
    popular: false,
  },
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="pricing-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            <AnimatedWords text="Simple Pricing" accentWords={["Pricing"]} startDelay={0.04} />
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            No hidden fees. No surprise bills. Just straightforward pricing for managed OpenClaw hosting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.62,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`relative rounded-2xl p-6 lg:p-8 flex flex-col ${
                tier.popular 
                  ? "bg-accent/5 border-2 border-accent" 
                  : "bg-surface border border-line hover:border-accent/30"
              } transition-all`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-sm font-semibold rounded-full flex items-center gap-1">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {tier.name === "Enterprise" ? (
                    <Building2 className="w-5 h-5 text-accent" aria-hidden="true" />
                  ) : (
                    <Zap className="w-5 h-5 text-accent" aria-hidden="true" />
                  )}
                  <h3 className="text-xl font-bold text-text-primary">{tier.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">{tier.price}</span>
                  <span className="text-muted">{tier.period}</span>
                </div>
                <p className="text-sm text-muted mt-2">{tier.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1" aria-label={`${tier.name} features`}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-text-primary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.href}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all focus-ring ${
                  tier.popular
                    ? "bg-accent text-white hover:bg-accent-2"
                    : "bg-surface text-text-primary border border-line hover:bg-bg-void/50"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Trust note */}
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="text-center text-muted mt-12"
        >
          All plans include 24/7 OpenClaw infrastructure hosting. You just bring your Telegram bot token.
        </motion.p>
      </div>
    </section>
  );
}
