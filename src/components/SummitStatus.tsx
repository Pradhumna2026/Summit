import React from 'react';
import { Mountain, Flag, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Group, ActivityLog } from '../lib/store';
import { stepsToElevation } from '../lib/expedition';

interface SummitStatusProps {
    currentElevation: number;
    groups?: Group[];
    logs?: ActivityLog[];
}

export const SummitStatus: React.FC<SummitStatusProps> = ({ currentElevation, groups = [], logs = [] }) => {
    const progress = Math.min((currentElevation / 8848) * 100, 100);

    // Calculate individual team stats
    const teamStats = groups.map(group => {
        const teamLogs = logs.filter(l => l.group_id === group.id);
        const totalSteps = teamLogs.reduce((acc, log) => acc + log.steps, 0);
        const elevation = stepsToElevation(totalSteps);
        const teamProgress = Math.min((elevation / 8848) * 100, 100);

        return {
            ...group,
            totalSteps,
            elevation,
            progress: teamProgress
        };
    }).sort((a, b) => b.elevation - a.elevation); // Sort by elevation descending

    const groupColors = [
        { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'from-blue-600 to-blue-400' },
        { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'from-rose-600 to-rose-400' },
        { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'from-emerald-600 to-emerald-400' },
        { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'from-amber-600 to-amber-400' },
        { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'from-purple-600 to-purple-400' },
        { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', bar: 'from-pink-600 to-pink-400' }
    ];

    return (
        <div className="glass-panel p-6 rounded-bento border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Mountain size={80} className="text-white" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Flag className="text-primary animate-bounce" size={20} />
                    <h2 className="text-xl font-black text-white tracking-tight">SUMMIT REACH</h2>
                </div>

                <div className="flex items-end gap-2 mb-1">
                    <span className="text-5xl font-black text-white tabular-nums leading-none">
                        {currentElevation.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-slate-400 mb-1">m</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
                    <span>TARGET: 8,848m</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span>GAP: {(8848 - currentElevation).toLocaleString()}m</span>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Expedition Progress</span>
                        <span className="text-primary">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 via-primary to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                </div>

                {/* Team Summary Cards */}
                {teamStats.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={14} className="text-slate-500" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Progress</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {teamStats.map((team, idx) => {
                                const colors = groupColors[idx % groupColors.length];
                                return (
                                    <div
                                        key={team.id}
                                        className={`${colors.bg} ${colors.border} border rounded-lg p-3 transition-all hover:scale-[1.02]`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                                                <span className="text-xs font-bold text-white">{team.name}</span>
                                            </div>
                                            <span className={`text-[10px] font-black ${colors.text}`}>
                                                {team.progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1.5">
                                            <span>{team.elevation.toLocaleString()}m</span>
                                            <span>{team.totalSteps.toLocaleString()} steps</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-950/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${team.progress}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                                                className={`h-full bg-gradient-to-r ${colors.bar}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
