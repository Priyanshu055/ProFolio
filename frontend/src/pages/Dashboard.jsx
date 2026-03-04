import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ContestsWidget from '../components/ContestsWidget';
import { RatingHistoryChart, LeetCodePieChart, WeaknessAnalysis, GitHubHeatmap } from '../components/Graphs';
import { Code2, Target, Trophy, Flame, AlertCircle, Activity, GraduationCap, Linkedin, Tag, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const PlatformSection = ({ name, data, type, profileUrl }) => {
    if (!data) return null; // not connected at all — skip

    // API failed — show a graceful unavailable card
    if (data.error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                        <a href={profileUrl || '#'} target="_blank" rel="noopener noreferrer"
                            className="hover:text-primary transition-colors inline-flex items-center gap-2 group">
                            <h2 className="text-2xl font-bold capitalize text-text/70">{name}</h2>
                            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                        <p className="text-muted/60 text-sm">Connected · Stats temporarily unavailable</p>
                    </div>
                </div>
                <div className="glass rounded-2xl p-6 border border-yellow-500/10 bg-yellow-500/5 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-yellow-300 font-medium">Stats temporarily unavailable</p>
                        <p className="text-xs text-muted mt-1">
                            The {name} data API is currently down or unreachable. This is common with unofficial APIs.
                            Your profile is still connected — try clicking <strong>Refresh</strong> later.
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <a href={profileUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2 group cursor-pointer">
                        <h2 className="text-2xl font-bold capitalize">{name}</h2>
                        <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    <p className="text-muted text-sm tracking-wide">@{data.handle || data.username || type} • Rank: {data.rank || data.ranking || 'N/A'}</p>
                </div>
            </div>

            {/* GitHub — show heatmap full width */}
            {type === 'github' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats card */}
                    <div className="glass rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> GitHub Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-surface/40 p-3 rounded-xl border border-white/5">
                                <span className="text-sm text-muted">Public Repos</span>
                                <span className="font-bold text-lg">{data.public_repos ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface/40 p-3 rounded-xl border border-white/5">
                                <span className="text-sm text-muted">Followers</span>
                                <span className="font-bold text-lg">{data.followers ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface/40 p-3 rounded-xl border border-white/5">
                                <span className="text-sm text-muted">Following</span>
                                <span className="font-bold text-lg">{data.following ?? 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contribution heatmap — spans 2 cols */}
                    <div className="glass rounded-2xl p-6 relative overflow-hidden lg:col-span-2">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/5 rounded-full blur-[50px] pointer-events-none" />
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" /> Contribution Activity
                        </h3>
                        <GitHubHeatmap contributions={data.contributions} username={data.username} />
                    </div>
                </div>
            ) : (
                /* All other platforms — existing layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats / Pie Chart */}
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" /> Problem Solving
                        </h3>
                        <div className="text-3xl font-bold mb-6">
                            {data.totalSolved !== undefined ? data.totalSolved : 0}
                            <span className="text-sm font-normal text-muted ml-2">Total Solved</span>
                        </div>
                        {type === 'leetcode' && (
                            <LeetCodePieChart easy={data.easySolved} medium={data.mediumSolved} hard={data.hardSolved} />
                        )}
                    </div>

                    {/* Trajectory */}
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group lg:col-span-2">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] pointer-events-none" />
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-accent" /> Past Contest History
                            </h3>
                            <div className="text-right">
                                <div className="text-xs text-muted uppercase tracking-wider mb-1">Highest Rating</div>
                                <div className="text-2xl font-bold text-accent">{data.maxRating || data.contestRating || 'N/A'}</div>
                            </div>
                        </div>

                        {data.ratingHistory && data.ratingHistory.length > 0 ? (
                            <>
                                <RatingHistoryChart data={data.ratingHistory} />
                                <div className="mt-6 max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 sticky top-0 bg-surface/90 backdrop-blur z-10 py-1">Recent Contests</h4>
                                    {data.ratingHistory.slice().reverse().map((contest, i) => (
                                        <div key={i} className="flex justify-between items-center bg-surface/40 p-3 rounded-lg text-sm border border-white/5 hover:bg-surface/60 transition-colors">
                                            <span className="truncate flex-1 pr-4 text-text font-medium">{contest.contestName}</span>
                                            <div className="flex gap-4 items-center shrink-0">
                                                <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${contest.change > 0 ? 'bg-green-500/10 text-green-400' : contest.change < 0 ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                                    {contest.change > 0 ? '+' : ''}{contest.change}
                                                </span>
                                                <span className="font-bold w-12 text-right text-accent">{contest.rating}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted text-sm bg-surface/30 rounded-xl border border-white/5">
                                No past contest history found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};


const Dashboard = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [topicData, setTopicData] = useState(null);
    const [topicLoading, setTopicLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAll = React.useCallback(async (isRefresh = false) => {
        if (!user?.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        if (isRefresh) {
            setRefreshing(true);
            try { await axios.post('/api/profiles/refresh', {}, config); } catch (_) { }
        }

        const [profileRes, topicRes] = await Promise.allSettled([
            axios.get('/api/profiles', config),
            axios.get('/api/analysis/topics', config)
        ]);

        if (profileRes.status === 'fulfilled') {
            setProfileData(profileRes.value.data);
            setError(null);
        } else {
            console.error('Dashboard fetch error', profileRes.reason);
            if (!profileData) setError('Failed to load profile data. Please check your settings.');
        }

        if (topicRes.status === 'fulfilled') {
            setTopicData(topicRes.value.data);
        }

        setLastUpdated(new Date());
        setLoading(false);
        setTopicLoading(false);
        setRefreshing(false);
    }, [user?.token]);

    useEffect(() => {
        if (!user) return;
        // Initial fetch
        fetchAll();
        // Auto-refresh every 5 minutes (300 000 ms) silently in background
        const interval = setInterval(() => fetchAll(false), 5 * 60 * 1000);
        return () => clearInterval(interval); // cleanup on unmount
    }, [fetchAll]);


    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="mt-6 text-muted font-medium animate-pulse">Aggregating platform data...</p>
            </div>
        );
    }

    const hasPlatformsSet = user?.platforms && Object.values(user.platforms).some(val => val !== '');

    if (!hasPlatformsSet) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto p-6">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Code2 className="w-12 h-12 text-primary opacity-80" />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                    Welcome to ProFolio
                </h2>
                <p className="text-muted mb-8 leading-relaxed">
                    It looks like you haven't connected any coding platforms yet. Head over to settings to add your LeetCode, Codeforces, and other handles to start tracking your progress!
                </p>
                <a href="/settings" className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg shadow-primary/20">
                    Go to Settings
                </a>
            </div>
        );
    }

    const PLATFORM_META = [
        { key: 'leetcode', type: 'leetcode', name: 'LeetCode' },
        { key: 'codeforces', type: 'codeforces', name: 'Codeforces' },
        { key: 'codechef', type: 'codechef', name: 'CodeChef' },
        { key: 'geeksforgeeks', type: 'gfg', name: 'GeeksForGeeks' },
        { key: 'github', type: 'github', name: 'GitHub' },
        { key: 'hackerrank', type: 'hackerrank', name: 'HackerRank' },
        { key: 'hackerearth', type: 'hackerearth', name: 'HackerEarth' },
        { key: 'atcoder', type: 'atcoder', name: 'AtCoder' },
    ];

    const platformsToRender = PLATFORM_META
        .filter(p => profileData?.[p.key])   // only show actually-fetched platforms
        .map(p => ({ ...p, data: profileData[p.key] }));

    return (
        <div className="space-y-8">
            {/* Dashboard header with Refresh */}
            <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-muted hidden sm:block">
                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={() => fetchAll(true)}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-surface/50 hover:bg-surface hover:border-primary/40 text-muted hover:text-text transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg
                            className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="glass rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6 border border-white/10">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-surface shadow-xl overflow-hidden bg-surface flex-shrink-0 self-center md:self-start">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                            <Code2 className="w-10 h-10" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                    {/* Name */}
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent inline-block pb-1 capitalize">
                        {user?.name || 'Overview'}
                    </h1>

                    {/* Bio */}
                    {user?.bio && (
                        <p className="text-muted mt-1 text-sm leading-relaxed max-w-xl">{user.bio}</p>
                    )}

                    {/* Education row */}
                    {(user?.course || user?.branch || user?.college || user?.graduationYear) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-muted justify-center md:justify-start">
                            <GraduationCap className="w-4 h-4 text-secondary shrink-0" />
                            {user?.course && <span className="font-medium text-text">{user.course}</span>}
                            {user?.branch && <><span className="opacity-40">·</span><span>{user.branch}</span></>}
                            {user?.college && (
                                <><span className="opacity-40">·</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.college}</span></>
                            )}
                            {user?.graduationYear && (
                                <><span className="opacity-40">·</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Class of {user.graduationYear}</span></>
                            )}
                        </div>
                    )}

                    {/* LinkedIn */}
                    {user?.linkedin && (
                        <a
                            href={user.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile
                        </a>
                    )}

                    {/* Skills */}
                    {user?.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            {user.skills.map(skill => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-medium"
                                >
                                    <Tag className="w-2.5 h-2.5" />{skill}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Fallback if nothing set */}
                    {!user?.bio && !user?.course && !user?.college && (
                        <p className="text-muted mt-1">Unified statistics across your connected platforms</p>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg text-sm border border-red-400/20 shrink-0">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}
            </div>


            {/* Per-Platform Sections */}
            <div className="space-y-12">
                {platformsToRender.map((platform) => (
                    <PlatformSection
                        key={platform.type}
                        name={platform.name}
                        type={platform.type}
                        data={platform.data}
                        profileUrl={user?.platforms?.[platform.type]}
                    />
                ))}
            </div>

            {/* Global Widgets Grid (Weakness & Contests) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-2"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" /> Weakness Analysis
                    </h2>
                    <div className="glass rounded-2xl p-6">
                        {topicLoading ? (
                            <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 text-muted">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm">Analyzing topics...</p>
                            </div>
                        ) : (
                            <WeaknessAnalysis
                                topics={topicData?.topics}
                                sources={topicData?.sources}
                            />
                        )}
                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1 h-full"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-accent" /> Upcoming Contests
                    </h2>
                    <ContestsWidget />
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
