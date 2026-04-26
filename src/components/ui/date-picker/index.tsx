"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export interface DatePickerProps {
    value: string; // ISO date string "YYYY-MM-DD"
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toIso(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function parseIso(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export function DatePicker({ value, onChange, label, placeholder = "Select date", min, max, disabled, className }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = parseIso(value);
    const minDate = parseIso(min ?? "");
    const maxDate = parseIso(max ?? "");

    const today = new Date();
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Sync view to selected value when it changes
    useEffect(() => {
        const d = parseIso(value);
        if (d) {
            setViewMonth(d.getMonth());
            setViewYear(d.getFullYear());
        }
    }, [value]);

    const prev = useCallback(() => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }, [viewMonth]);

    const next = useCallback(() => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }, [viewMonth]);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const isDisabled = (day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        if (minDate && d < minDate) return true;
        if (maxDate && d > maxDate) return true;
        return false;
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
    };

    const isToday = (day: number) => {
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
    };

    const handleSelect = (day: number) => {
        if (isDisabled(day)) return;
        onChange(toIso(new Date(viewYear, viewMonth, day)));
        setOpen(false);
    };

    const displayValue = selected
        ? selected.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";

    return (
        <div ref={ref} className={`relative ${className ?? ""}`}>
            {label && <label className="block text-sm font-semibold text-stone-700 mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-left transition-all outline-none ${
                    open ? "ring-2 ring-brand-500/20 border-brand-300" : "hover:border-stone-300"
                } ${disabled ? "opacity-50 cursor-not-allowed bg-stone-50" : "cursor-pointer"}`}
            >
                <Calendar size={16} className="text-stone-400 flex-shrink-0" />
                <span className={displayValue ? "text-stone-900" : "text-stone-400"}>{displayValue || placeholder}</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Month/Year header */}
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={prev} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-stone-900">{MONTHS[viewMonth]} {viewYear}</span>
                        <button type="button" onClick={next} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-stone-400 uppercase py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7">
                        {/* Empty cells for days before 1st */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`e-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dis = isDisabled(day);
                            const sel = isSelected(day);
                            const tod = isToday(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    disabled={dis}
                                    className={`w-9 h-9 mx-auto rounded-lg text-sm font-medium transition-all ${
                                        sel
                                            ? "bg-brand-800 text-white font-bold"
                                            : dis
                                                ? "text-stone-300 cursor-not-allowed"
                                                : tod
                                                    ? "bg-brand-50 text-brand-700 font-bold hover:bg-brand-100"
                                                    : "text-stone-700 hover:bg-stone-100"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today shortcut */}
                    <div className="mt-2 pt-2 border-t border-stone-100 flex justify-center">
                        <button
                            type="button"
                            onClick={() => handleSelect(today.getDate())}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
