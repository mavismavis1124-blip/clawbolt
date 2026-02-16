"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimatedWordsProps {
  text: string;
  className?: string;
  accentWords?: string[];
  startDelay?: number;
  once?: boolean;
}

const normalize = (word: string) => word.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

export function AnimatedWords({
  text,
  className = "",
  accentWords = [],
  startDelay = 0,
  once = true,
}: AnimatedWordsProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");
  const accentSet = new Set(accentWords.map((word) => normalize(word)));

  return (
    <span aria-label={text} className={className}>
      {words.map((word, index) => {
        const isAccent = accentSet.has(normalize(word));

        return (
          <motion.span
            key={`${word}-${index}`}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once }}
            transition={{
              duration: 0.42,
              delay: startDelay + index * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`inline-block ${isAccent ? "text-accent" : ""}`}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        );
      })}
    </span>
  );
}
