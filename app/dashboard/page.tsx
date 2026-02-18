'use client'

import { useAuth, useUser, SignOutButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { 
  Bot, 
  Settings, 
  MessageSquare, 
  CreditCard, 
  LogOut,
  Plus,
  ExternalLink,
  Trash2,
  Play,
  Square,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  RefreshCw
} from 'lucide-react'
import { Header } from '@/components/Header'

interface DeploymentStats {
  total: number
  success: number
  failed: number
  inProgress: number
  pending: number
}

interface BotData {
  id: string
  userId: string
  name: string
  username?: string
  token: string
  model?: 'gpt' | 'claude' | 'gemini' | string
  status: 'PENDING' | 'DEPLOYING' | 'LIVE' | 'ERROR' | 'STOPPED'
  runtimeStatus?: string
  containerName?: string | null
  runtimePort?: number | null
  webhookUrl?: string
  createdAt: string
  updatedAt: string
  deployments?: DeploymentData[]
  deploymentStats?: DeploymentStats
}

interface DeploymentData {
  id: string
  botId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
  logs?: string
  error?: string
  createdAt: string
  updatedAt: string
}

interface RuntimeTelemetry {
  botId: string
  botStatus: string
  runtimeStatus: string
  runtimePort?: number | null
  containerName?: string | null
  containerStatus?: string | null
  startedAt?: string | null
  updatedAt?: string
  logs?: string
  host?: {
    load1: number
    memoryUsedPercent: number
    memoryFreeGb: number
  }
}

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'bots' | 'settings' | 'billing'>('bots')
  const [bots, setBots] = useState<BotData[]>([])
  const [showAddBot, setShowAddBot] = useState(false)
  const [newBotToken, setNewBotToken] = useState('')
  const [newBotModel, setNewBotModel] = useState<'gpt' | 'claude' | 'gemini'>('gemini')
  const [newApiKey, setNewApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedBot, setExpandedBot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deployingBotId, setDeployingBotId] = useState<string | null>(null)
  
  // Edit bot config state
  const [editingBotId, setEditingBotId] = useState<string | null>(null)
  const [editModel, setEditModel] = useState<'gpt' | 'claude' | 'gemini'>('gemini')
  const [editApiKey, setEditApiKey] = useState('')
  const [showEditApiKey, setShowEditApiKey] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  // API key test states
  const [isTestingNewKey, setIsTestingNewKey] = useState(false)
  const [newKeyTestMessage, setNewKeyTestMessage] = useState<string | null>(null)
  const [newKeyTestOk, setNewKeyTestOk] = useState<boolean | null>(null)

  const [isTestingEditKey, setIsTestingEditKey] = useState(false)
  const [editKeyTestMessage, setEditKeyTestMessage] = useState<string | null>(null)
  const [editKeyTestOk, setEditKeyTestOk] = useState<boolean | null>(null)

  // Runtime telemetry streaming (per expanded bot)
  const [runtimeTelemetryByBot, setRuntimeTelemetryByBot] = useState<Record<string, RuntimeTelemetry>>({})
  const [runtimeErrorByBot, setRuntimeErrorByBot] = useState<Record<string, string | null>>({})
  const [runtimeLoadingByBot, setRuntimeLoadingByBot] = useState<Record<string, boolean>>({})

  // Fetch bots on mount
  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots')
      if (!res.ok) throw new Error('Failed to fetch bots')
      const data = await res.json()
      setBots(data.bots || [])
    } catch (err) {
      console.error('Error fetching bots:', err)
      setError('Failed to load bots')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
    if (isSignedIn) {
      fetchBots()
    }
  }, [isLoaded, isSignedIn, router, fetchBots])

  // Poll for updates when a bot is deploying
  useEffect(() => {
    if (!deployingBotId) return

    const interval = setInterval(() => {
      fetchBots()
    }, 3000)

    return () => clearInterval(interval)
  }, [deployingBotId, fetchBots])

  const testApiKey = async (provider: 'gemini' | 'gpt' | 'claude', apiKey: string) => {
    const res = await fetch('/api/keys/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data?.error || 'API key test failed')
    }

    return data?.message || 'API key looks valid.'
  }

  const handleTestNewKey = async () => {
    if (!newApiKey.trim()) {
      setNewKeyTestOk(false)
      setNewKeyTestMessage('Enter an API key first.')
      return
    }

    setIsTestingNewKey(true)
    setNewKeyTestMessage(null)

    try {
      const message = await testApiKey(newBotModel, newApiKey)
      setNewKeyTestOk(true)
      setNewKeyTestMessage(message)
    } catch (err: any) {
      setNewKeyTestOk(false)
      setNewKeyTestMessage(err.message)
    } finally {
      setIsTestingNewKey(false)
    }
  }

  const handleTestEditKey = async () => {
    if (!editApiKey.trim()) {
      setEditKeyTestOk(false)
      setEditKeyTestMessage('Enter an API key first.')
      return
    }

    setIsTestingEditKey(true)
    setEditKeyTestMessage(null)

    try {
      const message = await testApiKey(editModel, editApiKey)
      setEditKeyTestOk(true)
      setEditKeyTestMessage(message)
    } catch (err: any) {
      setEditKeyTestOk(false)
      setEditKeyTestMessage(err.message)
    } finally {
      setIsTestingEditKey(false)
    }
  }

  const fetchRuntimeTelemetry = useCallback(async (botId: string, silent = false) => {
    if (!silent) {
      setRuntimeLoadingByBot((prev) => ({ ...prev, [botId]: true }))
    }

    try {
      const res = await fetch(`/api/runtime/logs?botId=${botId}&tail=140`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch runtime telemetry')
      }

      setRuntimeTelemetryByBot((prev) => ({
        ...prev,
        [botId]: data,
      }))
      setRuntimeErrorByBot((prev) => ({ ...prev, [botId]: null }))
    } catch (err: any) {
      setRuntimeErrorByBot((prev) => ({
        ...prev,
        [botId]: err?.message || 'Failed to fetch runtime telemetry',
      }))
    } finally {
      if (!silent) {
        setRuntimeLoadingByBot((prev) => ({ ...prev, [botId]: false }))
      }
    }
  }, [])

  useEffect(() => {
    if (!expandedBot || activeTab !== 'bots') return

    fetchRuntimeTelemetry(expandedBot)
    const interval = setInterval(() => {
      fetchRuntimeTelemetry(expandedBot, true)
    }, 2500)

    return () => clearInterval(interval)
  }, [expandedBot, activeTab, fetchRuntimeTelemetry])

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  const handleAddBot = async () => {
    if (!newBotToken.trim()) return

    if (!newApiKey.trim()) {
      setError('API key is required to deploy this bot')
      return
    }

    setIsDeploying(true)
    setError(null)

    try {
      // Step 1: Create the bot
      const createRes = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: newBotToken.trim(),
          model: newBotModel,
          channel: 'telegram',
          apiKey: newApiKey.trim(),
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        throw new Error(err.error || 'Failed to create bot')
      }

      const { bot } = await createRes.json()

      // Add to list immediately with deploying status
      setBots(prev => [bot, ...prev])
      setNewBotToken('')
      setShowAddBot(false)
      setDeployingBotId(bot.id)

      // Step 2: Deploy the bot
      const deployRes = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: bot.id,
          model: newBotModel,
          channel: 'telegram',
          apiKey: newApiKey.trim(),
        }),
      })

      if (!deployRes.ok) {
        const err = await deployRes.json()
        throw new Error(err.error || 'Deployment failed')
      }

      setNewApiKey('')
      setShowApiKey(false)
      setNewKeyTestMessage(null)
      setNewKeyTestOk(null)

      // Refresh to get updated status
      await fetchBots()
      setDeployingBotId(null)
    } catch (err: any) {
      setError(err.message)
      await fetchBots() // Refresh to get actual status
    } finally {
      setIsDeploying(false)
      setDeployingBotId(null)
    }
  }

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot?')) return

    try {
      const res = await fetch(`/api/bots?id=${botId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete bot')

      setBots(prev => prev.filter(b => b.id !== botId))
    } catch (err) {
      setError('Failed to delete bot')
    }
  }

  const handleStopBot = async (botId: string) => {
    try {
      const res = await fetch(`/api/deploy?botId=${botId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to stop bot')

      await fetchBots()
    } catch (err) {
      setError('Failed to stop bot')
    }
  }

  const handleRedeploy = async (botId: string, model?: string) => {
    const apiKey = window.prompt('Paste API key for redeploy (it will be used for this deployment only):')
    if (!apiKey || !apiKey.trim()) return

    const targetModel = model || 'gemini'

    setDeployingBotId(botId)

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          model: targetModel,
          channel: 'telegram',
          apiKey: apiKey.trim(),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Redeployment failed')
      }

      await fetchBots()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeployingBotId(null)
    }
  }

  const startEditingConfig = (bot: BotData) => {
    setEditingBotId(bot.id)
    setEditModel((bot.model as 'gpt' | 'claude' | 'gemini') || 'gemini')
    setEditApiKey('') // Don't show existing key, just placeholder for new one
    setShowEditApiKey(false)
    setEditKeyTestMessage(null)
    setEditKeyTestOk(null)
  }

  const cancelEditingConfig = () => {
    setEditingBotId(null)
    setEditModel('gemini')
    setEditApiKey('')
    setShowEditApiKey(false)
    setEditKeyTestMessage(null)
    setEditKeyTestOk(null)
  }

  const handleSaveConfig = async (botId: string) => {
    if (!editApiKey.trim()) {
      setError('API key is required to save configuration')
      return
    }

    const currentBot = bots.find(b => b.id === botId)
    const wasLive = currentBot?.status === 'LIVE'

    setIsSavingConfig(true)
    setError(null)

    try {
      // Step 1: Update bot model and API key in database
      const updateRes = await fetch('/api/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: botId,
          model: editModel,
          apiKey: editApiKey.trim(),
        }),
      })

      if (!updateRes.ok) {
        const err = await updateRes.json()
        throw new Error(err.error || 'Failed to update bot configuration')
      }

      // Step 2: Refresh bot data to confirm save worked
      await fetchBots()
      
      // Step 3: If bot was live before update, restart runtime to apply key/model changes
      if (wasLive) {
        // Stop the container
        await fetch(`/api/deploy?botId=${botId}`, { method: 'DELETE' })
        
        // Wait for container to fully stop
        await new Promise(r => setTimeout(r, 3000))
        
        // Deploy - the backend will use the apiKey from database
        const deployRes = await fetch('/api/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId,
            model: editModel,
            channel: 'telegram',
            // Don't send apiKey - let backend use what's in DB
          }),
        })

        if (!deployRes.ok) {
          const err = await deployRes.json()
          throw new Error(err.error || 'Failed to redeploy with new configuration')
        }
        
        // Wait for deployment to start processing
        await new Promise(r => setTimeout(r, 2000))
      }

      await fetchBots()
      cancelEditingConfig()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSavingConfig(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-green-500'
      case 'DEPLOYING': return 'bg-yellow-500 animate-pulse'
      case 'PENDING': return 'bg-gray-400'
      case 'ERROR': return 'bg-red-500'
      case 'STOPPED': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-green-500/10 text-green-500'
      case 'DEPLOYING': return 'bg-yellow-500/10 text-yellow-500'
      case 'PENDING': return 'bg-gray-500/10 text-gray-500'
      case 'ERROR': return 'bg-red-500/10 text-red-500'
      case 'STOPPED': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'LIVE': return '● Live'
      case 'DEPLOYING': return '○ Deploying'
      case 'PENDING': return '○ Pending'
      case 'ERROR': return '● Error'
      case 'STOPPED': return '○ Stopped'
      default: return '○ Unknown'
    }
  }

  const formatRelativeDate = (iso?: string | null) => {
    if (!iso) return '—'
    const time = new Date(iso).getTime()
    if (Number.isNaN(time)) return '—'

    const diffMs = Date.now() - time
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const formatUptime = (startedAt?: string | null) => {
    if (!startedAt) return '—'
    const start = new Date(startedAt).getTime()
    if (Number.isNaN(start)) return '—'

    const diffMs = Math.max(Date.now() - start, 0)
    const mins = Math.floor(diffMs / 60000)
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    const minutes = mins % 60

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-bg-void">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.firstName || 'there'}
          </h1>
          <p className="text-text-secondary">
            Manage your OpenClaw deployments and runtime health
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center space-x-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('bots')}
            className={`px-4 py-3 flex items-center space-x-2 text-sm font-medium transition-colors ${
              activeTab === 'bots' 
                ? 'text-accent-crimson border-b-2 border-accent-crimson' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>My Bots</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-3 flex items-center space-x-2 text-sm font-medium transition-colors ${
              activeTab === 'billing' 
                ? 'text-accent-crimson border-b-2 border-accent-crimson' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 flex items-center space-x-2 text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'text-accent-crimson border-b-2 border-accent-crimson' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'bots' && (
          <div>
            {/* Add Bot Button */}
            {!showAddBot ? (
              <button
                onClick={() => setShowAddBot(true)}
                className="mb-6 flex items-center space-x-2 px-4 py-2 bg-accent-crimson hover:bg-accent-crimson/90 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Deploy New Bot</span>
              </button>
            ) : (
              <div className="mb-6 p-6 border border-border-subtle rounded-xl bg-surface-elevated">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Deploy Your OpenClaw
                </h3>
                <p className="text-text-secondary mb-4">
                  Paste your Telegram bot token and your model API key. The key is used for this deployment.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={newBotToken}
                    onChange={(e) => setNewBotToken(e.target.value)}
                    placeholder="Telegram token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="w-full px-4 py-2 bg-surface-hover border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-crimson"
                  />

                  <div className="flex items-center gap-2">
                    {(['gemini', 'gpt', 'claude'] as const).map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setNewBotModel(model)
                          setNewKeyTestMessage(null)
                          setNewKeyTestOk(null)
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          newBotModel === model
                            ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson'
                            : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                        }`}
                      >
                        {model === 'gpt' ? 'OpenAI GPT' : model === 'claude' ? 'Anthropic Claude' : 'Google Gemini'}
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={newApiKey}
                      onChange={(e) => {
                        setNewApiKey(e.target.value)
                        setNewKeyTestMessage(null)
                        setNewKeyTestOk(null)
                      }}
                      placeholder={`${newBotModel.toUpperCase()} API key`}
                      className="flex-1 px-4 py-2 bg-surface-hover border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-crimson"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((prev) => !prev)}
                      className="px-3 py-2 border border-border-subtle hover:bg-surface-hover text-text-secondary rounded-lg transition-colors"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestNewKey}
                      disabled={isTestingNewKey || !newApiKey.trim()}
                      className="px-4 py-2 border border-border-subtle hover:bg-surface-hover text-text-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isTestingNewKey && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isTestingNewKey ? 'Testing key…' : 'Test API key'}</span>
                    </button>
                    {newKeyTestMessage && (
                      <p className={`text-xs ${newKeyTestOk ? 'text-green-500' : 'text-red-500'}`}>
                        {newKeyTestMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddBot}
                      disabled={isDeploying || !newBotToken.trim() || !newApiKey.trim()}
                      className="px-6 py-2 bg-accent-crimson hover:bg-accent-crimson/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isDeploying && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isDeploying ? 'Deploying...' : 'Deploy'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddBot(false)
                        setNewKeyTestMessage(null)
                        setNewKeyTestOk(null)
                      }}
                      disabled={isDeploying}
                      className="px-4 py-2 border border-border-subtle hover:bg-surface-hover text-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bots List */}
            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-accent-crimson animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Loading your bots...</p>
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border-subtle rounded-xl">
                <Bot className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No bots yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Deploy your first OpenClaw to get started
                </p>
                <button
                  onClick={() => setShowAddBot(true)}
                  className="px-4 py-2 bg-accent-crimson hover:bg-accent-crimson/90 text-white rounded-lg font-medium transition-colors"
                >
                  Deploy Your First OpenClaw
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="p-4 border border-border-subtle rounded-xl bg-surface-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`} />
                        <div>
                          <h4 className="font-medium text-text-primary flex items-center space-x-2">
                            <span>{bot.name}</span>
                            {bot.username && (
                              <span className="text-text-tertiary text-sm">@{bot.username}</span>
                            )}
                          </h4>
                          <p className="text-sm text-text-secondary font-mono">{bot.token}</p>
                          {bot.model && (
                            <p className="text-xs text-text-tertiary uppercase tracking-wide mt-1">Model: {bot.model}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(bot.status)}`}>
                          {getStatusLabel(bot.status)}
                        </span>
                        
                        {/* Action Buttons */}
                        {bot.status === 'LIVE' ? (
                          <button
                            onClick={() => handleStopBot(bot.id)}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-text-secondary transition-colors"
                            title="Stop bot"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                        ) : bot.status === 'STOPPED' || bot.status === 'ERROR' ? (
                          <button
                            onClick={() => handleRedeploy(bot.id, bot.model)}
                            disabled={deployingBotId === bot.id}
                            className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg text-text-secondary transition-colors disabled:opacity-50"
                            title="Redeploy"
                          >
                            {deployingBotId === bot.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        ) : null}
                        
                        <button
                          onClick={() => setExpandedBot(expandedBot === bot.id ? null : bot.id)}
                          className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                          title="View details"
                        >
                          {expandedBot === bot.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBot(bot.id)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-text-secondary transition-colors"
                          title="Delete bot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedBot === bot.id && (
                      <div className="mt-4 pt-4 border-t border-border-subtle">
                        {/* Configuration Editor */}
                        {editingBotId === bot.id ? (
                          <div className="mb-6 p-4 bg-surface-hover rounded-xl border border-border-subtle">
                            <h5 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Edit Configuration
                            </h5>
                            
                            <div className="space-y-4">
                              {/* Model Selector */}
                              <div>
                                <label className="text-xs text-text-tertiary uppercase tracking-wide block mb-2">Model Provider</label>
                                <div className="flex items-center gap-2">
                                  {(['gemini', 'gpt', 'claude'] as const).map((model) => (
                                    <button
                                      key={model}
                                      type="button"
                                      onClick={() => {
                                        setEditModel(model)
                                        setEditKeyTestMessage(null)
                                        setEditKeyTestOk(null)
                                      }}
                                      disabled={isSavingConfig}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        editModel === model
                                          ? 'bg-accent-crimson/10 border-accent-crimson text-accent-crimson'
                                          : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                      } disabled:opacity-50`}
                                    >
                                      {model === 'gpt' ? 'OpenAI GPT' : model === 'claude' ? 'Anthropic Claude' : 'Google Gemini'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* API Key Input */}
                              <div>
                                <label className="text-xs text-text-tertiary uppercase tracking-wide block mb-2">
                                  {editModel.toUpperCase()} API Key
                                </label>
                                <div className="flex space-x-2">
                                  <input
                                    type={showEditApiKey ? 'text' : 'password'}
                                    value={editApiKey}
                                    onChange={(e) => {
                                      setEditApiKey(e.target.value)
                                      setEditKeyTestMessage(null)
                                      setEditKeyTestOk(null)
                                    }}
                                    placeholder={`Enter new ${editModel.toUpperCase()} API key`}
                                    disabled={isSavingConfig}
                                    className="flex-1 px-4 py-2 bg-bg-void border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-crimson disabled:opacity-50"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditApiKey((prev) => !prev)}
                                    disabled={isSavingConfig}
                                    className="px-3 py-2 border border-border-subtle hover:bg-bg-void text-text-secondary rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {showEditApiKey ? 'Hide' : 'Show'}
                                  </button>
                                </div>
                                <p className="text-xs text-text-tertiary mt-1">
                                  {bot.status === 'LIVE' ? 'Changing config will restart your bot automatically.' : 'Save to apply new configuration.'}
                                </p>

                                <div className="mt-3 flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={handleTestEditKey}
                                    disabled={isTestingEditKey || !editApiKey.trim() || isSavingConfig}
                                    className="px-4 py-2 border border-border-subtle hover:bg-bg-void text-text-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                  >
                                    {isTestingEditKey && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{isTestingEditKey ? 'Testing key…' : 'Test API key'}</span>
                                  </button>
                                  {editKeyTestMessage && (
                                    <p className={`text-xs ${editKeyTestOk ? 'text-green-500' : 'text-red-500'}`}>
                                      {editKeyTestMessage}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleSaveConfig(bot.id)}
                                  disabled={isSavingConfig || !editApiKey.trim()}
                                  className="px-4 py-2 bg-accent-crimson hover:bg-accent-crimson/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  {isSavingConfig && <Loader2 className="w-4 h-4 animate-spin" />}
                                  <span>{isSavingConfig ? 'Saving...' : 'Save & Apply'}</span>
                                </button>
                                <button
                                  onClick={cancelEditingConfig}
                                  disabled={isSavingConfig}
                                  className="px-4 py-2 border border-border-subtle hover:bg-bg-void text-text-secondary rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs text-text-tertiary uppercase tracking-wide">Bot ID</label>
                            <p className="text-sm text-text-secondary font-mono">{bot.id}</p>
                          </div>
                          <div>
                            <label className="text-xs text-text-tertiary uppercase tracking-wide">Created</label>
                            <p className="text-sm text-text-secondary">
                              {new Date(bot.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {bot.model && (
                            <div>
                              <label className="text-xs text-text-tertiary uppercase tracking-wide">Model</label>
                              <p className="text-sm text-text-secondary capitalize">{bot.model}</p>
                            </div>
                          )}
                          {bot.webhookUrl && (
                            <div className="col-span-2">
                              <label className="text-xs text-text-tertiary uppercase tracking-wide">Webhook URL</label>
                              <p className="text-sm text-text-secondary font-mono truncate">{bot.webhookUrl}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Edit Config Button */}
                        {!editingBotId && (
                          <button
                            onClick={() => startEditingConfig(bot)}
                            className="mb-4 flex items-center space-x-2 px-3 py-2 text-sm border border-border-subtle hover:bg-surface-hover text-text-secondary rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Edit Configuration</span>
                          </button>
                        )}

                        {/* Deployment Logs */}
                        {bot.deployments && bot.deployments.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Terminal className="w-4 h-4 text-text-tertiary" />
                              <span className="text-sm text-text-secondary">Latest Deployment</span>
                              {bot.deployments[0].status === 'SUCCESS' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : bot.deployments[0].status === 'FAILED' ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                              )}
                            </div>
                            {bot.deployments[0].logs && (
                              <pre className="p-3 bg-bg-void rounded-lg text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap">
                                {bot.deployments[0].logs}
                              </pre>
                            )}
                            {bot.deployments[0].error && (
                              <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm text-red-500">{bot.deployments[0].error}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bot Analytics */}
                        <div className="mt-4 rounded-xl border border-border-subtle bg-bg-void p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-text-tertiary" />
                              <span className="text-sm text-text-secondary">Bot Analytics</span>
                            </div>
                            <span className="text-[11px] text-text-tertiary">
                              Updated {formatRelativeDate(runtimeTelemetryByBot[bot.id]?.updatedAt || bot.updatedAt)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-lg border border-border-subtle bg-surface-hover px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Deployments</p>
                              <p className="text-base font-semibold text-text-primary">{bot.deploymentStats?.total ?? 0}</p>
                            </div>
                            <div className="rounded-lg border border-border-subtle bg-surface-hover px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Success rate</p>
                              <p className="text-base font-semibold text-green-400">
                                {(() => {
                                  const total = bot.deploymentStats?.total ?? 0
                                  const success = bot.deploymentStats?.success ?? 0
                                  return total > 0 ? `${Math.round((success / total) * 100)}%` : '—'
                                })()}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border-subtle bg-surface-hover px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Runtime uptime</p>
                              <p className="text-base font-semibold text-text-primary">{formatUptime(runtimeTelemetryByBot[bot.id]?.startedAt)}</p>
                            </div>
                            <div className="rounded-lg border border-border-subtle bg-surface-hover px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-text-tertiary">Last deployment</p>
                              <p className="text-base font-semibold text-text-primary">
                                {formatRelativeDate(bot.deployments?.[0]?.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                            <span className="rounded-md border border-border-subtle px-2 py-0.5">
                              success: {bot.deploymentStats?.success ?? 0}
                            </span>
                            <span className="rounded-md border border-border-subtle px-2 py-0.5">
                              failed: {bot.deploymentStats?.failed ?? 0}
                            </span>
                            <span className="rounded-md border border-border-subtle px-2 py-0.5">
                              active jobs: {(bot.deploymentStats?.inProgress ?? 0) + (bot.deploymentStats?.pending ?? 0)}
                            </span>
                            <span className="rounded-md border border-border-subtle px-2 py-0.5">
                              runtime: {runtimeTelemetryByBot[bot.id]?.containerStatus || bot.runtimeStatus || 'unknown'}
                            </span>
                          </div>
                        </div>

                        {/* Live Runtime Stream */}
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-text-tertiary" />
                              <span className="text-sm text-text-secondary">Runtime Stream</span>
                              {runtimeTelemetryByBot[bot.id]?.containerStatus === 'running' && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-green-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                  live
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => fetchRuntimeTelemetry(bot.id)}
                              disabled={runtimeLoadingByBot[bot.id]}
                              className="inline-flex items-center gap-1 rounded-md border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${runtimeLoadingByBot[bot.id] ? 'animate-spin' : ''}`} />
                              refresh
                            </button>
                          </div>

                          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                            <span className="rounded-md border border-border-subtle bg-bg-void px-2 py-0.5">
                              container: {runtimeTelemetryByBot[bot.id]?.containerName || '—'}
                            </span>
                            <span className="rounded-md border border-border-subtle bg-bg-void px-2 py-0.5">
                              status: {runtimeTelemetryByBot[bot.id]?.containerStatus || bot.runtimeStatus || '—'}
                            </span>
                            <span className="rounded-md border border-border-subtle bg-bg-void px-2 py-0.5">
                              port: {runtimeTelemetryByBot[bot.id]?.runtimePort ?? bot.runtimePort ?? '—'}
                            </span>
                            {runtimeTelemetryByBot[bot.id]?.host && (
                              <>
                                <span className="rounded-md border border-border-subtle bg-bg-void px-2 py-0.5">
                                  host load: {runtimeTelemetryByBot[bot.id]?.host?.load1}
                                </span>
                                <span className="rounded-md border border-border-subtle bg-bg-void px-2 py-0.5">
                                  mem: {runtimeTelemetryByBot[bot.id]?.host?.memoryUsedPercent}%
                                </span>
                              </>
                            )}
                          </div>

                          {runtimeErrorByBot[bot.id] && (
                            <div className="mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                              {runtimeErrorByBot[bot.id]}
                            </div>
                          )}

                          <pre className="max-h-64 overflow-auto rounded-lg bg-bg-void p-3 text-xs text-text-secondary font-mono whitespace-pre-wrap">
                            {runtimeTelemetryByBot[bot.id]?.logs?.trim() || 'No runtime output yet. Stream updates every ~2.5s.'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 border border-border-subtle rounded-xl bg-surface-elevated">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Current Plan</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary">ClawBolt</p>
                  <p className="text-text-secondary">$49/month</p>
                </div>
                <span className="inline-flex items-center rounded-lg border border-border-subtle px-3 py-1 text-xs uppercase tracking-wide text-text-secondary">
                  single tier
                </span>
              </div>
              <div className="space-y-1 text-sm text-text-secondary">
                <p>✓ 1 Telegram bot per subscription</p>
                <p>✓ Unlimited messages (bounded by your provider key limits)</p>
                <p>✓ Bring-your-own API key (OpenAI / Anthropic / Gemini)</p>
                <p>✓ VM spins up on-demand for isolation</p>
              </div>
            </div>

            <div className="p-6 border border-border-subtle rounded-xl bg-surface-elevated">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Bots in this workspace</span>
                    <span className="text-text-primary">{bots.length} / 1 included per subscription</span>
                  </div>
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-crimson rounded-full transition-all"
                      style={{ width: `${Math.min((bots.length / 1) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {bots.length > 1 && (
                  <p className="text-xs text-yellow-500">
                    You currently have more than one bot configured locally. In production, each bot should map to its own $49 subscription.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-4">
            <div className="p-6 border border-border-subtle rounded-xl bg-surface-elevated">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Email</label>
                  <p className="text-text-primary">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Name</label>
                  <p className="text-text-primary">{user?.fullName || 'Not set'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border border-border-subtle rounded-xl bg-surface-elevated">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Danger Zone</h3>
              <SignOutButton>
                <button className="flex items-center space-x-2 px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
