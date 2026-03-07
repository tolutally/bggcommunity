import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Disable the hover shadow lift */
    flat?: boolean;
}

export function Card({ className, flat, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-2xl border border-stone-100 shadow-sm transition-all duration-300",
                !flat && "hover:shadow-md",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
