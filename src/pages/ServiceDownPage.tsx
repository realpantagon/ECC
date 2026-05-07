const NEW_URL = "https://ats-ecc.aware.co.th/";

export function ServiceDownPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <img src="/ecc.png" alt="ATS ECC" className="w-10 h-10 object-contain rounded" />
                    <span className="text-2xl font-bold text-red-600">ATS ECC</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Service Moved</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        This service has moved to a new address. Please click the button below to continue.
                    </p>
                </div>

                <a
                    href={NEW_URL}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 transition-colors text-sm"
                >
                    Go to new page →
                </a>

                <p className="text-xs text-muted-foreground">
                    <span className="font-mono break-all">{NEW_URL}</span>
                </p>
            </div>
        </div>
    );
}
