"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  LogOut, 
  Users, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  UserCircle, 
  ExternalLink,
  ChevronRight,
  Trash2,
  Globe,
  UserCog,
  X,
  Compass
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [hasUnread, setHasUnread] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkUnreadStatus = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/notifications/unread");
      if (response.ok) {
        const data = await response.json();
        setHasUnread(data.count > 0);
      }
    } catch (error) {
      console.error("Fehler beim Checken der Unread-Nachrichten:", error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (mounted && session?.user) {
      checkUnreadStatus();
      const interval = setInterval(checkUnreadStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [mounted, session?.user, checkUnreadStatus, pathname]);

  useEffect(() => {
    if (!session?.user || !(session.user as any).id) return;
    const userId = (session.user as any).id;
    const channel = pusherClient.subscribe(userId);
    const handleNewMessage = (data: any) => {
      const activeChatId = searchParams.get("chat");
      if (activeChatId !== data.senderId) {
        setHasUnread(true);
      }
    };
    channel.bind("message:new", handleNewMessage);
    return () => {
      pusherClient.unsubscribe(userId);
      channel.unbind("message:new", handleNewMessage);
    };
  }, [session?.user, searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", { method: "DELETE" });
      if (response.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Fehler beim Löschen.");
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.isAdmin === true;
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  const getHeaderTitle = () => {
    if (pathname === "/dashboard") return "Live Chats";
    if (pathname === "/discovery") return "Neuigkeiten Feed"; 
    if (pathname === "/friends") return "Deine Community";
    if (pathname === "/users") return "Globales Netzwerk";
    if (pathname === "/admin") return "Admin Control";
    if (pathname.includes("/profile")) return "Profil Übersicht";
    return "Willkommen";
  };

  const noScrollbarStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 font-sans relative text-white">
      <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#818cf8', // Indigo für Toaster angepasst
              border: '1px solid rgba(129, 140, 248, 0.2)',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              borderRadius: '20px',
            }
          }}
      />
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }`}} />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10 animate-vibrant-flow bg-[length:400%_400%] pointer-events-none opacity-50" />
      
      {/* Sidebar */}
      <aside className="w-72 bg-white/[0.02] backdrop-blur-3xl border-r border-white/10 flex flex-col z-20 shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
        <div className="p-10 pb-6 text-center">
          <Link href="/dashboard" className="group inline-block">
            <h1 className="text-4xl font-black text-white tracking-tighter italic drop-shadow-2xl transition-all group-hover:scale-105">
              YOU<span className="text-cyan-400">&</span>ME
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-px w-6 bg-white/20" />
              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Premium</p>
              <span className="h-px w-6 bg-white/20" />
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 flex flex-col pt-4 overflow-y-auto no-scrollbar" style={noScrollbarStyle}>
          {mounted && (
            <>
              <div className="mb-8 px-2">
                <Link 
                  href={`/profile/${(session?.user as any)?.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-[32px] transition-all duration-500 border group relative overflow-hidden",
                    "bg-white/[0.03] border-white/10 shadow-lg",
                    pathname.includes("/profile") 
                      ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.2)]" 
                      : "hover:bg-white/[0.08] hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] hover:-translate-y-1"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative shrink-0 z-10">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-xl drop-shadow-md">{userInitial}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-950 rounded-full">
                      <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                    </div>
                  </div>

                  <div className="min-w-0 relative z-10">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                      {session?.user?.name || "User"}
                    </p>
                    <span className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.2em] flex items-center gap-1 mt-0.5 opacity-60 group-hover:opacity-100 transition-all">
                      Profil <ExternalLink size={8} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
              
              <nav className="space-y-3 flex-1 px-2">
                <Link href="/users" className={cn("group flex items-center justify-between p-4 rounded-[24px] transition-all border font-black uppercase text-[10px] tracking-[0.2em]", pathname === "/users" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg" : "text-white/30 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white")}>
                  <div className="flex items-center gap-4">
                    <Globe size={20} className={pathname === "/users" ? "text-white" : "text-white/20 group-hover:text-indigo-400"} />
                    <span>User finden</span>
                  </div>
                </Link>

                <Link 
                  href="/discovery" 
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-[24px] transition-all border font-black uppercase text-[10px] tracking-[0.2em] relative overflow-hidden", 
                    pathname === "/discovery" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg" : "text-white/30 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <Compass size={20} className={cn("transition-all duration-500", pathname === "/discovery" ? "text-white scale-110" : "text-white/20 group-hover:text-indigo-400 group-hover:rotate-12")} />
                    <span>Neuigkeiten</span>
                  </div>
                </Link>

                <div className="h-px bg-white/5 mx-4 my-2" />

                <Link href="/dashboard" className={cn("group flex items-center justify-between p-4 rounded-[24px] transition-all border font-black uppercase text-[10px] tracking-[0.2em]", pathname === "/dashboard" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg" : "text-white/30 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white")}>
                  <div className="flex items-center gap-4">
                    <MessageSquare size={20} className={pathname === "/dashboard" ? "text-white" : "text-white/20 group-hover:text-cyan-400"} />
                    <span>Chats</span>
                  </div>
                  {hasUnread && (
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]"></span>
                    </div>
                  )}
                </Link>

                <Link href="/friends" className={cn("group flex items-center justify-between p-4 rounded-[24px] transition-all border font-black uppercase text-[10px] tracking-[0.2em]", pathname === "/friends" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg" : "text-white/30 border-white/5 bg-white/5 hover:bg-white/10 hover:text-white")}>
                  <div className="flex items-center gap-4">
                    <Users size={20} className={pathname === "/friends" ? "text-white" : "text-white/20 group-hover:text-cyan-400"} />
                    <span>Freunde</span>
                  </div>
                </Link>

                {isAdmin && (
                  <div className="pt-8 mt-8 border-t border-white/10">
                    <Link href="/admin" className={cn("flex items-center space-x-4 p-4 rounded-[24px] transition-all border font-black uppercase text-[10px] tracking-[0.2em] group", pathname === "/admin" ? "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-lg shadow-rose-500/5" : "bg-white/5 text-rose-400/40 border-white/5 hover:bg-rose-500/10 hover:text-rose-400")}>
                      <ShieldCheck size={20} className="text-rose-500" />
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                )}
              </nav>
            </>
          )}
        </div>

        <div className="p-8 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center justify-center space-x-3 w-full p-4 text-white/20 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.3em] group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Abmelden</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-24 bg-white/[0.01] backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-12 relative z-40">
          <div className="flex flex-col">
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic">
              {mounted ? getHeaderTitle() : "Dashboard"}
            </h2>
            <div className="h-1 w-12 bg-cyan-500 rounded-full mt-1 shadow-[0_0_8px_rgba(6,182,212,1)]" />
          </div>

          <div className="relative flex items-center gap-6" ref={menuRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={cn(
                "p-4 rounded-[22px] transition-all border shadow-lg active:scale-95", 
                isSettingsOpen 
                  ? "bg-white text-slate-950 border-white shadow-cyan-500/20" 
                  : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              )}
            >
              <Settings size={22} className={cn("transition-transform duration-700", isSettingsOpen && "rotate-180")} />
            </button>

            {mounted && isSettingsOpen && (
              <div className="absolute right-0 top-20 w-72 bg-slate-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px] py-6 z-[9999] animate-in fade-in zoom-in-95 duration-300 origin-top-right overflow-hidden">
                <div className="px-8 py-4 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] italic">Einstellungen</p>
                </div>

                <Link 
                  href={`/profile/${(session?.user as any)?.id}`} 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="flex items-center justify-between px-8 py-4 text-[11px] text-white/60 hover:text-white hover:bg-white/5 transition-all font-black uppercase tracking-widest group"
                >
                  <div className="flex items-center gap-4">
                    <UserCircle size={18} className="text-cyan-400" />
                    <span>Mein Profil</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </Link>

                <Link 
                  href="/settings/profile" 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="flex items-center justify-between px-8 py-4 text-[11px] text-white/60 hover:text-white hover:bg-white/5 transition-all font-black uppercase tracking-widest group"
                >
                  <div className="flex items-center gap-4">
                    <UserCog size={18} className="text-indigo-400" />
                    <span>Profil bearbeiten</span>
                  </div>
                  <ChevronRight size={14} className="opacity-40" />
                </Link>

                <button 
                  onClick={() => { setIsSettingsOpen(false); signOut({ callbackUrl: "/login" }); }} 
                  className="flex items-center justify-between px-8 py-4 w-full text-[11px] text-white/60 hover:text-white hover:bg-rose-500/5 transition-all font-black uppercase tracking-widest text-left group"
                >
                  <div className="flex items-center gap-4">
                    <LogOut size={18} className="text-rose-500" />
                    <span>Abmelden</span>
                  </div>
                </button>

                <div className="h-px bg-white/5 mx-6 my-2" />

                <button 
                  onClick={() => { setIsSettingsOpen(false); setIsDeleteModalOpen(true); }} 
                  className="flex items-center gap-4 px-8 py-4 w-full text-[11px] text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-black uppercase tracking-widest text-left group"
                >
                  {/* HIER DIE FARBE: Indigo-400 (Connect with the World Style) */}
                  <Trash2 
                    size={18} 
                    className="text-indigo-400 opacity-100 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)] group-hover:scale-110 transition-all" 
                  />
                  <span>Account löschen</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 no-scrollbar relative z-0" style={noScrollbarStyle}>
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </section>
      </main>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[50px] p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-white tracking-tighter italic drop-shadow-2xl">
                    YOU<span className="text-cyan-400">&</span>ME
                </h1>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] mt-1.5">Sicherheitscenter</p>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mx-auto mt-4" />
            </div>
            <div className="w-20 h-20 bg-rose-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,1)]">
              <Trash2 size={38} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Account löschen?</h3>
            <p className="text-white/40 text-[10px] mb-12 font-black uppercase tracking-[0.2em] leading-relaxed px-6">
              Vorsicht: Dieser Schritt <span className="text-rose-400">löscht unwiderruflich</span> alle deine Daten.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button disabled={isDeleting} onClick={() => setIsDeleteModalOpen(false)} className="p-5 rounded-3xl bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">Abbrechen</button>
              <button disabled={isDeleting} onClick={confirmDeleteAccount} className="p-5 rounded-3xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50">
                {isDeleting ? "Wird gelöscht..." : "Ja, löschen"}
              </button>
            </div>
            <button onClick={() => !isDeleting && setIsDeleteModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}