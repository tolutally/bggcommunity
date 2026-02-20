"use client";

import { useUser } from "@/context/UserContext";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function MemberSettingsPage() {
    const { user } = useUser();

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-stone-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="p-8 border-b border-stone-100 flex items-center gap-6">
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover" alt="Avatar" />
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">{user.name}</h2>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wide">Member Account</span>
                        <div className="mt-2">
                            <button className="text-brand-700 font-semibold text-sm hover:underline">Change Avatar</button>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" value={user.name} />
                        <InputGroup label="Email Address" value="nia@example.com" />
                        <InputGroup label="Job Title" value="Product Designer" />
                        <InputGroup label="Company" value="Tech Corp" />
                    </div>
                </div>
                <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
                    <button className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-stone-800">Save Changes</button>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-8">
                <h3 className="font-bold text-lg mb-4">Notifications</h3>
                <div className="space-y-4">
                    <ToggleRow label="Email digest of weekly activity" checked />
                    <ToggleRow label="New session announcements" checked />
                    <ToggleRow label="Comments on my posts" checked />
                </div>
            </div>
        </div>
    )
}

function InputGroup({ label, value }: any) {
    return (
        <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">{label}</label>
            <input type="text" defaultValue={value} className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
    )
}

function ToggleRow({ label, checked, description }: any) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <span className="text-stone-700 font-medium block">{label}</span>
                {description && <span className="text-xs text-stone-500">{description}</span>}
            </div>

            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-brand-600' : 'bg-stone-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
        </div>
    )
}
