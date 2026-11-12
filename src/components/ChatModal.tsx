import React, { useState } from 'react';
import { X, Send, MessageSquare, User, Clock } from 'lucide-react';
import { InternalChat, UserSession, Ustadz } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  chatList: InternalChat[];
  ustadzList: Ustadz[];
  onSendMessage: (msg: string, recipientId: string, recipientName: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  chatList,
  ustadzList,
  onSendMessage
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('all');
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let recName = 'Semua Ustadz & Pengurus';
    if (selectedRecipientId !== 'all') {
      const u = ustadzList.find(item => item.id === selectedRecipientId);
      if (u) recName = u.nama;
      else if (selectedRecipientId === 'admin') recName = 'Administrator TPQ';
    }

    onSendMessage(inputText.trim(), selectedRecipientId, recName);
    setInputText('');
  };

  // Filter messages relevant to this conversation
  const filteredChats = chatList.filter(chat => {
    if (selectedRecipientId === 'all') return true;
    return (
      (chat.recipientId === selectedRecipientId || chat.senderId === selectedRecipientId) ||
      chat.recipientId === 'all'
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full h-[600px] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm leading-none">Pesan Internal &amp; Koordinasi Ustadz</h3>
              <p className="text-[11px] text-slate-400 mt-1">Koordinasi data santri dan pelaporan nilai</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Recipient Selection */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium shrink-0">Tujuan Percakapan:</span>
          <select
            value={selectedRecipientId}
            onChange={(e) => setSelectedRecipientId(e.target.value)}
            className="form-select text-xs py-1 px-2.5 rounded border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 max-w-xs"
          >
            <option value="all">Kanal Umum (Semua Ustadz &amp; Admin)</option>
            {currentUser.role !== 'admin' && (
              <option value="admin">Administrator TPQ</option>
            )}
            {ustadzList.map(u => (
              <option key={u.id} value={u.id}>
                {u.nama} ({u.role === 'kepala' ? 'Kepala' : 'Ustadz'})
              </option>
            ))}
          </select>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {filteredChats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <span>Belum ada riwayat pesan di kanal ini.</span>
              <span className="text-[11px] text-slate-400 mt-1">Ketik pesan di bawah untuk memulai koordinasi.</span>
            </div>
          ) : (
            filteredChats.map(c => {
              const isMe = c.senderId === currentUser.id || (currentUser.role === 'admin' && c.senderRole === 'admin');
              return (
                <div
                  key={c.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                    <span className="font-semibold text-slate-700">{c.senderName}</span>
                    <span>·</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {c.timestamp}
                    </span>
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {c.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan koordinasi atau catatan nilai..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
