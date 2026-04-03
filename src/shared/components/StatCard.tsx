import { Card, CardContent } from "../../components/ui/card";

interface StatCardProps {
    label: string;
    value: string | number;
    valueClass?: string;
}

/**
 * Minimal stat card with a label + large value. Used in participant & admin dashboards.
 */
export function StatCard({ label, value, valueClass = "text-slate-800" }: StatCardProps) {
    return (
        <Card className="flex-1 min-w-[80px] bg-white/85 border-blue-100 shadow-sm">
            <CardContent className="p-2">
                <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
            </CardContent>
        </Card>
    );
}
