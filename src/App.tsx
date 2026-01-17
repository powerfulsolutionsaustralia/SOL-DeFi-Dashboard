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
    ArrowRight,
    RefreshCw,
    Wallet
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

    useEffect(() => {
        fetchInitialData()

        // Real-time Subscriptions
        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 15))
                triggerScanEffect()
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                setActions(prev => [payload.new as AgentAction, ...prev].slice(0, 15))
            })
            .subscribe()

        return () => {
            yieldSub.unsubscribe()
            actionSub.unsubscribe()
        }
    }, [])

    async function fetchInitialData() {
        const { data: yieldData } = await supabase
            .from('yield_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(15)

        const { data: actionData } = await supabase
            .from('agent_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(15)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        setLoading(false)
    }

    const triggerScanEffect = () => {
        setIsScanning(true)
        setTimeout(() => setIsScanning(false), 2000)
    }

    const currentBalance = actions.find(a => a.action_type === 'BALANCE_CHECK')?.details.balance || 0
    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Analyzing market liquidity...", pathway: "Stable", action: "WAIT" }

    return (
        <div className="min-h-screen p-6 md:p-12 relative">
            <div className="aura-container">
                <div className="aura-blob aura-1" />
                <div className="aura-blob aura-2" />
            </div>

            {/* Header */}
            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg ring-1 ring-white/20">
                            <Cpu size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl tracking-tighter gradient-text">
                            SOLANA <span className="font-light">INTELLIGENCE</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-2">
                            <span className="status-indicator status-online animate-pulse" />
                            Network: Mainnet-Beta
                        </span>
                        <span className="flex items-center gap-2">
                            <span className={`status-indicator ${isScanning ? 'status-scanning animate-spin' : 'status-online'}`} />
                            xAI Core: Online
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="glass-panel p-4 flex-1 md:flex-none min-w-[180px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Asset Value</p>
                        <div className="text-2xl font-black flex items-baseline gap-1">
                            {loading ? '...' : currentBalance.toFixed(3)} <span className="text-xs text-blue-400">SOL</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Hero: Intelligence Strategy */}
                <section className="lg:col-span-12 glass-panel p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={160} />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10 items-center">
                        <div className="flex-1">
                            <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <Zap size={14} fill="currentColor" /> Active Strategy
                            </h2>
                            <div className="space-y-4">
                                <p className="text-2xl md:text-3xl font-bold leading-tight text-slate-100 italic">
                                    "{latestDecision.advice}"
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                        Pathway: {latestDecision.pathway}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest">
                                        Action: {latestDecision.action}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full lg:w-96">
                            {[
                                { label: 'Scans', icon: RefreshCw, value: reports.length, color: 'blue' },
                                { label: 'Actions', icon: Activity, value: actions.length, color: 'purple' },
                                { label: 'Health', icon: Shield, value: '100%', color: 'green' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                    <stat.icon size={20} className={`mx-auto mb-2 text-${stat.color}-400 opacity-60`} />
                                    <div className="text-lg font-black">{stat.value}</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Left: Intelligence Feed (Agent Logs) */}
                <section className="lg:col-span-7 flex flex-col gap-6">
                    <div className="glass-panel flex-1 flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Layers size={14} className="text-purple-400" /> Intelligence Feed
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-purple-400 uppercase">Live Trace</span>
                            </div>
                        </div>
                        <div className="p-2 h-[450px] overflow-y-auto custom-scrollbar font-mono text-xs">
                            {actions.map((action) => (
                                <div key={action.id} className="group p-4 rounded-xl hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-purple-500/30 mb-1">
                                    <div className="flex justify-between mb-1.5 opacity-50 font-bold text-[10px]">
                                        <span>[{action.action_type}]</span>
                                        <span>{new Date(action.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-slate-300 leading-relaxed font-medium">
                                        {action.action_type === 'BALANCE_CHECK' ? (
                                            <div className="flex items-center gap-2">
                                                <Wallet size={12} className="text-blue-400" />
                                                Liquidity verification: <span className="text-white font-black">{action.details.balance} SOL</span>
                                            </div>
                                        ) : action.action_type === 'STRATEGY_DECISION' ? (
                                            <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-blue-100 italic">
                                                {action.details.advice}
                                            </div>
                                        ) : (
                                            <span className="opacity-60">{JSON.stringify(action.details).slice(0, 100)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right: Market Scanner (Opportunities) */}
                <section className="lg:col-span-5 flex flex-col gap-6">
                    <div className="glass-panel flex-1 flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Globe size={14} className="text-blue-400" /> Market Scanner
                            </h3>
                            <RefreshCw size={12} className={`text-slate-500 ${isScanning ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {reports.map((report) => (
                                <div key={report.id} className="p-5 flex justify-between items-center border-b border-white/5 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                                            <TrendingUp size={16} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{report.token}</div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase">{report.protocol}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-blue-400">{report.apy}%</div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Current APY</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                <div>&copy; 2026 AI DEFI HEDGE FUND</div>
                <div className="flex items-center gap-4">
                    <span className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</span>
                    <span className="hover:text-purple-400 cursor-pointer transition-colors">Audit Report</span>
                </div>
            </footer>
        </div>
    )
}
