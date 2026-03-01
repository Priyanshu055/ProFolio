import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, LayoutDashboard, Settings as SettingsIcon, Code2, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        // Minimal header for login/register pages
        return (
            <div className="absolute top-0 left-0 w-full p-6 flex justify-center z-50">
                <Link text="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                        <Code2 className="w-8 h-8 text-white" />
                    </div>
                </Link>
            </div>
        );
    }

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/settings', icon: SettingsIcon, label: 'Settings' }
    ];

    return (
        <>
            {/* Desktop Floating Sidebar */}
            <motion.nav
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden md:flex flex-col items-center justify-between glass fixed left-6 top-1/2 -translate-y-1/2 w-20 py-8 rounded-3xl z-50 border border-white/10 shadow-2xl h-[80vh] min-h-[500px]"
            >
                {/* Logo top */}
                <Link to="/" className="group mb-8">
                    <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300">
                        <Code2 className="w-8 h-8 text-white" />
                    </div>
                </Link>

                {/* Nav Links middle */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group relative p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text hover:bg-surface/50'}`}
                            >
                                <Icon className="w-6 h-6 relative z-10" />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/20 rounded-2xl border border-primary/30"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col items-center gap-6 mt-8">
                    <Link to="/profile" className="block transform transition-transform hover:scale-105 active:scale-95" title="Personal Profile">
                        {user.profilePicture ? (
                            <div className="w-10 h-10 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg p-0.5 pointer-events-none">
                                <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shadow-lg pointer-events-none">
                                <UserIcon className="w-5 h-5" />
                            </div>
                        )}
                    </Link>

                    <ThemeToggle />

                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Floating Bottom Dock */}
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="md:hidden glass fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm px-6 py-4 rounded-3xl z-50 border border-white/10 shadow-2xl flex items-center justify-between"
            >
                <Link to="/profile" className="p-1 rounded-full border border-primary/30 shrink-0">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserIcon className="w-4 h-4" />
                        </div>
                    )}
                </Link>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text'}`}
                        >
                            <Icon className="w-6 h-6" />
                        </Link>
                    );
                })}

                <ThemeToggle />

                <button
                    onClick={handleLogout}
                    className="p-3 rounded-2xl text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </motion.nav>
        </>
    );
};

export default Navbar;
