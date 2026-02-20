"use client";

import { useUser } from "@/context/UserContext";
import { MessageSquare, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function MentorDashboard() {
    const { user } = useUser();
    const [dmOpen, setDmOpen] = useState(true);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto"
        >
            {/* Welcome Section */}
            <motion.div variants={item}>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                    Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-lg text-stone-500 mt-2">
                    You have upcoming sessions to prepare for.
                </p>
            </motion.div>

            {/* Dashboard Content */}
            <motion.div variants={item}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-stone-900 mb-4">Sessions to Host</h2>
                            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm border-l-4 border-l-brand-600">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-2">Upcoming - Starts in 2h</span>
                                        <h3 className="text-lg font-bold text-stone-900">Product Strategy Workshop</h3>
                                        <p className="text-stone-500">Cohort Alpha • 45 Attending</p>
                                    </div>
                                    <button className="bg-brand-800 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-700">
                                        Launch Session
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-stone-900 mb-4">Booking Requests</h2>
                            <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
                                <BookingRequestItem name="Maya Angelou" topic="Career Transition" time="Tue, 10:00 AM" />
                                <BookingRequestItem name="Zora Neale" topic="Portfolio Review" time="Wed, 2:30 PM" />
                            </div>
                        </section>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-stone-200 p-6">
                            <h3 className="font-bold text-stone-900 mb-6">Mentor Stats</h3>
                            <div className="space-y-6">
                                <StatRow label="Mentoring Hours" value="12.5" trend="+2.5" />
                                <StatRow label="Sessions Hosted" value="8" trend="0" />
                                <StatRow label="Avg. Rating" value="4.9" trend="+0.1" />
                            </div>
                        </div>

                        {/* DM Toggle Banner - Below Stats */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={20} className={dmOpen ? 'text-green-600' : 'text-stone-400'} />
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Direct Messages</h4>
                                    <p className="text-xs text-stone-500">{dmOpen ? 'Members can send you messages.' : 'Your DMs are closed.'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDmOpen(!dmOpen)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${dmOpen ? 'bg-green-500' : 'bg-stone-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${dmOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function BookingRequestItem({ name, topic, time }: any) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    {name[0]}
                </div>
                <div>
                    <h4 className="font-bold text-stone-900 text-sm">{name}</h4>
                    <p className="text-xs text-stone-500">{topic} • {time}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button className="p-2 text-stone-400 hover:text-red-600 bg-stone-100 hover:bg-red-50 rounded-lg transition-all"><X size={16} /></button>
                <button className="p-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all"><Check size={16} /></button>
            </div>
        </div>
    )
}

function StatRow({ label, value, trend }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-stone-600">{label}</span>
            <div className="text-right">
                <div className="font-bold text-stone-900">{value}</div>
                <div className="text-xs text-green-600">{trend} this week</div>
            </div>
        </div>
    )
}
