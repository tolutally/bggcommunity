"use client";

import { useUser } from "@/context/UserContext";
import { Shield, Server, Plug, AlertTriangle, Save, RefreshCw, Database, Check, X, Eye, EyeOff } from "lucide-react";
import { useState, useCallback } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface AuditEntry { action: string; target: string; user: string; time: string; }
interface Integration { name: string; status: "Connected" | "Disconnected"; desc: string; icon: string; }

const INITIAL_INTEGRATIONS: Integration[] = [
    { name: "Slack", status: "Connected", desc: "Sync community announcements and alerts.", icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/slack_logo_icon_169766.png" },
    { name: "Zoom", status: "Connected", desc: "Auto-generate links for events and sessions.", icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/zoom_logo_icon_170003.png" },
    { name: "Stripe", status: "Disconnected", desc: "Process payments for premium memberships.", icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/stripe_logo_icon_169963.png" },
    { name: "Discord", status: "Disconnected", desc: "Alternative community chat sync.", icon: "https://cdn.icon-icons.com/icons2/2699/PNG/512/discord_logo_icon_170131.png" },
];

const INITIAL_AUDIT: AuditEntry[] = [
    { action: "User Banned", target: "spambot_99", user: "Admin", time: "2m ago" },
    { action: "Settings Changed", target: "Platform Config", user: "Admin", time: "1h ago" },
    { action: "Integration Added", target: "Slack", user: "System", time: "5h ago" },
    { action: "Report Resolved", target: "R-1022", user: "Admin", time: "1d ago" },
];

export default function AdminSettingsPage() {
    const { user } = useUser();

    // Config state
    const [communityName, setCommunityName] = useState("Black Girls Gather");
    const [supportEmail, setSupportEmail] = useState("help@blackgirlsgather.com");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistrations, setAllowRegistrations] = useState(true);

    // Persistence feedback
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [dirty, setDirty] = useState(false);

    // Integrations
    const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);

    // Audit
    const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT);
    const [showFullLog, setShowFullLog] = useState(false);

    // Danger zone
    const [resetConfirm, setResetConfirm] = useState(false);

    const addAudit = useCallback((action: string, target: string) => {
        setAuditLog(prev => [{ action, target, user: user.name.split(" ")[0], time: "Just now" }, ...prev]);
    }, [user.name]);

    const markDirty = () => { setDirty(true); setSaveStatus("idle"); };

    const handleSave = () => {
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("saved");
            setDirty(false);
            addAudit("Settings Changed", "Platform Config");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 600);
    };

    const toggleIntegration = (name: string) => {
        setIntegrations(prev => prev.map(i => {
            if (i.name !== name) return i;
            const newStatus = i.status === "Connected" ? "Disconnected" : "Connected";
            addAudit(newStatus === "Connected" ? "Integration Added" : "Integration Removed", name);
            return { ...i, status: newStatus };
        }));
    };

    const handleResetData = () => {
        addAudit("Data Reset", "All mock data");
        setResetConfirm(false);
    };

    const handleExportJSON = () => {
        const data = { communityName, supportEmail, maintenanceMode, allowRegistrations, integrations, auditLog };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "bgg-settings-export.json"; a.click();
        URL.revokeObjectURL(url);
        addAudit("Data Exported", "JSON Dump");
    };

    return (
        <ErrorBoundary>
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
                            <Server size={20} className="text-brand-600" />
                            <h2 className="font-bold text-lg text-stone-900">Platform Configuration</h2>
                            {dirty && <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Unsaved Changes</span>}
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Community Name</label>
                                    <input type="text" value={communityName} onChange={e => { setCommunityName(e.target.value); markDirty(); }} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Support Email</label>
                                    <input type="email" value={supportEmail} onChange={e => { setSupportEmail(e.target.value); markDirty(); }} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-medium" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-stone-100">
                                <ToggleSetting label="Maintenance Mode" desc="Only admins can access the platform." checked={maintenanceMode} onChange={(v: boolean) => { setMaintenanceMode(v); markDirty(); addAudit(v ? "Enabled" : "Disabled", "Maintenance Mode"); }} danger />
                                <ToggleSetting label="Allow New Registrations" desc="New users can sign up via the public landing page." checked={allowRegistrations} onChange={(v: boolean) => { setAllowRegistrations(v); markDirty(); addAudit(v ? "Enabled" : "Disabled", "Allow Registrations"); }} />
                                <div className="relative">
                                    <div className="opacity-40 blur-[1px] pointer-events-none">
                                        <ToggleSetting label="Force 2FA for Mentors" desc="Require Two-Factor Authentication for all mentor accounts." checked={false} onChange={() => {}} />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-end pr-4">
                                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Coming Soon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
                            {saveStatus === "saved" && <span className="flex items-center gap-1 text-green-600 text-sm font-bold"><Check size={16} /> Saved!</span>}
                            <button onClick={handleSave} disabled={!dirty && saveStatus !== "idle"} className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${dirty ? "bg-stone-900 text-white hover:bg-stone-800" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
                                {saveStatus === "saving" ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
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
                            {integrations.map(integ => (
                                <IntegrationCard key={integ.name} integration={integ} onToggle={() => toggleIntegration(integ.name)} />
                            ))}
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
                            <span className="ml-auto text-xs font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{auditLog.length} entries</span>
                        </div>
                        <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                            {(showFullLog ? auditLog : auditLog.slice(0, 4)).map((entry, i) => (
                                <AuditRow key={i} action={entry.action} target={entry.target} user={entry.user} time={entry.time} isNew={entry.time === "Just now"} />
                            ))}
                        </div>
                        <div className="p-4 bg-stone-50 text-center border-t border-stone-100">
                            <button onClick={() => setShowFullLog(!showFullLog)} className="text-stone-500 font-bold text-sm hover:text-stone-900 flex items-center gap-1 mx-auto">
                                {showFullLog ? <><EyeOff size={14} /> Show Less</> : <><Eye size={14} /> View Full Log ({auditLog.length})</>}
                            </button>
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
                                <button onClick={() => setResetConfirm(true)} className="w-full bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-2"><RefreshCw size={14} /> Reset Data</button>
                                <ConfirmModal
                                    open={resetConfirm}
                                    onClose={() => setResetConfirm(false)}
                                    onConfirm={handleResetData}
                                    title="Reset Test Data?"
                                    description="This will clear all mock posts, comments, and reports. Users will remain."
                                    confirmLabel="Reset"
                                    icon={RefreshCw}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900 text-sm">Export User Data</h3>
                                <p className="text-xs text-stone-500 mb-2">Download a full JSON dump of the user database.</p>
                                <button onClick={handleExportJSON} className="w-full bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center gap-2"><Database size={14} /> Export JSON</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
}

function ToggleSetting({ label, desc, checked, onChange, danger }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
            <div>
                <span className={`font-bold block text-sm ${danger ? "text-red-700" : "text-stone-800"}`}>{label}</span>
                <span className="text-xs text-stone-500">{desc}</span>
            </div>
            <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? (danger ? "bg-red-500" : "bg-brand-600") : "bg-stone-200"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}></div>
            </button>
        </div>
    );
}

function IntegrationCard({ integration, onToggle }: { integration: Integration; onToggle: () => void }) {
    const isConnected = integration.status === "Connected";
    return (
        <div className="border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-brand-300 transition-colors group">
            <img src={integration.icon} alt={integration.name} className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-stone-900">{integration.name}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isConnected ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{integration.status}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">{integration.desc}</p>
                <button onClick={onToggle} className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isConnected ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                    {isConnected ? "Disconnect" : "Connect"}
                </button>
            </div>
        </div>
    );
}

function AuditRow({ action, target, user, time, isNew }: { action: string; target: string; user: string; time: string; isNew?: boolean }) {
    return (
        <div className={`p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-sm ${isNew ? "bg-green-50/50" : ""}`}>
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isNew ? "bg-green-500 animate-pulse" : "bg-stone-300"}`}></div>
                <div>
                    <span className="font-bold text-stone-800">{action}</span> <span className="text-stone-500">on {target}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-stone-900 font-semibold">{user}</div>
                <div className="text-xs text-stone-400">{time}</div>
            </div>
        </div>
    );
}
