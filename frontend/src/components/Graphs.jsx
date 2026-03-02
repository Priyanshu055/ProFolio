import React, { useState } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

// GitHub-style contribution heatmap
// contributions: [{ date: "2024-03-01", count: 5, level: 0-4 }]
const LEVEL_COLORS = [
    'bg-white/5',          // level 0 — no contributions
    'bg-green-900/80',     // level 1 — 1-3
    'bg-green-700/80',     // level 2 — 4-9
    'bg-green-500/80',     // level 3 — 10-19
    'bg-green-400',        // level 4 — 20+
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export const GitHubHeatmap = ({ contributions, username }) => {
    const [tooltip, setTooltip] = useState(null);

    if (!contributions || contributions.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-muted text-sm bg-surface/30 rounded-xl border border-white/5">
                No contribution data available
            </div>
        );
    }

    // Build 52-week grid (7 rows × 52 cols)
    // Pad start so week starts on Sunday
    const firstDay = new Date(contributions[0].date).getDay(); // 0=Sun
    const paddedDays = [...Array(firstDay).fill(null), ...contributions];
    const weeks = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
        weeks.push(paddedDays.slice(i, i + 7));
    }

    // Figure out which column each month label starts on
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
        const firstReal = week.find(d => d !== null);
        if (firstReal) {
            const m = new Date(firstReal.date).getMonth();
            if (m !== lastMonth) {
                monthLabels.push({ col: wi, label: MONTH_NAMES[m] });
                lastMonth = m;
            }
        }
    });

    const totalContributions = contributions.reduce((s, d) => s + d.count, 0);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted">{totalContributions.toLocaleString()} contributions in the last year</span>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                    Less
                    {LEVEL_COLORS.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c} border border-white/5`} />)}
                    More
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-flex gap-0 relative" style={{ minWidth: `${weeks.length * 14}px` }}>
                    {/* Day labels column */}
                    <div className="flex flex-col gap-px mr-1 mt-5">
                        {DAY_LABELS.map((d, i) => (
                            <div key={i} style={{ height: '11px', lineHeight: '11px' }} className="text-[9px] text-muted pr-1 text-right w-6">{d}</div>
                        ))}
                    </div>

                    <div className="flex-1">
                        {/* Month labels */}
                        <div className="flex mb-1" style={{ gap: 0 }}>
                            {weeks.map((_, wi) => {
                                const label = monthLabels.find(m => m.col === wi);
                                return (
                                    <div key={wi} style={{ width: '13px', flexShrink: 0 }} className="text-[9px] text-muted overflow-visible whitespace-nowrap">
                                        {label ? label.label : ''}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-px">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-px">
                                    {Array.from({ length: 7 }, (_, di) => {
                                        const day = week[di] ?? null;
                                        return (
                                            <div
                                                key={di}
                                                className={`w-2.5 h-2.5 rounded-sm border border-white/5 cursor-default transition-transform hover:scale-125 ${day ? LEVEL_COLORS[day.level ?? 0] : 'bg-transparent border-transparent'}`}
                                                onMouseEnter={() => day && setTooltip({ date: day.date, count: day.count })}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover tooltip */}
            {tooltip && (
                <div className="mt-2 text-xs text-center text-muted bg-surface/60 border border-white/10 rounded-lg py-1 px-3 inline-block">
                    <span className="text-green-400 font-semibold">{tooltip.count}</span> contribution{tooltip.count !== 1 ? 's' : ''} on{' '}
                    {new Date(tooltip.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            )}
        </div>
    );
};


export const RatingHistoryChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-muted text-sm border border-white/5 rounded-xl bg-surface/30">
                Rating history unavailable
            </div>
        );
    }

    return (
        <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.2} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        domain={['dataMin - 100', 'dataMax + 100']}
                        stroke="var(--muted)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'var(--text)'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRating)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const LeetCodePieChart = ({ easy, medium, hard }) => {
    const data = [
        { name: 'Easy', value: easy || 0, color: '#00b8a3' },
        { name: 'Medium', value: medium || 0, color: '#ffc01e' },
        { name: 'Hard', value: hard || 0, color: '#ef4743' },
    ].filter(d => d.value > 0);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-muted text-sm border border-white/5 rounded-xl bg-surface/30">
                Problem data unavailable
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'var(--text)'
                        }}
                        itemStyle={{ color: 'var(--text)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeaknessAnalysis = ({ topics, sources }) => {
    if (!topics || topics.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted text-sm border border-white/5 rounded-xl bg-surface/30 p-6 min-h-[300px] text-center gap-3">
                <Target className="w-8 h-8 opacity-40" />
                <p className="font-medium">No topic data available</p>
                <p className="text-xs opacity-70">Connect your LeetCode or Codeforces accounts to see real topic analysis.</p>
            </div>
        );
    }

    const maxSolved = Math.max(...topics.map(t => t.solved), 1);
    const sortedAsc = [...topics].sort((a, b) => a.solved - b.solved);
    const weaknesses = sortedAsc.slice(0, 4);
    const strengths = sortedAsc.slice(-4).reverse();
    // Top 10 for the bar chart
    const chartTopics = [...topics].slice(0, 10);

    return (
        <div className="flex flex-col h-full space-y-5">
            {/* Source badges */}
            {sources && sources.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted">Data from:</span>
                    {sources.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary font-medium">{s}</span>
                    ))}
                </div>
            )}

            {/* Horizontal bar chart — top 10 topics */}
            <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-surface/30">
                <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-3">Top Topics by Problems Solved</p>
                {chartTopics.map((topic) => {
                    const pct = Math.round((topic.solved / maxSolved) * 100);
                    return (
                        <div key={topic.subject} className="flex items-center gap-3 group">
                            <span className="text-xs text-muted w-32 shrink-0 truncate group-hover:text-text transition-colors">{topic.subject}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-muted w-10 text-right shrink-0">{topic.solved}</span>
                        </div>
                    );
                })}
            </div>

            {/* Focus Areas & Strengths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Focus Areas
                    </h4>
                    <p className="text-xs text-muted mb-2">Topics with the least practice:</p>
                    <ul className="space-y-1.5">
                        {weaknesses.map(w => (
                            <li key={w.subject} className="text-sm bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 flex justify-between">
                                <span className="truncate pr-2">{w.subject}</span>
                                <span className="text-red-400 font-mono shrink-0">{w.solved} solved</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-green-400 mb-2">
                        <TrendingUp className="w-4 h-4" /> Strengths
                    </h4>
                    <p className="text-xs text-muted mb-2">Your most practiced topics:</p>
                    <ul className="space-y-1.5">
                        {strengths.map(s => (
                            <li key={s.subject} className="text-sm bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 flex justify-between">
                                <span className="truncate pr-2">{s.subject}</span>
                                <span className="text-green-400 font-mono shrink-0">{s.solved} solved</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

