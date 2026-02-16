"use client";

import { SimpleClawLogo } from "./SimpleClawLogo";

export function Footer() {
  return (
    <footer className="py-10 border-t border-line bg-bg-void">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SimpleClawLogo size="sm" />

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
            <span>Built by</span>
            <a
              href="https://x.com/Gizasin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary hover:text-accent transition-colors"
            >
              Zero
            </a>
            <span className="text-line">•</span>
            <a href="#pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </a>
            <span className="text-line">•</span>
            <a href="#faq" className="hover:text-text-primary transition-colors">
              FAQ
            </a>
            <span className="text-line">•</span>
            <a
              href="mailto:hello@simpleclaw.dev"
              className="hover:text-text-primary transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
