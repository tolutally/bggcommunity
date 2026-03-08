"use client";

import { useState, useMemo } from "react";
import { Briefcase, Plus, X, Trash2, Pencil, MapPin, Building2, Clock, ExternalLink, UserCircle, Users, Search, ArrowRight, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type ContactRole = "Member" | "Ecosystem Partner" | "Alumni" | "Staff";
type ReferralStatus = "New" | "Contacted" | "Closed";

interface InternalContact {
    name: string;
    role: ContactRole;
}

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: "Full-time" | "Part-time" | "Contract" | "Internship";
    workMode: "Remote" | "Hybrid" | "On-site";
    url: string;
    featured: boolean;
    postedAt: string;
    contact?: InternalContact;
}

interface ReferralRequest {
    id: number;
    memberName: string;
    memberEmail: string;
    memberAvatar: string;
    jobTitle: string;
    company: string;
    requestedAt: string;
    status: ReferralStatus;
    notes: string;
}

const CONTACT_ROLES: ContactRole[] = ["Member", "Ecosystem Partner", "Alumni", "Staff"];
const REFERRAL_STATUSES: ReferralStatus[] = ["New", "Contacted", "Closed"];

const INITIAL_REFERRALS: ReferralRequest[] = [
    { id: 1, memberName: "Amara Okafor", memberEmail: "amara.okafor@example.com", memberAvatar: "https://i.pravatar.cc/150?u=10", jobTitle: "Java Developer", company: "CGI", requestedAt: "2025-10-22", status: "New", notes: "" },
    { id: 2, memberName: "Chiamaka Nnadi", memberEmail: "chiamaka.nnadi@example.com", memberAvatar: "https://i.pravatar.cc/150?u=12", jobTitle: "Senior Product Manager", company: "Shopify", requestedAt: "2025-10-21", status: "Contacted", notes: "Connected with TechBridge partner" },
    { id: 3, memberName: "Efe Omoregie", memberEmail: "efe.omoregie@example.com", memberAvatar: "https://i.pravatar.cc/150?u=14", jobTitle: "Data Analyst Intern", company: "Meta", requestedAt: "2025-10-20", status: "New", notes: "" },
    { id: 4, memberName: "Fatima Diop", memberEmail: "fatima.diop@example.com", memberAvatar: "https://i.pravatar.cc/150?u=15", jobTitle: "Java Developer", company: "CGI", requestedAt: "2025-10-19", status: "Closed", notes: "Referral submitted by Amara" },
    { id: 5, memberName: "Imani Lewis", memberEmail: "imani.lewis@example.com", memberAvatar: "https://i.pravatar.cc/150?u=18", jobTitle: "Senior Product Manager", company: "Shopify", requestedAt: "2025-10-18", status: "Contacted", notes: "Awaiting reply from recruiter" },
    { id: 6, memberName: "Keisha Williams", memberEmail: "keisha.williams@example.com", memberAvatar: "https://i.pravatar.cc/150?u=20", jobTitle: "Frontend Engineer", company: "Stripe", requestedAt: "2025-10-17", status: "New", notes: "" },
];

