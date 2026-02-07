import React from 'react';
import type { Milestone } from '../data/milestones';
import { X, Satellite, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MilestoneModalProps {
    milestone: Milestone | null;
    onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, onClose }) => {
    if (!milestone) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-bento overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-white shadow-lg transition-colors border border-white/5"
                    >
                        <X size={18} />
                    </button>

                    <div className="h-64 bg-slate-950 relative group overflow-hidden">
                        {/* Placeholder for Dynamic Imagery */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-2">
                            <Satellite size={48} className="opacity-30" />
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Satellite Recon Feed</span>
                        </div>
                        {/* In a real app, this would be the generated image */}
                        <img
                            src={milestone.snapshot || `https://placehold.co/600x400/020617/3b82f6?text=${encodeURIComponent(milestone.name)}`}
                            alt={milestone.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2 text-blue-400 font-mono text-[10px] font-bold">
                                    <MapPin size={10} />
                                    <span>COORD: {milestone.coordinates.x.toFixed(2)}, {milestone.coordinates.y.toFixed(2)}</span>
                                </div>
                                {milestone.zone && (
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        {milestone.zone}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight uppercase">{milestone.name}</h2>
                            <p className="text-blue-500 font-black tracking-widest text-sm mt-1">{milestone.elevation} METERS ASL</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <p className="text-slate-400 leading-relaxed mb-8 font-medium italic text-lg">
                            "{milestone.description}"
                        </p>
                        <div className="flex gap-4">
                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-xl active:scale-95">
                                RECON INFO
                            </button>
                            <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-blue-500/20">
                                3D TERRAIN
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
