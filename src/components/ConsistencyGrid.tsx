import React from 'react';
import type { ActivityLog } from '../lib/store';
import { format, isSameDay } from 'date-fns';
import clsx from 'clsx';
import { Calendar } from 'lucide-react';

interface ConsistencyGridProps {
    logs: ActivityLog[];
    onDateClick?: (date: Date) => void;
}

export const ConsistencyGrid: React.FC<ConsistencyGridProps> = ({ logs, onDateClick }) => {
    const today = new Date();

    // Expedition starts Jan 28, 2026 (Wednesday)
    const expeditionStart = new Date(2026, 0, 28); // Month is 0-indexed

    // Calculate how many weeks to show (from start to today, plus current week)
    const daysSinceStart = Math.max(0, Math.floor((today.getTime() - expeditionStart.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksToShow = Math.ceil((daysSinceStart + 1) / 7);

    // Generate days for each week (Wed-Tue cycles)
    const weeks: Date[][] = [];
    for (let weekNum = 0; weekNum < weeksToShow; weekNum++) {
        const weekStart = new Date(expeditionStart);
        weekStart.setDate(expeditionStart.getDate() + (weekNum * 7));

        const weekDays: Date[] = [];
        for (let day = 0; day < 7; day++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + day);
            weekDays.push(date);
        }
        weeks.push(weekDays);
    }

    const getIntensity = (date: Date) => {
        const dailySteps = logs
            .filter(log => isSameDay(new Date(log.date), date))
            .reduce((acc, log) => acc + log.steps, 0);

        if (dailySteps === 0) return 'bg-slate-900 border-white/5';
        if (dailySteps < 4000) return 'bg-sky-500/40 border-sky-500/20';
        if (dailySteps < 8000) return 'bg-emerald-500/60 border-emerald-500/30';
        if (dailySteps < 12000) return 'bg-amber-500/80 border-amber-500/40';
        if (dailySteps < 16000) return 'bg-orange-500 border-orange-500/50';
        return 'bg-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
    };

    const weekDayLabels = ['W', 'T', 'F', 'S', 'S', 'M', 'T']; // Wed-Tue

    return (
        <div className="glass-panel p-6 rounded-bento">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    Expedition Readiness
                </h2>
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Since Jan 28, 2026
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDayLabels.map((day, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-600 text-center uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                {weeks.map((weekDays, weekIndex) => (
                    <div key={weekIndex}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                Week {weekIndex + 1}
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {weekDays.map((date) => {
                                const isToday = isSameDay(date, today);
                                const isFuture = date > today;

                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => onDateClick?.(date)}
                                        disabled={isFuture}
                                        className={clsx(
                                            "flex flex-col items-center gap-1 group focus:outline-none transition-all",
                                            isFuture && "opacity-20 cursor-not-allowed",
                                            isToday && "scale-105"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "w-full aspect-square rounded-sm border transition-all duration-300 relative",
                                                getIntensity(date),
                                                isToday && "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950",
                                                !isFuture && "group-hover:scale-110 group-focus:ring-1 group-focus:ring-blue-400"
                                            )}
                                        >
                                            <span className={clsx(
                                                "absolute inset-0 flex items-center justify-center text-[8px] font-bold transition-opacity",
                                                isToday ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-100 text-slate-300"
                                            )}>
                                                {format(date, 'd')}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>Low</span>
                    <div className="flex gap-0.5">
                        <div className="w-2 hs-2 rounded-[1px] bg-slate-900 border border-white/5" />
                        <div className="w-2 h-2 rounded-[1px] bg-sky-500/40" />
                        <div className="w-2 h-2 rounded-[1px] bg-emerald-500/60" />
                        <div className="w-2 h-2 rounded-[1px] bg-amber-500/80" />
                        <div className="w-2 h-2 rounded-[1px] bg-orange-500" />
                        <div className="w-2 h-2 rounded-[1px] bg-rose-500" />
                    </div>
                    <span>Peak</span>
                </div>
                <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    Live Readiness Matrix
                </div>
            </div>
        </div>
    );
};
