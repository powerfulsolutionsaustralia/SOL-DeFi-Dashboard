import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Activity,
    Cpu,
    Globe,
    Zap,
    Shield,
    TrendingUp,
    RefreshCw,
    Wallet,
    Server,
    Brain,
    ZapOff,
    ChevronRight,
    Maximize2
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
    const [systemTime, setSystemTime] = useState(new Date().toISOString())

    useEffect(() => {
        fetchInitialData()
        const timer = setInterval(() => setSystemTime(new Date().toISOString()), 1000)

        // Real-time Subscriptions
        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 25))
                triggerScanEffect()
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                setActions(prev => [payload.new as AgentAction, ...prev].slice(0, 25))
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
            .limit(25)

        const { data: actionData } = await supabase
            .from('agent_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(25)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        setLoading(false)
    }

    const triggerScanEffect = () => {
        setIsScanning(true)
        setTimeout(() => setIsScanning(false), 2000)
    }

    const currentBalance = actions.find(a => a.action_type === 'BALANCE_CHECK')?.details.balance || 0
    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Analyzing market sentiment...", pathway: "Neural-Static", action: "MONITOR" }

    return (
        <div className="min-h-screen relative font-sans">
            <div className="app-bg" />
            <div className="scan-overlay" />

            {/* Top Navigation / Branding */}
            <nav className="p-8 pb-4 flex justify-between items-start max-w-[1600px] mx-auto">
                <div>
                    <div className="flex items-center gap-4 mb-1">
                        <div className="w-8 h-8 rounded-sm bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
                            <TrendingUp size={16} className="text-accent-blue" strokeWidth={3} />
                        </div>
                        <h2 className="exec-header text-2xl tracking-tighter">SOLANA_HQ</h2>
                    </div>
                    <div className="flex gap-4">
                        <span className="status-tag tag-active"><div className="w-1.5 h-1.5 bg-accent-solana rounded-full animate-pulse" /> Mainnet Live</span>
                        <span className="status-tag">V2.4_OBSIDIAN</span>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                    <div className="status-tag font-mono text-[9px] px-3 py-1">SYS_TIME: {systemTime}</div>
                    <div className="flex gap-2">
                        <span className="status-tag hover:border-accent-blue transition-colors cursor-pointer group">
                            <Maximize2 size={10} className="group-hover:text-accent-blue" />
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-4 md:p-8 pt-0">
                <div className="exec-grid">

                    {/* Header Matrix Cell */}
                    <div className="grid-cell lg:col-span-8 md:col-span-12 flex flex-col justify-end min-h-[300px]">
                        <span className="exec-label mb-4">Strategic Intelligence Core</span>
                        <h1 className="exec-header">AUTONOMOUS_CAPITAL</h1>
                        <p className="mt-6 text-xl font-light text-text-secondary leading-snug max-w-2xl">
                            Continuous market monitoring and execution via integrated xAI Intelligence. Operating at 400ms latency on Solana Mainnet.
                        </p>
                    </div>

                    {/* Capital Management Cell */}
                    <div className="grid-cell lg:col-span-4 md:col-span-12 border-l border-obsidian-border flex flex-col justify-between">
                        <div>
                            <span className="exec-label mb-8">Asset Valuation (SOL)</span>
                            <div className="matrix-value">
                                {loading ? '---' : currentBalance.toFixed(4)}
                                <span className="text-sm text-text-muted ml-3 tracking-widest font-sans font-black">SOL_BETA</span>
                            </div>
                        </div>
                        <div className="pt-8 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                                <span>ROI_PROJECTION</span>
                                <span className="text-accent-solana">+8.4% APY_AVG</span>
                            </div>
                            <div className="h-[2px] bg-white/5 w-full relative">
                                <div className="absolute top-0 left-0 h-full bg-accent-solana w-2/3 shadow-[0_0_10px_var(--accent-solana)]" />
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Health Matrix */}
                    <div className="grid-cell lg:col-span-12 border-y border-obsidian-border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            {[
                                { title: 'Operational Status', st: 'Stable', icon: Server, col: 'accent-solana' },
                                { title: 'xAI Intelligence', st: 'Deep Analysing', icon: Brain, col: 'accent-purple' },
                                { title: 'Railway Instance', st: 'Continuous', icon: Activity, col: 'accent-blue' },
                                { title: 'Execution Layer', st: 'Mainnet-B', icon: Zap, col: 'accent-solana' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-6">
                                    <div className={`p-3 bg-${s.col}/5 border border-${s.col}/10 rounded-full`}>
                                        <s.icon size={20} className={`text-${s.col}`} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div className="exec-label">{s.title}</div>
                                        <div className="text-sm font-bold mt-1 text-text-primary tracking-tight">{s.st}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strategic Brain Cell */}
                    <div className="grid-cell lg:col-span-7 md:col-span-12 border-r border-obsidian-border relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-1000">
                            <Brain size={140} strokeWidth={0.5} />
                        </div>
                        <span className="exec-label mb-8">Active Strategic Decision</span>
                        <div className="space-y-6">
                            <h3 className="text-3xl font-black italic leading-tight text-white/90">
                                "{latestDecision.advice}"
                            </h3>
                            <div className="flex gap-4">
                                <span className="status-tag py-2 px-4 border-accent-blue/30 text-accent-blue">Action: {latestDecision.action}</span>
                                <span className="status-tag py-2 px-4 border-accent-purple/30 text-accent-purple">Logic: {latestDecision.pathway}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Dashboard Cell */}
                    <div className="grid-cell lg:col-span-5 md:col-span-12">
                        <span className="exec-label mb-8 underline decoration-white/10 underline-offset-8">Intelligence Metrics</span>
                        <div className="space-y-4">
                            {[
                                { label: 'Audit Points Scanned', val: reports.length },
                                { label: 'Autonomous Rotations', val: actions.length },
                                { label: 'Network Uptime', val: '99.9%' },
                                { label: 'Average Execution Speed', val: '0.4s' }
                            ].map((m, i) => (
                                <div key={i} className="matrix-row">
                                    <span className="matrix-label">{m.label}</span>
                                    <span className="matrix-val">{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logic Trace (Terminal) Cell */}
                    <div className="grid-cell lg:col-span-8 md:col-span-12 border-t border-obsidian-border">
                        <div className="flex justify-between items-center mb-8">
                            <span className="exec-label">System_Logic_Trace</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-text-muted">LIVE_KERNEL_TRACE</span>
                            </div>
                        </div>
                        <div className="trace-container custom-scrollbar pr-4">
                            {actions.map((a, i) => (
                                <div key={a.id} className="trace-line">
                                    <span className="trace-meta">TIMECASE_{new Date(a.created_at).toLocaleTimeString()} // ID_{a.id.slice(0, 8)}</span>
                                    <div className="trace-body">
                                        <span className="text-accent-blue font-bold mr-2">[{a.action_type}]</span>
                                        {a.action_type === 'BALANCE_CHECK' ? (
                                            `Core balance verified at ${a.details.balance} SOL. Asset remains liquid and deployable.`
                                        ) : a.action_type === 'STRATEGY_DECISION' ? (
                                            `Strategic judgment finalized Target objective identified via xAI analysis.`
                                        ) : (
                                            JSON.stringify(a.details)
                                        )}
                                        {a.action_type === 'STRATEGY_DECISION' && (
                                            <div className="mt-4 p-4 bg-white/[0.03] border-l-2 border-accent-purple text-text-primary italic text-xs leading-relaxed">
                                                {a.details.advice}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Scanner Cell */}
                    <div className="grid-cell lg:col-span-4 md:col-span-12 border-t border-l border-obsidian-border">
                        <div className="flex justify-between items-center mb-8">
                            <span className="exec-label">Market_Flux_Scanner</span>
                            {isScanning && <RefreshCw size={12} className="animate-spin text-accent-solana" />}
                        </div>
                        <div className="h-[450px] overflow-y-auto custom-scrollbar">
                            {reports.map((r) => (
                                <div key={r.id} className="flow-row group">
                                    <div>
                                        <div className="text-xs font-bold tracking-tight text-white group-hover:text-accent-solana transition-colors">{r.token}</div>
                                        <div className="text-[9px] text-text-muted font-bold">{r.protocol}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-mono font-bold text-accent-blue">{r.apy}%</div>
                                        <div className="text-[8px] text-text-muted font-bold">APY</div>
                                    </div>
                                    <div className="text-right">
                                        <ChevronRight size={12} className="text-text-muted ml-auto cursor-pointer hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <footer className="max-w-[1600px] mx-auto p-8 pt-0 border-t border-obsidian-border/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
                    <div className="text-[10px] font-black text-text-muted tracking-[0.5em] uppercase">
                        OBSIDIAN_INTELLIGENCE // SOLANA_AUTONOMY_v2
                    </div>
                    <div className="flex gap-12">
                        <span className="exec-label cursor-pointer hover:text-white transition-colors">Documentation_Node</span>
                        <span className="exec-label cursor-pointer hover:text-white transition-colors">Core_Audit_Log</span>
                        <span className="exec-label cursor-pointer hover:text-white transition-colors">Liquidity_Pools</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
