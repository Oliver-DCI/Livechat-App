"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  ShieldCheck, 
  LogOut,
  LayoutDashboard,
  ArrowRight,
  Compass,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Navigation-Routes inkl. Discovery
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Discovery", // DEIN NEUER REITER
      icon: Compass,
      href: "/discovery",
      color: "text-rose-500",
      isNew: true
    },
    {
      label: "Chats",
      icon: MessageSquare,
      href: "/dashboard", // In einer Ausbaustufe evtl. /chats
    },
    {
      label: "Freunde finden",
      icon: Users,
      href: "/users",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 border-r border-white/10 w-72 relative overflow-hidden shadow-[32px_0_64px_-16px_rgba(0,0,0,0.6)]">
      
      {/* Hintergrunde-Animationen & Blobs */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10 animate-vibrant-flow bg-[length:400%_400%] opacity-30" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[20%] w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] -right-[10%] w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>

      <div className="px-8 py-10 flex-1 relative z-10 flex flex-col">
        {/* BRANDING */}
        <Link href="/dashboard" className="flex flex-col mb-12 group">
          <h1 className="text-4xl font-black text-white tracking-tighter italic drop-shadow-2xl transition-all duration-500">
            YOU<span className="text-cyan-400">&</span>ME
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-px w-6 bg-white/20" />
            <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Premium</p>
            <span className="h-px w-6 bg-white/20" />
          </div>
        </Link>
        
        {/* NAVIGATION */}
        <nav className="space-y-4 flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group relative flex p-4 w-full items-center font-black rounded-3xl transition-all duration-300 border uppercase text-[10px] tracking-[0.2em] overflow-hidden",
                pathname === route.href 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-[0_20px_40px_-12px_rgba(6,182,212,0.5)]" 
                  : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center flex-1 relative z-10">
                <route.icon className={cn(
                    "h-5 w-5 mr-4 transition-all duration-500",
                    pathname === route.href ? "text-white" : cn("text-white/20 group-hover:text-cyan-400", route.color)
                )} />
                {route.label}
                {route.isNew && pathname !== route.href && (
                  <Sparkles size={10} className="ml-2 text-rose-500 animate-pulse" />
                )}
              </div>
              {pathname === route.href && <ArrowRight size={14} className="relative z-10 animate-in slide-in-from-left-2" />}
              
              {pathname === route.href && (
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}
            </Link>
          ))}

          {/* ADMIN SECTION */}
          {isAdmin && (
            <div className="mt-8 pt-8 border-t border-white/10">
               <Link
                href="/admin"
                className={cn(
                  "group flex p-4 w-full items-center font-black rounded-3xl transition-all border uppercase text-[10px] tracking-[0.2em]",
                  pathname === "/admin" 
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                    : "bg-white/5 text-rose-400/40 border-white/10 hover:bg-rose-500/10 hover:text-rose-400"
                )}
              >
                <ShieldCheck className="h-5 w-5 mr-4 transition-transform group-hover:rotate-12" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        {/* SETTINGS */}
        <Link
          href="/settings/profile"
          className={cn(
            "group flex p-4 w-full items-center font-black rounded-3xl transition-all border uppercase text-[10px] tracking-[0.2em] mb-4",
            pathname.includes("/settings") 
              ? "bg-white/10 text-white border-white/20 shadow-lg" 
              : "bg-white/5 text-white/30 border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings className={cn(
            "h-5 w-5 mr-4 transition-all duration-700 group-hover:rotate-90",
            pathname.includes("/settings") ? "text-indigo-400" : "text-white/20 group-hover:text-indigo-400"
          )} />
          <span>Settings</span>
        </Link>
      </div>

      {/* USER CARD (Bottom) */}
      <div className="px-6 py-8 border-t border-white/10 bg-slate-950/40 backdrop-blur-3xl">
        <Link 
          href={`/profile/${user?.id}`}
          className="flex items-center gap-x-4 p-4 rounded-[32px] border border-white/10 bg-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
        >
          {/* Top Glossy Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-white/10 shadow-lg overflow-hidden shrink-0">
            {user?.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
                <span className="text-sm font-black text-white">{userInitial}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
              {user?.name || "Member"}
            </p>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" /> Online
            </span>
          </div>
        </Link>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-3 p-4 mt-6 text-white/20 hover:text-rose-400 transition-all text-[9px] font-black uppercase tracking-[0.4em] group hover:bg-white/5 rounded-2xl"
        >
           <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
           Logout
        </button>
      </div>
    </div>
  );
}