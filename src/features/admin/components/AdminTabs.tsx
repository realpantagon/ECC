import type { ReactNode } from "react";
import { Award, Users as UsersIcon, Clock } from "lucide-react";

type TabId = "overview" | "participants" | "report";

interface AdminTabsProps {
    activeTab: TabId;
    onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
    { id: "overview",      label: "Overview",        icon: <Award size={14} /> },
    { id: "participants",  label: "Participants",     icon: <UsersIcon size={14} /> },
    { id: "report",        label: "Session Report",  icon: <Clock size={14} /> },
];

export function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
    return (
        <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 px-4 py-2 animate-fade-in">
            <div className="flex gap-1 flex-wrap">
                {TABS.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none
                            ${activeTab === id ? "bg-blue-600 text-white" : "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
