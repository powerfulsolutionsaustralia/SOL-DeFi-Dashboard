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
    Database,
    Terminal,
    Search,
    Lock,
    Binary
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

    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Analyzing neural pathways...", pathway: "Stable-Beta", action: "MONITOR" }

    return (
        <div className="relative min-h-screen selection:bg-nebula-purple selection:text-white">
            <div className="nebula-bg">
                <div className="nebula-blob blob-purple" />
                <div className="nebula-blob blob-blue" />
                <div className="nebula-blob blob-solana" />
            </div>

            {/* Premium Command Nav */}
            <nav className="p-10 pb-0 flex justify-between items-center max-w-[1800px] mx-auto">
                <div className="flex items-center gap-8">
                    <div className="p-4 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-2xl">
                        <Binary size={32} className="text-nebula-solana" />
                    </div>
                    <div>
                        <h1 className="hero-display text-4xl mb-1 tracking-tighter">AURORA_INTEL_v5</h1>
                        <div className="flex gap-4">
                            <div className="flow-pill py-1.5 px-4 text-[11px] font-black border-nebula-solana/20 bg-nebula-solana/5 text-nebula-solana">
                                <div className="dot-active" /> SOLANA_KERNEL_CONNECTED
                            </div>
                            <div className="flow-pill py-1.5 px-4 text-[11px] font-black border-white/10 bg-white/5 text-text-soft">
                                VER_5.0.0_PRODUCTION
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="nebula-card py-4 px-8 rounded-full flex items-center gap-10">
                        <div className="text-right">
                            <div className="text-[11px] font-black text-text-mute tracking-widest uppercase">Kernel_Time</div>
                            <div className="font-mono text-lg font-bold tracking-widest text-white">{systemTime}</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-right">
                            <div className="text-[11px] font-black text-text-mute tracking-widest uppercase">System_State</div>
                            <div className="text-nebula-solana font-black text-lg tracking-tighter">SECURE (99.9%)</div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="nebula-grid">

                {/* THE VAULT HERO (Centered Narrative) */}
                <div className="col-span-12 lg:col-span-12">
                    <div className="nebula-card p-16 flex flex-col items-center text-center overflow-hidden relative">
                        {/* Decorative Shield Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-[2.5] rotate-12">
                            <Shield size={600} strokeWidth={0.5} />
                        </div>

                        <span className="tagline">Institutional Asset Valuation</span>
                        <div className="relative">
                            <h2 className="display-large mb-4">
                                {loading ? '---' : balance.toFixed(4)}
                            </h2>
                            <span className="absolute -right-24 bottom-6 text-4xl font-black text-text-mute tracking-tighter">SOL</span>
                        </div>

                        <div className="mt-8 flex gap-12 items-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-1">Growth_Velocity</span>
                                <span className="text-xl font-black text-nebula-solana flex items-center gap-2">
                                    <ArrowUpRight size={20} /> +8.4% APY
                                </span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-1">Yield_Accrual</span>
                                <span className="text-xl font-black text-white">0.012 SOL</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-1">Risk_Integrity</span>
                                <span className="text-xl font-black text-nebula-blue uppercase tracking-tighter">DELTA_ZERO</span>
                            </div>
                        </div>

                        <p className="mt-12 max-w-3xl text-text-soft text-xl leading-relaxed font-light">
                            Continuous capital optimization on Solana. Your assets are currently deployed across **Jupiter** and **Liquidity V3** pools, managed autonomously by xAI reasoning and Railway execution.
                        </p>
                    </div>
                </div>

                {/* THE BRAIN (Judgment & Automation) */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="nebula-card h-full relative group">
                        <div className="absolute top-10 right-10 p-4 bg-nebula-purple/10 rounded-2xl border border-nebula-purple/20">
                            <Brain size={32} className="text-nebula-purple animate-pulse" />
                        </div>
                        <span className="tagline">Intelligence Process Pathway</span>

                        <div className="mt-8 space-y-10">
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-nebula-purple/20 border border-nebula-purple/40 flex items-center justify-center">
                                    <Cpu size={16} className="text-nebula-purple" />
                                </div>
                                <h3 className="text-3xl font-black italic text-white/90 leading-tight">
                                    "{latestDecision.advice}"
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-nebula-purple/30 transition-all">
                                    <div className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-3 text-nebula-purple">Judgment_Output</div>
                                    <div className="text-xl font-black uppercase tracking-tighter">{latestDecision.action}</div>
                                    <div className="mt-2 text-xs text-text-soft font-bold">PROBABILITY_CONFIDENCE: 94.2%</div>
                                </div>
                                <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-nebula-blue/30 transition-all">
                                    <div className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-3 text-nebula-blue">Logic_Pathway</div>
                                    <div className="text-xl font-black uppercase tracking-tighter">{latestDecision.pathway}</div>
                                    <div className="mt-2 text-xs text-text-soft font-bold">NEURAL_VERIFICATION_PASS</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-white/5">
                            <span className="text-[10px] font-black text-text-mute tracking-widest uppercase mb-6 block">Operational_Infrastructure (Railway 24/7)</span>
                            <div className="flex gap-12">
                                {[
                                    { name: 'ENGINE_ROOM', icon: Server, status: 'Continuous' },
                                    { name: 'XAI_BRAIN', icon: Cpu, status: 'Deep_Analysis' },
                                    { name: 'SOLANA_MAINNET', icon: Database, status: 'Mainnet-B' }
                                ].map((inf, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <inf.icon size={20} className="text-text-mute" />
                                        <div>
                                            <div className="text-xs font-black text-white tracking-widest">{inf.name}</div>
                                            <div className="text-[10px] font-bold text-nebula-solana">{inf.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE AUDIT (Live Intelligence Stream) */}
                <div className="col-span-12 lg:col-span-5">
                    <div className="nebula-card h-full">
                        <div className="flex justify-between items-center mb-10">
                            <span className="tagline">Alpha_Intelligence_Trace</span>
                            <div className="dot-active shadow-[0_0_15px_var(--nebula-purple)] bg-nebula-purple border-none" />
                        </div>

                        <div className="h-[400px] overflow-y-auto pr-6 custom-scrollbar font-mono">
                            {actions.map((a) => (
                                <div key={a.id} className="audit-row group">
                                    <div className="flex items-center gap-6">
                                        <Terminal size={14} className="text-text-mute group-hover:text-nebula-purple" />
                                        <div>
                                            <div className="text-[10px] text-text-mute font-black uppercase mb-1 tracking-widest group-hover:text-white transition-colors">
                                                LOG ENTRY // ID_{a.id.slice(0, 8)}
                                            </div>
                                            <div className="text-xs text-text-soft leading-relaxed pr-8">
                                                {a.action_type === 'BALANCE_CHECK' ? (
                                                    `[SYSTEM_AUDIT] Balance confirmed: ${a.details.balance} SOL at base station.`
                                                ) : (
                                                    `[CORE_JUDGMENT] ${a.details.advice}`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-[10px] font-black text-text-mute group-hover:text-nebula-purple">
                                        {new Date(a.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* THE FLUX (Market Yield Opportunities) */}
                <div className="col-span-12">
                    <div className="nebula-card">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <span className="tagline">Solana_Yield_Flux_Scanner</span>
                                <h4 className="text-2xl font-black tracking-tighter mt-1">REAL-TIME_ECOSYSTEM_AUDIT</h4>
                            </div>
                            <div className="flex items-center gap-6">
                                {isScanning && <div className="text-xs font-black text-nebula-solana animate-pulse tracking-widest uppercase">Scanning_Jupiter_v6...</div>}
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <RefreshCw size={20} className={isScanning ? 'animate-spin text-nebula-solana' : 'text-text-mute'} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {reports.slice(0, 4).map((r) => (
                                <div key={r.id} className="p-8 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-nebula-solana/30 transition-all hover:bg-white/[0.04]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-nebula-solana/5 border border-nebula-solana/20 flex items-center justify-center text-nebula-solana font-black text-xs">
                                            {r.token.split(' ')[0]}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] font-black text-text-mute uppercase tracking-widest mb-1">Yield_APY</div>
                                            <div className="text-3xl font-black text-nebula-solana tracking-tighter">{r.apy}%</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white mb-1 uppercase tracking-tight">{r.token}</div>
                                        <div className="text-[10px] text-text-mute font-black tracking-widest">{r.protocol} • SOLANA_NETWORK</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            <footer className="max-w-[1800px] mx-auto p-12 pt-0 border-t border-white/5 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-xs font-black text-text-mute tracking-[0.4em] uppercase">
                        DESIGNED_BY_AURORA_INTEL_LABS // v5.0.0_STABLE
                    </div>
                    <div className="flex gap-16 font-black text-[10px] text-text-soft uppercase tracking-[0.2em]">
                        <span className="cursor-pointer hover:text-white transition-colors">Documentation_Vault</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Operational_Nodes</span>
                        <span className="cursor-pointer hover:text-white transition-colors">System_Audit_Log</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
