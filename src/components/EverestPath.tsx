import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Trophy, Activity, Target } from 'lucide-react';
import { MILESTONES, type Milestone } from '../data/milestones';
import type { ActivityLog } from '../lib/store';
import clsx from 'clsx';

// Asset Imports
import foothills from '../assets/zones/foothills.png';
import alpine from '../assets/zones/alpine.png';
import highAltitude from '../assets/zones/high_altitude.png';
import extreme from '../assets/zones/extreme.png';

interface EverestPathProps {
    groups: Array<{
        id: string;
        name: string;
        members: string[];
        totalSteps: number;
        elevation: number;
        isActive?: boolean;
    }>;
    logs: ActivityLog[];
    onMilestoneClick?: (milestone: Milestone) => void;
}

export const EverestPath: React.FC<EverestPathProps> = ({ groups, logs, onMilestoneClick }) => {
    const [hoveredMilestone, setHoveredMilestone] = React.useState<Milestone | null>(null);
    const [showIdentifier, setShowIdentifier] = useState<string | null>(null);
    const [identifierPos, setIdentifierPos] = React.useState({ x: 0, y: 0 });

    const maxElevation = useMemo(() => Math.max(...groups.map(g => g.elevation), 0), [groups]);
    const activeGroup = useMemo(() => groups.find(g => g.isActive), [groups]);


    // Smoothed Path Helper
    const pathData = useMemo(() => {
        const points = MILESTONES.map(m => m.coordinates);
        if (points.length < 2) return "";

        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            // Calculate control points for a smooth curve
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return d;
    }, []);


    return (
        <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl bg-slate-950/50 backdrop-blur-sm group/visualizer">
            {/* 1. Multi-Column Zoned Background */}
            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-40 grayscale group-hover/visualizer:grayscale-0 transition-all duration-1000">
                <div className="relative h-full overflow-hidden border-r border-white/5">
                    <img src={foothills} className="absolute inset-0 w-full h-full object-cover" alt="Foothills" />
                </div>
                <div className="relative h-full overflow-hidden border-r border-white/5">
                    <img src={alpine} className="absolute inset-0 w-full h-full object-cover" alt="Alpine" />
                </div>
                <div className="relative h-full overflow-hidden border-r border-white/5">
                    <img src={highAltitude} className="absolute inset-0 w-full h-full object-cover" alt="Glacier" />
                </div>
                <div className="relative h-full overflow-hidden">
                    <img src={extreme} className="absolute inset-0 w-full h-full object-cover" alt="Extreme" />
                </div>
            </div>

            {/* Background Atmosphere Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

            <div className="relative w-full h-[400px] md:h-[600px] p-8">
                {/* Header */}
                <div className="absolute top-8 left-8 z-30">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-emerald-500/20 rounded shadow-inner">
                            <Mountain size={18} className="text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
                            Expedition <span className="text-slate-500">Tracker</span>
                        </h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] font-mono">
                        Everest Expedition • Visualizer MK-V
                    </p>
                </div>

                {/* HUD Metrics */}
                <div className="absolute top-8 right-8 z-30 flex gap-4">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[120px]">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest opacity-70">Altitude</span>
                            <Activity size={10} className="text-blue-400 animate-pulse" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white font-mono leading-none">
                                {(activeGroup ? activeGroup.elevation : maxElevation).toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-blue-400">M</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[120px]">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest opacity-70">Progress</span>
                            <Target size={10} className="text-emerald-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white font-mono leading-none">
                                {Math.min(((activeGroup ? activeGroup.elevation : maxElevation) / 8848 * 100), 100).toFixed(0)}
                            </span>
                            <span className="text-xs font-black text-blue-400">%</span>
                        </div>
                    </div>
                </div>

                {/* Satellite Status Badge */}
                <div className="absolute top-36 right-8 z-30">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Satellite Feed Active</span>
                    </div>
                </div>

                {/* Vertical Guidelines & Labels */}
                <div className="absolute bottom-6 left-0 right-0 px-8 z-30 flex justify-between pointer-events-none opacity-50">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lowlands</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High Alpine</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Glacier Zone</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Death Zone</span>
                </div>

                {/* Path SVG */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-8 overflow-visible z-20">
                    <defs>
                        <linearGradient id="expeditionPath" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="30%" stopColor="#2dd4bf" />
                            <stop offset="60%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Faint Background Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />


                    {/* Milestones */}
                    {MILESTONES.map((m) => {
                        const isReached = m.elevation <= maxElevation;
                        const isHovered = hoveredMilestone?.name === m.name;

                        return (
                            <g
                                key={m.id}
                                onMouseEnter={() => setHoveredMilestone(m)}
                                onMouseLeave={() => setHoveredMilestone(null)}
                                onClick={() => onMilestoneClick?.(m)}
                            >
                                <circle
                                    cx={m.coordinates.x}
                                    cy={m.coordinates.y}
                                    r="4"
                                    fill="transparent"
                                />
                                <motion.circle
                                    cx={m.coordinates.x}
                                    cy={m.coordinates.y}
                                    r={isHovered ? 2.5 : (isReached ? 1.5 : 0.8)}
                                    fill={isReached ? (m.isKeyMarker ? "#2dd4bf" : "#fff") : "rgba(255,255,255,0.1)"}
                                    stroke={isReached ? "rgba(0,0,0,0.5)" : "none"}
                                    strokeWidth="0.2"
                                    animate={{
                                        scale: isHovered ? 1.5 : 1,
                                    }}
                                />

                                {/* Milestone Labels */}
                                {m.isKeyMarker && (
                                    <foreignObject
                                        x={m.coordinates.x - 15}
                                        y={m.coordinates.y - 8}
                                        width="30"
                                        height="10"
                                        className="pointer-events-none overflow-visible"
                                    >
                                        <div className="flex flex-col items-center justify-end h-full">
                                            <div className="text-center">
                                                <div className={clsx(
                                                    "font-black uppercase leading-tight whitespace-nowrap text-[2.5px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                                                    isReached ? "text-emerald-400" : "text-slate-400"
                                                )}>
                                                    {m.name}
                                                </div>
                                                <div className="text-[2px] font-bold text-slate-600 uppercase tracking-widest leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                                                    {m.elevation}m
                                                </div>
                                            </div>
                                            <div className={clsx(
                                                "w-[0.3px] h-1.5 mt-0.5",
                                                isReached ? "bg-emerald-500/30" : "bg-white/5"
                                            )} />
                                        </div>
                                    </foreignObject>
                                )}
                            </g>
                        );
                    })}

                    {/* Group Progression Signals */}
                    {groups.map((group, idx) => {
                        const progress = Math.min(group.elevation / 8848, 1);
                        const pointIndex = Math.min(Math.floor(progress * (MILESTONES.length - 1)), MILESTONES.length - 1);
                        const point = MILESTONES[pointIndex].coordinates;

                        // Distinct colors for groups
                        const groupColors = [
                            '#3b82f6', // blue
                            '#f43f5e', // rose
                            '#10b981', // emerald
                            '#f59e0b', // amber
                            '#a855f7', // purple
                            '#ec4899'  // pink
                        ];
                        const color = groupColors[idx % groupColors.length];

                        return (
                            <motion.g
                                key={group.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="pointer-events-auto cursor-help"
                                onMouseMove={(e) => {
                                    const rect = e.currentTarget.closest('svg')!.getBoundingClientRect();
                                    setIdentifierPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                                    setShowIdentifier(group.id);
                                }}
                                onMouseLeave={() => setShowIdentifier(null)}
                            >
                                {/* Flag Marker */}
                                <g transform={`translate(${point.x}, ${point.y})`}>
                                    {/* Flag pole */}
                                    <line
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="3"
                                        stroke={color}
                                        strokeWidth="0.3"
                                        className="opacity-80"
                                    />
                                    {/* Flag */}
                                    <motion.path
                                        d="M 0,0 L 2.5,0.8 L 2.5,2.2 L 0,3 Z"
                                        fill={color}
                                        className="animate-pulse"
                                        style={{ animationDuration: '2s' }}
                                    />
                                    {/* Glow effect */}
                                    <circle
                                        cx="0"
                                        cy="1.5"
                                        r="2"
                                        fill={color}
                                        opacity="0.2"
                                        className="animate-pulse"
                                        style={{ animationDuration: '2s' }}
                                    />
                                </g>
                            </motion.g>
                        );
                    })}
                </svg>

                {/* Milestone Detail Card (Bottom Right) */}
                <AnimatePresence>
                    {hoveredMilestone && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-12 right-8 z-[100] bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-3xl w-[320px] pointer-events-none"
                        >
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">{hoveredMilestone.zone}</div>
                            <h4 className="text-2xl font-black text-white leading-tight uppercase mb-4">{hoveredMilestone.name}</h4>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Elevation</div>
                                    <div className="text-lg font-mono font-black text-white">{hoveredMilestone.elevation.toLocaleString()}m</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Sector</div>
                                    <div className="text-lg font-mono font-black text-white">0{hoveredMilestone.id}</div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                "{hoveredMilestone.description}"
                            </p>

                            {hoveredMilestone.elevation <= maxElevation && (
                                <div className="mt-4 flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                    <Trophy size={14} /> Objective Secured
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Team Information Tooltip */}
                {showIdentifier && (() => {
                    const team = groups.find(g => g.id === showIdentifier);
                    if (!team) return null;

                    const teamLogs = logs.filter(l => l.group_id === team.id);
                    const totalSteps = teamLogs.reduce((acc, log) => acc + log.steps, 0);
                    const teamProgress = Math.min((team.elevation / 8848) * 100, 100);

                    // Calculate weekly stats
                    const today = new Date();
                    const expeditionStart = new Date(2026, 0, 28);
                    const daysSinceStart = Math.floor((today.getTime() - expeditionStart.getTime()) / (1000 * 60 * 60 * 24));
                    const currentWeekNum = Math.floor(daysSinceStart / 7);

                    const currentWeekStart = new Date(expeditionStart);
                    currentWeekStart.setDate(expeditionStart.getDate() + (currentWeekNum * 7));
                    const currentWeekEnd = new Date(currentWeekStart);
                    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

                    const priorWeekStart = new Date(currentWeekStart);
                    priorWeekStart.setDate(currentWeekStart.getDate() - 7);
                    const priorWeekEnd = new Date(currentWeekStart);
                    priorWeekEnd.setDate(currentWeekStart.getDate() - 1);

                    const currentWeekSteps = teamLogs
                        .filter(log => {
                            const logDate = new Date(log.date);
                            return logDate >= currentWeekStart && logDate <= currentWeekEnd;
                        })
                        .reduce((acc, log) => acc + log.steps, 0);

                    const priorWeekSteps = teamLogs
                        .filter(log => {
                            const logDate = new Date(log.date);
                            return logDate >= priorWeekStart && logDate <= priorWeekEnd;
                        })
                        .reduce((acc, log) => acc + log.steps, 0);

                    const groupColors = [
                        { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', dot: 'bg-blue-500' },
                        { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-500' },
                        { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-500' },
                        { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-500' },
                        { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-500' },
                        { bg: 'bg-pink-500/10', border: 'border-pink-500/40', text: 'text-pink-400', dot: 'bg-pink-500' }
                    ];
                    const teamIdx = groups.findIndex(g => g.id === team.id);
                    const colors = groupColors[teamIdx % groupColors.length];

                    return (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                position: 'absolute',
                                left: Math.min(identifierPos.x + 15, window.innerWidth - 320),
                                top: identifierPos.y - 20,
                                pointerEvents: 'none',
                                zIndex: 1000
                            }}
                            className={`w-[280px] ${colors.bg} ${colors.border} border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl`}
                        >
                            {/* Team Header */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                                <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
                                <h4 className="text-sm font-black text-white uppercase tracking-wide">{team.name}</h4>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Elevation</div>
                                    <div className={`text-lg font-black ${colors.text} font-mono`}>{team.elevation.toLocaleString()}m</div>
                                </div>
                                <div>
                                    <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Progress</div>
                                    <div className={`text-lg font-black ${colors.text}`}>{teamProgress.toFixed(1)}%</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Total Steps</div>
                                    <div className="text-base font-black text-white font-mono">{totalSteps.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Weekly Progress */}
                            <div className="mb-3 pb-3 border-b border-white/10">
                                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Weekly Progress</div>
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-slate-400">This Week</span>
                                    <span className={`font-black ${colors.text}`}>{currentWeekSteps.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400">Prior Week</span>
                                    <span className="font-bold text-slate-500">{priorWeekSteps.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div>
                                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Team Members</div>
                                <div className="flex flex-wrap gap-1">
                                    {team.members.filter(m => m.trim()).map((member, idx) => (
                                        <span key={idx} className="text-[9px] bg-slate-900/50 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                            {member}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </div>
        </div>
    );
};
