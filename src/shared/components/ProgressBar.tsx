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
        <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
            <div
                className={`h-full ${colorClass} rounded-full transition-all`}
                style={{ width: `${clamped}%` }}
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    );
}
