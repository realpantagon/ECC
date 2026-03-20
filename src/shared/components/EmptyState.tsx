interface EmptyStateProps {
    message: string;
}

/**
 * Centered placeholder for empty lists/tables.
 */
export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 py-12 text-center text-slate-500 text-sm">
            {message}
        </div>
    );
}
