import { Clock } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Availability } from "../../../types/Availability";

interface ConfirmRequestModalProps {
    selectedSlots: string[];
    availabilities: Availability[];
    topic: string;
    setTopic: (t: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmRequestModal({
    selectedSlots,
    availabilities,
    topic,
    setTopic,
    onConfirm,
    onClose,
}: ConfirmRequestModalProps) {
    return (
        <Modal onClose={onClose}>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Confirm Session Requests</h2>
            <p className="text-sm text-slate-500 mb-4">
                You are about to request to join {selectedSlots.length} session(s). An admin will review and assign you a buddy.
            </p>

            <div className="max-h-[200px] overflow-y-auto mb-4 flex flex-col gap-2">
                {selectedSlots.map(id => {
                    const slot = availabilities.find(a => a.id === id);
                    if (!slot) return null;
                    return (
                        <div key={id} className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg text-sm">
                            <Clock size={14} className="text-slate-400" />
                            <span>{slot.date} | {slot.start} - {slot.end}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                    Topic to talk with the buddy <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-vertical"
                    rows={3}
                    placeholder="E.g. I want to learn about React hooks"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                />
                <div className="text-xs text-slate-400">This field is required.</div>
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg cursor-pointer"
                    onClick={onConfirm}
                    disabled={!topic.trim()}
                >
                    Confirm Requests
                </button>
            </div>
        </Modal>
    );
}
