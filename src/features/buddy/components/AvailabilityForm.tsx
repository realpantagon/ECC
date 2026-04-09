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
                <form onSubmit={onAddSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="bg-white"
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Start Time</label>
                        <Input
                            type="time"
                            value={start}
                            onChange={e => onStartChange(e.target.value)}
                            required
                            className="bg-white"
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">End Time</label>
                        <Input
                            type="time"
                            value={end}
                            disabled
                            className="bg-slate-50 opacity-60 cursor-not-allowed"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 w-full sm:w-auto cursor-pointer"
                    >
                        <Plus size={15} /> Add Slot
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
