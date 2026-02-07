import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';

interface DynamicSyncProps {
    online: boolean;
}

export const DynamicSync: React.FC<DynamicSyncProps> = ({ online }) => {
    return (
        <div className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-colors",
            online
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/50 text-rose-400"
        )}>
            {online ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
            <span>{online ? "SatLink Active" : "Offline Mode"}</span>
        </div>
    );
};
