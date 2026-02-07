import React, { useState } from 'react';
import type { ActivityLog } from '../lib/store';
import { X, Trash2, Edit2, Save, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyLogModalProps {
    date: Date | null;
    logs: ActivityLog[];
    onClose: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    activeGroupId: string | null;
    onUpdateLog: (log: ActivityLog) => void;
    onDeleteLog: (id: string) => void;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
    date,
    logs,
    onClose,
    isAuthenticated,
    isAdmin,
    activeGroupId,
    onUpdateLog,
    onDeleteLog
}) => {
    if (!date) return null;

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editSteps, setEditSteps] = useState<string>('');

    const handleEdit = (log: ActivityLog) => {
        setEditingId(log.id);
        setEditSteps(log.steps.toString());
    };

    const handleSave = (log: ActivityLog) => {
        const steps = parseInt(editSteps);
        if (!isNaN(steps)) {
            onUpdateLog({ ...log, steps });
            setEditingId(null);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                        <div>
                            <h2 className="text-xl font-bold text-white">Mission Log</h2>
                            <p className="text-sm text-slate-400 font-mono tracking-tighter uppercase">{format(date, 'MMMM d, yyyy')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                        {logs.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 italic font-medium">
                                <RotateCcw className="mx-auto mb-2 opacity-20" size={32} />
                                No activity recorded for this sector.
                            </div>
                        ) : (
                            logs.map((log) => {
                                const canEdit = isAdmin || (isAuthenticated && log.group_id === activeGroupId);
                                return (
                                    <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                        <div className="flex-1">
                                            {editingId === log.id ? (
                                                <input
                                                    type="number"
                                                    value={editSteps}
                                                    onChange={(e) => setEditSteps(e.target.value)}
                                                    className="bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white w-24"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-bold text-blue-400">{log.steps.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-500 uppercase font-mono">steps</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-slate-400 mt-1 uppercase font-mono">{log.memberName}</div>
                                        </div>

                                        {canEdit && (
                                            <div className="flex gap-2">
                                                {editingId === log.id ? (
                                                    <button onClick={() => handleSave(log)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded">
                                                        <Save size={18} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEdit(log)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => onDeleteLog(log.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

};
