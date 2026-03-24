import { Plus } from "lucide-react";

interface AvailabilityFormProps {
    date: string;
    setDate: (v: string) => void;
    start: string;
    onStartChange: (v: string) => void;
    end: string;
    onAddSubmit: (e: React.FormEvent) => void;
}

export function AvailabilityForm({ date, setDate, start, onStartChange, end, onAddSubmit }: AvailabilityFormProps) {
    return (
        <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-xl shadow-md shadow-blue-100/30 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-0.5">Add Availability</h2>
            <p className="text-xs text-slate-500 mb-3">Schedule your weekly mentoring slots</p>
            <form onSubmit={onAddSubmit} className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">Date</label>
                    <input
                        type="date"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">Start Time</label>
                    <input
                        type="time"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                        value={start}
                        onChange={e => onStartChange(e.target.value)}
                        required
                    />
                </div>
                <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">End Time</label>
                    <input
                        type="time"
                        className="px-3 py-1.5 bg-white/70 border border-slate-200 rounded-lg text-sm opacity-60 cursor-not-allowed"
                        value={end}
                        disabled
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer h-[34px]"
                >
                    <Plus size={16} /> Add Slot
                </button>
            </form>
        </div>
    );
}
