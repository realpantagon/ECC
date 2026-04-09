import { Plus, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

interface AvailabilityFormProps {
    date: string;
    setDate: (v: string) => void;
    start: string;
    onStartChange: (v: string) => void;
    end: string;
    onAddSubmit: (e: React.FormEvent) => void;
}

function handleOpenPickerOnClick(e: React.MouseEvent<HTMLInputElement>) {
    const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
    if (typeof input.showPicker === "function") {
        try {
            input.showPicker();
        } catch {
            // Some browsers can block showPicker; focused input still allows manual selection.
        }
    }
}

export function AvailabilityForm({ date, setDate, start, onStartChange, end, onAddSubmit }: AvailabilityFormProps) {
    return (
        <Card className="bg-white/90 border-blue-100 shadow-md shadow-blue-100/30">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <CalendarPlus size={18} className="text-blue-600" />
                    <div>
                        <CardTitle className="text-base text-slate-800">Add Availability</CardTitle>
                        <CardDescription className="text-xs">Schedule your weekly mentoring slots (20 min each)</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={onAddSubmit}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                    <div className="w-full sm:flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            onClick={handleOpenPickerOnClick}
                            required
                            className="bg-white w-full"
                        />
                    </div>

                    <div className="w-full sm:flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Start Time</label>
                        <Input
                            type="time"
                            value={start}
                            onChange={e => onStartChange(e.target.value)}
                            onClick={handleOpenPickerOnClick}
                            required
                            className="bg-white w-full"
                        />
                    </div>

                    <div className="w-full sm:flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">End Time</label>
                        <Input
                            type="time"
                            value={end}
                            disabled
                            className="bg-slate-50 opacity-60 cursor-not-allowed w-full"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
                    >
                        <Plus size={15} />
                        Add Slot
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
