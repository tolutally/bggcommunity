"use client";

import { Users, Lock } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function AdminMentorsPage() {
    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10 relative min-h-[70vh]">
            {/* Blurred Background Content (decorative) */}
            <div className="pointer-events-none select-none blur-sm opacity-40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">Mentor Network</h1>
                        <p className="text-stone-500 mt-1">Manage applications, monitor capacity, and review performance.</p>
                    </div>
                </div>
                <div className="border-b border-stone-200 flex gap-8 mt-8">
                    <span className="pb-4 px-2 font-bold text-sm text-brand-700">Active Directory</span>
                    <span className="pb-4 px-2 font-bold text-sm text-stone-500">Applications</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 h-56">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-stone-200" />
                                <div>
                                    <div className="h-4 w-32 bg-stone-200 rounded mb-2" />
                                    <div className="h-3 w-24 bg-stone-100 rounded" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-stone-50 mb-4">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="text-center">
                                        <div className="h-5 w-8 bg-stone-200 rounded mx-auto mb-1" />
                                        <div className="h-2 w-12 bg-stone-100 rounded mx-auto" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <div className="h-6 w-20 bg-stone-100 rounded" />
                                <div className="h-6 w-16 bg-stone-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200 shadow-2xl p-10 text-center max-w-md mx-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Lock size={32} className="text-stone-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Mentor Module</h2>
                    <p className="text-stone-500 mb-6">
                        The mentor network feature is currently under development and will be available soon.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-xl text-sm font-bold text-stone-500">
                        <Users size={16} />
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
}
