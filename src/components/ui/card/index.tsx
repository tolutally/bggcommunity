import { ArrowRight, Briefcase, Store, Heart } from "lucide-react";
import React from 'react';

// Using a simplified version for the prototype to keep things fast
export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
            {children}
        </div>
    );
}
