import React from 'react';
import type { Group, ActivityLog } from '../lib/store';
import { Users, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { stepsToElevation, getWeeklyStats, SUMMIT_ELEVATION } from '../lib/expedition';

interface GroupSummaryProps {
    groups: Group[];
    logs: ActivityLog[];
}

export const GroupSummary: React.FC<GroupSummaryProps> = ({ groups, logs }) => {
    const groupStats = groups.map(group => {
        const groupLogs = logs.filter(l => l.group_id === group.id);
        const totalSteps = groupLogs.reduce((acc, log) => acc + log.steps, 0);
        const elevation = stepsToElevation(totalSteps);
        const progress = Math.min((elevation / SUMMIT_ELEVATION) * 100, 100);
        const weekly = getWeeklyStats(groupLogs);

        // Find recent adjustments
        const recentAdjustments = groupLogs
            .filter(l => l.type === 'adjustment')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 1);

        return {
            ...group,
            totalSteps,
            elevation,
            progress,
            weekly,
            lastAdjustment: recentAdjustments[0]
        };
    }).sort((a, b) => b.elevation - a.elevation);

    return (
        <div className="glass-panel p-6 rounded-bento overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-primary" />
                    Expedition Leaderboard
                </h2>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                    {groups.length} Groups Participating
                </div>
            </div>

            <div className="space-y-4">
                {groupStats.map((stat, index) => (
                    <div
                        key={stat.id}
                        className="relative bg-slate-800/30 border border-white/5 rounded-xl p-4 transition-all hover:bg-slate-800/50 hover:border-white/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                    index === 1 ? 'bg-slate-700/50 text-slate-300 border border-white/10' :
                                        index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                            'bg-slate-800 text-slate-500 border border-white/5'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{stat.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">ID: {stat.id.split('-')[0].toUpperCase()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-emerald-400 leading-none">{stat.elevation}m</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                                    {stat.totalSteps.toLocaleString()} Steps
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-1000"
                                style={{ width: `${stat.progress}%` }}
                            />
                        </div>

                        {/* Weekly Insights */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-slate-900/40 rounded-lg p-2 border border-white/5">
                                <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    <Calendar size={10} className="text-blue-400" />
                                    This Week
                                </div>
                                <div className="text-sm font-mono font-black text-white leading-none">
                                    {stat.weekly.currentWeekSteps.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-slate-900/40 rounded-lg p-2 border border-white/5">
                                <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    <ArrowUpRight size={10} className="text-emerald-400" />
                                    Prior Week
                                </div>
                                <div className="text-sm font-mono font-black text-white leading-none">
                                    {stat.weekly.prevWeekSteps.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Recent Adjustment Tag */}
                        {stat.lastAdjustment && (
                            <div className="flex items-center gap-2 text-[9px] font-bold py-1 px-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 animate-pulse">
                                <TrendingUp size={10} />
                                RECENT ADJUSTMENT: {stat.lastAdjustment.steps > 0 ? '+' : ''}{stat.lastAdjustment.steps} steps ({stat.lastAdjustment.description || 'Bonus'})
                            </div>
                        )}
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="text-center py-12 text-slate-600 italic text-sm">
                        No groups have been deployed yet.
                    </div>
                )}
            </div>
        </div>
    );
};
