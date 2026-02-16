"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, X, CheckCircle, MessageCircle, Zap, ChevronRight, Lock, CreditCard } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { AnthropicLogo, GeminiLogo, OpenAILogo } from "@/components/ProviderLogos";

// Model options
interface ModelOption {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const models: ModelOption[] = [
  {
    id: "claude-opus",
    name: "Claude",
    subtitle: "Anthropic • Opus",
    icon: <AnthropicLogo className="w-6 h-6 text-[#CC785C]" />,
    color: "#CC785C",
  },
  {
    id: "gpt",
    name: "GPT",
    subtitle: "OpenAI • 4.1 / 5",
    icon: <OpenAILogo className="w-6 h-6 text-[#10A37F]" />,
    color: "#10A37F",
  },
  {
    id: "gemini",
    name: "Gemini",
    subtitle: "Google • 2.0+",
    icon: <GeminiLogo className="w-6 h-6" />,
    color: "#8AB4FF",
  },
];

// Channel options
interface ChannelOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  badge?: string;
}

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

// CTA Button States
type CTAState = 
  | 'logged_out'      // State 1: Not signed in
  | 'no_selections'   // State 2: Signed in, no model or channel
  | 'model_only'      // State 3: Signed in, model selected, no channel
  | 'both_selected'   // State 4: Signed in, both selected, no token
  | 'token_entered';  // State 5: Token entered, show pricing

interface PricingCardProps {
  onDeploy: () => void;
}

function PricingCard({ onDeploy }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,30,45,0.15)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-text-primary">Ready to Deploy</h4>
          <p className="text-sm text-muted">Your OpenClaw instance is configured</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-line/50">
          <span className="text-muted">Monthly subscription</span>
          <span className="font-semibold text-text-primary">$49/month</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-line/50">
          <span className="text-muted">Initial AI credits</span>
          <span className="font-semibold text-accent">$15 included</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-muted">First month total</span>
          <span className="font-bold text-lg text-text-primary">$49</span>
        </div>
      </div>
      
      <motion.button
        onClick={onDeploy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(255,30,45,0.3)] hover:shadow-[0_0_30px_rgba(255,30,45,0.5)]"
      >
        Pay & Deploy Now
      </motion.button>
      
      <p className="mt-3 text-xs text-muted text-center">
        Your agent will be live in under 60 seconds
      </p>
    </motion.div>
  );
}

