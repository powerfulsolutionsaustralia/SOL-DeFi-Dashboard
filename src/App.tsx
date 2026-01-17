import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Search,
    Bell,
    ChevronDown,
    LayoutDashboard,
    Zap,
    List,
    Settings,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Server,
    Database,
    Shield,
    Filter,
    Download
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

    useEffect(() => {
        fetchInitialData()
        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 15))
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                const newAction = payload.new as AgentAction
                setActions(prev => [newAction, ...prev].slice(0, 15))
                if (newAction.action_type === 'BALANCE_CHECK') {
                    setBalance(newAction.details.balance)
                }
            })
            .subscribe()

        return () => {
            yieldSub.unsubscribe()
            actionSub.unsubscribe()
        }
    }, [])

    async function fetchInitialData() {
        const { data: yieldData } = await supabase.from('yield_reports').select('*').order('created_at', { ascending: false }).limit(15)
        const { data: actionData } = await supabase.from('agent_actions').select('*').order('created_at', { ascending: false }).limit(15)
        const { data: balanceData } = await supabase.from('agent_actions').select('details').eq('action_type', 'BALANCE_CHECK').order('created_at', { ascending: false }).limit(1)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        if (balanceData && balanceData[0]) setBalance(balanceData[0].details.balance)
        setLoading(false)
    }

    return (
        <div className="saas-layout">

            {/* 1. Sidebar Navigation */}
            <aside className="saas-sidebar">
                <div className="h-16 flex items-center px-6 border-b border-[var(--md-sys-color-outline)]">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3">
                        <Activity size={18} className="text-primary" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-white">Aurora</span>
                </div>

                <nav className="p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-[var(--md-sys-color-surface-4)] text-white">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-2)] hover:text-white transition-colors">
                        <Zap size={18} />
                        Active Strategies
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-2)] hover:text-white transition-colors">
                        <List size={18} />
                        Execution Log
                    </a>
                    <div className="pt-4 mt-4 border-t border-[var(--md-sys-color-outline)]">
                        <div className="px-3 mb-2 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">Settings</div>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-2)] hover:text-white transition-colors">
                            <Settings size={18} />
                            Platform Config
                        </a>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="saas-main">

                {/* 2. Top Header */}
                <header className="saas-header">
                    <div className="flex items-center flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" size={16} />
                            <input
                                type="text"
                                placeholder="Search strategy logs, transaction IDs..."
                                className="w-full bg-[var(--md-sys-color-surface-1)] border border-[var(--md-sys-color-outline)] text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-primary text-white placeholder-[var(--md-sys-color-on-surface-variant)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                        {/* System Status Indicators */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-2)] border border-[var(--md-sys-color-outline)]">
                            <div className="w-2 h-2 rounded-full bg-success"></div>
                            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">Railway Live</span>
                        </div>

                        <div className="h-6 w-px bg-[var(--md-sys-color-outline)] mx-2"></div>

                        <button className="relative p-2 text-[var(--md-sys-color-on-surface-variant)] hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-error border-2 border-[var(--md-sys-color-background)]"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 border border-white/10"></div>
                            <span className="text-sm font-medium text-white hidden md:block">Admin</span>
                            <ChevronDown size={14} className="text-[var(--md-sys-color-on-surface-variant)]" />
                        </div>
                    </div>
                </header>

                <main className="saas-content space-y-8">

                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">Real-time valuation and AI strategy performance.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--md-sys-color-surface-1)] border border-[var(--md-sys-color-outline)] rounded-md text-sm font-medium text-white hover:bg-[var(--md-sys-color-surface-2)]">
                                <Download size={16} /> Export
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 rounded-md text-sm font-medium text-white shadow-lg shadow-indigo-500/20">
                                <Zap size={16} /> New Strategy
                            </button>
                        </div>
                    </div>

                    {/* 3. Hero Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Valuation"
                            value={`${balance.toFixed(4)} SOL`}
                            trend="+12.5%"
                            trendUp={true}
                            chartData={[40, 35, 55, 60, 50, 65, 80]}
                        />
                        <MetricCard
                            title="Current APY"
                            value="8.42%"
                            trend="+0.8%"
                            trendUp={true}
                            chartData={[60, 65, 62, 68, 70, 72, 85]}
                        />
                        <MetricCard
                            title="Risk Score"
                            value="98/100"
                            trend="Stable"
                            trendUp={true}
                            chartData={[90, 92, 95, 95, 96, 98, 98]}
                            color="success"
                        />
                        <MetricCard
                            title="Active Nodes"
                            value="12"
                            trend="All Systems Go"
                            trendUp={true}
                            chartData={[10, 10, 11, 12, 12, 12, 12]}
                            color="primary"
                        />
                    </div>

                    {/* 4. Data Visualization Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Line Chart */}
                        <div className="saas-card lg:col-span-2 min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3>Portfolio Growth (30D)</h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 text-xs font-medium rounded bg-[var(--md-sys-color-surface-3)] text-white">30D</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-2)]">7D</button>
                                    <button className="px-3 py-1 text-xs font-medium rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-2)]">24H</button>
                                </div>
                            </div>
                            {/* Simple SVG Line Chart */}
                            <div className="w-full h-[300px] relative mt-4">
                                <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="250" x2="800" y2="250" stroke="var(--md-sys-color-outline)" strokeDasharray="4 4" />
                                    <line x1="0" y1="150" x2="800" y2="150" stroke="var(--md-sys-color-outline)" strokeDasharray="4 4" />
                                    <line x1="0" y1="50" x2="800" y2="50" stroke="var(--md-sys-color-outline)" strokeDasharray="4 4" />

                                    {/* Line Path */}
                                    <path d="M0,250 C100,240 200,180 300,150 C400,120 500,190 600,100 C700,40 800,20 800,20"
                                        fill="none" stroke="var(--md-sys-color-primary)" strokeWidth="3" />
                                    {/* Area Gradient */}
                                    <defs>
                                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,250 C100,240 200,180 300,150 C400,120 500,190 600,100 C700,40 800,20 800,20 V300 H0 Z"
                                        fill="url(#gradient)" />
                                </svg>
                            </div>
                        </div>

                        {/* Doughnut Chart */}
                        <div className="saas-card">
                            <h3 className="mb-6">Asset Allocation</h3>
                            <div className="flex flex-col items-center justify-center p-6 relative">
                                <svg viewBox="0 0 36 36" className="w-48 h-48 block">
                                    <path className="text-[var(--md-sys-color-surface-3)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-primary" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <div className="text-2xl font-bold text-white">75%</div>
                                    <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase">Liquidity</div>
                                </div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                        <span className="text-[var(--md-sys-color-on-surface)]">Liquidity Pools</span>
                                    </div>
                                    <span className="font-semibold text-white">75%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[var(--md-sys-color-surface-4)]" />
                                        <span className="text-[var(--md-sys-color-on-surface)]">Cash (SOL)</span>
                                    </div>
                                    <span className="font-semibold text-white">25%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Complex Data Table */}
                    <div className="saas-card p-0 overflow-hidden">
                        <div className="p-6 border-b border-[var(--md-sys-color-outline)] flex justify-between items-center">
                            <h3>Strategy Execution Log</h3>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--md-sys-color-outline)] rounded text-sm text-[var(--md-sys-color-on-surface-variant)] hover:text-white">
                                    <Filter size={14} /> Filter
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="saas-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Strategy ID</th>
                                        <th>Protocol</th>
                                        <th>Execution Type</th>
                                        <th>Yield APY</th>
                                        <th>Timestamp</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {actions.map((a) => (
                                        <tr key={a.id}>
                                            <td>
                                                <span className={`chip ${a.action_type === 'BALANCE_CHECK' ? 'chip-neutral' : 'chip-success'}`}>
                                                    {a.action_type === 'BALANCE_CHECK' ? 'Audited' : 'Executed'}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs">{a.id.slice(0, 8)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-[var(--md-sys-color-surface-4)] flex items-center justify-center text-[8px] font-bold">SOL</div>
                                                    {a.details?.pathway || 'Core Chain'}
                                                </div>
                                            </td>
                                            <td>{a.action_type}</td>
                                            <td>
                                                <span className="font-medium text-success">+{(Math.random() * 5 + 4).toFixed(2)}%</span>
                                            </td>
                                            <td className="text-[var(--md-sys-color-on-surface-variant)]">{new Date(a.created_at).toLocaleString()}</td>
                                            <td>
                                                <button className="text-[var(--md-sys-color-on-surface-variant)] hover:text-white">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.slice(0, 5).map((r) => (
                                        <tr key={r.id}>
                                            <td><span className="chip chip-warning">Scanned</span></td>
                                            <td className="font-mono text-xs">{r.id.slice(0, 8)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded bg-[var(--md-sys-color-surface-4)] flex items-center justify-center text-[8px] font-bold">YLD</div>
                                                    {r.protocol}
                                                </div>
                                            </td>
                                            <td>OPPORTUNITY_DETECTED</td>
                                            <td><span className="font-medium text-success">+{r.apy}%</span></td>
                                            <td className="text-[var(--md-sys-color-on-surface-variant)]">{new Date(r.created_at).toLocaleString()}</td>
                                            <td><MoreVertical size={16} className="text-[var(--md-sys-color-on-surface-variant)]" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-[var(--md-sys-color-outline)] flex justify-between items-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
                            <span>Showing 1-10 of 50 results</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 border border-[var(--md-sys-color-outline)] rounded hover:bg-[var(--md-sys-color-surface-2)]">Previous</button>
                                <button className="px-3 py-1 border border-[var(--md-sys-color-outline)] rounded hover:bg-[var(--md-sys-color-surface-2)]">Next</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

// Sub-Component: Metric Card with Sparkline
function MetricCard({ title, value, trend, trendUp, chartData, color = 'primary' }: any) {
    const polylinePoints = chartData
        .map((val: number, i: number) => `${(i / (chartData.length - 1)) * 120},${60 - (val / 100) * 60}`)
        .join(' ')

    return (
        <div className="saas-card relative overflow-hidden">
            <h4 className="mb-2">{title}</h4>
            <div className="flex items-end gap-3 mb-4">
                <span className="value text-3xl">{value}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1 mb-1 ${trendUp ? 'text-success bg-success/10' : 'text-error bg-error/10'
                    }`}>
                    {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </span>
            </div>

            {/* SVG Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                <svg width="100%" height="100%" viewBox="0 0 120 60" preserveAspectRatio="none">
                    <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke={`var(--md-sys-color-${color})`}
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                    />
                    <path
                        d={`M0,60 ${polylinePoints} V60 H0 Z`}
                        fill={`var(--md-sys-color-${color})`}
                        opacity="0.4"
                    />
                </svg>
            </div>
        </div>
    )
}
