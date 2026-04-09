import type { ReactNode } from "react";
import { Award, Users as UsersIcon, Clock } from "lucide-react";

type TabId = "overview" | "participants" | "report";

interface AdminTabsProps {
    activeTab: TabId;
    onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; shortLabel: string; icon: ReactNode }[] = [
    { id: "overview",     label: "Overview",        shortLabel: "Overview",      icon: <Award size={14} /> },
    { id: "participants", label: "Participants",     shortLabel: "Participants",  icon: <UsersIcon size={14} /> },
    { id: "report",       label: "Session Report",  shortLabel: "Report",        icon: <Clock size={14} /> },
];

export function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
    return (
        <div className="bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 px-3 sm:px-4 py-2 animate-fade-in overflow-x-auto">
            <div className="flex gap-1 min-w-max">
                {TABS.map(({ id, label, shortLabel, icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            activeTab === id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                        {icon}
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{shortLabel}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
