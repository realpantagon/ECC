import { Progress, ProgressIndicator, ProgressTrack } from "../../components/ui/progress";

interface ProgressBarProps {
    /** Value from 0 to 100. */
    value: number;
    colorClass?: string;
    height?: string;
}

/**
 * Horizontal progress bar. colorClass defaults to blue-500.
 */
export function ProgressBar({
    value,
    colorClass = "bg-blue-500",
    height = "h-2",
}: ProgressBarProps) {
    const clamped = Math.min(Math.max(value, 0), 100);

    return (
        <Progress value={clamped} className="gap-0" aria-label="Progress">
            <ProgressTrack className={`${height} bg-slate-100`}>
                <ProgressIndicator className={colorClass} />
            </ProgressTrack>
        </Progress>
    );
}
