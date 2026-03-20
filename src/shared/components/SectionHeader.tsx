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
        <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
            <div>
                <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
        </div>
    );
}
