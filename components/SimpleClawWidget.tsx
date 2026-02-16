"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  MessageCircle, 
  Sparkles, 
  Zap, 
  X, 
  CheckCircle, 
  ArrowRight,
  Lock,
  Shield,
  CreditCard
} from "lucide-react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";

// ============================================================================
// TYPES
// ============================================================================

interface ModelOption {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

interface ChannelOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  badge?: string;
}

type WidgetState = 
  | 'logged-out'      // State 1: Not authenticated
  | 'logged-in'       // State 2: Authenticated, needs Telegram token
  | 'token-entered'   // State 3: Token saved, ready to deploy
  | 'deploy-ready';   // State 4: Show pricing, ready for Stripe checkout

// ============================================================================
// DATA
// ============================================================================

const models: ModelOption[] = [
  {
    id: "claude",
    name: "Claude",
    subtitle: "Opus 4.5",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#CC785C"/>
        <path d="M12 6L14.5 11H9.5L12 6Z" fill="#1A1A1A"/>
        <path d="M8 13L12 18L16 13H8Z" fill="#1A1A1A"/>
      </svg>
    ),
    color: "#CC785C",
  },
  {
    id: "gpt",
    name: "GPT",
    subtitle: "GPT-5.2",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="#10A37F"/>
        <path d="M12 5L19 9V15L12 19L5 15V9L12 5Z" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    ),
    color: "#10A37F",
  },
  {
    id: "gemini",
    name: "Gemini",
    subtitle: "3 Flash",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill="url(#geminiGradientWidget)"/>
        <defs>
          <linearGradient id="geminiGradientWidget" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="33%" stopColor="#EA4335"/>
            <stop offset="66%" stopColor="#FBBC05"/>
            <stop offset="100%" stopColor="#34A853"/>
          </linearGradient>
        </defs>
        <path d="M12 6L14 10H10L12 6Z" fill="white"/>
        <path d="M8 11H16L12 17L8 11Z" fill="white"/>
      </svg>
    ),
    color: "#4285F4",
  },
];

