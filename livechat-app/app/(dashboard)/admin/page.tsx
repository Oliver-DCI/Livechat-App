"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Users, Heart, Trash2, Loader2, Database, Activity, Lock, ExternalLink, X, User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Admin-Stats Error:", e);
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
        <Loader2 className="animate-spin text-cyan-400" size={48} />
        <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Verify Admin Access...</p>
      </div>
    );
  }

  const currentUser = session?.user as any;
  if (!session || (currentUser?.role !== "ADMIN" && !currentUser?.isAdmin)) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-xl text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Admin<span className="text-rose-500">Panel</span>
            </h1>
          </div>
          <p className="text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] ml-1">
            System Monitoring & User Control
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
          <StatCard icon={<Users size={24} />} label="Total User" value={data?.stats.totalUsers} color="cyan" />
          <StatCard icon={<Heart size={24} />} label="Connections" value={data?.stats.activeFriendships} color="rose" />
        </div>
      </div>

      {/* USER DATABASE TABLE */}
      <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Live User Database</h3>
            </div>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest px-4 py-1.5 border border-white/30 rounded-full bg-white/10 shadow-lg">
              {data?.users.length} Records Found
            </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest">Identität</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest hidden md:table-cell text-center">UID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">Registrierung</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.users.map((u: any) => (
                <tr 
                  key={u.id} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-white/[0.05] transition-all group cursor-pointer"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center font-black text-lg text-cyan-400 overflow-hidden shadow-xl shrink-0 group-hover:border-cyan-500/50 transition-colors">
                        {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-black text-white tracking-tight uppercase italic group-hover:text-cyan-300 transition-colors">{u.name}</p>
                        <p className="text-xs text-cyan-300/60 font-medium lowercase italic tracking-tight">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 hidden md:table-cell text-center">
                    <code className="text-[10px] text-white/30 font-mono bg-black/30 px-2 py-1 rounded-md border border-white/5">
                      {u.id.substring(0, 10)}...
                    </code>
                  </td>
                  <td className="p-6 hidden sm:table-cell">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-tighter">
                      {new Date(u.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end">
                       <div className="p-2 text-white/10 group-hover:text-cyan-400 transition-colors">
                         <ExternalLink size={18} />
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-white/5 flex items-center justify-center gap-3 border-t border-white/10">
            <Lock size={12} className="text-cyan-400" />
            <p className="text-[10px] text-white/90 font-black uppercase tracking-[0.5em] italic">
              Security Protocol Active & Encrypted
            </p>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => !isDeleting && setSelectedUser(null)} 
          />
          
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-rose-500 to-indigo-500" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-3xl bg-slate-800 border border-white/10 flex items-center justify-center font-black text-2xl text-cyan-400 overflow-hidden shadow-2xl">
                    {selectedUser.image ? <img src={selectedUser.image} className="w-full h-full object-cover" /> : selectedUser.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase italic leading-tight">{selectedUser.name}</h2>
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">User Management</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* AKTION: PROFIL AUFRUFEN - Der Pfad ignoriert den Group-Folder (dashboard) */}
                <button 
                  onClick={() => router.push(`/profile/${selectedUser.id}`)}
                  className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-cyan-500 hover:text-slate-950 transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <UserIcon size={24} />
                    <span className="font-black uppercase italic tracking-wider">Profil ansehen</span>
                  </div>
                  <ChevronRightIcon />
                </button>

                {/* AKTION: LÖSCHEN */}
                {currentUser.id !== selectedUser.id ? (
                  <button 
                    disabled={isDeleting}
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="w-full flex items-center justify-between p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl hover:bg-rose-500 text-rose-500 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {isDeleting ? <Loader2 className="animate-spin" size={24} /> : <Trash2 size={24} />}
                      <span className="font-black uppercase italic tracking-wider">User löschen</span>
                    </div>
                    <span className="text-[10px] font-black opacity-40 uppercase group-hover:opacity-100">Permanent</span>
                  </button>
                ) : (
                  <div className="p-4 text-center text-[10px] font-black text-white/20 uppercase tracking-widest italic">
                    Self-Deletion Restricted
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

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: "cyan" | "rose" }) {
  const isCyan = color === "cyan";
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-xl flex items-center gap-5 min-w-[220px]">
      <div className={`${isCyan ? 'bg-cyan-500' : 'bg-rose-500'} p-4 rounded-2xl text-white shadow-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter italic">{value || 0}</p>
      </div>
    </div>
  );
}