import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Shield, Zap, Github, Mail, Linkedin, ChevronRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform cursor-default"
    >
        <div className="w-12 h-12 bg-accent/20 rounded-xl flex flex-center items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-accent" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const Home = () => {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar area */}
            <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    ProFolio
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
                        Log in
                    </Link>
                    <Link to="/register" className="px-5 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                        Sign up
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mt-16 mb-24">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
                    >
                        Your Coding Profile, <br />
                        <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Unified.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto"
                    >
                        Aggregate your programming achievements from LeetCode, Codeforces, GitHub, and more into one beautiful, shareable dashboard.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:-translate-y-0.5">
                            Get Started Free <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold glass hover:bg-white/10 transition-all border border-white/10">
                            Log into Account
                        </Link>
                    </motion.div>
                </div>

                {/* Purpose / About Section */}
                <div className="mb-24 relative">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why ProFolio?</h2>
                        <p className="text-muted max-w-2xl mx-auto">
                            As developers, our profiles are scattered across dozens of platforms. We built this tool to give you a single source of truth for your coding journey, making it easier to track your growth, analyze your strengths, and showcase your skills to recruiters.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={Activity}
                            title="Track Progress"
                            description="Automatically sync and visualize your contest ratings, solve counts, and contribution graphs from multiple platforms."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Real-time Updates"
                            description="Your dashboard is always up-to-date with your latest submissions, ensuring your portfolio reflects your current skill level."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Beautifully Yours"
                            description="A sleek, modern, and dark-themed glassmorphic interface that truly makes your coding statistics stand out."
                            delay={0.5}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="text-xl font-bold tracking-tight text-white/90 mb-2">ProFolio</div>
                        <p className="text-sm text-muted">Building a better way to showcase developer talent.</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-sm text-muted mb-3">Developed by <span className="text-white/90 font-medium">Priyanshu</span></span>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-lg bg-surface hover:bg-white/10 text-muted hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-surface hover:bg-white/10 text-muted hover:text-[#0A66C2] transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="mailto:contact@example.com" className="p-2 rounded-lg bg-surface hover:bg-white/10 text-muted hover:text-accent transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
