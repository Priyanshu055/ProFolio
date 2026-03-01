import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

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

export const WeaknessAnalysis = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted text-sm border border-white/5 rounded-xl bg-surface/30 p-6 min-h-[300px]">
                <Target className="w-8 h-8 opacity-50 mb-2" />
                <p>Not enough data to analyze weaknesses.</p>
            </div>
        );
    }

    // Sort by rating ascending to find lowest scores
    const sortedTopics = [...data].sort((a, b) => a.A - b.A);
    const weaknesses = sortedTopics.slice(0, 4);
    const strengths = sortedTopics.slice(-4).reverse();

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="h-48 w-full border border-white/5 rounded-xl p-2 bg-surface/30">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="var(--muted)" opacity={0.3} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Proficiency"
                            dataKey="A"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.4}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'var(--text)'
                            }}
                            itemStyle={{ color: 'var(--primary)' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-4">
                <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Focus Areas
                    </h4>
                    <p className="text-xs text-muted mb-2">You are currently weakest in these topics:</p>
                    <ul className="space-y-2">
                        {weaknesses.map(w => (
                            <li key={w.subject} className="text-sm bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 flex justify-between tracking-wide">
                                <span>{w.subject}</span>
                                <span className="text-red-400 font-mono">{w.A}/150</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-green-400 mb-2">
                        <TrendingUp className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                        {strengths.map(s => (
                            <li key={s.subject} className="text-sm bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 flex justify-between tracking-wide">
                                <span>{s.subject}</span>
                                <span className="text-green-400 font-mono">{s.A}/150</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
