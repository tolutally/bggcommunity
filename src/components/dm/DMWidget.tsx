"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";

const MOCK_CONTACTS = [
    { id: 1, name: "Amara Okafor", avatar: "https://i.pravatar.cc/150?u=1", role: "member", lastMessage: "Hey, can you share that doc?", dmOpen: true },
    { id: 4, name: "Brianna Sterling", avatar: "https://i.pravatar.cc/150?u=4", role: "member", lastMessage: "See you at the event!", dmOpen: true },
    { id: 5, name: "Chiamaka Nnadi", avatar: "https://i.pravatar.cc/150?u=5", role: "member", lastMessage: "Thanks for the feedback!", dmOpen: true },
];

type Contact = (typeof MOCK_CONTACTS)[number];

export default function DMWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [message, setMessage] = useState("");

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
    };

    const handleSend = () => {
        if (!message.trim()) return;
        setMessage("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Panel */}
            {isOpen && (
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-brand-800 text-white p-4 flex items-center justify-between">
                        {selectedContact ? (
                            <button onClick={() => setSelectedContact(null)} className="flex items-center gap-2 hover:opacity-80">
                                <ChevronDown size={18} className="rotate-90" />
                                <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 rounded-full" />
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
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
                                <div className="flex gap-2">
                                    <img src={selectedContact.avatar} alt={selectedContact.name} className="w-8 h-8 rounded-full" />
                                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm max-w-[80%]">
                                        <p className="text-sm text-stone-700">{selectedContact.lastMessage}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-brand-700 text-white p-3 rounded-xl shadow-sm max-w-[80%]">
                                        <p className="text-sm">Sounds great!</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 border-t border-stone-100 bg-white flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button onClick={handleSend} className="bg-brand-700 text-white p-2.5 rounded-xl hover:bg-brand-800 transition-colors">
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
                                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-stone-900 text-sm truncate">{contact.name}</h4>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-stone-100 text-stone-500">
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
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-brand-700 hover:bg-brand-800'}`}
            >
                {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
            </button>
        </div>
    );
}
