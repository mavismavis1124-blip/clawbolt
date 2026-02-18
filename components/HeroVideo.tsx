"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { AnimatedWords } from "@/components/AnimatedWords";

const highlights = [
  { value: "< 60s", label: "Average deployment" },
  { value: "24/7", label: "Managed uptime" },
  { value: "Zero setup", label: "Infra handled for you" },
];

export function HeroVideo() {
  const shouldReduceMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.96, 0.78]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          className="w-full h-full object-cover opacity-60"
          aria-hidden="true"
          style={shouldReduceMotion ? undefined : { scale: videoScale }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </motion.video>

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,30,45,0.16), transparent 52%), linear-gradient(to bottom, rgba(4,4,4,0.72), rgba(4,4,4,0.88) 55%, rgba(4,4,4,1))",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16"
        style={shouldReduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="text-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur border border-line text-sm text-muted mb-8 text-shimmer">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Managed OpenClaw hosting • Public beta open
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6"
          >
            <AnimatedWords text="Deploy OpenClaw" startDelay={0.02} />
            <br />
            <span className="bg-gradient-to-r from-accent via-accent-2 to-[#ff6a75] bg-clip-text text-transparent animated-gradient-text">
              <AnimatedWords text="Under 1 Minute" startDelay={0.2} />
            </span>
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-muted max-w-3xl mx-auto mb-10"
          >
            Run your own OpenClaw assistant with managed infrastructure, production reliability,
            and a clean deployment flow built for speed.
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-3"
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
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-line text-text-primary hover:bg-surface/80 transition-all focus-ring"
            >
              See how it works
              <PlayCircle className="w-5 h-5" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto"
          >
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-line bg-surface/70 backdrop-blur px-4 py-3"
              >
                <p className="text-sm text-muted mb-1">{item.label}</p>
                <p className="text-base md:text-lg font-semibold text-text-primary inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  {item.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-line flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
