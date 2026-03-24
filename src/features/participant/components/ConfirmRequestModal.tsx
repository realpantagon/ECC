import { Clock } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Availability } from "../../../types/Availability";

interface ConfirmRequestModalProps {
    selectedSlots: string[];
    availabilities: Availability[];
    topics: Record<string, string>;
    setTopics: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmRequestModal({
    selectedSlots,
    availabilities,
    topics,
    setTopics,
    onConfirm,
    onClose,
}: ConfirmRequestModalProps) {
    const handleTopicChange = (slotId: string, text: string) => {
        setTopics(prev => ({ ...prev, [slotId]: text }));
    };

    const isConfirmDisabled = selectedSlots.some(id => !topics[id]?.trim());

    return (
        <Modal onClose={onClose}>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Confirm Session Requests</h2>
            <p className="text-sm text-slate-500 mb-4">
                You are about to request to join {selectedSlots.length} session(s). Please provide a topic for each session.
            </p>

            <div className="max-h-[350px] overflow-y-auto mb-4 flex flex-col gap-4 pr-1">
                {selectedSlots.map(id => {
                    const slot = availabilities.find(a => a.id === id);
                    if (!slot) return null;
                    return (
                        <div key={id} className="flex flex-col gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                <Clock size={14} className="text-slate-400" />
                                <span>{slot.date} | {slot.start} - {slot.end}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <textarea
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-vertical"
                                    rows={2}
                                    placeholder="E.g. I want to learn about React hooks"
                                    value={topics[id] || ""}
                                    onChange={(e) => handleTopicChange(id, e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg cursor-pointer transition-colors"
                    onClick={onConfirm}
                    disabled={isConfirmDisabled}
                >
                    Confirm Requests
                </button>
            </div>
        </Modal>
    );
}
