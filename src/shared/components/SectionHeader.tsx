import { Separator } from "../../components/ui/separator";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

/**
 * Consistent section heading with optional subtitle and right-aligned action slot.
 */
export function SectionHeader({ title, subtitle, children }: SectionHeaderProps) {
    return (
        <div className="mb-2">
            <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
            </div>
            <Separator className="mt-2 bg-blue-100/80" />
        </div>
    );
}
