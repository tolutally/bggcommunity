"use client";

import { useState } from "react";

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                    <div className="whitespace-nowrap rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg">
                        {label}
                    </div>
                    <div className="mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stone-900" />
                </div>
            )}
        </div>
    );
}
