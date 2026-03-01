import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity ${colorClass}`} />

            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl bg-surface border border-white/10 shadow-sm ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted mb-1">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight text-text">
                        {value !== undefined && value !== null ? value : '-'}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
