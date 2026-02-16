"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[70] bg-gradient-to-r from-accent via-accent-2 to-[#8AB4FF]"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
