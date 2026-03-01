import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle2, Link, User as UserIcon, GraduationCap } from 'lucide-react';

const Settings = () => {
    const { user, setUser } = useAuth();
    const [platforms, setPlatforms] = useState({
        leetcode: '',
        codeforces: '',
        github: '',
        codechef: '',
        geeksforgeeks: '',
        hackerrank: '',
        hackerearth: '',
        atcoder: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setPlatforms(prev => ({
                ...prev,
                ...(user.platforms || {})
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setPlatforms({ ...platforms, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put('/api/users/profile', { platforms }, config);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setStatus({ type: 'success', message: 'Platform handles updated successfully!' });
        } catch (error) {
            console.error(error);
            const msg = error.response && error.response.data.message ? error.response.data.message : error.message;
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const inputFields = [
        { id: 'leetcode', label: 'LeetCode Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_LEETCODE },
        { id: 'codeforces', label: 'Codeforces Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_CODEFORCES },
        { id: 'github', label: 'GitHub Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_GITHUB },
        { id: 'codechef', label: 'CodeChef Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_CODECHEF },
        { id: 'geeksforgeeks', label: 'GeeksforGeeks Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_GEEKSFORGEEKS },
        { id: 'hackerrank', label: 'HackerRank Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_HACKERRANK },
        { id: 'hackerearth', label: 'HackerEarth Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_HACKEREARTH },
        { id: 'atcoder', label: 'AtCoder Profile URL', placeholder: import.meta.env.VITE_PLACEHOLDER_ATCODER },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/20">
                    <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
                    Account Settings
                </h1>
                <p className="text-muted mt-2 max-w-lg mx-auto">
                    Customize your public profile and connect your coding platforms.
                </p>
            </div>

            {/* Error/Success Messages */}
            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success'
                    ? 'bg-accent/10 border-accent/20 text-accent'
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {status.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium text-sm">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">


                {/* Platform Integrations Section */}
                <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

                    <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-white/10 flex items-center gap-2 relative z-10">
                        <Link className="w-5 h-5 text-secondary" />
                        Coding Platform Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {inputFields.map((field) => (
                            <div key={field.id} className="space-y-2">
                                <label htmlFor={field.id} className="block text-sm font-medium text-text">
                                    {field.label}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                        <Link className="w-4 h-4 text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        id={field.id}
                                        name={field.id}
                                        value={platforms[field.id]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="block w-full pl-9 pr-4 py-3 border border-white/10 rounded-xl bg-surface/50 text-text placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-3 rounded-xl font-medium text-white shadow-sm flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/25 cursor-pointer"
                        >
                            {isSaving ? (
                                <>Saving...</>
                            ) : (
                                <><Save className="w-5 h-5" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Settings;
