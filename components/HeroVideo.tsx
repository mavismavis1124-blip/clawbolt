"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { AnimatedWords } from "@/components/AnimatedWords";
import { AnthropicLogo, GeminiLogo, OpenAILogo } from "@/components/ProviderLogos";

const highlights = [
  { value: "< 60s", label: "Average deployment" },
  { value: "24/7", label: "Managed uptime" },
  { value: "$49/mo", label: "Single tier pricing" },
];

export function HeroVideo() {
  const shouldReduceMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,30,45,0.18), transparent 42%), radial-gradient(circle at 86% 18%, rgba(120,120,255,0.14), transparent 36%), linear-gradient(180deg, rgba(4,4,4,0.88), rgba(4,4,4,1))",
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12"
        style={shouldReduceMotion ? undefined : { y: contentY }}
      >
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
          {/* Left copy */}
          <div>
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/85 backdrop-blur border border-line text-sm text-muted mb-7 text-shimmer">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                Demo-first deployment flow • Built for OpenClaw
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.68, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-5"
            >
              <AnimatedWords text="Deploy OpenClaw" startDelay={0.02} />
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-2 to-[#8A6BFF] bg-clip-text text-transparent animated-gradient-text">
                <AnimatedWords text="With a live demo UX" startDelay={0.18} />
              </span>
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-muted max-w-xl mb-8"
            >
              Let visitors pick model + channel, then immediately see the real deployment demo video
              side-by-side. Fast, clear, and conversion-focused.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-line bg-surface/70 backdrop-blur p-4 mb-8"
            >
              <p className="text-sm text-text-secondary mb-3">Which model do you want as default?</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-lg border border-[#CC785C]/40 bg-[#CC785C]/10 px-3 py-2 text-xs text-text-primary inline-flex items-center gap-1.5">
                  <AnthropicLogo className="w-4 h-4 text-[#CC785C]" /> Claude
                </div>
                <div className="rounded-lg border border-[#10A37F]/40 bg-[#10A37F]/10 px-3 py-2 text-xs text-text-primary inline-flex items-center gap-1.5">
                  <OpenAILogo className="w-4 h-4 text-[#10A37F]" /> GPT
                </div>
                <div className="rounded-lg border border-[#8AB4FF]/40 bg-[#8AB4FF]/10 px-3 py-2 text-xs text-text-primary inline-flex items-center gap-1.5">
                  <GeminiLogo className="w-4 h-4" /> Gemini
                </div>
              </div>

              <p className="text-sm text-text-secondary mb-3">Which channel do you want to use?</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-line bg-bg-void px-3 py-2 text-xs text-text-primary inline-flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#2AABEE]" /> Telegram
                </div>
                <div className="rounded-lg border border-line/70 bg-bg-void/70 px-3 py-2 text-xs text-text-tertiary">Discord</div>
                <div className="rounded-lg border border-line/70 bg-bg-void/70 px-3 py-2 text-xs text-text-tertiary">WhatsApp</div>
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-2 transition-all focus-ring"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-2 transition-all focus-ring"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}

              <a
                href="#the-widget"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-line text-text-primary hover:bg-surface/80 transition-all focus-ring"
              >
                See interactive demo
                <PlayCircle className="w-5 h-5" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid sm:grid-cols-3 gap-3 max-w-2xl"
            >
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-line bg-surface/60 backdrop-blur px-4 py-3"
                >
                  <p className="text-xs text-muted mb-1">{item.label}</p>
                  <p className="text-base font-semibold text-text-primary inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right media */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={shouldReduceMotion ? undefined : { y: videoY }}
            className="relative"
          >
            <div className="rounded-[28px] border border-white/10 bg-[#090909] p-3 shadow-[0_20px_90px_rgba(0,0,0,0.7),0_0_80px_rgba(255,30,45,0.18)]">
              <div className="flex items-center justify-between px-3 py-2 border border-line rounded-xl bg-bg-void mb-3">
                <div className="inline-flex items-center gap-2 text-xs text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live demo
                </div>
                <span className="text-xs text-text-tertiary">hero.mp4</span>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-line bg-black">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/videos/hero-poster.jpg"
                  className="w-full h-full object-cover min-h-[320px] md:min-h-[420px]"
                >
                  <source src="/videos/hero.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

                <div className="absolute left-3 right-3 bottom-3 rounded-xl border border-white/15 bg-black/60 backdrop-blur px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1">Demo script</p>
                  <p className="text-sm text-text-primary">Connect Telegram → choose model → deploy OpenClaw in under 60 seconds.</p>
                </div>
              </div>
            </div>

            <div className="hidden md:block absolute -right-5 -bottom-5 rounded-xl border border-line bg-surface/90 backdrop-blur px-4 py-3 shadow-2xl">
              <p className="text-xs text-text-tertiary">Conversion helper</p>
              <p className="text-sm text-text-primary">"Limited cloud servers" badge + clear CTA</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
