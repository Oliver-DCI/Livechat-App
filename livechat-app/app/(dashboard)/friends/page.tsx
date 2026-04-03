"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Check, 
  X, 
  MessageSquare, 
  Loader2, 
  Users2, 
  UserMinus,
  AlertCircle,
  Filter 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FriendsPage() {
  const [filterQuery, setFilterQuery] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const [friendToDelete, setFriendToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchIncoming(), fetchFriends()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredFriends = useMemo(() => {
    const query = filterQuery.toLowerCase().trim();
    return friends.filter((friend: any) => 
      friend.name?.toLowerCase().includes(query) ||
      friend.email?.toLowerCase().includes(query)
    );
  }, [filterQuery, friends]);

  const fetchIncoming = async () => {
    try {
      const res = await fetch("/api/friends/manage");
      if (res.ok) {
        const data = await res.json();
        setIncomingRequests(data);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Anfragen:", err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends/list"); 
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Freunde:", err);
    }
  };

  const handleMarkAsRead = async (friendId: string) => {
    try {
      await fetch("/api/messages/mark-as-read", {
        method: "POST",
        body: JSON.stringify({ senderId: friendId }),
        headers: { "Content-Type": "application/json" }
      });
      setFriends((prev: any) => 
        prev.map((f: any) => f.id === friendId ? { ...f, hasUnread: false } : f)
      );
    } catch (err) {
      console.error("Fehler beim Markieren als gelesen:", err);
    }
  };

  const handleManageRequest = async (requestId: string, action: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/friends/manage", {
        method: "PATCH",
        body: JSON.stringify({ requestId, action }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setIncomingRequests(prev => prev.filter((r: any) => r.id !== requestId));
        if (action === "ACCEPTED") fetchFriends();
      }
    } catch (err) {
      console.error("Fehler beim Verarbeiten der Anfrage:", err);
    }
  };

  const confirmRemoveFriend = async () => {
    if (!friendToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/friends/manage?friendId=${friendToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFriends((prev) => prev.filter((f: any) => f.id !== friendToDelete.id));
        setFriendToDelete(null);
      }
    } catch (err) {
      console.error("Delete Error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700 text-white relative px-4">
      
      {/* HEADER & FILTER SEKTION */}
      <div className="space-y-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Community</h1>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              <p className="text-cyan-100/40 font-bold uppercase tracking-[0.3em] text-[10px]">
                {friends.length} Kontakte in deinem Netzwerk
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-[28rem] group">
            <div className="relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Name oder Email..."
                className="w-full p-5 pl-14 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[24px] text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all text-sm font-bold shadow-2xl"
              />
              <Filter className="absolute left-5 top-5 text-white/10 group-focus-within:text-cyan-500 transition-colors" size={20} />
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <p className="text-[10px] font-black text-slate-100 uppercase tracking-[0.3em] opacity-90">Schnellfilter / Kontakte durchsuchen</p>
            </div>
          </div>
        </div>
      </div>

      {/* EINGEHENDE ANFRAGEN */}
      {incomingRequests.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[30px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[30px]">
            <h2 className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <span className="h-2 w-2 bg-cyan-500 rounded-full animate-ping"></span>
              Neue Anfragen ({incomingRequests.length})
            </h2>
            <div className="grid gap-4">
              {incomingRequests.map((req: any) => (
                <div key={req.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center font-black border border-white/10 overflow-hidden text-xl uppercase">
                      {req.sender.image ? <img src={req.sender.image} alt="" className="object-cover w-full h-full" /> : req.sender.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase italic">{req.sender.name}</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest">{req.sender.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleManageRequest(req.id, "ACCEPTED")} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-3 rounded-xl transition-all"><Check size={18} /></button>
                    <button onClick={() => handleManageRequest(req.id, "DECLINED")} className="bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 p-3 rounded-xl transition-all border border-white/5"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FREUNDESLISTE MIT POSTCARD EFFEKT */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Users2 className="text-cyan-500" size={20} /></div>
            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">Deine Kontakte</h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
            <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em] italic">Kein Treffer in deiner Liste.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFriends.map((friend: any) => (
              <div key={friend.id} className="block group perspective-1000 relative">
                
                {/* 1. GLOW EFFEKT AUS POSTCARD */}
                <div className="absolute -inset-1 bg-cyan-400/0 group-hover:bg-cyan-400/10 blur-xl rounded-[40px] transition-all duration-500 -z-10" />

                <div className="group bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden h-full">
                  
                  {/* 2. SHINE EFFECT (SWEEP) AUS POSTCARD */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg]" />
                  </div>

                  <Link href={`/profile/${friend.id}`} className="flex items-center space-x-5 z-20 cursor-pointer group/card">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-[20px] bg-slate-800 flex items-center justify-center font-black text-white text-xl overflow-hidden border border-white/10 group-hover/card:scale-110 transition-transform duration-300 shadow-xl relative z-40">
                        {friend.image ? <img src={friend.image} alt="" className="object-cover w-full h-full" /> : friend.name?.charAt(0).toUpperCase()}
                      </div>
                      {friend.hasUnread && (
                        <div className="absolute -top-2 -right-2 bg-cyan-500 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-bounce z-50">
                          NEU
                        </div>
                      )}
                    </div>
                    <div className="relative z-40">
                      <p className="font-black text-white text-xl tracking-tighter mb-1 uppercase italic leading-none">{friend.name}</p>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 w-fit">
                          <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse"></div>
                          <p className="text-[8px] text-cyan-400 font-black uppercase tracking-widest">Aktiv</p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex gap-2 z-40 relative">
                    <Link 
                      href={`/dashboard?chat=${friend.id}`} 
                      onClick={() => handleMarkAsRead(friend.id)}
                      className={cn(
                        "p-4 rounded-2xl transition-all border border-white/5 active:scale-95 flex items-center justify-center relative z-50",
                        friend.hasUnread 
                          ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]" 
                          : "bg-white/5 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                      )}
                    >
                        <MessageSquare size={20} fill="currentColor" className={friend.hasUnread ? "opacity-100" : "opacity-20"} />
                    </Link>
                    <button onClick={() => setFriendToDelete({ id: friend.id, name: friend.name })} className="p-4 bg-white/5 text-rose-500/40 hover:text-rose-500 rounded-2xl hover:bg-rose-500/10 transition-all border border-white/5 active:scale-95 relative z-50">
                        <UserMinus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ÜBERARBEITETES DELETE MODAL */}
      {friendToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !isDeleting && setFriendToDelete(null)} />
          
          <div className="relative w-full max-w-sm bg-slate-900 border border-cyan-500/20 rounded-[45px] p-10 text-center shadow-[0_0_80px_rgba(6,182,212,0.15)] animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 bg-cyan-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <UserMinus size={32} className="text-cyan-400" />
            </div>

            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3 italic leading-none">
              Verbindung <br /><span className="text-cyan-500">lösen?</span>
            </h3>
            
            <p className="text-white/40 text-[10px] mb-10 font-black uppercase tracking-[0.2em] leading-relaxed px-4">
              Möchtest du die Verbindung zu <span className="text-cyan-400">{friendToDelete.name}</span> wirklich aufheben?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={isDeleting} 
                onClick={() => setFriendToDelete(null)} 
                className="p-5 rounded-[22px] bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
              >
                Abbrechen
              </button>
              
              <button 
                disabled={isDeleting} 
                onClick={confirmRemoveFriend} 
                className="p-5 rounded-[22px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 flex items-center justify-center"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "BESTÄTIGEN"}
              </button>
            </div>

            <button 
              onClick={() => !isDeleting && setFriendToDelete(null)} 
              className="absolute top-8 right-8 text-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}