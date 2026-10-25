import React, { useState, useEffect } from 'react';
import { Mail, Check, Phone, User, Clock } from 'lucide-react';
import { api } from '../../api';
import type { ContactMessage } from '../../types';

export const MessagesTab: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    api
      .getAdminMessages()
      .then((res) => setMessages(res.messages || []))
      .catch((err) => console.error('Error fetching contact messages:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markMessageRead(id);
      fetchMessages();
    } catch (err: any) {
      alert(`Error marking read: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-600" />
            <span>Public Website Contact Inquiries</span>
          </h3>
          <p className="text-xs text-slate-500">
            Messages and inquiries submitted by patients or visitors via the public contact form.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No contact messages received yet.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 ${
                msg.isRead ? 'bg-white' : 'bg-sky-50/40'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{msg.name}</span>
                  <a
                    href={`tel:${msg.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-sm"
                  >
                    <Phone className="w-3 h-3 text-sky-600" />
                    <span>{msg.phone}</span>
                  </a>
                  {msg.email && (
                    <span className="text-xs text-slate-500">{msg.email}</span>
                  )}
                  {!msg.isRead && (
                    <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800">Subject: {msg.subject}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100">
                  {msg.message}
                </p>

                <p className="text-[11px] text-slate-400">
                  Received: {new Date(msg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>

              {!msg.isRead && (
                <button
                  onClick={() => handleMarkRead(msg.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark as Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
