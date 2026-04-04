"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Users, Heart, Trash2, Loader2, Activity, Lock, 
  ExternalLink, X, User as UserIcon, Info, Mail, Calendar, MessageSquare, 
  ChevronRight, Fingerprint, Command, Zap, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) { 
      console.error("Admin-Stats Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (!isClient || status === "loading") return;
    const user = session?.user as any;
    const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;

    if (status === "unauthenticated" || !isAdmin) {
      router.push("/dashboard");
    } else {
      loadData();
    }
  }, [status, session, router, isClient]);

  const handleDeleteUser = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        setSelectedUser(null);
        setConfirmDelete(false);
      }
    } catch (e) { 
      console.error("Delete failed"); 
    } finally { 
      setIsDeleting(false); 
    }
  };

  if (!isClient) return <div className="min-h-screen bg-transparent" />;

  if (status === "loading" || (loading && !data)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-white font-black uppercase tracking-[0.3em] text-sm italic">Accessing Control Center...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* --- HEADER SECTION (NUN IN VIOLETT) --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            {/* Icon nun in Violett passend zur Admin-Karte */}
            <div className="p-3 bg-violet-600 rounded-2xl text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <Command size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                ADMIN<span className="text-violet-500">CONTROL</span>CENTER
              </h1>
              <p className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px] mt-1">
                YOU&ME Architecture v2.0
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
          <StatCard icon={<Users size={20} />} label="Total Members" value={data?.stats.totalUsers} color="cyan" />
          <StatCard icon={<Heart size={20} />} label="Active Links" value={data?.stats.activeFriendships} color="violet" />
        </div>
      </div>

      {/* --- USER GRID AREA --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-violet-500 animate-pulse" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Live Network Nodes</h3>
          </div>
          <div className="text-[9px] font-black text-violet-500 uppercase bg-violet-500/10 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-lg shadow-violet-500/5 italic">
             {data?.users.length || 0} Registered Entities
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.users.map((u: any) => {
            const isOnline = u.isOnline;
            const friendsCount = u.friendsCount || 0; 
            const isMe = u.id === session?.user?.id;
            const isFriendOfAdmin = u.isFriend; 

            return (
              <div 
                key={u.id}
                className={cn(
                  "group relative transition-all duration-500 rounded-[2.5rem] p-6 cursor-pointer border overflow-hidden",
                  isMe 
                    ? "sm:col-span-2 bg-gradient-to-br from-violet-600/20 to-slate-900/90 border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20" 
                    : isOnline 
                      ? "bg-slate-900/80 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.05)]" 
                      : "bg-slate-900/40 border-white/5 hover:border-white/20"
                )}
                onClick={() => { setSelectedUser(u); setConfirmDelete(false); }}
              >
                {isMe && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/10 blur-[50px] rounded-full pointer-events-none" />
                )}

                <div className="flex items-center gap-5 mb-5 relative z-10">
                  <div className={cn(
                    "h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-2xl transition-all duration-500 border-2",
                    isMe ? "border-violet-500 scale-105" : "border-white/10 group-hover:border-cyan-400/50",
                    !isMe && isOnline && "border-cyan-400/50"
                  )}>
                    {u.image ? (
                      <img src={u.image} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/10 uppercase italic bg-slate-800">
                        {u.name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={cn(
                        "font-black uppercase italic tracking-tighter truncate transition-colors leading-tight",
                        isMe ? "text-2xl text-violet-400" : "text-lg text-white group-hover:text-cyan-400"
                      )}>
                        {u.name}
                      </h4>
                      {isMe && (
                        <span className="px-2 py-0.5 bg-violet-500 text-white rounded-md text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-1 shadow-lg shadow-violet-500/20">
                           <Zap size={8} fill="currentColor" /> System Host
                        </span>
                      )}
                      {isFriendOfAdmin && !isMe && (
                         <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                           <Star size={8} className="inline mr-1" fill="currentColor" /> Friend
                         </span>
                      )}
                    </div>
                    <p className={cn(
                      "font-medium lowercase tracking-tight truncate italic mt-0.5",
                      isMe ? "text-violet-200/50 text-[11px]" : "text-cyan-100/70 text-[10px]"
                    )}>
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Friends</p>
                       <p className={cn("text-sm font-black italic", isMe ? "text-violet-400" : "text-white")}>{friendsCount}</p>
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm", 
                      isOnline ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse" : "bg-white/5 border-white/10 text-white/20")}>
                      {isOnline ? "Live Node" : "Standby"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-xl bg-white/5 text-white/20",
                    isMe 
                      ? "group-hover:bg-violet-600 group-hover:text-white shadow-violet-600/20" 
                      : "group-hover:bg-cyan-500 group-hover:text-slate-950 shadow-cyan-500/20"
                  )}>
                    <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MASTER MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => !isDeleting && setSelectedUser(null)} />
          
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-[2rem] bg-slate-800 border-2 border-white/10 overflow-hidden shadow-2xl">
                    {selectedUser.image ? (
                      <img src={selectedUser.image} className="w-full h-full object-cover" alt="User" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10 uppercase italic">
                        {selectedUser.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-3">
                       <span className={cn("h-2 w-2 rounded-full", selectedUser.isOnline ? "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" : "bg-white/20")} />
                       <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] italic">
                         {selectedUser.isOnline ? "Secure Connection" : "Terminated Link"}
                       </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-white/10 hover:text-white transition-colors bg-white/5 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoBox icon={<Mail size={12}/>} label="User Identity" value={selectedUser.email} />
                <InfoBox icon={<Calendar size={12}/>} label="Registry Date" value={new Date(selectedUser.createdAt).toLocaleDateString('de-DE')} />
                <InfoBox icon={<Users size={12}/>} label="Connections" value={`${selectedUser.friendsCount || 0} Friends`} />
                <InfoBox icon={<MessageSquare size={12}/>} label="Feed Activity" value={`${selectedUser.postsCount || 0} Posts`} />
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <button 
                  onClick={() => router.push(`/profile/${selectedUser.id}`)}
                  className="w-full flex items-center justify-center gap-3 p-5 bg-white text-slate-950 rounded-2xl hover:bg-cyan-400 transition-all font-black uppercase italic tracking-widest text-xs shadow-xl"
                >
                  <ExternalLink size={16} /> Access Master Profile
                </button>

                {!confirmDelete ? (
                  <button 
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-3 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500 text-rose-500 hover:text-white transition-all font-black uppercase italic tracking-widest text-[10px]"
                  >
                    <Trash2 size={16} /> Delete Entry
                  </button>
                ) : (
                  <div className="flex gap-2 animate-in slide-in-from-bottom-4">
                    <button 
                      disabled={isDeleting}
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="flex-[2] p-5 bg-rose-600 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-rose-700 transition-colors shadow-2xl"
                    >
                      {isDeleting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "CONFIRM WIPE"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 bg-white/5 text-white rounded-2xl font-black uppercase italic text-[10px]">
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- HELPERS ---

function InfoBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
      <div className="flex items-center gap-2 mb-1 opacity-30">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-bold text-white/90 truncate italic">{value || "---"}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: "cyan" | "rose" | "violet" }) {
  const isCyan = color === "cyan";
  const isViolet = color === "violet";
  
  return (
    <div className="bg-slate-950/40 p-5 rounded-3xl border border-white/5 flex items-center gap-4 min-w-[200px]">
      <div className={cn(
        "p-3 rounded-xl text-white shadow-xl", 
        isCyan ? 'bg-cyan-500 shadow-cyan-500/20' : 
        isViolet ? 'bg-violet-600 shadow-violet-600/20' : 
        'bg-rose-500 shadow-rose-500/20'
      )}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-black text-white italic leading-none">{value || 0}</p>
      </div>
    </div>
  );
}