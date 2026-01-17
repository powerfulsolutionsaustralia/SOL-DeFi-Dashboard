import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TrendingUp, Target, Zap, Clock, ArrowUpRight, Activity } from 'lucide-react'
import './index.css'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
)

interface Goal {
    target_sol: number
    current_sol: number
    target_apy: number
    days_to_goal: number
    status: string
}

interface AgentAction {
    id: string
    agent_name: string
    action_type: string
    details: any
    created_at: string
}

interface YieldReport {
    id: string
    protocol: string
    token: string
    apy: number
    created_at: string
}

interface ActivityItem {
    id: string
    agent_name: string
    action_type: string
    details: any
    created_at: string
}

export default function App() {
    const [balance, setBalance] = useState<number>(0)
    const [goal, setGoal] = useState<Goal | null>(null)
    const [latestDecision, setLatestDecision] = useState<any>(null)
    const [opportunities, setOpportunities] = useState<YieldReport[]>([])
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()

        // Subscribe to real-time updates
        const actionsChannel = supabase
            .channel('actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, (payload) => {
                const newAction = payload.new as AgentAction
                if (newAction.action_type === 'BALANCE_CHECK') {
                    setBalance(newAction.details.balance)
                } else if (newAction.action_type === 'STRATEGY_DECISION') {
                    setLatestDecision(newAction.details)
                }
            })
            .subscribe()

        const goalsChannel = supabase
            .channel('goals')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, (payload) => {
                setGoal(payload.new as Goal)
            })
            .subscribe()

        return () => {
            actionsChannel.unsubscribe()
            goalsChannel.unsubscribe()
        }
    }, [])

    async function fetchData() {
        // Get latest balance
        const { data: balanceData } = await supabase
            .from('agent_actions')
            .select('details')
            .eq('action_type', 'BALANCE_CHECK')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (balanceData) setBalance(balanceData.details.balance)

        // Get current goal
        const { data: goalData } = await supabase
            .from('goals')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (goalData) setGoal(goalData)

        // Get latest AI decision
        const { data: decisionData } = await supabase
            .from('agent_actions')
            .select('details')
            .eq('action_type', 'STRATEGY_DECISION')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (decisionData) setLatestDecision(decisionData.details)

        // Get opportunities
        const { data: oppsData } = await supabase
            .from('yield_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4)

        if (oppsData) setOpportunities(oppsData)

        // Get recent activity
        const { data: activityData } = await supabase
            .from('agent_actions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (activityData) setActivityFeed(activityData)

        setLoading(false)
    }

    const progressPercent = goal ? (goal.current_sol / goal.target_sol) * 100 : 0

    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Autonomous DeFi Agent</h1>
                    <p className="hero-subtitle">xAI-powered agent finding and executing Solana DeFi opportunities 24/7 on Railway</p>
                </div>
                <div className="status-badge">
                    <div className="status-pulse" />
                    <span>Agent Active</span>
                </div>
            </div>

            {/* Portfolio Value */}
            <div className="portfolio-value">
                <div className="value-label">Total Portfolio Value</div>
                <div className="value-main">{loading ? '---' : balance.toFixed(4)} SOL</div>
                <div className="value-growth">
                    <ArrowUpRight size={16} />
                    +8.4% APY
                </div>
            </div>

            {/* Balance Sheet */}
            <div className="balance-sheet">
                <h2>💰 Your Money (Live Balance & Projections)</h2>
                <div className="balance-grid">
                    <div className="balance-item">
                        <span className="balance-label">Current Holdings</span>
                        <span className="balance-value">{balance.toFixed(4)} SOL</span>
                        <span className="balance-usd">${(balance * 100).toFixed(2)} USD</span>
                    </div>
                    <div className="balance-item">
                        <span className="balance-label">7-Day Projection</span>
                        <span className="balance-value">{goal ? ((balance * Math.pow(1 + (goal.target_apy / 100 / 365), 7))).toFixed(4) : '--'} SOL</span>
                        <span className="balance-growth">+{goal ? ((Math.pow(1 + (goal.target_apy / 100 / 365), 7) - 1) * 100).toFixed(2) : '--'}%</span>
                    </div>
                    <div className="balance-item">
                        <span className="balance-label">30-Day Projection (with compound interest)</span>
                        <span className="balance-value">{goal ? ((balance * Math.pow(1 + (goal.target_apy / 100 / 365), 30))).toFixed(4) : '--'} SOL</span>
                        <span className="balance-growth">+{goal ? ((Math.pow(1 + (goal.target_apy / 100 / 365), 30) - 1) * 100).toFixed(2) : '--'}%</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">

                {/* Goal Progress */}
                <div className="card">
                    <div className="card-header">
                        <Target size={20} />
                        <h3>🎯 Goal: Grow Your SOL</h3>
                    </div>
                    <div className="goal-content">
                        <div className="goal-target">
                            <span className="goal-label">Target</span>
                            <span className="goal-value">{goal?.target_sol || 1.0} SOL</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <div className="goal-stats">
                            <div>
                                <span className="stat-label">Progress</span>
                                <span className="stat-value">{progressPercent.toFixed(1)}%</span>
                            </div>
                            <div>
                                <span className="stat-label">Days to Goal</span>
                                <span className="stat-value">{goal?.days_to_goal || '--'} days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Status */}
                <div className="card">
                    <div className="card-header">
                        <Activity size={20} />
                        <h3>🤖 What The Agent Is Doing Right Now</h3>
                    </div>
                    <div className="agent-status">
                        <div className="status-item">
                            <span className="status-label">Currently Executing</span>
                            <span className="status-text">Scanning Jupiter pools</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Latest AI Advice (from xAI)</span>
                            <span className="status-text">{latestDecision?.advice || 'Analyzing market...'}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Recommended Action</span>
                            <span className="status-badge">{latestDecision?.action || 'MONITOR'}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Projection */}
                <div className="card timeline-card">
                    <div className="card-header">
                        <Clock size={20} />
                        <h3>⏱️ How Long Until You Reach Your Goal</h3>
                    </div>
                    <div className="timeline-content">
                        <div className="timeline-stat">
                            <span className="timeline-label">If the agent maintains {goal?.target_apy || 8.4}% APY and compounds daily</span>
                            <div className="timeline-value">{goal?.days_to_goal || '--'} days</div>
                            <span className="timeline-subtext">until you have {goal?.target_sol || 1.0} SOL (your target)</span>
                        </div>
                        <div className="timeline-formula">
                            <div>Daily Compound Rate</div>
                            <div className="formula-value">{goal ? ((goal.target_apy / 365) / 100).toFixed(4) : '--'}%</div>
                        </div>
                    </div>
                </div>

                {/* Agent Communication Feed */}
                <div className="card communication-feed">
                    <div className="card-header">
                        <Activity size={20} />
                        <h3>📡 Live Feed: What The Agent Is Thinking & Doing</h3>
                    </div>
                    <div className="feed-list">
                        {activityFeed.map((item) => (
                            <div key={item.id} className="feed-item">
                                <div className="feed-time">
                                    {new Date(item.created_at).toLocaleTimeString()}
                                </div>
                                <div className="feed-content">
                                    {item.action_type === 'STRATEGY_DECISION' && (
                                        <>
                                            <div className="feed-title">🧠 AI Decision</div>
                                            <div className="feed-text">{item.details.advice}</div>
                                            <div className="feed-meta">Action: {item.details.action} | Pathway: {item.details.pathway}</div>
                                        </>
                                    )}
                                    {item.action_type === 'BALANCE_CHECK' && (
                                        <>
                                            <div className="feed-title">💰 Balance Update</div>
                                            <div className="feed-text">Current: {item.details.balance?.toFixed(4)} SOL</div>
                                        </>
                                    )}
                                    {item.action_type === 'GOAL_PROGRESS' && (
                                        <>
                                            <div className="feed-title">🎯 Goal Progress</div>
                                            <div className="feed-text">Tracking toward target at {item.details.current_apy}% APY</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Opportunities */}
                <div className="card opportunities-card">
                    <div className="card-header">
                        <Zap size={20} />
                        <h3>⚡ Opportunities The Agent Is Scanning On Solana</h3>
                    </div>
                    <div className="opportunities-list">
                        {opportunities.map((opp) => (
                            <div key={opp.id} className="opportunity-item">
                                <div className="opp-info">
                                    <div className="opp-protocol">{opp.protocol}</div>
                                    <div className="opp-token">{opp.token}</div>
                                </div>
                                <div className="opp-apy">
                                    {opp.apy.toFixed(2)}%
                                    <span className="apy-label">APY</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
