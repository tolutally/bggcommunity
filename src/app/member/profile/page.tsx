"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import {
    MapPin,
    Building2,
    Linkedin,
    Twitter,
    Globe,
    Mail,
    Edit2,
    Save,
    Camera,
    User,
    Lock,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

export default function MemberProfilePage() {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [isOpenToWork, setIsOpenToWork] = useState(false);

    // Mock initial state based on user + extra fields
    const [formData, setFormData] = useState({
        occupation: "Product Designer",
        industry: "EdTech",
        location: "Lagos, Nigeria",
        bio: "Passionate about creating accessible and inclusive user experiences. Currently focusing on educational technology solutions for emerging markets.",
        website: "https://nia-designs.com",
        linkedin: "nia-adebayo",
        twitter: "niadesigns",
        company: "BGG Tech"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header / Banner */}
            <div className="relative">
                {/* Banner Image */}
                <div className="h-48 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 to-indigo-900 relative">
                    <img
                        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                        alt="Profile Cover"
                    />
                    {isEditing && (
                        <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-xl backdrop-blur-md transition-colors hover:scale-105 active:scale-95">
                            <Camera size={20} />
                        </button>
                    )}
                </div>

                {/* Profile Info Card */}
                <div className="relative -mt-20 px-4 md:px-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row gap-6 md:items-start">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0 -mt-20 md:-mt-24">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-white shadow-lg">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover bg-stone-100"
                                />
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-2 right-2 bg-purple-900 text-white p-2 rounded-full border-4 border-white shadow-sm hover:bg-purple-800 transition-colors hover:scale-105 active:scale-95">
                                    <Camera size={16} />
                                </button>
                            )}
                            {/* Open To Work Badge (Visible when NOT editing if true) */}
                            {!isEditing && isOpenToWork && (
                                <div className="absolute -bottom-2 md:-bottom-3 inset-x-0 flex justify-center">
                                    <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-md">
                                        #OpenToWork
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info & Actions */}
                        <div className="flex-1 space-y-4 pt-2">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold text-stone-900">{user.name}</h1>
                                        {/* Status Toggle in Header */}
                                        <div
                                            onClick={() => setIsOpenToWork(!isOpenToWork)}
                                            className={`cursor-pointer group flex items-center gap-2 px-3 py-1 rounded-full border transition-all select-none ${isOpenToWork ? 'bg-green-50 border-green-200 text-green-700' : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full transition-colors ${isOpenToWork ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                                            <span className="text-xs font-bold whitespace-nowrap">
                                                {isOpenToWork ? 'Open to Work' : 'Not Open'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 text-stone-500 font-medium flex-wrap">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleChange}
                                                placeholder="Occupation"
                                                className="px-3 py-1 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-stone-400"
                                            />
                                        ) : (
                                            <span className="text-purple-700 font-semibold">{formData.occupation}</span>
                                        )}
                                        <span className="text-stone-300 hidden md:inline">•</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                placeholder="Company"
                                                className="px-3 py-1 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-stone-400"
                                            />
                                        ) : (
                                            <span>{formData.company}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-stone-500 flex-wrap">
                                        <div className="flex items-center gap-1.5 min-w-[120px]">
                                            <MapPin size={16} className="text-stone-400" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className="px-2 py-1 border border-stone-200 rounded-lg text-xs bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none w-full"
                                                />
                                            ) : (
                                                formData.location
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-[120px]">
                                            <Building2 size={16} className="text-stone-400" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleChange}
                                                    className="px-2 py-1 border border-stone-200 rounded-lg text-xs bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none w-full"
                                                />
                                            ) : (
                                                formData.industry
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${isEditing ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white border text-stone-700 hover:border-purple-200 hover:text-purple-700 hover:bg-purple-50'}`}
                                >
                                    {isEditing ? (
                                        <> <Save size={18} /> Save Changes </>
                                    ) : (
                                        <> <Edit2 size={18} /> Edit Profile </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: About & Bio */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-stone-900">About</h2>
                        </div>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-stone-700 leading-relaxed resize-none transition-all placeholder:text-stone-400"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-stone-600 leading-relaxed">
                                {formData.bio}
                            </p>
                        )}
                    </section>

                    {/* Account Details (Premium Redesign) */}
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-stone-900">Account Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="w-full px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-xl text-stone-500 font-medium flex items-center gap-3 transition-colors group-hover:bg-stone-100">
                                        <User size={18} className="text-stone-400" />
                                        {user.name}
                                    </div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 group-hover:text-stone-400 transition-colors" title="This field cannot be edited">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="w-full px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-xl text-stone-500 font-medium flex items-center gap-3 transition-colors group-hover:bg-stone-100">
                                        <Mail size={18} className="text-stone-400" />
                                        nia@example.com
                                    </div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 group-hover:text-stone-400 transition-colors" title="This field cannot be edited">
                                        <Lock size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-stone-400 mt-4 ml-1">
                            * To change your account details, please contact support or visit account settings.
                        </p>
                    </section>
                </div>

                {/* Right Column: Socials */}
                <div className="space-y-8">
                    <section className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm h-full flex flex-col">
                        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <Globe size={20} className="text-purple-600" /> Online Presence
                        </h2>

                        <div className="space-y-6 flex-1">
                            {/* Website */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                                    Website / Portfolio
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-sm transition-all"
                                        placeholder="https://"
                                    />
                                ) : (
                                    <a href={formData.website} target="_blank" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-purple-50 border border-stone-100 hover:border-purple-200 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-purple-700">{formData.website.replace('https://', '')}</span>
                                        <Globe size={16} className="text-stone-400 group-hover:text-purple-400" />
                                    </a>
                                )}
                            </div>

                            {/* LinkedIn */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                                    LinkedIn
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-sm transition-all"
                                        placeholder="Username"
                                    />
                                ) : (
                                    <a href="#" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-blue-50 border border-stone-100 hover:border-blue-200 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-blue-700">/{formData.linkedin}</span>
                                        <Linkedin size={16} className="text-stone-400 group-hover:text-blue-400" />
                                    </a>
                                )}
                            </div>

                            {/* Twitter */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                                    Twitter / X
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-sm transition-all"
                                        placeholder="Username"
                                    />
                                ) : (
                                    <a href="#" className="flex items-center justify-between w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 border border-stone-100 hover:border-stone-300 rounded-xl transition-all group">
                                        <span className="text-stone-700 font-medium truncate group-hover:text-stone-900">@{formData.twitter}</span>
                                        <Twitter size={16} className="text-stone-400 group-hover:text-stone-900" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