const INITIAL_JOBS: Job[] = [
    { id: 1, title: "Java Developer", company: "CGI", location: "Toronto, ON", type: "Full-time", workMode: "Hybrid", url: "https://example.com/job/1", featured: true, postedAt: "2025-10-20", contact: { name: "Amara Okafor", role: "Member" } },
    { id: 2, title: "Senior Product Manager", company: "Shopify", location: "Remote, Canada", type: "Full-time", workMode: "Remote", url: "https://example.com/job/2", featured: true, postedAt: "2025-10-18", contact: { name: "TechBridge Inc.", role: "Ecosystem Partner" } },
    { id: 3, title: "UX Researcher", company: "Google", location: "New York, NY", type: "Full-time", workMode: "Hybrid", url: "https://example.com/job/3", featured: false, postedAt: "2025-10-15" },
    { id: 4, title: "Data Analyst Intern", company: "Meta", location: "Remote", type: "Internship", workMode: "Remote", url: "https://example.com/job/4", featured: true, postedAt: "2025-10-22", contact: { name: "Keisha Williams", role: "Alumni" } },
    { id: 5, title: "Frontend Engineer", company: "Stripe", location: "San Francisco, CA", type: "Contract", workMode: "On-site", url: "https://example.com/job/5", featured: false, postedAt: "2025-10-10" },
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
const WORK_MODES = ["Remote", "Hybrid", "On-site"] as const;

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
    const [modal, setModal] = useState<null | "create" | Job>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"jobs" | "referrals">("jobs");
    const [referrals, setReferrals] = useState<ReferralRequest[]>(INITIAL_REFERRALS);
    const [referralSearch, setReferralSearch] = useState("");
    const [referralFilter, setReferralFilter] = useState<"All" | ReferralStatus>("All");
    let nextId = jobs.length ? Math.max(...jobs.map(j => j.id)) + 1 : 1;

    const featured = jobs.filter(j => j.featured);
    const unfeatured = jobs.filter(j => !j.featured);

    const handleSave = (data: Omit<Job, "id" | "postedAt">) => {
        if (modal && typeof modal === "object" && "id" in modal) {
            setJobs(prev => prev.map(j => j.id === modal.id ? { ...j, ...data } : j));
        } else {
            setJobs(prev => [...prev, { ...data, id: nextId++, postedAt: new Date().toISOString().split("T")[0] }]);
        }
        setModal(null);
    };

    const handleDelete = () => {
        if (deleteId !== null) setJobs(prev => prev.filter(j => j.id !== deleteId));
        setDeleteId(null);
    };

    const toggleFeatured = (id: number) => {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, featured: !j.featured } : j));
    };

    const filteredReferrals = useMemo(() => {
        return referrals.filter(r => {
            const matchesSearch = r.memberName.toLowerCase().includes(referralSearch.toLowerCase()) ||
                r.jobTitle.toLowerCase().includes(referralSearch.toLowerCase()) ||
                r.company.toLowerCase().includes(referralSearch.toLowerCase());
            const matchesFilter = referralFilter === "All" || r.status === referralFilter;
            return matchesSearch && matchesFilter;
        });
    }, [referrals, referralSearch, referralFilter]);

    const updateReferralStatus = (id: number, status: ReferralStatus) => {
        setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const referralStats = useMemo(() => ({
        total: referrals.length,
        new: referrals.filter(r => r.status === "New").length,
        contacted: referrals.filter(r => r.status === "Contacted").length,
        closed: referrals.filter(r => r.status === "Closed").length,
    }), [referrals]);

    return (
        <ErrorBoundary>
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Featured Jobs</h1>
                    <p className="text-stone-500 mt-1">Manage job listings visible to community members.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-stone-100 rounded-xl p-1">
                        <button onClick={() => setActiveTab("jobs")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "jobs" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}>
                            <Briefcase size={16} /> Jobs
                        </button>
                        <button onClick={() => setActiveTab("referrals")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "referrals" ? "bg-white shadow text-stone-900" : "text-stone-500"}`}>
                            <Users size={16} /> Referrals
                            {referralStats.new > 0 && (
                                <span className="ml-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{referralStats.new}</span>
                            )}
                        </button>
                    </div>
                    {activeTab === "jobs" && (
                        <button onClick={() => setModal("create")} className="bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-800/10 w-fit">
                            <Plus size={18} /> Add Job
                        </button>
                    )}
                </div>
            </div>

            {/* Jobs Tab */}
            {activeTab === "jobs" && (<>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                    <p className="text-sm text-stone-500 font-medium">Total Listings</p>
                    <p className="text-3xl font-bold text-stone-900 mt-1">{jobs.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                    <p className="text-sm text-stone-500 font-medium">Featured</p>
                    <p className="text-3xl font-bold text-brand-700 mt-1">{featured.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-5">
                    <p className="text-sm text-stone-500 font-medium">Unlisted</p>
                    <p className="text-3xl font-bold text-stone-400 mt-1">{unfeatured.length}</p>
                </div>
            </div>

            {/* Featured Jobs */}
            {featured.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Featured ({featured.length})</h2>
                    <div className="space-y-3">
                        {featured.map(job => (
                            <JobRow key={job.id} job={job} onEdit={() => setModal(job)} onDelete={() => setDeleteId(job.id)} onToggle={() => toggleFeatured(job.id)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Unfeatured Jobs */}
            {unfeatured.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Unlisted ({unfeatured.length})</h2>
                    <div className="space-y-3">
                        {unfeatured.map(job => (
                            <JobRow key={job.id} job={job} onEdit={() => setModal(job)} onDelete={() => setDeleteId(job.id)} onToggle={() => toggleFeatured(job.id)} />
                        ))}
                    </div>
                </div>
            )}

            {jobs.length === 0 && (
                <EmptyState
                    icon={Briefcase}
                    heading="No jobs yet"
                    description="Add your first listing."
                    variant="plain"
                />
            )}
            </>)}

            {/* Referral Requests Tab */}
            {activeTab === "referrals" && (<>
                {/* Referral Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-100 p-5">
                        <p className="text-sm text-stone-500 font-medium">Total Requests</p>
                        <p className="text-3xl font-bold text-stone-900 mt-1">{referralStats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-rose-100 p-5">
                        <p className="text-sm text-rose-600 font-medium">New</p>
                        <p className="text-3xl font-bold text-rose-700 mt-1">{referralStats.new}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-amber-100 p-5">
                        <p className="text-sm text-amber-600 font-medium">Contacted</p>
                        <p className="text-3xl font-bold text-amber-700 mt-1">{referralStats.contacted}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-green-100 p-5">
                        <p className="text-sm text-green-600 font-medium">Closed</p>
                        <p className="text-3xl font-bold text-green-700 mt-1">{referralStats.closed}</p>
                    </div>
                </div>

                {/* Referral Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-stone-200">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search referral requests..."
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            value={referralSearch}
                            onChange={(e) => setReferralSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {(["All", ...REFERRAL_STATUSES] as const).map(s => (
                            <button key={s} onClick={() => setReferralFilter(s as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${referralFilter === s ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Referral Table */}
                {filteredReferrals.length > 0 ? (
                    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-stone-500">
                                <thead className="text-xs text-stone-400 uppercase bg-stone-50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Member</th>
                                        <th className="px-6 py-4 font-bold">Job</th>
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReferrals.map(req => (
                                        <tr key={req.id} className="bg-white border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarInitials name={req.memberName} src={req.memberAvatar} size="md" />
                                                    <div>
                                                        <div className="font-bold text-stone-900">{req.memberName}</div>
                                                        <div className="text-xs text-stone-500">{req.memberEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-stone-900">{req.jobTitle}</div>
                                                <div className="text-xs text-stone-500 flex items-center gap-1"><Building2 size={12} /> {req.company}</div>
                                            </td>
                                            <td className="px-6 py-4 text-stone-500 font-medium whitespace-nowrap">
                                                {new Date(req.requestedAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => updateReferralStatus(req.id, e.target.value as ReferralStatus)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-colors ${
                                                        req.status === "New" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                                        req.status === "Contacted" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                        "bg-green-50 text-green-700 border-green-200"
                                                    }`}
                                                >
                                                    {REFERRAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.notes ? (
                                                    <span className="text-stone-600 text-sm flex items-center gap-1.5">
                                                        <MessageSquare size={12} className="text-stone-400 flex-shrink-0" />
                                                        <span className="line-clamp-1">{req.notes}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-300 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        icon={Users}
                        heading="No referral requests"
                        description={referralSearch || referralFilter !== "All" ? "Try adjusting your search or filters." : "Members haven't requested any referrals yet."}
                    />
                )}
            </>)}

            {/* Create / Edit Modal */}
            {modal !== null && <JobFormModal initial={typeof modal === "object" ? modal : undefined} onClose={() => setModal(null)} onSave={handleSave} />}

            {/* Delete Confirm */}
            <ConfirmModal
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Job?"
                description="This listing will be permanently deleted."
                icon={Trash2}
            />
        </div>
        </ErrorBoundary>
    );
}

