import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface Group {
    id: string;
    name: string;
    pin: string;
    members: string[]; // Dynamically added member names
    created_at?: string;
}

export interface ActivityLog {
    id: string;
    member_id: string;  // Changed from memberId
    group_id: string;   // Changed from groupId
    steps: number;
    date: string; // ISO string
    timestamp: number;
    type: 'activity' | 'adjustment';
    description?: string;
    memberName: string;
}

export interface AppState {
    groups: Group[];
    logs: ActivityLog[];
    loading: boolean;
    online: boolean;
    totalSteps: number;
    currentElevation: number; // meters
    isAdmin: boolean;
    activeGroupId: string | null;
}

const STEPS_PER_METER = 100;
const STORAGE_KEY = 'everest_logs';

export const useStore = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [online, setOnline] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Derived state for active group
    const activeGroupLogs = logs.filter(l => l.group_id === activeGroupId);
    const totalSteps = activeGroupLogs.reduce((acc, log) => acc + log.steps, 0);
    const currentElevation = Math.floor(totalSteps / STEPS_PER_METER);

    useEffect(() => {
        const init = async () => {
            try {
                if (isSupabaseConfigured()) {
                    // Fetch groups
                    const { data: groupData, error: groupError } = await supabase
                        .from('groups')
                        .select('*');

                    if (!groupError && groupData) {
                        setGroups(groupData as Group[]);
                    }

                    // Fetch logs
                    const { data: logData, error: logError } = await supabase
                        .from('logs')
                        .select('*')
                        .order('timestamp', { ascending: true });

                    if (!logError && logData) {
                        setLogs(logData as ActivityLog[]);
                        setOnline(true);
                    } else {
                        loadLocal();
                    }
                } else {
                    loadLocal();
                }
            } catch (e) {
                console.error('Init error', e);
                loadLocal();
            } finally {
                setLoading(false);
            }
        };

        init();

        // Subscribe to realtime if online
        if (isSupabaseConfigured()) {
            const channel = supabase
                .channel('public:logs')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
                    // Simple re-fetch or optimistically update. Re-fetch is safer for now.
                    // Ideally we handle INSERT/DELETE
                    if (payload.eventType === 'INSERT') {
                        setLogs(prev => [...prev, payload.new as ActivityLog]);
                    } else if (payload.eventType === 'DELETE') {
                        setLogs(prev => prev.filter(l => l.id !== payload.old.id));
                    }
                })
                .subscribe((status) => {
                    console.log('UseStore: Realtime Subscription Status:', status);
                    if (status === 'SUBSCRIBED') {
                        console.log('UseStore: Connected to Realtime!');
                        setOnline(true);
                    } else {
                        console.warn('UseStore: Failed to connect to Realtime. Status:', status);
                        // setOnline(false); // keep it true if initial fetch worked? No, better to reflect sync status.
                    }
                });

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, []);

    const loadLocal = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setLogs(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to parse local logs', e);
            localStorage.removeItem(STORAGE_KEY);
        }
        setOnline(false);
    };

    const addLog = async (member_id: string, steps: number, date: string, type: 'activity' | 'adjustment' = 'activity', description?: string) => {
        if (!activeGroupId) return;

        const newLog: ActivityLog = {
            id: crypto.randomUUID(),
            member_id,
            group_id: activeGroupId,
            steps,
            date,
            timestamp: new Date(date).getTime(),
            type,
            description
        };

        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('logs').insert([newLog]);
            if (error) {
                console.error('Supabase insert failed', error);
                saveLocal(newLog);
            }
        } else {
            saveLocal(newLog);
        }
    };

    const addManualLog = async (groupId: string, member_id: string, steps: number, date: string, description: string) => {
        const newLog: ActivityLog = {
            id: crypto.randomUUID(),
            member_id,
            group_id: groupId,
            steps,
            date,
            timestamp: new Date(date).getTime(),
            type: 'activity',
            description
        };

        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('logs').insert([newLog]);
            if (error) {
                console.error('Supabase manual insert failed', error);
                saveLocal(newLog);
            }
        } else {
            saveLocal(newLog);
        }
    };

    const updateLog = async (updatedLog: ActivityLog) => {
        // Optimistic update
        setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('logs').update(updatedLog).eq('id', updatedLog.id);
            if (error) {
                console.error('Supabase update failed', error);
                // Revert on error? Or just warn. Warn for now.
            }
        } else {
            updateLocal(updatedLog);
        }
    };

    const deleteLog = async (id: string) => {
        // Optimistic update
        setLogs(prev => prev.filter(l => l.id !== id));

        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('logs').delete().eq('id', id);
            if (error) {
                console.error('Supabase delete failed', error);
            }
        } else {
            deleteLocal(id);
        }
    };

    const saveLocal = (log: ActivityLog) => {
        const newLogs = [...logs, log];
        setLogs(newLogs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    };

    const updateLocal = (updatedLog: ActivityLog) => {
        const newLogs = logs.map(l => l.id === updatedLog.id ? updatedLog : l);
        setLogs(newLogs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    };

    const deleteLocal = (id: string) => {
        const newLogs = logs.filter(l => l.id !== id);
        setLogs(newLogs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    };

    const authenticate = (pin: string, targetId: 'admin' | string) => {
        // Admin check
        if (targetId === 'admin') {
            if (pin === 'Everest8848') {
                setIsAdmin(true);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        }

        // Group check
        const group = groups.find(g => g.id === targetId && g.pin === pin);
        if (group) {
            setActiveGroupId(group.id);
            setIsAuthenticated(true);
            setIsAdmin(false);
            return true;
        }

        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setActiveGroupId(null);
    };

    const createGroup = async (name: string, pin: string, members: string[] = []) => {
        const newGroup: Group = {
            id: crypto.randomUUID(),
            name,
            pin,
            members
        };

        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('groups').insert([newGroup]);
            if (error) {
                console.error('Group creation failed', error);
                return false;
            }
        }
        setGroups(prev => [...prev, newGroup]);
        return true;
    };

    const updateGroup = async (id: string, name: string, pin: string, members: string[]) => {
        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('groups').update({ name, pin, members }).eq('id', id);
            if (error) {
                console.error('Group update failed', error);
                return false;
            }
        }
        setGroups(prev => prev.map(g => g.id === id ? { ...g, name, pin, members } : g));
        return true;
    };

    const deleteGroup = async (id: string) => {
        if (isSupabaseConfigured() && online) {
            const { error } = await supabase.from('groups').delete().eq('id', id);
            if (error) {
                console.error('Group deletion failed', error);
                return false;
            }
        }
        setGroups(prev => prev.filter(g => g.id !== id));
        return true;
    };

    return {
        groups,
        logs,
        loading,
        online,
        totalSteps,
        currentElevation,
        isAuthenticated,
        isAdmin,
        activeGroupId,
        activeGroup: groups.find(g => g.id === activeGroupId),
        authenticate,
        logout,
        addLog,
        addManualLog,
        updateLog,
        deleteLog,
        createGroup,
        updateGroup,
        deleteGroup,
    };
};

