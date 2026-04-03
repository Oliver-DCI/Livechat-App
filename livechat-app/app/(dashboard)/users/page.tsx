"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Clock, 
  Check, 
  User as UserIcon,
  Loader2, 
  ExternalLink,
  Users2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GlobalUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  status: "NONE" | "PENDING" | "ACCEPTED";
  isOnline: boolean;
}

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Fehler beim Laden der User:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddFriend = async (receiverId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ receiverId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === receiverId ? { ...u, status: "PENDING" } : u));
      }
    } catch (error) {
      console.error("Request failed", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000 text-white px-6">
      
      {/* 1. HEADER & SEARCH */}
      <div className="space-y-10 mt-12">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/10 px-4 py-1.5 rounded-full mb-2">
            <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Global Network</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
            Find <span className="text-cyan-500">Friends</span>
          </h1>
        </div>

        <div className="relative group max-w-3xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche nach Namen oder E-Mail..."
              className="w-full p-7 pl-16 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/30 transition-all text-xl font-medium shadow-[0_0_50px_rgba(0,0,0,0.3)]"
            />
            <Search className="absolute left-6 top-7 text-white/10 group-focus-within:text-cyan-500 transition-colors" size={28} />
          </div>
        </div>
      </div>

      {/* 2. USER GRID */}
      <div className="pt-8">
        <div className="flex items-center gap-4 mb-12">
            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">Community Directory</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="text-cyan-500 animate-spin" size={48} />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/40">Synchronizing...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredUsers.map((user) => (
              <div key={user.id} className="group relative h-full">
                
                {/* DYNAMISCHER HINTERGRUND GLOW */}
                <div className={cn(
                    "absolute -inset-2 rounded-[45px] blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100 -z-10",
                    user.isOnline ? "bg-emerald-500/30" : "bg-cyan-500/10"
                )} />

                <div className={cn(
                  "relative backdrop-blur-xl border rounded-[40px] p-7 flex flex-col items-center transition-all duration-500 hover:border-white/10 hover:-translate-y-3 overflow-hidden h-full",
                  user.isOnline 
                    ? "bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/50" 
                    : "bg-white/[0.03] border-white/5 hover:border-cyan-500/40"
                )}>
                  
                  {/* SPECTACULAR SHINE EFFECT */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
                  </div>

                  <Link href={`/profile/${user.id}`} className="flex flex-col items-center w-full mb-8 relative z-20">
                    
                    {/* PROFIL ICON (Ohne Border, purer Glow bei Hover) */}
                    <div className="absolute -top-2 -right-2 p-2 text-white/5 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:translate-x-1">
                      <ExternalLink size={20} className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    </div>

                    <div className="relative mb-6">
                      <div className={cn(
                        "h-24 w-24 rounded-[32px] bg-slate-900/50 border flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl",
                        user.isOnline ? "border-emerald-500/30" : "border-white/10"
                      )}>
                        {user.image ? (
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={36} className="text-white/10" />
                        )}
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-[4px] border-slate-950 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.6)] z-30" />
                      )}
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className={cn(
                          "text-sm font-black uppercase italic tracking-wider transition-colors",
                          user.isOnline ? "text-emerald-400" : "text-white group-hover:text-cyan-400"
                        )}>
                        {user.name || "Unknown"}
                        </h3>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                          {user.isOnline ? "Active Now" : user.email?.split('@')[0]}
                        </p>
                    </div>
                  </Link>

                  <div className="w-full mt-auto relative z-30">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if(user.status === "NONE") handleAddFriend(user.id);
                      }}
                      disabled={user.status !== "NONE"}
                      className={cn(
                        "w-full py-4 rounded-2xl border flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-[0.2em] px-1 shadow-lg",
                        user.status === "NONE" 
                          ? "bg-white/5 border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-500 hover:text-slate-950 active:scale-95" 
                          : user.status === "PENDING"
                          ? "border-amber-500/20 bg-amber-500/5 text-amber-500/50 cursor-default"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 cursor-default"
                      )}
                    >
                      {user.status === "NONE" && <><UserPlus size={14} /> Add Connection</>}
                      {user.status === "PENDING" && <><Clock size={14} /> Request Sent</>}
                      {user.status === "ACCEPTED" && <><Check size={14} /> Connected</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;