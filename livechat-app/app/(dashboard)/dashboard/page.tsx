"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, Search, Loader2, Sparkles, 
  Trash2, X, MessageSquare, Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [friends, setFriends] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const filteredFriends = useMemo(() => {
    return friends.filter(friend => 
      friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  const fetchFriendsData = useCallback(async () => {
    try {
      const res = await fetch("/api/friends/list");
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
        if (selectedFriend) {
          const updatedSelected = data.find((f: any) => f.id === selectedFriend.id);
          if (updatedSelected?.hasUnread) markAsRead(selectedFriend.id);
        }
      }
    } catch (err) { console.error(err); }
  }, [selectedFriend]);

  const markAsRead = async (friendId: string) => {
    if (!friendId) return;
    try {
      await fetch("/api/messages/mark-as-read", {
        method: "POST",
        body: JSON.stringify({ senderId: friendId }),
        headers: { "Content-Type": "application/json" }
      });
      setFriends(prev => prev.map(f => f.id === friendId ? { ...f, hasUnread: false } : f));
      window.dispatchEvent(new Event('messages-read'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchFriendsData().then(() => setLoading(false));
    const interval = setInterval(fetchFriendsData, 4000);
    return () => clearInterval(interval);
  }, [mounted, fetchFriendsData]);

  useEffect(() => {
    if (!mounted || !selectedFriend?.id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${selectedFriend.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
        }
      } catch (err) { console.error(err); }
    };
    fetchMessages();
    const msgInterval = setInterval(fetchMessages, 3000);
    return () => clearInterval(msgInterval);
  }, [mounted, selectedFriend?.id]);

  useEffect(() => {
    if (mounted && messages.length > 0) scrollToBottom();
  }, [messages, mounted, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentToSend = message.trim();
    if (!contentToSend || !selectedFriend) return;

    // Das Feld sofort leeren (React State)
    setMessage(""); 

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ content: contentToSend, receiverId: selectedFriend.id }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(scrollToBottom, 50);
      } else {
        // Falls Fehler: Text wiederherstellen
        setMessage(contentToSend);
      }
    } catch (err) { 
      setMessage(contentToSend); 
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedFriend) return;
    setIsDeletingChat(true);
    try {
      const res = await fetch(`/api/messages?userId=${selectedFriend.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages([]);
        setIsDeleteModalOpen(false);
      }
    } catch (err) { console.error(err); } finally {
      setIsDeletingChat(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in fade-in duration-700 overflow-hidden px-4 relative">
      
      {/* SIDEBAR */}
      <aside className="w-80 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl shrink-0">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 italic">
            <Sparkles size={12} /> Live Kontakte
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 text-xs text-white outline-none focus:border-cyan-500/50 transition-all" 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-500" /></div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend: any) => (
              <button 
                key={friend.id}
                onClick={() => { setSelectedFriend(friend); markAsRead(friend.id); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-[25px] transition-all group relative border",
                  selectedFriend?.id === friend.id ? "bg-cyan-500/20 border-cyan-500/30" : "hover:bg-white/5 border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-white border border-white/10 overflow-hidden">
                    {friend.image ? <img src={friend.image} className="w-full h-full object-cover" alt="" /> : friend.name?.charAt(0).toUpperCase()}
                  </div>
                  {friend.hasUnread && (
                    <div className="absolute -top-1 -right-1 bg-cyan-500 text-[8px] font-black text-slate-950 px-2 py-0.5 rounded-full animate-bounce shadow-[0_0_15px_#06b6d4]">NEU</div>
                  )}
                </div>
                <div className="text-left overflow-hidden">
                  <p className={cn("font-black text-sm uppercase truncate italic transition-colors", friend.hasUnread ? "text-cyan-400" : "text-white")}>{friend.name}</p>
                  <p className="text-[9px] font-bold uppercase text-white/20 italic tracking-widest">Verbunden</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase tracking-widest">Keine Treffer</div>
          )}
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative">
        {selectedFriend ? (
          <>
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black italic">
                    {selectedFriend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm italic tracking-tighter">{selectedFriend.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]" />
                    <span className="text-[8px] text-cyan-400/60 font-black uppercase tracking-widest italic">Live-Chat</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsDeleteModalOpen(true)} className="p-3 rounded-2xl bg-white/5 text-white/20 hover:bg-rose-500/20 hover:text-rose-500 transition-all shadow-lg active:scale-95 group border border-white/5 hover:border-rose-500/30">
                <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
               {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex w-full animate-in slide-in-from-bottom-2", msg.senderId === session?.user?.id ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] p-4 rounded-[26px] text-sm font-medium shadow-xl",
                      msg.senderId === session?.user?.id ? "bg-cyan-500 text-slate-950 rounded-tr-none shadow-cyan-500/10" : "bg-white/10 text-white border border-white/5 rounded-tl-none"
                    )}>{msg.body}</div>
                  </div>
               ))}
               <div ref={scrollRef} className="h-4" />
            </div>

            <footer className="p-8 shrink-0">
              <form onSubmit={handleSendMessage} className="bg-slate-900/40 border border-white/10 rounded-[30px] p-2 flex items-center gap-2 backdrop-blur-md shadow-2xl focus-within:border-cyan-500/40 transition-all">
                
                <button type="button" className="p-4 text-cyan-400 hover:text-cyan-300 transition-colors">
                  <Smile size={20} />
                </button>

                <input 
                  ref={inputRef} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder={`Nachricht an ${selectedFriend.name}...`} 
                  autoComplete="off"
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2" 
                />
                <button type="submit" disabled={!message.trim()} className="p-4 bg-white text-slate-950 rounded-2xl hover:bg-cyan-400 hover:text-white transition-all disabled:opacity-10 shadow-lg active:scale-95">
                  <Send size={20} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-[35px] flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare className="text-cyan-500" size={32} />
            </div>
            <h2 className="text-4xl font-black italic uppercase text-white mb-2 tracking-tighter shadow-cyan-500/20 drop-shadow-2xl">YOU<span className="text-cyan-400">&</span>ME</h2>
            <p className="text-cyan-100/20 text-[10px] font-black uppercase tracking-[0.4em]">Starten wir eine Verbindung</p>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !isDeletingChat && setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[45px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <Trash2 size={32} className="text-cyan-400" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">Chat leeren?</h3>
            <p className="text-white/40 text-[10px] mb-10 font-black uppercase tracking-[0.2em] leading-relaxed px-4">
                Möchtest du alle Nachrichten mit <span className="text-cyan-400">{selectedFriend?.name}</span> entfernen?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button disabled={isDeletingChat} onClick={() => setIsDeleteModalOpen(false)} className="p-5 rounded-[22px] bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">Abbrechen</button>
              <button disabled={isDeletingChat} onClick={handleDeleteChat} className="p-5 rounded-[22px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95">{isDeletingChat ? "Lädt..." : "Bestätigen"}</button>
            </div>
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-8 right-8 text-white/10 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-cyan-500" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}