"use client";

import { useState } from "react";
import { MessageCircle, X, Send, AlertTriangle, ChevronDown } from "lucide-react";

const MOCK_CONTACTS = [
    { id: 1, name: "Amara Okafor", avatar: "https://i.pravatar.cc/150?u=1", role: "member", lastMessage: "Hey, can you share that doc?", dmOpen: true },
    { id: 2, name: "Dr. Alisha Reid", avatar: "https://i.pravatar.cc/150?u=alisha", role: "mentor", lastMessage: "Thanks for the chat!", dmOpen: true },
    { id: 3, name: "Maya Patel", avatar: "https://i.pravatar.cc/150?u=maya", role: "mentor", lastMessage: "Let me know when you're free.", dmOpen: false },
];

export default function DMWidget({ userRole = 'member' }: { userRole?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const handleSelectContact = (contact: any) => {
        // Only block if a MEMBER tries to message a MENTOR with closed DMs
        // Mentors can always message other mentors
        const isMemberMessagingClosedMentor = userRole === 'member' && contact.role === 'mentor' && !contact.dmOpen;

        if (isMemberMessagingClosedMentor) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }
        setSelectedContact(contact);
    };

    const handleSend = () => {
        if (!message.trim()) return;
        // Mock send - just clear input
        setMessage("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Alert Toast */}
            {showAlert && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <span className="font-medium text-sm">This mentor's DMs are currently closed.</span>
                </div>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
                        {selectedContact ? (
                            <button onClick={() => setSelectedContact(null)} className="flex items-center gap-2 hover:opacity-80">
                                <ChevronDown size={18} className="rotate-90" />
                                <img src={selectedContact.avatar} className="w-8 h-8 rounded-full" />
                                <span className="font-bold">{selectedContact.name}</span>
                            </button>
                        ) : (
                            <span className="font-bold">Messages</span>
                        )}
                        <button onClick={() => { setIsOpen(false); setSelectedContact(null); }} className="hover:bg-white/10 p-1.5 rounded-lg">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    {selectedContact ? (
                        <div className="flex flex-col h-80">
                            {/* Mock Messages */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
                                <div className="flex gap-2">
                                    <img src={selectedContact.avatar} className="w-8 h-8 rounded-full" />
                                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm max-w-[80%]">
                                        <p className="text-sm text-stone-700">{selectedContact.lastMessage}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-purple-600 text-white p-3 rounded-xl shadow-sm max-w-[80%]">
                                        <p className="text-sm">Sounds great!</p>
                                    </div>
                                </div>
                            </div>
                            {/* Input */}
                            <div className="p-3 border-t border-stone-100 bg-white flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button onClick={handleSend} className="bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 transition-colors">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                            {MOCK_CONTACTS.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => handleSelectContact(contact)}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-colors text-left"
                                >
                                    <div className="relative">
                                        <img src={contact.avatar} className="w-10 h-10 rounded-full" />
                                        {contact.role === 'mentor' && !contact.dmOpen && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <X size={8} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-stone-900 text-sm truncate">{contact.name}</h4>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${contact.role === 'mentor' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-500'}`}>
                                                {contact.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500 truncate">{contact.lastMessage}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
                {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
            </button>
        </div>
    );
}