const channels: ChannelOption[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: <MessageCircle className="w-6 h-6" />,
    available: true,
  },
  {
    id: "discord",
    name: "Discord",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    available: false,
    badge: "Coming soon",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-.1.806-1.038.669-.447 1.256-.719 1.434-.769.178-.05.36-.025.51.074.148.099.347.297.446.496.099.198.347.645.422.745.074.099.124.223.075.347-.05.149-.075.223-.173.347-.099.124-.174.223-.273.347-.099.124-.223.248-.148.372.074.124.347.67.644 1.09.347.446.745.792 1.043.916.298.124.521.074.67-.025.149-.099.62-.744.775-.993.149-.248.298-.223.496-.124.199.074 1.26.59 1.484.694.223.099.372.149.422.223.05.074.05.422-.124.868zM12.043 2.001c-5.522 0-10 4.477-10 10s4.478 10 10 10c1.89 0 3.663-.526 5.175-1.439l1.742 1.005c.21.121.48.048.59-.163a.56.56 0 0 0 .05-.256v-2.121c1.553-1.67 2.513-3.897 2.513-6.349 0-5.523-4.477-10-10-10zm0 18.225c-4.536 0-8.225-3.689-8.225-8.225s3.689-8.225 8.225-8.225 8.225 3.689 8.225 8.225-3.689 8.225-8.225 8.225z"/>
      </svg>
    ),
    available: false,
    badge: "Coming soon",
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ModelSelector({ 
  selectedModel, 
  onSelect 
}: { 
  selectedModel: string | null; 
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-text-primary mb-6">
        Which model do you want as default?
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 focus-ring ${
              selectedModel === model.id
                ? "border-accent bg-surface shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                : "border-line bg-surface/50 hover:border-line/80"
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${model.color}20` }}
              >
                {model.icon}
              </div>
              <div>
                <div className="font-semibold text-text-primary">{model.name}</div>
                <div className="text-sm text-muted">{model.subtitle}</div>
              </div>
            </div>
            {selectedModel === model.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChannelSelector({ 
  selectedChannel, 
  onSelect 
}: { 
  selectedChannel: string | null; 
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-text-primary mb-6">
        Which channel do you want to use?
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => channel.available && onSelect(channel.id)}
            disabled={!channel.available}
            className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 focus-ring ${
              selectedChannel === channel.id && channel.available
                ? "border-accent bg-surface shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                : channel.available
                ? "border-line bg-surface/50 hover:border-line/80 cursor-pointer"
                : "border-line/50 bg-surface/30 cursor-not-allowed opacity-60"
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedChannel === channel.id && channel.available
                    ? "bg-accent/10 text-accent"
                    : "bg-bg-void text-muted"
                }`}
              >
                {channel.icon}
              </div>
              <div>
                <div className={`font-semibold ${channel.available ? 'text-text-primary' : 'text-muted'}`}>
                  {channel.name}
                </div>
                {channel.badge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-line/50 rounded text-xs text-muted">
                    {channel.badge}
                  </span>
                )}
              </div>
            </div>
            {selectedChannel === channel.id && channel.available && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (token: string) => void;
}

function TelegramModal({ isOpen, onClose, onConnect }: TelegramModalProps) {
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'input' | 'connecting' | 'success'>('input');

  if (!isOpen) return null;

  const handleConnect = () => {
    if (!token.trim()) return;
    setStep('connecting');
    // Simulate connection
    setTimeout(() => {
      setStep('success');
      onConnect(token);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Side Modal */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-surface border-l border-line shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              Connect Telegram
            </h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-line/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <div className="p-6">
            {step === 'input' && (
              <>
                {/* 5-Step BotFather Instructions */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">
                    Follow these 5 steps
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center">
                        1
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">Open Telegram</p>
                        <p className="text-xs text-muted">Launch the Telegram app on your device</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center">
                        2
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">Find @BotFather</p>
                        <p className="text-xs text-muted">Search for <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@BotFather</a> in the search bar</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center">
                        3
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">Create a new bot</p>
                        <p className="text-xs text-muted">Start a chat and type <code className="bg-line px-1.5 py-0.5 rounded text-text-primary">/newbot</code></p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center">
                        4
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">Setup your bot</p>
                        <p className="text-xs text-muted">Follow prompts to name your bot and choose a username (ending in 'bot')</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-semibold flex items-center justify-center">
                        5
                      </div>
                      <div>
                        <p className="text-sm text-text-primary font-medium">Copy your token</p>
                        <p className="text-xs text-muted">BotFather will send you a long token. Copy it below:</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Bot Token
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="w-full px-4 py-3 bg-bg-void border border-line rounded-xl text-text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  
                  <button
                    onClick={handleConnect}
                    disabled={!token.trim()}
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Save & Connect
                  </button>
                </div>

                {/* Security Note */}
                <div className="mt-6 flex items-start gap-3 p-4 bg-bg-void rounded-xl border border-line/50">
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-primary font-medium">Your token is encrypted</p>
                    <p className="text-xs text-muted mt-1">We use industry-standard encryption. Your token is never shared or logged.</p>
                  </div>
                </div>
              </>
            )}

            {step === 'connecting' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Connecting...</h3>
                <p className="text-muted">Validating token and setting up your bot</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Connected!</h3>
                <p className="text-muted mb-6">Your Telegram bot is now linked and ready</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface PricingRevealProps {
  selectedModel: string | null;
  onDeploy: () => void;
}

function PricingReveal({ selectedModel, onDeploy }: PricingRevealProps) {
  const modelName = models.find(m => m.id === selectedModel)?.name || 'Claude';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-surface to-surface/50 p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-text-primary">SimpleClaw Starter</h4>
          <p className="text-sm text-muted">Everything you need to get started</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent">$49<span className="text-lg font-normal text-muted">/mo</span></div>
          <div className="text-xs text-muted">Billed monthly</div>
        </div>
      </div>

      {/* AI Credits Badge */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-accent/10 rounded-lg inline-flex">
        <Zap className="w-4 h-4 text-accent" />
        <span className="text-sm text-accent font-medium">Includes $15 AI credits</span>
      </div>

      {/* Included Features */}
      <ul className="space-y-2 mb-6">
        {[
          `1 AI agent (${modelName} powered)`,
          "Telegram integration",
          "Unlimited messages",
          "24/7 uptime",
          "Webhook support",
          "Cancel anytime"
        ].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Stripe Checkout Button */}
      <button
        onClick={onDeploy}
        className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(255,30,45,0.3)] hover:shadow-[0_0_40px_rgba(255,30,45,0.4)] flex items-center justify-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        Deploy with Stripe
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Secure payment powered by Stripe. 7-day money-back guarantee.
      </p>
    </motion.div>
  );
}

interface CTAZoneProps {
  state: WidgetState;
  isReady: boolean;
  onCTAClick: () => void;
}

function CTAZone({ state, isReady, onCTAClick }: CTAZoneProps) {
  // State 1: Logged Out - Google Sign In
  if (state === 'logged-out') {
    return (
      <div className="text-center">
        <button
          onClick={onCTAClick}
          disabled={!isReady}
          className={`inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl transition-all focus-ring ${
            isReady
              ? "bg-white hover:bg-gray-100 text-gray-900 shadow-lg hover:shadow-xl"
              : "bg-line/50 text-muted cursor-not-allowed"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <p className="mt-3 text-sm text-muted">
          Sign in to deploy your AI assistant
        </p>
      </div>
    );
  }

  // State 2: Logged In - Connect Telegram
  if (state === 'logged-in') {
    return (
      <div className="text-center">
        <button
          onClick={onCTAClick}
          className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all focus-ring bg-[#0088cc] hover:bg-[#0077b3] text-white shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          Connect Telegram to continue
        </button>
        <p className="mt-3 text-sm text-muted">
          You&apos;ll need to create a bot via @BotFather
        </p>
      </div>
    );
  }

  // State 3 & 4: Token Entered / Deploy Ready - handled by PricingReveal
  return null;
}

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

export function SimpleClawWidget() {
  // Selection state
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  
  // Auth state
  const { isSignedIn, isLoaded } = useAuth();
  const { signIn } = useSignIn();
  
  // Widget state machine
  const [widgetState, setWidgetState] = useState<WidgetState>('logged-out');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update widget state based on auth
  useEffect(() => {
    if (isLoaded && isSignedIn && widgetState === 'logged-out') {
      setWidgetState('logged-in');
    }
  }, [isLoaded, isSignedIn, widgetState]);

  const handleModelSelect = (id: string) => {
    setSelectedModel(id);
  };

  const handleChannelSelect = (id: string) => {
    if (channels.find(c => c.id === id)?.available) {
      setSelectedChannel(id);
    }
  };

  const handleSignIn = () => {
    if (!signIn) return;
    
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sign-up",
      redirectUrlComplete: "/",
    });
  };

  const handleCTA = () => {
    if (widgetState === 'logged-out') {
      handleSignIn();
    } else if (widgetState === 'logged-in') {
      setIsModalOpen(true);
    }
  };

  const handleTokenConnect = () => {
    setWidgetState('token-entered');
    setTimeout(() => setIsModalOpen(false), 1500);
  };

  const handleStripeDeploy = () => {
    console.log('Redirecting to Stripe checkout...');
    alert('Stripe checkout would open here. For demo, proceeding to dashboard.');
    window.location.href = '/dashboard';
  };

  const isReadyToProceed = Boolean(selectedModel && selectedChannel === 'telegram');

  return (
    <section 
      id="simpleclaw-widget" 
      className="py-24 md:py-32 bg-bg-void"
      aria-labelledby="widget-heading"
    >
      {/* Telegram Modal */}
      <TelegramModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConnect={handleTokenConnect}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 id="widget-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Configure Your <span className="text-accent">AI Agent</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Pick your model, connect Telegram, and deploy in seconds.
          </p>
        </div>

        {/* Model Selection - Always Visible */}
        <ModelSelector 
          selectedModel={selectedModel} 
          onSelect={handleModelSelect}
        />

        {/* Channel Selection - Always Visible */}
        <ChannelSelector 
          selectedChannel={selectedChannel} 
          onSelect={handleChannelSelect}
        />

        {/* Dynamic CTA Zone */}
        <div className="mt-12">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${
              isReadyToProceed ? 'bg-accent' : 'bg-line'
            }`} />
            <div className="w-8 h-0.5 bg-line">
              <div className={`h-full bg-accent transition-all duration-500 ${
                widgetState !== 'logged-out' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-3 h-3 rounded-full ${
              widgetState !== 'logged-out' ? 'bg-accent' : 'bg-line'
            }`} />
            <div className="w-8 h-0.5 bg-line">
              <div className={`h-full bg-accent transition-all duration-500 ${
                widgetState === 'token-entered' || widgetState === 'deploy-ready' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`w-3 h-3 rounded-full ${
              widgetState === 'token-entered' || widgetState === 'deploy-ready' ? 'bg-accent' : 'bg-line'
            }`} />
          </div>

          {/* Show Pricing when token entered */}
          {widgetState === 'token-entered' && (
            <PricingReveal 
              selectedModel={selectedModel}
              onDeploy={handleStripeDeploy}
            />
          )}

          {/* Show CTA for other states */}
          {(widgetState === 'logged-out' || widgetState === 'logged-in') && (
            <CTAZone 
              state={widgetState}
              isReady={isReadyToProceed}
              onCTAClick={handleCTA}
            />
          )}

          {/* Helper text */}
          <div className="mt-6 text-center h-6">
            {!isReadyToProceed && (
              <p className="text-sm text-muted">
                Select a model and Telegram channel to continue
              </p>
            )}
            {isReadyToProceed && widgetState === 'logged-out' && (
              <p className="text-sm text-muted">
                Ready to configure your agent
              </p>
            )}
            {widgetState === 'logged-in' && (
              <p className="text-sm text-accent/80">
                Almost there! Connect your Telegram bot to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
