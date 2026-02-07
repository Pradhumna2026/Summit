import { useState } from 'react';
import { useStore } from './lib/store';
import { GroupSummary } from './components/GroupSummary';
import { AdminDashboard } from './components/AdminDashboard';
import { EverestPath } from './components/EverestPath';
import { ActivityLogger } from './components/ActivityLogger';
import { TeamStats } from './components/TeamStats';
import { ConsistencyGrid } from './components/ConsistencyGrid';
import { SummitStatus } from './components/SummitStatus';
import { DynamicSync } from './components/DynamicSync';
import { MilestoneModal } from './components/MilestoneModal';
import { DailyLogModal } from './components/DailyLogModal';
import type { Milestone } from './data/milestones';
import { Satellite, ShieldCheck, LogOut } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { stepsToElevation } from './lib/expedition';

function App() {
  const {
    groups,
    logs,
    loading,
    online,
    currentElevation,
    isAuthenticated,
    isAdmin,
    activeGroupId,
    activeGroup,
    authenticate,
    logout,
    addLog,
    addManualLog,
    updateLog,
    deleteLog,
    createGroup,
    updateGroup,
    deleteGroup
  } = useStore();

  const activeGroupLogs = logs.filter(l => l.group_id === activeGroupId);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-400">
        <Satellite size={64} className="animate-spin mb-4" />
        <div className="text-xl font-mono tracking-widest animate-pulse">ESTABLISHING UPLINK...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              KAYAKALPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">EVEREST</span>
            </h1>
          </div>
          <p className="text-slate-400 font-mono text-xs tracking-[0.2em] uppercase pl-1">
            Vertical Expedition Command Center
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DynamicSync online={online} />
          {isAuthenticated && (
            <button
              onClick={logout}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/5"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {isAdmin ? (
          <AdminDashboard
            groups={groups}
            onCreateGroup={createGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            onManualLog={addManualLog}
            onLogout={logout}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hero Section: Map & Status */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              <EverestPath
                groups={groups.map(g => {
                  const totalSteps = logs.filter(l => l.group_id === g.id).reduce((acc, curr) => acc + curr.steps, 0);
                  return {
                    ...g,
                    totalSteps,
                    elevation: stepsToElevation(totalSteps),
                    isActive: g.id === activeGroupId
                  };
                })}
                logs={logs}
                onMilestoneClick={setSelectedMilestone}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummitStatus currentElevation={currentElevation} groups={groups} logs={logs} />
                <ConsistencyGrid logs={isAuthenticated ? activeGroupLogs : logs} onDateClick={setSelectedDate} />
              </div>

            </section>

            {/* Sidebar: Stats, Logger & Leaderboard */}
            <section className="lg:col-span-4 flex flex-col gap-6">
              <ActivityLogger
                isAuthenticated={isAuthenticated}
                onAuthenticate={(pin, targetId) => authenticate(pin, targetId)}
                onLogout={logout}
                groups={groups}
                members={activeGroup?.members || []}
                onLogStep={(memberId, steps, date, type, desc) => addLog(memberId, steps, date, type, desc)}
              />

              {!isAuthenticated && (
                <div className="bg-slate-900/50 rounded-bento border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-slate-900/80">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Mission Leaderboard
                    </h3>
                  </div>
                  <div className="p-2">
                    <GroupSummary groups={groups} logs={logs} />
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-bento p-4 mb-2">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Active Group</div>
                    <div className="text-xl font-black text-white">{activeGroup?.name}</div>
                  </div>
                  <TeamStats members={activeGroup?.members || []} logs={activeGroupLogs} />
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      <MilestoneModal milestone={selectedMilestone} onClose={() => setSelectedMilestone(null)} />

      <DailyLogModal
        date={selectedDate}
        logs={selectedDate ? logs.filter(l => isSameDay(new Date(l.date), selectedDate)) : []}
        onClose={() => setSelectedDate(null)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        activeGroupId={activeGroupId}
        onUpdateLog={updateLog}
        onDeleteLog={deleteLog}
      />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 py-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-xs font-mono">
          SYSTEM STATUS: NOMINAL • ELEVATION DATA: SCALED 1:100 • SECURE CONNECTION
        </p>
      </footer>
    </div>
  );
}

export default App;
