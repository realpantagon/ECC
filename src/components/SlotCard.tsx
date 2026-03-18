import type { Availability } from "../types/Availability";
import type { User } from "../types/User";
import { Clock, Calendar, Users, Trash2 } from "lucide-react";
import "./SlotCard.css";

interface SlotCardProps {
    slot: Availability;
    buddy?: User;
    onJoin?: () => void;
    onDelete?: () => void;
    showBuddyName?: boolean;
    participantCount?: number;
    isJoined?: boolean;
    isSelected?: boolean;
}

export function SlotCard({
    slot,
    buddy,
    onJoin,
    onDelete,
    showBuddyName = false,
    participantCount = 0,
    isJoined = false,
    isSelected = false
}: SlotCardProps) {
    return (
        <div className={`slot-card glass-panel animate-fade-in ${slot.booked ? "slot-booked" : isSelected ? "slot-selected" : ""}`} style={{
            borderColor: isSelected && !slot.booked ? 'var(--primary-color)' : undefined,
            borderWidth: isSelected && !slot.booked ? '2px' : undefined
        }}>
            <div className="slot-header">
                <div className="slot-time-badge">
                    <Calendar size={14} />
                    <span>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                {slot.booked && <span className="status-badge booked">Booked</span>}
                {!slot.booked && isJoined && <span className="status-badge joined">Joined</span>}
            </div>

            <div className="slot-body">
                <div className="time-row">
                    <Clock size={16} className="icon-subtle" />
                    <span className="time-text">{slot.start} - {slot.end}</span>
                </div>
                {showBuddyName && buddy && (
                    <div className="detail-row">
                        <span className="label">Buddy:</span>
                        <span className="value">{buddy.name}</span>
                    </div>
                )}
                {(participantCount > 0 || showBuddyName) && (
                    <div className="detail-row">
                        <span className="label">Participants:</span>
                        <div className="participant-count">
                            <Users size={14} />
                            <span>{participantCount}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="slot-footer">
                {onJoin && (
                    <button
                        className="btn btn-primary w-full"
                        onClick={onJoin}
                        disabled={slot.booked || isJoined}
                    >
                        {slot.booked ? "Meeting Set" : isJoined ? "Request Pending" : isSelected ? "Selected (Click to remove)" : "Select Slot"}
                    </button>
                )}
                {onDelete && (
                    <button className="btn btn-danger icon-btn" onClick={onDelete} title="Delete Slot">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
