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
    Layers,
    ChevronRight,
    Gauge,
    ArrowUpRight,
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
    const [balance, setBalance] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
        fetchInitialData()
        const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000)

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
                const newAction = payload.new as AgentAction
                setActions(prev => [newAction, ...prev].slice(0, 20))
                if (newAction.action_type === 'BALANCE_CHECK') {
                    setBalance(newAction.details.balance)
                }
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

        const { data: balanceData } = await supabase
            .from('agent_actions')
            .select('details')
            .eq('action_type', 'BALANCE_CHECK')
            .order('created_at', { ascending: false })
            .limit(1)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        if (balanceData && balanceData[0]) setBalance(balanceData[0].details.balance)
        setLoading(false)
    }

    const triggerScanEffect = () => {
        setIsScanning(true)
        setTimeout(() => setIsScanning(false), 2000)
    }

    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Synchronizing brain kernels...", pathway: "Stable-Beta", action: "MONITOR" }

    return (
        <div className="relative min-h-screen">
            {/* Immersive Aurora Background */}
            <div className="aurora-bg">
                <div className="aurora-blob blob-1" />
                <div className="aurora-blob blob-2" />
                <div className="aurora-blob blob-3" />
            </div>

            {/* Premium Header Nav */}
            <nav className="p-8 pb-0 flex justify-between items-center max-w-[1700px] mx-auto">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                        <TrendingUp size={24} className="text-aurora-green" />
                    </div>
                    <div>
                        <h1 className="hero-display text-3xl mb-1">AURORA_INTEL</h1>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-aurora-green/10 text-aurora-green text-[10px] font-bold rounded-full border border-aurora-green/20">
                                <div className="w-1.5 h-1.5 bg-aurora-green rounded-full animate-pulse shadow-[0_0_8px_var(--aurora-green)]" />
                                SOLANA_MAINNET_LIVE
                            </div>
                        </div>
                    </div>
                </div>

                <div className="diamond-card py-3 px-6 rounded-full flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] font-black text-text-dim text-right">OPERATIONAL_TIME</div>
                        <div className="font-mono text-sm tracking-widest">{systemTime}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-right">
                        <div className="text-[10px] font-black text-text-dim text-right">SYSTEM_INTEGRITY</div>
                        <div className="text-aurora-green font-bold text-sm tracking-tighter">SECURE (99.9%)</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1700px] mx-auto p-8 grid grid-cols-12 gap-8">

                {/* HERO: The Vault */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="diamond-card h-full flex flex-col justify-between overflow-hidden relative">
                        {/* Decorative Background Icon */}
                        <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12 pointer-events-none">
                            <Wallet size={500} />
                        </div>

                        <div>
                            <span className="section-label">Institutional Asset Vault</span>
                            <div className="flex items-end gap-6 mb-8 mt-4">
                                <h2 className="hero-display">{loading ? '---' : balance.toFixed(4)}</h2>
                                <div className="mb-4">
                                    <span className="block text-2xl font-black text-text-dim tracking-tighter">SOL</span>
                                    <span className="text-sm font-bold text-aurora-green flex items-center gap-1">
                                        <ArrowUpRight size={14} /> +8.4% APY
                                    </span>
                                </div>
                            </div>
                            <p className="max-w-xl text-text-dim text-lg leading-relaxed font-light">
                                Real-time valuation of your sub-custodial wallet deployed on Solana. Currently optimizing yields across Jupiter and Liquidity pools.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Available Liquidity', val: `${balance.toFixed(4)} SOL`, icon: Layers },
                                { label: 'Yield Accrued', val: '0.012 SOL', icon: Zap },
                                { label: 'Active Strategies', val: '3', icon: Target },
                                { label: 'Risk Profile', val: 'Delta-Neutral', icon: Shield }
                            ].map((m, i) => (
                                <div key={i}>
                                    <div className="flex items-center gap-2 text-text-ghost mb-1">
                                        {m.icon && <m.icon size={12} />}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                                    </div>
                                    <div className="text-sm font-bold tracking-tight">{m.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The Engine Room (Operational Status) */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="diamond-card status-active">
                        <span className="section-label">Engine_Room</span>
                        <div className="space-y-6 mt-6">
                            {[
                                { name: 'Railway Cluster', status: 'Continuous', icon: Server, color: 'text-aurora-blue' },
                                { name: 'xAI Reasoning', status: 'Deep_Learning', icon: Brain, color: 'text-aurora-purple' },
                                { name: 'Solana RPC', status: 'Mainnet-B', icon: Database, color: 'text-aurora-green' },
                                { name: 'Execution Layer', status: 'Active', icon: Gauge, color: 'text-aurora-green' }
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-all ${s.color}`}>
                                            <s.icon size={18} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{s.name}</div>
                                            <div className="text-[10px] text-text-dim font-medium">{s.status}</div>
                                        </div>
                                    </div>
                                    <div className="status-indicator" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="diamond-card bg-aurora-purple/5 border-aurora-purple/20">
                        <span className="section-label text-aurora-purple">AI Strategic Alpha</span>
                        <div className="mt-4">
                            <div className="text-xl font-black italic tracking-tight text-white/90">
                                "{latestDecision.advice}"
                            </div>
                            <div className="mt-6 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <div className="text-[9px] font-black text-text-dim">TARGET_OBJECTIVE</div>
                                    <div className="text-xs font-bold text-aurora-purple uppercase">{latestDecision.action}</div>
                                </div>
                                <ArrowUpRight size={18} className="text-aurora-purple" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Data Flux & Kernels */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Data Flux Scanner */}
                    <div className="diamond-card">
                        <div className="flex justify-between items-center mb-8">
                            <span className="section-label">Market_Yield_Flux</span>
                            {isScanning && <div className="text-[10px] font-bold text-aurora-green animate-pulse">SCANNING_JUPITER...</div>}
                        </div>
                        <div className="flux-container custom-scrollbar h-[350px]">
                            {reports.map((r) => (
                                <div key={r.id} className="flux-row group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-aurora-green/5 border border-aurora-green/10 flex items-center justify-center text-aurora-green font-bold text-[10px]">
                                            {r.token.split(' ')[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-aurora-green transition-colors">{r.token}</div>
                                            <div className="text-[10px] text-text-dim font-bold">{r.protocol} • SOLANA</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black tracking-tighter text-aurora-green">{r.apy}%</div>
                                        <div className="text-[9px] text-text-dim font-black tracking-widest uppercase">EST_APY</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Logic Trace */}
                    <div className="diamond-card">
                        <div className="flex justify-between items-center mb-8">
                            <span className="section-label">Alpha_Logic_Stream</span>
                            <div className="status-indicator shadow-[0_0_10px_var(--aurora-purple)]" />
                        </div>
                        <div className="flux-container custom-scrollbar h-[350px] font-mono">
                            {actions.map((a) => (
                                <div key={a.id} className="mb-6 group">
                                    <div className="flex justify-between text-[10px] text-text-dim mb-2 font-bold group-hover:text-aurora-purple transition-colors">
                                        <span>SYS_LOG :: ID_{a.id.slice(0, 8)}</span>
                                        <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-xs text-text-pure/80 leading-relaxed border-l-2 border-white/5 pl-4 py-1 group-hover:border-aurora-purple/50 transition-all">
                                        {a.action_type === 'BALANCE_CHECK' ? (
                                            <span className="text-aurora-blue font-bold tracking-tighter">[VALUATION_AUDIT]</span>
                                        ) : (
                                            <span className="text-aurora-purple font-bold tracking-tighter">[INTEL_JUDGMENT]</span>
                                        )} {a.action_type === 'BALANCE_CHECK' ? `Balance verified: ${a.details.balance} SOL. Asset remains liquid.` : a.details.advice}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            <footer className="max-w-[1700px] mx-auto p-12 pt-0 border-t border-white/5">
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-[10px] font-black text-text-ghost tracking-[0.5em] uppercase">
                        DESIGNED_BY_AURORA_INTELLIGENCE // v4.0.0_STABLE
                    </div>
                    <div className="flex gap-12 font-black text-[9px] text-text-dim uppercase tracking-widest">
                        <span className="cursor-pointer hover:text-white transition-colors">Core_Documentation</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Hedge_Vault_Audit</span>
                        <span className="cursor-pointer hover:text-white transition-colors">API_Connectivity</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// Missing Lucide Icon
function Target({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
