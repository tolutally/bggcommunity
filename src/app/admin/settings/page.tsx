"use client";

import { useUser } from "@/context/UserContext";
import { Shield, Server, Plug, Activity, AlertTriangle, Save, RefreshCw, Database } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
    const { user } = useUser();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Platform Settings</h1>
                <p className="text-stone-500 mt-1">Configure global application settings and integrations.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Config Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Platform Configuration */}
                    <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-stone-100 flex items-center gap-2">
                            <Server size={20} className="text-purple-600" />
                            <h2 className="font-bold text-lg text-stone-900">Platform Configuration</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Community Name</label>
                                    <input type="text" defaultValue="Black Girls Gather" className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Support Email</label>
                                    <input type="email" defaultValue="help@blackgirlsgather.com" className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-stone-100">
                                <ToggleSetting
                                    label="Maintenance Mode"
                                    desc="Only admins can access the platform."
                                    checked={maintenanceMode}
                                    onChange={setMaintenanceMode}
                                    danger
                                />
                                <ToggleSetting
                                    label="Allow New Registrations"
                                    desc="New users can sign up via the public landing page."
                                    checked={allowRegistrations}
                                    onChange={setAllowRegistrations}
                                />
                                <ToggleSetting
                                    label="Force 2FA for Mentors"
                                    desc="Require Two-Factor Authentication for all mentor accounts."
                                    checked={true}
                                    onChange={() => { }}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
                            <button className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-stone-800 flex items-center gap-2">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </section>

                    {/* Integrations Hub */}
                    <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-stone-100 flex items-center gap-2">
                            <Plug size={20} className="text-blue-600" />
                            <h2 className="font-bold text-lg text-stone-900">Integrations Hub</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <IntegrationCard
                                name="Slack"
                                status="Connected"
                                desc="Sync community announcements and alerts."
                                icon="https://cdn.icon-icons.com/icons2/2699/PNG/512/slack_logo_icon_169766.png"
                            />
                            <IntegrationCard
                                name="Zoom"
                                status="Connected"
                                desc="Auto-generate links for events and sessions."
                                icon="https://cdn.icon-icons.com/icons2/2699/PNG/512/zoom_logo_icon_170003.png"
                            />
                            <IntegrationCard
                                name="Stripe"
                                status="Disconnected"
                                desc="Process payments for premium memberships."
                                icon="https://cdn.icon-icons.com/icons2/2699/PNG/512/stripe_logo_icon_169963.png"
                            />
                            <IntegrationCard
                                name="Discord"
                                status="Disconnected"
                                desc="Alternative community chat sync."
                                icon="https://cdn.icon-icons.com/icons2/2699/PNG/512/discord_logo_icon_170131.png"
                            />
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Audit Log */}
                    <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-stone-100 flex items-center gap-2">
                            <Shield size={20} className="text-green-600" />
                            <h2 className="font-bold text-lg text-stone-900">Security Audit</h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            <AuditRow action="User Banned" target="spambot_99" user="Admin" time="2m ago" />
                            <AuditRow action="Settings Changed" target="Platform Config" user="Admin" time="1h ago" />
                            <AuditRow action="Integration Added" target="Slack" user="System" time="5h ago" />
                            <AuditRow action="Report Resolved" target="R-1022" user="Admin" time="1d ago" />
                        </div>
                        <div className="p-4 bg-stone-50 text-center">
                            <button className="text-stone-500 font-bold text-sm hover:text-stone-900">View Full Log</button>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
                        <div className="p-6 border-b border-red-100 flex items-center gap-2 text-red-800">
                            <AlertTriangle size={20} />
                            <h2 className="font-bold text-lg">Danger Zone</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-bold text-stone-900 text-sm">Reset Test Data</h3>
                                <p className="text-xs text-stone-500 mb-2">Clears all mock posts, comments, and reports. Users remain.</p>
                                <button className="w-full bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-2">
                                    <RefreshCw size={14} /> Reset Data
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900 text-sm">Export User Data</h3>
                                <p className="text-xs text-stone-500 mb-2">Download a full JSON dump of the user database.</p>
                                <button className="w-full bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-2">
                                    <Database size={14} /> Export JSON
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ToggleSetting({ label, desc, checked, onChange, danger }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
            <div>
                <span className={`font-bold block text-sm ${danger ? 'text-red-700' : 'text-stone-800'}`}>{label}</span>
                <span className="text-xs text-stone-500">{desc}</span>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? (danger ? 'bg-red-500' : 'bg-purple-600') : 'bg-stone-200'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
        </div>
    )
}

function IntegrationCard({ name, status, desc, icon }: any) {
    const isConnected = status === "Connected";
    return (
        <div className="border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-purple-300 transition-colors group">
            <img src={icon} className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-stone-900">{name}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isConnected ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{status}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{desc}</p>
            </div>
        </div>
    )
}

function AuditRow({ action, target, user, time }: any) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-sm">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                <div>
                    <span className="font-bold text-stone-800">{action}</span> <span className="text-stone-500">on {target}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-stone-900 font-semibold">{user}</div>
                <div className="text-xs text-stone-400">{time}</div>
            </div>
        </div>
    )
}
