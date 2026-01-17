import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity, ArrowUpRight, ShieldCheck, TrendingUp } from 'lucide-react'
import './index.css'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
)

interface YieldReport {
    id: string
    protocol: string
    chain: string
    apy: number
    token: string
    created_at: string
}

interface AgentAction {
    id: string
    agent_name: string
    action_type: string
    details: any
    created_at: string
}

function App() {
    const [reports, setReports] = useState<YieldReport[]>([])
    const [actions, setActions] = useState<AgentAction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()

        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 10))
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                setActions(prev => [payload.new as AgentAction, ...prev].slice(0, 10))
            })
            .subscribe()

        return () => {
            yieldSub.unsubscribe()
            actionSub.unsubscribe()
        }
    }, [])

    async function fetchData() {
        const { data: yieldData } = await supabase
            .from('yield_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: actionData } = await supabase
            .from('agent_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        setLoading(false)
    }

    const bestYield = reports.length > 0 ? Math.max(...reports.map(r => r.apy)) : 0
    const currentBalance = actions.find(a => a.action_type === 'BALANCE_CHECK')?.details.balance || 0
    const latestAdvice = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Gathering market data...", pathway: "Pending Analysis", action: "WAIT" }

    return (
        <div className="min-h-screen bg-[#0a0b14] text-white font-sans p-8 selection:bg-purple-500/30">
            {/* Ambient Background Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-400 bg-clip-text text-transparent">
                            DEFI CO-PILOT
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        xAI Intelligence Core: <span className="text-blue-400">Grok-Beta</span> Active
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="bg-[#151726] p-5 rounded-2xl border border-white/5 flex-1 md:flex-none min-w-[200px] shadow-xl backdrop-blur-sm">
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">Portfolio Value</div>
                        <div className="text-2xl font-black text-blue-400 flex items-baseline gap-1">
                            {loading ? '...' : currentBalance.toFixed(4)} <span className="text-xs text-blue-400/50">SOL</span>
                        </div>
                    </div>
                    <div className="bg-[#151726] p-5 rounded-2xl border border-white/5 flex-1 md:flex-none min-w-[200px] shadow-xl backdrop-blur-sm">
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">Market Price</div>
                        <div className="text-2xl font-black text-green-400">
                            {loading ? '...' : `$${(bestYield * 10).toFixed(2)}`}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* AI Intelligence Pathway (Hero Section) */}
                <div className="lg:col-span-12 bg-gradient-to-br from-[#1a1c2e] to-[#151726] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <TrendingUp size={120} className="text-blue-500" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
                                <Activity className="text-blue-400 animate-pulse" /> Current Autonomous Strategy
                            </h2>
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
                                <p className="text-lg text-blue-100 font-medium leading-relaxed italic">
                                    "{latestAdvice.advice}"
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-[450px]">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 text-center md:text-left">Compound Pathway</h3>
                            <div className="flex items-center justify-between relative px-4">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/50 to-blue-500/20 -translate-y-1/2" />

                                <div className="z-10 bg-[#1a1c2e] p-3 rounded-full border border-blue-500 ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/20">
                                    <ShieldCheck className="text-blue-400" />
                                </div>
                                <div className="z-10 bg-[#1a1c2e] p-3 rounded-full border border-purple-500 animate-pulse ring-4 ring-purple-500/20">
                                    <TrendingUp className="text-purple-400" />
                                </div>
                                <div className="z-10 bg-[#1a1c2e] p-3 rounded-full border border-gray-700 opacity-50">
                                    <ArrowUpRight className="text-gray-500" />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-tighter text-gray-500 px-1">
                                <span>Wallet</span>
                                <span className="text-purple-400">Optimize</span>
                                <span>Compound</span>
                            </div>
                            <div className="mt-6 text-center">
                                <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-500/20 scale-105 transition-transform">
                                    Pathway: {latestAdvice.pathway}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Column: Market Feed */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-[#151726] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={16} className="text-green-400" /> Market Scanner
                            </h2>
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Live</span>
                        </div>
                        <div className="divide-y divide-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                            {reports.map((report) => (
                                <div key={report.id} className="p-5 flex justify-between items-center hover:bg-white/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <TrendingUp size={18} className="text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{report.token}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{report.protocol} Optimizer</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-green-400 font-mono">${(report.apy * 10).toFixed(2)}</div>
                                        <div className="text-[10px] text-gray-500 font-bold">SOL RATE</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Brain Activity */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-[#151726] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-blue-400" /> Intelligence Feed
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                            {actions.map((action) => (
                                <div key={action.id} className="p-5 flex flex-col gap-3 hover:bg-white/5 transition-all border-l-4 border-transparent hover:border-blue-500/50">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest leading-none ${action.action_type === 'BALANCE_CHECK' ? 'bg-blue-500/10 text-blue-400' :
                                                action.action_type === 'STRATEGY_DECISION' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {action.action_type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold">
                                            {new Date(action.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-200 leading-relaxed font-medium">
                                        {action.action_type === 'BALANCE_CHECK' ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                System online. Wallet verification complete: <span className="text-blue-400 font-mono text-xs">{action.details.balance} SOL</span>
                                            </span>
                                        ) : action.action_type === 'STRATEGY_DECISION' ? (
                                            <div className="space-y-2">
                                                <div className="text-gray-400 text-xs italic">" {action.details.advice} "</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Pathway:</span>
                                                    <span className="text-xs font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded leading-none">{action.details.pathway}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            JSON.stringify(action.details).slice(0, 100) + '...'
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default App
// Trigger build
