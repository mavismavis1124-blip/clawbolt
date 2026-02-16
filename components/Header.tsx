"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SimpleClawLogo } from "./SimpleClawLogo";

const navItems = [
  { label: "Comparison", href: "#comparison" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg-void/75 backdrop-blur-xl border-b border-line/50"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
          <Link
            href="/"
            className="hover:opacity-90 transition-opacity focus-ring rounded-lg p-1"
            aria-label="SimpleClaw Home"
          >
            <SimpleClawLogo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted hover:text-text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="mailto:hello@simpleclaw.dev"
              className="text-sm text-muted hover:text-text-primary transition-colors px-2.5 py-2"
            >
              Contact
            </a>

            <a
              href="#the-widget"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-2 transition-colors"
            >
              Deploy
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