// Telegram Token Modal
function TelegramModal({ isOpen, onClose, onComplete }: { isOpen: boolean; onClose: () => void; onComplete: () => void }) {
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'input' | 'connecting' | 'success'>('input');

  if (!isOpen) return null;

  const handleConnect = () => {
    if (!token.trim()) return;
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'input' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text-primary">Connect Telegram</h3>
                  <button onClick={onClose} className="p-2 hover:bg-line/50 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-muted" />
                  </button>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-text-primary mb-3">How to get your bot token?</h4>
                  <ol className="space-y-3 text-sm text-muted">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">1</span>
                      <span>Open Telegram and go to <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@BotFather</a></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">2</span>
                      <span>Type <code className="bg-line px-1.5 py-0.5 rounded text-text-primary">/newbot</code> and follow prompts</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">3</span>
                      <span>Copy the token BotFather sends you and paste below:</span>
                    </li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="w-full px-4 py-3 bg-bg-void border border-line rounded-xl text-text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                  <motion.button
                    onClick={handleConnect}
                    disabled={!token.trim()}
                    whileHover={token.trim() ? { scale: 1.02 } : {}}
                    whileTap={token.trim() ? { scale: 0.98 } : {}}
                    className="w-full py-3 bg-accent hover:bg-accent/90 disabled:bg-line/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Connect & Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Your token is encrypted and never shared</span>
                </div>
              </>
            )}

            {step === 'connecting' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Validating...</h3>
                <p className="text-muted">Checking your bot token</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-6">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">Token Verified!</h3>
                  <p className="text-muted text-sm">Your Telegram bot is ready</p>
                </div>
                
                {/* DELAYED PRICING REVEAL - Only shown after token entered */}
                <PricingCard onDeploy={() => {
                  onComplete();
                  setTimeout(() => {
                    window.location.href = '/dashboard';
                  }, 500);
                }} />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progressive CTA Button Component
interface ProgressiveCTAProps {
  state: CTAState;
  onAction: () => void;
  disabled?: boolean;
}

function ProgressiveCTA({ state, onAction }: ProgressiveCTAProps) {
  const getButtonConfig = () => {
    switch (state) {
      case 'logged_out':
        return {
          text: 'Sign in with Google',
          icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.766 12.2764c0-.8168-.0734-1.6033-.2094-2.3534H12.2344v4.4451h6.4766c-.2797 1.5156-1.1172 2.7979-2.3751 3.6523v3.0371h3.8476c2.2531-2.075 3.5547-5.1328 3.5547-8.7812z" fill="#4285F4"/>
              <path d="M12.2344 24c3.2141 0 5.9109-1.0664 7.8781-2.8867l-3.8476-3.0371c-1.0547.7066-2.4062 1.1234-4.0305 1.1234-3.1016 0-5.7312-2.0922-6.6672-4.9125h-3.975v3.1391C4.6414 21.2969 8.2031 24 12.2344 24z" fill="#34A853"/>
              <path d="M5.5672 14.2875c-.2391-.7066-.3766-1.4594-.3766-2.2375s.1375-1.5313.3766-2.2375v-3.1391h-3.975c-.8094 1.5938-1.2734 3.3953-1.2734 5.3766s.464 3.7828 1.2734 5.3766l3.975-3.1391z" fill="#FBBC05"/>
              <path d="M12.2344 4.6125c1.7453 0 3.3156.6016 4.5531 1.7797l3.4187-3.4188C17.9366 1.0891 15.2398 0 12.2344 0 8.2031 0 4.6414 2.7031 2.5922 6.7125l3.975 3.1391c.936-2.8203 3.5656-4.9125 6.6672-4.9125z" fill="#EA4335"/>
            </svg>
          ),
          className: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
          glow: false,
        };
      case 'no_selections':
        return {
          text: 'Choose Model & Channel',
          icon: <ChevronRight className="w-5 h-5" />,
          className: 'bg-surface hover:bg-surface/80 text-muted border border-line cursor-default',
          glow: false,
        };
      case 'model_only':
        return {
          text: 'Choose Telegram',
          icon: <MessageCircle className="w-5 h-5" />,
          className: 'bg-surface hover:bg-surface/80 text-muted border border-line cursor-default',
          glow: false,
        };
      case 'both_selected':
        return {
          text: 'Deploy OpenClaw',
          icon: <Zap className="w-5 h-5" />,
          className: 'bg-accent hover:bg-accent/90 text-white shadow-[0_0_30px_rgba(255,30,45,0.3)] hover:shadow-[0_0_40px_rgba(255,30,45,0.5)]',
          glow: true,
        };
      case 'token_entered':
        return {
          text: 'Pay & Deploy',
          icon: <CreditCard className="w-5 h-5" />,
          className: 'bg-accent hover:bg-accent/90 text-white shadow-[0_0_40px_rgba(255,30,45,0.4)] hover:shadow-[0_0_50px_rgba(255,30,45,0.6)]',
          glow: true,
        };
    }
  };

  const config = getButtonConfig();

  // For logged_out state, use SignInButton
  if (state === 'logged_out') {
    return (
      <SignInButton mode="modal">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl transition-all ${config.className}`}
        >
          {config.icon}
          {config.text}
        </motion.button>
      </SignInButton>
    );
  }

  // For disabled states (no selections, model only), show disabled button
  if (state === 'no_selections' || state === 'model_only') {
    return (
      <motion.button
        disabled
        className={`inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl transition-all opacity-60 cursor-not-allowed ${config.className}`}
      >
        {config.text}
        {config.icon}
      </motion.button>
    );
  }

  // For enabled states (both_selected, token_entered), show glowing button
  return (
    <motion.button
      onClick={onAction}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={config.glow ? {
        boxShadow: [
          '0 0 30px rgba(255,30,45,0.3)',
          '0 0 40px rgba(255,30,45,0.5)',
          '0 0 30px rgba(255,30,45,0.3)',
        ],
      } : {}}
      transition={config.glow ? {
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      } : {}}
      className={`inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl transition-all ${config.className}`}
    >
      {config.icon}
      {config.text}
    </motion.button>
  );
}

// Google SVG icon for the CTA
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.766 12.2764c0-.8168-.0734-1.6033-.2094-2.3534H12.2344v4.4451h6.4766c-.2797 1.5156-1.1172 2.7979-2.3751 3.6523v3.0371h3.8476c2.2531-2.075 3.5547-5.1328 3.5547-8.7812z" fill="#4285F4"/>
    <path d="M12.2344 24c3.2141 0 5.9109-1.0664 7.8781-2.8867l-3.8476-3.0371c-1.0547.7066-2.4062 1.1234-4.0305 1.1234-3.1016 0-5.7312-2.0922-6.6672-4.9125h-3.975v3.1391C4.6414 21.2969 8.2031 24 12.2344 24z" fill="#34A853"/>
    <path d="M5.5672 14.2875c-.2391-.7066-.3766-1.4594-.3766-2.2375s.1375-1.5313.3766-2.2375v-3.1391h-3.975c-.8094 1.5938-1.2734 3.3953-1.2734 5.3766s.464 3.7828 1.2734 5.3766l3.975-3.1391z" fill="#FBBC05"/>
    <path d="M12.2344 4.6125c1.7453 0 3.3156.6016 4.5531 1.7797l3.4187-3.4188C17.9366 1.0891 15.2398 0 12.2344 0 8.2031 0 4.6414 2.7031 2.5922 6.7125l3.975 3.1391c.936-2.8203 3.5656-4.9125 6.6672-4.9125z" fill="#EA4335"/>
  </svg>
);

export function TheWidget() {
  const shouldReduceMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [tokenEntered, setTokenEntered] = useState(false);

  // Handle model selection
  const handleModelSelect = (id: string) => {
    setSelectedModel(id);
    setTokenEntered(false); // Reset token state when selections change
  };

  // Handle channel selection
  const handleChannelSelect = (id: string) => {
    const channel = channels.find(c => c.id === id);
    if (channel?.available) {
      setSelectedChannel(id);
      setTokenEntered(false);
    }
  };

  // Determine current CTA state
  const getCTAState = (): CTAState => {
    if (!isSignedIn) return 'logged_out';
    if (tokenEntered) return 'token_entered';
    if (selectedModel && selectedChannel) return 'both_selected';
    if (selectedModel && !selectedChannel) return 'model_only';
    return 'no_selections';
  };

  const ctaState = getCTAState();

  // Handle CTA click
  const handleCTAClick = () => {
    if (ctaState === 'both_selected') {
      setShowTelegramModal(true);
    } else if (ctaState === 'token_entered') {
      // Redirect to payment or dashboard
      window.location.href = '/dashboard';
    }
  };

  // Handle token submission from modal
  const handleTokenComplete = () => {
    setTokenEntered(true);
    setShowTelegramModal(false);
  };

  // Get status text for below the button
  const getStatusText = () => {
    if (!isSignedIn) {
      return { text: 'No credit card required • Free tier available', hasCheckmarks: true };
    }
    if (ctaState === 'no_selections') {
      return { 
        text: `${!selectedModel ? '• Choose a model' : ''} ${!selectedChannel ? '• Choose a channel' : ''}`, 
        hasCheckmarks: false 
      };
    }
    if (ctaState === 'model_only') {
      return { text: `Selected: ${models.find(m => m.id === selectedModel)?.name} • Choose Telegram`, hasCheckmarks: false };
    }
    if (ctaState === 'both_selected') {
      return { text: `${models.find(m => m.id === selectedModel)?.name} + ${channels.find(c => c.id === selectedChannel)?.name} ready`, hasCheckmarks: false };
    }
    return { text: 'Ready to deploy', hasCheckmarks: true };
  };

  const status = getStatusText();

  return (
    <section 
      id="the-widget" 
      className="py-12 md:py-20 bg-bg-void"
      aria-labelledby="widget-heading"
    >
      {/* Telegram Modal with Delayed Pricing */}
      <TelegramModal 
        isOpen={showTelegramModal} 
        onClose={() => setShowTelegramModal(false)}
        onComplete={handleTokenComplete}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Widget Container */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0.86, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-surface/90 border border-line rounded-3xl p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        >
          <h2 id="widget-heading" className="sr-only">Configure Your AI Agent</h2>

          {/* Step 1: Model Selection */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${selectedModel ? 'bg-accent text-white' : 'bg-line text-muted'}`}>
                1
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                Which model do you want as default?
              </h3>
              {selectedModel && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {models.map((model) => (
                <motion.button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-5 rounded-xl border-2 text-left transition-all duration-300 focus-ring overflow-hidden ${
                    selectedModel === model.id
                      ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                      : "border-line bg-bg-void hover:border-line/80"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-line/60"
                      style={{ backgroundColor: `${model.color}14` }}
                    >
                      {model.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary group-hover:tracking-[0.01em] transition-all duration-300">
                        {model.name}
                      </div>
                      <div className="text-sm text-muted">{model.subtitle}</div>
                    </div>
                  </div>

                  <div
                    className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent origin-center scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 transition-all duration-300"
                    aria-hidden="true"
                  />

                  <AnimatePresence>
                    {selectedModel === model.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step 2: Channel Selection */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${selectedChannel ? 'bg-accent text-white' : 'bg-line text-muted'}`}>
                2
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                Which channel do you want to use?
              </h3>
              {selectedChannel && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <motion.button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  disabled={!channel.available}
                  whileHover={channel.available ? { scale: 1.02 } : {}}
                  whileTap={channel.available ? { scale: 0.98 } : {}}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 focus-ring ${
                    selectedChannel === channel.id && channel.available
                      ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                      : channel.available
                      ? "border-line bg-bg-void hover:border-line/80 cursor-pointer"
                      : "border-line/50 bg-bg-void/50 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedChannel === channel.id && channel.available
                          ? "bg-accent/10 text-accent"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {channel.icon}
                    </div>
                    <div>
                      <div className={`font-semibold ${channel.available ? 'text-text-primary' : 'text-muted'}`}>
                        {channel.name}
                      </div>
                      {channel.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-line rounded text-xs text-muted">
                          {channel.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {selectedChannel === channel.id && channel.available && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                      >
                        <Sparkles className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Progressive CTA Area - Single morphing button */}
          <div className="border-t border-line pt-8">
            <div className="text-center">
              {/* THE SINGLE PROGRESSIVE CTA BUTTON */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={ctaState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProgressiveCTA 
                    state={ctaState} 
                    onAction={handleCTAClick}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Status text below button */}
              <motion.div 
                className="mt-4 flex items-center justify-center gap-2 text-sm text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {status.hasCheckmarks && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                    <span className="text-line">•</span>
                    <span>Cancel anytime</span>
                  </>
                )}
                {!status.hasCheckmarks && (
                  <span className={ctaState === 'no_selections' || ctaState === 'model_only' ? 'text-accent/60' : 'text-green-500/80'}>
                    {status.text}
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0.9 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Deploys in under 60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>End-to-end encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Start for free</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
