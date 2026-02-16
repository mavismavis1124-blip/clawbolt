"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { 
  Mail, FileText, Globe, Calendar, Clock, Calculator, CreditCard,
  ShoppingCart, Tag, Search, FileSearch, Plane, Utensils, Share2,
  Target, Briefcase, TrendingUp, Users, MessageSquare, Bell,
  Database, Shield, Code, Monitor, Smartphone, Folder, PenTool,
  BarChart3, DollarSign, Gift, ShieldCheck, FileCheck, Presentation,
  HeartHandshake, Megaphone, Sparkles, Zap, Bot
} from "lucide-react";

// 40+ use cases like SimpleClaw
const useCasesRow1 = [
  { icon: Mail, label: "Read & summarize email" },
  { icon: PenTool, label: "Draft replies" },
  { icon: Globe, label: "Translate messages" },
  { icon: Folder, label: "Organize inbox" },
  { icon: HeartHandshake, label: "Answer tickets" },
  { icon: FileText, label: "Summarize docs" },
  { icon: Bell, label: "Meeting alerts" },
  { icon: Calendar, label: "Schedule meetings" },
  { icon: Clock, label: "Deadline reminders" },
  { icon: Target, label: "Plan your week" },
  { icon: PenTool, label: "Meeting notes" },
  { icon: Globe, label: "Time zone sync" },
];

const useCasesRow2 = [
  { icon: Calculator, label: "Do taxes" },
  { icon: CreditCard, label: "Track expenses" },
  { icon: FileCheck, label: "Compare insurance" },
  { icon: DollarSign, label: "Manage subscriptions" },
  { icon: BarChart3, label: "Run payroll" },
  { icon: Gift, label: "Negotiate refunds" },
  { icon: Tag, label: "Find coupons" },
  { icon: Search, label: "Best prices" },
  { icon: Tag, label: "Discount codes" },
  { icon: Bell, label: "Price alerts" },
  { icon: FileSearch, label: "Product specs" },
  { icon: HeartHandshake, label: "Negotiate deals" },
];

const useCasesRow3 = [
  { icon: ShieldCheck, label: "Contracts & NDAs" },
  { icon: Search, label: "Research competitors" },
  { icon: Users, label: "Screen leads" },
  { icon: FileText, label: "Generate invoices" },
  { icon: Presentation, label: "Create slides" },
  { icon: Plane, label: "Book travel" },
  { icon: Utensils, label: "Find recipes" },
  { icon: Share2, label: "Draft posts" },
  { icon: Megaphone, label: "Monitor news" },
  { icon: Target, label: "Track goals" },
  { icon: MessageSquare, label: "Screen outreach" },
  { icon: Briefcase, label: "Job descriptions" },
];

const useCasesRow4 = [
  { icon: Users, label: "Standup summaries" },
  { icon: TrendingUp, label: "Track OKRs" },
  { icon: Database, label: "Data processing" },
  { icon: Code, label: "Code review" },
  { icon: Monitor, label: "Web monitoring" },
  { icon: Shield, label: "Security audits" },
  { icon: Bot, label: "API management" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Smartphone, label: "Mobile alerts" },
  { icon: Sparkles, label: "AI workflows" },
  { icon: Zap, label: "Automation" },
  { icon: Bot, label: "And much more..." },
];

export function Marquee() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      ref={ref}
      id="use-cases"
      className="py-12 overflow-hidden bg-bg-void"
      aria-labelledby="usecases-heading"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 mb-8">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0.84, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="usecases-heading" className="text-lg font-medium text-text-primary mb-2">
            What can OpenClaw do for you?
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
            One assistant, thousands of use cases
          </h3>
        </motion.div>
      </div>

      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0.9 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-void to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-void to-transparent z-10 pointer-events-none" />

        {/* Row 1 - left to right */}
        <div className="flex mb-3">
          <motion.div
            animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 40,
              ease: "linear",
            }}
            className="flex gap-3 pr-3"
          >
            {[...useCasesRow1, ...useCasesRow1].map((useCase, index) => (
              <div
                key={`r1-${index}`}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-full whitespace-nowrap"
              >
                <useCase.icon className="w-4 h-4 text-accent" />
                <span className="text-sm text-text-primary">{useCase.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - right to left */}
        <div className="flex mb-3">
          <motion.div
            animate={shouldReduceMotion ? {} : { x: ["-50%", "0%"] }}
            transition={{
              repeat: Infinity,
              duration: 45,
              ease: "linear",
            }}
            className="flex gap-3 pr-3"
          >
            {[...useCasesRow2, ...useCasesRow2].map((useCase, index) => (
              <div
                key={`r2-${index}`}
                className="flex items-center gap-2 px-4 py-2 bg-surface/70 border border-line/70 rounded-full whitespace-nowrap"
              >
                <useCase.icon className="w-4 h-4 text-accent-2" />
                <span className="text-sm text-text-primary">{useCase.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 3 - left to right (slower) */}
        <div className="flex mb-3">
          <motion.div
            animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 50,
              ease: "linear",
            }}
            className="flex gap-3 pr-3"
          >
            {[...useCasesRow3, ...useCasesRow3].map((useCase, index) => (
              <div
                key={`r3-${index}`}
                className="flex items-center gap-2 px-4 py-2 bg-surface/50 border border-line/50 rounded-full whitespace-nowrap"
              >
                <useCase.icon className="w-4 h-4 text-accent" />
                <span className="text-sm text-text-primary">{useCase.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 4 - right to left */}
        <div className="flex">
          <motion.div
            animate={shouldReduceMotion ? {} : { x: ["-50%", "0%"] }}
            transition={{
              repeat: Infinity,
              duration: 42,
              ease: "linear",
            }}
            className="flex gap-3 pr-3"
          >
            {[...useCasesRow4, ...useCasesRow4].map((useCase, index) => (
              <div
                key={`r4-${index}`}
                className="flex items-center gap-2 px-4 py-2 bg-surface/30 border border-line/30 rounded-full whitespace-nowrap"
              >
                <useCase.icon className="w-4 h-4 text-accent-2" />
                <span className="text-sm text-text-primary">{useCase.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* PS note like SimpleClaw */}
      <motion.p
        initial={shouldReduceMotion ? {} : { opacity: 0.9 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-8 text-sm text-muted"
      >
        PS. You can add as many use cases as you want via natural language
      </motion.p>
    </section>
  );
}
