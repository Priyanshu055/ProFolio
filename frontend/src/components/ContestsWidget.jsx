import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, ExternalLink, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const ContestsWidget = () => {
    const { user } = useAuth();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('/api/contests', config);
                // Show all upcoming contests (typically next 30 days)
                setContests(data);
            } catch (err) {
                setError('Failed to load contests');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchContests();
        }
    }, [user]);

    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getPlatformColor = (platformName) => {
        const name = platformName.toLowerCase();
        if (name.includes('codeforces')) return 'text-red-500 bg-red-500/10';
        if (name.includes('leetcode')) return 'text-yellow-500 bg-yellow-500/10';
        if (name.includes('codechef')) return 'text-amber-700 bg-amber-700/10';
        if (name.includes('atcoder')) return 'text-black dark:text-gray-300 bg-gray-500/10';
        if (name.includes('geeksforgeeks')) return 'text-green-600 bg-green-600/10';
        if (name.includes('hackerrank')) return 'text-green-500 bg-green-500/10';
        if (name.includes('hackerearth')) return 'text-blue-500 bg-blue-500/10';
        return 'text-primary bg-primary/10';
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6 h-full animate-pulse flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted text-sm delay-150">Scanning horizons...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-2xl p-6 text-center text-muted flex flex-col items-center justify-center h-full">
                <Calendar className="w-10 h-10 mb-2 opacity-50" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-accent text-white shadow-lg shadow-secondary/20">
                    <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                    Upcoming Contests
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {contests.length === 0 ? (
                    <div className="text-center text-muted py-8">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No upcoming contests found.</p>
                    </div>
                ) : (
                    contests.map((contest, index) => {
                        const platformStyle = getPlatformColor(contest.site);
                        return (
                            <div
                                key={`${contest.name}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="block p-4 rounded-xl border border-white/5 bg-surface/30 hover:bg-surface/60 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 flex flex-col gap-3"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                            {contest.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                                            <span className={`px-2 py-0.5 rounded-md ${platformStyle}`}>
                                                {contest.site}
                                            </span>
                                            <span className="text-muted flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(contest.start_time)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={contest.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border border-primary/20"
                                >
                                    Register Now
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default ContestsWidget;
