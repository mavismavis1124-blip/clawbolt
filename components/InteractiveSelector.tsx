"use client";

import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Send, MessageCircle, Sparkles, Cpu, Zap, X, CheckCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

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
        <rect width="24" height="24" rx="6" fill="url(#geminiGradient)"/>
        <defs>
          <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

// Telegram Connection Modal Component
function TelegramModal({ isOpen, onClose, onConnect }: { isOpen: boolean; onClose: () => void; onConnect: (token: string) => void }) {
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
                    <span>Start a chat and type <code className="bg-line px-1.5 py-0.5 rounded text-text-primary">/newbot</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">3</span>
                    <span>Follow prompts to name your bot and choose a username</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center font-medium">4</span>
                    <span>BotFather will send you a token. Paste it below:</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full px-4 py-3 bg-bg-void border border-line rounded-xl text-text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleConnect}
                  disabled={!token.trim()}
                  className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Connect
                </button>
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
              <p className="text-muted mb-4">Your bot is now being deployed</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function InteractiveSelector() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  const handleModelSelect = (id: string) => {
    setSelectedModel(id);
  };

  const handleChannelSelect = (id: string) => {
    if (channels.find(c => c.id === id)?.available) {
      setSelectedChannel(id);
    }
  };

  const handleDeploy = () => {
    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = '/sign-up';
      return;
    }
    
    if (selectedChannel === 'telegram') {
      setShowTelegramModal(true);
    }
  };

  const isReadyToDeploy = selectedModel && selectedChannel;
  const canDeploy = isReadyToDeploy && isSignedIn;

  return (
    <section 
      ref={ref}
      id="selector" 
      className="py-24 md:py-32 bg-bg-void"
      aria-labelledby="selector-heading"
    >
      {/* Telegram Connection Modal */}
      <TelegramModal 
        isOpen={showTelegramModal} 
        onClose={() => setShowTelegramModal(false)}
        onConnect={(token) => {
          console.log('Connected with token:', token);
          // Redirect to dashboard after connection
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 id="selector-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Configure Your <span className="text-accent">AI Agent</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Pick your model, choose your channel, and deploy in seconds.
          </p>
        </motion.div>

        {/* Section 1: Model Selection */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-6">
            Which model do you want as default?
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 focus-ring ${
                  selectedModel === model.id
                    ? "border-[#FF1E2D] bg-surface shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                    : "border-[#242424] bg-surface/50 hover:border-line/80"
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
        </motion.div>

        {/* Section 2: Channel Selection */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold text-text-primary mb-6">
            Which channel do you want to use?
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                disabled={!channel.available}
                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 focus-ring ${
                  selectedChannel === channel.id && channel.available
                    ? "border-[#FF1E2D] bg-surface shadow-[0_0_20px_rgba(255,30,45,0.15)]"
                    : channel.available
                    ? "border-[#242424] bg-surface/50 hover:border-line/80 cursor-pointer"
                    : "border-[#242424]/50 bg-surface/30 cursor-not-allowed opacity-60"
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
        </motion.div>

        {/* Section 3: Deploy CTA - SimpleClaw Style */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* User Status */}
          {isSignedIn && (
            <div className="flex items-center justify-center gap-3 mb-4 text-sm">
              <span className="text-text-primary">Signed in as {isSignedIn ? 'you' : 'guest'}</span>
              <Link href="/" className="text-muted hover:text-text-primary transition-colors">
                (Sign out)
              </Link>
            </div>
          )}

          {/* Deploy Button - Progressive Disclosure */}
          <button
            onClick={handleDeploy}
            disabled={!canDeploy}
            className={`inline-flex items-center gap-2 px-10 py-4 font-semibold rounded-xl transition-all focus-ring ${
              canDeploy
                ? "bg-accent hover:bg-accent/90 text-white shadow-[0_0_30px_rgba(255,30,45,0.3)] hover:shadow-[0_0_40px_rgba(255,30,45,0.4)]"
                : "bg-line/50 text-muted cursor-not-allowed border border-line/30"
            }`}
          >
            <Zap className={`w-5 h-5 ${canDeploy ? '' : 'opacity-50'}`} />
            Deploy OpenClaw
          </button>

          {/* Status Message */}
          <div className="mt-4 h-6">
            {!isSignedIn && isReadyToDeploy && (
              <p className="text-sm text-muted">
                <Link href="/sign-in" className="text-accent hover:underline">Sign in</Link> to continue
              </p>
            )}
            {isSignedIn && !isReadyToDeploy && (
              <p className="text-sm text-accent/80">
                Select a model and channel to continue
              </p>
            )}
            {isSignedIn && selectedChannel && !selectedModel && (
              <p className="text-sm text-accent/80">
                Connect Telegram to continue
              </p>
            )}
            {canDeploy && (
              <p className="text-sm text-muted flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                Ready to deploy with {models.find(m => m.id === selectedModel)?.name} via {channels.find(c => c.id === selectedChannel)?.name}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
