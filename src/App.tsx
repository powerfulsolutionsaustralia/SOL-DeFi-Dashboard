import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Activity,
    Cpu,
    Globe,
    Layers,
    Zap,
    Shield,
    TrendingUp,
    RefreshCw,
    Wallet,
    Clock,
    Terminal,
    ChevronRight,
    Database
} from 'lucide-react'
import './index.css'

// Initialize Supabase
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
)

interface YieldReport {
    id: string
    protocol: string
    apy: number
    token: string
    created_at: string
}

interface AgentAction {
    id: string
    action_type: string
    details: any
    created_at: string
}

export default function App() {
    const [reports, setReports] = useState<YieldReport[]>([])
    const [actions, setActions] = useState<AgentAction[]>([])
    const [loading, setLoading] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
        fetchInitialData()
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)

        // Real-time Subscriptions
        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 20))
                triggerScanEffect()
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                setActions(prev => [payload.new as AgentAction, ...prev].slice(0, 20))
            })
            .subscribe()

        return () => {
            yieldSub.unsubscribe()
            actionSub.unsubscribe()
            clearInterval(timer)
        }
    }, [])

    async function fetchInitialData() {
        const { data: yieldData } = await supabase
            .from('yield_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        const { data: actionData } = await supabase
            .from('agent_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        setLoading(false)
    }

    const triggerScanEffect = () => {
        setIsScanning(true)
        setTimeout(() => setIsScanning(false), 2000)
    }

    const currentBalance = actions.find(a => a.action_type === 'BALANCE_CHECK')?.details.balance || 0
    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Analyzing market liquidity...", pathway: "Deep Neural", action: "MONITOR" }

    return (
        <div className="min-h-screen p-4 md:p-8 selection:bg-blue-500/30">
            <div className="app-bg" />

            {/* System Bar */}
            <div className="max-w-[1400px] mx-auto mb-8 flex justify-between items-center px-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="status-dot pulse-green" />
                        <span className="sub-title">System Live</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Database size={10} className="text-muted" />
                        <span className="sub-title">Jupiter Index: Current</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                        <Clock size={10} />
                        {currentTime}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="max-w-[1400px] mx-auto mb-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="fade-in">
                        <h1 className="display-title">SOLANA_CORE</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-2 py-0.5 border border-solana/20 rounded text-[9px] font-black tracking-widest text-solana uppercase">
                                v2.1.0-OBSIDIAN
                            </span>
                            <span className="sub-title tracking-widest">xAI Intelligence Core</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex gap-4">
                        <div className="obsidian-card p-6 min-w-[200px] flex flex-col justify-between">
                            <span className="sub-title mb-4">Total Liquidity</span>
                            <div className="text-3xl font-mono font-bold tracking-tighter self-end">
                                {loading ? '---' : currentBalance.toFixed(4)}
                                <span className="text-xs text-secondary ml-2">SOL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-grid fade-in" style={{ animationDelay: '0.2s' }}>

                {/* Node: Strategic Brain */}
                <section className="lg:col-span-8 md:col-span-12 obsidian-card bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700">
                        <Cpu size={120} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-1.5 bg-blue-500/10 rounded-md">
                                <Zap size={16} className="text-blue-500" />
                            </div>
                            <span className="sub-title text-blue-500">Intelligence Strategy</span>
                        </div>

                        <div className="space-y-6">
                            <p className="text-3xl font-bold leading-tight max-w-2xl text-slate-100">
                                "{latestDecision.advice}"
                            </p>

                            <div className="flex gap-4">
                                <div className="obsidian-glass rounded-lg px-4 py-2 flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold text-muted">Core Action</span>
                                    <span className="text-xs font-mono font-bold text-blue-400">{latestDecision.action}</span>
                                </div>
                                <div className="obsidian-glass rounded-lg px-4 py-2 flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold text-muted">Decision Path</span>
                                    <span className="text-xs font-mono font-bold text-purple-400">{latestDecision.pathway}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Node: Execution Stats */}
                <section className="lg:col-span-4 md:col-span-12 obsidian-card p-6 flex flex-col justify-between">
                    <div>
                        <span className="sub-title mb-8 block">Execution Metrics</span>
                        <div className="space-y-4">
                            {[
                                { label: 'Intelligence Scans', val: reports.length, icon: RefreshCw },
                                { label: 'Autonomous Actions', val: actions.length, icon: Activity },
                                { label: 'Security Health', val: 'Optimum', icon: Shield }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <s.icon size={14} className="text-muted" />
                                        <span className="text-xs font-medium text-secondary">{s.label}</span>
                                    </div>
                                    <span className="font-mono text-sm font-bold">{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%]" />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold text-muted uppercase">
                            <span>Resource Usage</span>
                            <span>65% CPU</span>
                        </div>
                    </div>
                </section>

                {/* Node: Intelligence Feed */}
                <section className="lg:col-span-7 md:col-span-12 obsidian-card">
                    <div className="p-6 border-b border-obsidian-border flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-purple-500" />
                            <span className="sub-title">Logic_Trace.log</span>
                        </div>
                        <span className="text-[10px] text-muted font-mono">{actions.length} Entries</span>
                    </div>
                    <div className="feed-frame custom-scrollbar">
                        {actions.map((a, i) => (
                            <div key={a.id} className="feed-item fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <span className="timestamp">T-{new Date(a.created_at).toLocaleTimeString()}</span>
                                <div className="flex items-start gap-3">
                                    <ChevronRight size={10} className="mt-1 text-muted" />
                                    <div className="space-y-2 flex-1">
                                        <div className="text-[11px] font-black uppercase text-secondary tracking-widest">
                                            {a.action_type}
                                        </div>
                                        {a.action_type === 'BALANCE_CHECK' ? (
                                            <div className="text-xs text-blue-400 font-mono">
                                                LIQUIDITY_VERIFIED: {a.details.balance} SOL
                                            </div>
                                        ) : a.action_type === 'STRATEGY_DECISION' ? (
                                            <div className="text-xs italic text-slate-300 bg-white/[0.03] p-3 rounded border border-white/5">
                                                {a.details.advice}
                                            </div>
                                        ) : (
                                            <pre className="text-[10px] text-muted overflow-hidden text-ellipsis">
                                                {JSON.stringify(a.details)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Node: Market Scanner */}
                <section className="lg:col-span-5 md:col-span-12 obsidian-card">
                    <div className="p-6 border-b border-obsidian-border flex justify-between items-center bg-white/[0.01]">
                        <div className="flex items-center gap-2">
                            <Globe size={14} className="text-blue-500" />
                            <span className="sub-title">Jupiter_Scanner</span>
                        </div>
                        {isScanning && <div className="status-dot pulse-green" />}
                    </div>
                    <div className="h-[400px] overflow-y-auto custom-scrollbar">
                        {reports.map((r) => (
                            <div key={r.id} className="data-row hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded border border-white/5 flex items-center justify-center bg-white/[0.02]">
                                        <TrendingUp size={12} className="text-blue-500 opacity-50 समूह-होवर:opacity-100" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold">{r.token}</div>
                                        <div className="text-[9px] text-muted uppercase tracking-tighter font-bold">{r.protocol}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-bold text-solana">{r.apy}%</div>
                                    <div className="text-[8px] text-muted uppercase font-bold tracking-[0.1em]">Yield APY</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer Status */}
            <footer className="max-w-[1400px] mx-auto mt-12 py-8 border-t border-obsidian-border flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[9px] font-bold text-muted uppercase tracking-[0.4em]">
                    &copy; 2026 OBSIDIAN INTELLIGENCE LTD // SOLANA DEFI
                </div>
                <div className="flex gap-8">
                    {['Network_Status', 'Auth_Protocol', 'Database_Uptime'].map((l) => (
                        <div key={l} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                            <div className="w-1 h-1 bg-solana rounded-full" />
                            <span className="text-[9px] font-black text-muted uppercase tracking-widest">{l}</span>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    )
}
