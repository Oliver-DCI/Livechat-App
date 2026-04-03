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
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700 text-white">
      
      {/* 1. HEADER & SUCHE */}
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Community</h1>
          <p className="text-cyan-100/40 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Finde deine Leute</p>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Username oder Email suchen..."
              className="w-full p-6 pl-16 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-full text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-lg font-medium shadow-2xl"
            />
            <Search className="absolute left-6 top-6 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" size={26} />
          </div>
        </div>
      </div>

      {/* 2. USER GRID */}
      <div className="pt-4">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Users2 className="text-cyan-500" size={24} />
            </div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] italic">
              Neue Kontakte
            </h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-cyan-500 animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="group relative bg-white/[0.02] border border-white/5 rounded-[40px] p-6 flex flex-col transition-all duration-500 hover:bg-white/[0.07] hover:-translate-y-2">
                
                <Link href={`/profile/${user.id}`} className="flex flex-col items-center flex-1 w-full">
                  
                  {/* ICON - DIREKT TÜRKIS UND GROSS */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                    <ExternalLink size={22} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  </div>

                  <div className="relative mb-5">
                    <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center overflow-hidden group-hover:rotate-6 transition-transform shadow-2xl group-hover:border-cyan-500/50">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={32} className="text-white/10" />
                      )}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[4px] border-slate-950 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>

                  <h3 className="text-[10px] font-black text-white uppercase tracking-tighter text-center mb-5 truncate w-full px-2 opacity-80 italic group-hover:text-cyan-400 transition-colors">
                    {user.name || "Anonymous"}
                  </h3>
                </Link>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if(user.status === "NONE") handleAddFriend(user.id);
                  }}
                  disabled={user.status !== "NONE"}
                  className={cn(
                    "w-full py-3 rounded-[20px] border flex items-center justify-center gap-2 transition-all font-black text-[8px] uppercase tracking-widest px-1 relative z-10",
                    user.status === "NONE" 
                      ? "bg-white/5 border-white/10 text-white hover:bg-cyan-500 hover:border-cyan-500 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95" 
                      : user.status === "PENDING"
                      ? "border-amber-500/20 bg-amber-500/5 text-amber-500/40 cursor-default"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 cursor-default"
                  )}
                >
                  {user.status === "NONE" && <><UserPlus size={12} /> Add Friend</>}
                  {user.status === "PENDING" && <><Clock size={12} /> Waiting</>}
                  {user.status === "ACCEPTED" && <><Check size={12} /> Friends</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;