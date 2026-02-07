import React from 'react';
import type { ActivityLog } from '../lib/store';
import { Users } from 'lucide-react';

interface TeamStatsProps {
    members: string[];
    logs: ActivityLog[];
}

export const TeamStats: React.FC<TeamStatsProps> = ({ members, logs }) => {
    const totalSteps = logs.reduce((acc, log) => acc + log.steps, 0);

    return (
        <div className="glass-panel p-6 rounded-bento">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={14} /> Team Composition
            </h3>
            <div className="space-y-3">
                {members.map((name, index) => {
                    const memberSteps = logs
                        .filter(l => l.member_id === name)
                        .reduce((acc, log) => acc + log.steps, 0);

                    return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/5 group hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                    {name.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-white">{name}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-blue-400 font-bold">{memberSteps.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Yield</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-tighter">Total Steps</div>
                        <div className="text-2xl font-black text-white">{totalSteps.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase tracking-tighter">Avg / Member</div>
                        <div className="text-2xl font-black text-white">{(members.length > 0 ? Math.round(totalSteps / members.length) : 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

