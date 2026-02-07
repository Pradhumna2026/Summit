import React, { useState } from 'react';
import { Lock, Unlock, Send, Activity, ChevronDown, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Group } from '../lib/store';

interface ActivityLoggerProps {
    isAuthenticated: boolean;
    onAuthenticate: (pin: string, targetId: 'admin' | string) => boolean;
    onLogout: () => void;
    groups: Group[];
    members: string[];
    onLogStep: (memberId: string, steps: number, date: string, type: 'activity' | 'adjustment', description?: string) => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
    isAuthenticated,
    onAuthenticate,
    onLogout,
    groups,
    members,
    onLogStep
}) => {
    const [pin, setPin] = useState('');
    const [loginTarget, setLoginTarget] = useState<'admin' | string>('admin'); // 'admin' or group.id
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [selectedMember, setSelectedMember] = useState(members[0] || '');
    const [steps, setSteps] = useState('');
    const [logType, setLogType] = useState<'activity' | 'adjustment'>('activity');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [error, setError] = useState('');

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onAuthenticate(pin, loginTarget);
        if (success) {
            setError('');
            setPin('');
        } else {
            setError('Access Denied: Invalid Security Code');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const stepCount = parseInt(steps);
        if (isNaN(stepCount)) {
            setError('Invalid vertical yield data.');
            return;
        }

        if (logType === 'activity' && stepCount <= 0) {
            setError('Standard activities must have positive step counts.');
            return;
        }

        // Combine date and time
        try {
            const combinedDate = new Date(`${date}T${time}:00`).toISOString();
            onLogStep(selectedMember, stepCount, combinedDate, logType, description);
            setSteps('');
            setDescription('');
            setError('');
        } catch (e) {
            setError('Invalid date/time configuration.');
        }
    };

    const selectedTargetName = loginTarget === 'admin'
        ? 'Expedition Admin'
        : groups.find(g => g.id === loginTarget)?.name || 'Select Target';

    if (!isAuthenticated) {
        return (
            <div className="glass-panel p-6 rounded-bento text-center relative overflow-hidden group min-h-[400px]">
                <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-blue-500/10 p-4 rounded-full mb-6 border border-blue-500/20 text-blue-400">
                        <Shield size={32} className="animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Mission Control</h3>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em] mb-8">Authorization Required</p>

                    <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
                        {/* Custom Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between text-white transition-all hover:border-blue-500/50"
                            >
                                <div className="flex items-center gap-3">
                                    {loginTarget === 'admin' ? <Shield size={16} className="text-amber-500" /> : <User size={16} className="text-blue-400" />}
                                    <span className="text-sm font-bold truncate">{selectedTargetName}</span>
                                </div>
                                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30"
                                    >
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                            <button
                                                type="button"
                                                onClick={() => { setLoginTarget('admin'); setIsDropdownOpen(false); }}
                                                className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center gap-3 transition-colors border-b border-white/5"
                                            >
                                                <Shield size={14} className="text-amber-500" />
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">Admin Terminal</span>
                                            </button>
                                            {groups.map(g => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => { setLoginTarget(g.id); setIsDropdownOpen(false); }}
                                                    className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center gap-3 transition-colors"
                                                >
                                                    <User size={14} className="text-blue-400" />
                                                    <span className="text-xs font-bold text-slate-300">{g.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="ENTER PASSCODE"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-mono tracking-widest focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-2xl transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-rose-500 text-[10px] font-black uppercase tracking-[0.1em]"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        >
                            <Unlock size={18} /> Authenticate
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-bento">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-primary" />
                    Data Entry
                </h2>
                <button
                    onClick={() => { onLogout(); setPin(''); }}
                    className="text-slate-400 hover:text-white text-xs uppercase tracking-wider flex items-center gap-1"
                >
                    <Lock size={12} /> Lock
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Log Type</label>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-white/5">
                        <button
                            type="button"
                            onClick={() => { setLogType('activity'); if (selectedMember === 'TEAM') setSelectedMember(members[0] || ''); }}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${logType === 'activity' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Regular Steps
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLogType('adjustment'); setSelectedMember('TEAM'); }}
                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${logType === 'adjustment' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Adjustment
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">
                        {logType === 'activity' ? 'Vertical Yield (Steps)' : 'Adjustment Value (+/-)'}
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={steps}
                            onChange={(e) => setSteps(e.target.value)}
                            placeholder={logType === 'activity' ? "0" : "+/- 500"}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-white font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xl"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                            STEPS
                        </div>
                    </div>
                </div>

                {logType === 'adjustment' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Adjustment Reason</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Wednesday Bonus"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xl"
                        />
                    </motion.div>
                )}

                <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Operative</label>
                    <div className="grid grid-cols-2 gap-2">
                        {logType === 'adjustment' ? (
                            <button
                                type="button"
                                disabled
                                className="col-span-2 flex items-center gap-2 p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500"
                            >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-amber-500 text-white">
                                    T
                                </div>
                                <span className="text-sm font-medium italic">Group-wide Adjustment</span>
                            </button>
                        ) : (
                            members.map((name, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedMember(name)}
                                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${selectedMember === name
                                        ? 'bg-primary/20 border-primary text-blue-400'
                                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-700 text-white`}>
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Log Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white font-mono text-sm focus:border-primary focus:outline-none shadow-2xl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">Log Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-white font-mono text-sm focus:border-primary focus:outline-none shadow-2xl"
                        />
                    </div>
                </div>

                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Send size={18} /> Upload Data
                </button>

                <div className="text-center text-[10px] text-slate-400 font-mono mt-2">
                    SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
            </form>
        </div>
    );
};
