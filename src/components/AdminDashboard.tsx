import React, { useState } from 'react';
import type { Group } from '../lib/store';
import { Shield, RefreshCw, Trash2, CheckCircle2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface AdminDashboardProps {
    groups: Group[];
    onCreateGroup: (name: string, pin: string, members: string[]) => Promise<boolean>;
    onUpdateGroup: (id: string, name: string, pin: string, members: string[]) => Promise<boolean>;
    onDeleteGroup: (id: string) => Promise<boolean>;
    onManualLog: (groupId: string, memberId: string, steps: number, date: string, description: string) => Promise<void>;
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    groups,
    onCreateGroup,
    onUpdateGroup,
    onDeleteGroup,
    onManualLog,
    onLogout
}) => {
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [members, setMembers] = useState(['', '', '', '']);
    const [isCreating, setIsCreating] = useState(false);

    // Editing state
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPin, setEditPin] = useState('');
    const [editMembers, setEditMembers] = useState<string[]>([]);

    // Manual log state
    const [logGroupId, setLogGroupId] = useState('');
    const [logMemberName, setLogMemberName] = useState('');
    const [logSteps, setLogSteps] = useState('');
    const [logDate, setLogDate] = useState('');
    const [logDescription, setLogDescription] = useState('');
    const [logWeek, setLogWeek] = useState<number>(1); // Week selector for Weekly Summary

    // Calculate current expedition week
    const getCurrentWeek = () => {
        const today = new Date();
        const expeditionStart = new Date(2026, 0, 28);
        const daysSinceStart = Math.floor((today.getTime() - expeditionStart.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.floor(daysSinceStart / 7) + 1);
    };

    // Calculate date for selected week (uses Wednesday as the representative day)
    const getDateForWeek = (weekNum: number) => {
        const expeditionStart = new Date(2026, 0, 28); // Jan 28, 2026 (Wednesday)
        const targetDate = new Date(expeditionStart);
        targetDate.setDate(expeditionStart.getDate() + ((weekNum - 1) * 7));
        return targetDate.toISOString().split('T')[0];
    };

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const generatePin = (type: 'new' | 'edit') => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        if (type === 'new') setNewPin(pin);
        else setEditPin(pin);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredMembers = members.filter(m => m.trim() !== '');
        if (!newName || !newPin || filteredMembers.length === 0) {
            setError('Missing data: Name, PIN, and at least one member required.');
            return;
        }

        setIsCreating(true);
        const ok = await onCreateGroup(newName, newPin, filteredMembers);
        setIsCreating(false);

        if (ok) {
            setSuccess(true);
            setNewName('');
            setNewPin('');
            setMembers(['', '', '', '']);
            setError('');
            setTimeout(() => setSuccess(false), 3000);
        } else {
            setError('Failed to create group. PIN might be in use.');
        }
    };

    const handleUpdate = async (id: string) => {
        const ok = await onUpdateGroup(id, editName, editPin, editMembers.filter(m => m.trim() !== ''));
        if (ok) {
            setEditingGroupId(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    const handleManualLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logGroupId || !logMemberName || !logSteps) return;

        // Use selected week's date for Weekly Summary, otherwise use manual date
        const finalDate = logMemberName === 'Weekly Summary' ? getDateForWeek(logWeek) : logDate;

        if (!finalDate) return;

        await onManualLog(logGroupId, logMemberName, parseInt(logSteps), finalDate, logDescription);
        setLogGroupId('');
        setLogMemberName('');
        setLogSteps('');
        setLogDate('');
        setLogDescription('');
        setLogWeek(getCurrentWeek()); // Reset to current week
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const updateMember = (index: number, val: string) => {
        const next = [...members];
        next[index] = val;
        setMembers(next);
    };

    return (
        <div className="space-y-6">
            <div className="glass-panel p-6 rounded-bento">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <Shield className="text-amber-500" size={20} />
                        </div>
                        Command Center (Admin)
                    </h2>
                    <button
                        onClick={onLogout}
                        className="text-slate-500 hover:text-white text-[10px] uppercase tracking-widest font-black transition-colors px-3 py-1 rounded border border-white/5 bg-slate-900"
                    >
                        Exit Secure Terminal
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Create Group Form */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Deploy New Group
                        </h3>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Group Name"
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-primary focus:outline-none shadow-2xl"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    placeholder="4-Digit PIN"
                                    maxLength={4}
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-center tracking-widest shadow-2xl"
                                />
                                <button type="button" onClick={() => generatePin('new')} className="px-4 bg-slate-800 text-slate-300 rounded-lg border border-white/5">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {members.map((m, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        value={m}
                                        onChange={(e) => updateMember(i, e.target.value)}
                                        placeholder={`Member ${i + 1}`}
                                        className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={isCreating} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/10">
                                {isCreating ? 'Deploying...' : 'Initialize Group'}
                            </button>
                        </form>
                    </div>

                    {/* Authorization Controls & Editing */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Active Database
                        </h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {groups.map(group => (
                                <div key={group.id} className="bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
                                    {editingGroupId === group.id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-slate-950 border border-primary rounded-lg px-3 py-2 text-white text-sm"
                                                placeholder="Group Name"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editPin}
                                                    onChange={(e) => setEditPin(e.target.value)}
                                                    className="flex-1 bg-slate-950 border border-primary rounded-lg px-3 py-2 text-white font-mono text-center"
                                                    placeholder="PIN"
                                                />
                                                <button onClick={() => generatePin('edit')} className="p-2 bg-slate-800 rounded-lg text-slate-300"><RefreshCw size={14} /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {editMembers.map((m, i) => (
                                                    <input
                                                        key={i}
                                                        type="text"
                                                        value={m}
                                                        onChange={(e) => {
                                                            const next = [...editMembers];
                                                            next[i] = e.target.value;
                                                            setEditMembers(next);
                                                        }}
                                                        placeholder={`Member ${i + 1}`}
                                                        className="bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-primary focus:outline-none"
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button onClick={() => handleUpdate(group.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Save Changes</button>
                                                <button onClick={() => setEditingGroupId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-white text-sm">{group.name}</div>
                                                <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest flex flex-wrap gap-x-2">
                                                    <span>PIN: <span className="text-amber-500">{group.pin}</span></span>
                                                    <span className="text-slate-700">|</span>
                                                    <span>{group.members.length} Members</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingGroupId(group.id);
                                                        setEditName(group.name);
                                                        setEditPin(group.pin);
                                                        setEditMembers(group.members.length > 0 ? [...group.members] : ['', '', '', '']);
                                                    }}
                                                    className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors rounded-lg border border-white/5"
                                                    title="Edit Group"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteGroup(group.id)}
                                                    className="p-2 text-slate-700 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manual Override Log Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Manual Override
                        </h3>
                        <form onSubmit={handleManualLog} className="space-y-4 bg-slate-900/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <select
                                value={logGroupId}
                                onChange={(e) => {
                                    setLogGroupId(e.target.value);
                                    setLogMemberName('');
                                }}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500/50 transition-all outline-none"
                            >
                                <option value="">Target Group</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>

                            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setLogMemberName('Weekly Summary')}
                                    className={clsx(
                                        "flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all",
                                        logMemberName === 'Weekly Summary' ? "bg-amber-500 text-slate-950" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    Weekly Summary
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogMemberName('')}
                                    className={clsx(
                                        "flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all",
                                        logMemberName !== 'Weekly Summary' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    Custom Member
                                </button>
                            </div>

                            <div className="space-y-3">
                                {logMemberName !== 'Weekly Summary' && (
                                    <input
                                        type="text"
                                        value={logMemberName}
                                        onChange={(e) => setLogMemberName(e.target.value)}
                                        placeholder="Member Name (e.g. Captain Nemo)"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-amber-500/50 outline-none"
                                    />
                                )}

                                {logMemberName === 'Weekly Summary' && (
                                    <div>
                                        <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2 block">
                                            Select Week
                                        </label>
                                        <select
                                            value={logWeek}
                                            onChange={(e) => setLogWeek(parseInt(e.target.value))}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500/50 transition-all outline-none"
                                        >
                                            {Array.from({ length: getCurrentWeek() }, (_, i) => i + 1).map(week => (
                                                <option key={week} value={week}>
                                                    Week {week} ({getDateForWeek(week)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <input
                                    type="number"
                                    value={logSteps}
                                    onChange={(e) => setLogSteps(e.target.value)}
                                    placeholder="Steps"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-amber-500/50 outline-none"
                                />

                                {logMemberName !== 'Weekly Summary' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Date</label>
                                            <input
                                                type="date"
                                                value={logDate}
                                                onChange={(e) => setLogDate(e.target.value)}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-amber-500/50 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Categorization</label>
                                            <input
                                                type="text"
                                                value={logDescription}
                                                onChange={(e) => setLogDescription(e.target.value)}
                                                placeholder="e.g. Week 2 Total"
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs italic focus:border-amber-500/50 outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-amber-900/40 text-xs">
                                Apply Manual Mission Yield
                            </button>
                        </form>
                    </div>
                </div>

                <AnimatePresence>
                    {(error || success) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex justify-center">
                            {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">{error}</p>}
                            {success && (
                                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Operation Securely Executed
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
};
