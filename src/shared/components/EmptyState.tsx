import { Alert, AlertDescription } from "../../components/ui/alert";

interface EmptyStateProps {
    message: string;
}

/**
 * Centered placeholder for empty lists/tables.
 */
export function EmptyState({ message }: EmptyStateProps) {
    return (
        <Alert className="bg-white/85 border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 py-12">
            <AlertDescription className="text-center text-slate-500 text-sm">{message}</AlertDescription>
        </Alert>
    );
}