/* ── Job Row ── */
function JobRow({ job, onEdit, onDelete, onToggle }: { job: Job; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
    return (
        <div className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${job.featured ? "border-brand-200 hover:border-brand-300" : "border-stone-100 opacity-70 hover:opacity-100"}`}>
            {/* Company icon */}
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-lg flex-shrink-0">
                {job.company[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-stone-900">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                    <StatusBadge label={job.workMode} preset={job.workMode as any} variant="tag" />
                </div>
                {job.contact && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <UserCircle size={14} className="text-brand-600" />
                        <span className="text-xs font-semibold text-brand-700">{job.contact.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 font-bold border border-brand-100">{job.contact.role}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onToggle} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${job.featured ? "bg-brand-50 text-brand-700 hover:bg-brand-100" : "bg-stone-50 text-stone-500 hover:bg-stone-100"}`}>
                    {job.featured ? "★ Featured" : "☆ Feature"}
                </button>
                {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"><ExternalLink size={16} /></a>
                )}
                <button onClick={onEdit} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"><Pencil size={16} /></button>
                <button onClick={onDelete} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
        </div>
    );
}

/* ── Job Form Modal ── */
function JobFormModal({ initial, onClose, onSave }: { initial?: Job; onClose: () => void; onSave: (data: Omit<Job, "id" | "postedAt">) => void }) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [company, setCompany] = useState(initial?.company ?? "");
    const [location, setLocation] = useState(initial?.location ?? "");
    const [type, setType] = useState<Job["type"]>(initial?.type ?? "Full-time");
    const [workMode, setWorkMode] = useState<Job["workMode"]>(initial?.workMode ?? "Remote");
    const [url, setUrl] = useState(initial?.url ?? "");
    const [featured, setFeatured] = useState(initial?.featured ?? true);
    const [contactName, setContactName] = useState(initial?.contact?.name ?? "");
    const [contactRole, setContactRole] = useState<ContactRole>(initial?.contact?.role ?? "Member");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Required";
        if (!company.trim()) e.company = "Required";
        if (!location.trim()) e.location = "Required";
        if (url && !/^https?:\/\/.+/i.test(url)) e.url = "Enter a valid URL";
        setErrors(e);
        if (Object.keys(e).length === 0) onSave({ title: title.trim(), company: company.trim(), location: location.trim(), type, workMode, url: url.trim(), featured, contact: contactName.trim() ? { name: contactName.trim(), role: contactRole } : undefined });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-xl text-brand-700"><Briefcase size={20} /></div>
                        <h2 className="text-lg font-bold text-stone-900">{initial ? "Edit Job" : "Add Job"}</h2>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Job Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Product Manager" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.title ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Company</label>
                        <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Shopify" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.company ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, Canada" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 ${errors.location ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Job Type</label>
                        <div className="flex gap-2 flex-wrap">
                            {JOB_TYPES.map(t => (
                                <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${type === t ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Work Mode</label>
                        <div className="flex gap-2">
                            {WORK_MODES.map(m => (
                                <button key={m} type="button" onClick={() => setWorkMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${workMode === m ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Application Link <span className="text-stone-400 font-normal">(optional)</span></label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://careers.company.com/job/123" className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 font-mono ${errors.url ? "border-red-300 bg-red-50" : "border-stone-200"}`} />
                        {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
                    </div>
                    {/* Internal Contact */}
                    <div className="border-t border-stone-100 pt-4">
                        <label className="block text-sm font-semibold text-stone-700 mb-1">Internal Contact <span className="text-stone-400 font-normal">(optional — who shared this?)</span></label>
                        <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Amara Okafor" className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 mb-2" />
                        {contactName.trim() && (
                            <div>
                                <label className="block text-xs font-semibold text-stone-500 mb-1">Contact Role</label>
                                <div className="flex gap-2 flex-wrap">
                                    {CONTACT_ROLES.map(r => (
                                        <button key={r} type="button" onClick={() => setContactRole(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${contactRole === r ? "bg-brand-800 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>{r}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <button type="button" onClick={() => setFeatured(!featured)} className={`w-10 h-6 rounded-full transition-colors relative ${featured ? "bg-brand-600" : "bg-stone-300"}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${featured ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                        <span className="text-sm font-semibold text-stone-700">Feature this job</span>
                    </label>
                </div>
                <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-800 hover:bg-brand-700 transition-colors">{initial ? "Save Changes" : "Add Job"}</button>
                </div>
            </div>
        </div>
    );
}
