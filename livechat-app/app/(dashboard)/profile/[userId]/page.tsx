"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Music, 
  Image as ImageIcon, 
  Loader2, 
  Lock,
  UserPlus,
  Clock,
  Settings,
  MessageSquare,
  Sparkles,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/users/profile?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Profil-Fehler:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("cloudinary.com")) return null; // Cloudinary ist ein Bild/Audio, kein YouTube-Embed
    
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else {
      const parts = url.split("/");
      videoId = parts[parts.length - 1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  const handleAddFriend = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ receiverId: userId }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setUser({ ...user, friendshipStatus: "PENDING" });
      }
    } catch (err) {
      console.error("Add Friend Error:", err);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4 text-white">
      <Loader2 className="animate-spin text-cyan-500" size={40} />
      <p className="text-cyan-100/50 text-[10px] font-black uppercase tracking-[0.3em]">YOU&ME wird synchronisiert...</p>
    </div>
  );

  if (!user) return <div className="text-white text-center p-20 font-black italic uppercase tracking-widest">Profil nicht gefunden.</div>;

  const isOwnProfile = session?.user?.id === userId;
  const isFriend = user.friendshipStatus === "ACCEPTED";
  const isPending = user.friendshipStatus === "PENDING";
  const canSeeContent = isOwnProfile || isFriend;

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 space-y-10 animate-in fade-in duration-1000 text-white no-scrollbar">
      
      {/* 1. HEADER CARD (Identity) */}
      <div className="relative bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-48 h-48 rounded-[50px] bg-slate-900 border-2 border-white/10 shadow-2xl overflow-hidden group">
            {user.image ? (
              <img src={user.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl font-black text-white/5 bg-slate-800 uppercase italic">{user.name?.charAt(0)}</div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
             <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-[0.4em] italic">
                  {isOwnProfile ? "Active Identity" : "Member Profile"}
                </span>
             </div>
             <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white leading-none">{user.name}</h1>
             <p className="text-cyan-500/40 text-[9px] font-black uppercase tracking-[0.6em] mt-4 flex items-center justify-center md:justify-start gap-3">
               <span className="w-8 h-[1px] bg-cyan-500/20"></span> Established User
             </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[240px]">
            {isOwnProfile ? (
              <Link href="/settings/profile" className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 hover:text-slate-950 transition-all flex items-center justify-center gap-3">
                <Settings size={16} /> Configuration
              </Link>
            ) : isFriend ? (
              <Link 
                href={`/dashboard?chat=${userId}`} 
                className="w-full py-5 bg-cyan-500 text-slate-950 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20"
              >
                <MessageSquare size={16} fill="currentColor" /> Open Chat
              </Link>
            ) : isPending ? (
              <div className="w-full py-5 bg-white/5 border border-white/5 text-white/30 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 italic">
                <Clock size={16} /> Pending
              </div>
            ) : (
              <button 
                onClick={handleAddFriend} 
                disabled={requestLoading}
                className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {requestLoading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                Add Connection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. VISUAL MOMENTS CARD (Bilder) */}
      <div className={cn(
        "bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-10 relative overflow-hidden",
        !canSeeContent && "opacity-40"
      )}>
        {!canSeeContent && <LockOverlay />}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]"><ImageIcon size={22} /></div>
          <div>
            <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Visual <span className="text-cyan-500">Moments</span></h3>
            <p className="text-cyan-500/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic">Personal Gallery</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[user.image1, user.image2, user.image3].map((content, i) => {
            const embedUrl = getEmbedUrl(content);
            return (
              <div key={i} className="aspect-square rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden relative group">
                {content ? (
                  embedUrl ? (
                    <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
                  ) : (
                    <img src={content} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-white/5" size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SOUNDTRACK SLOTS CARD (Videos/Music) */}
      <div className={cn(
        "bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-10 relative overflow-hidden",
        !canSeeContent && "opacity-40"
      )}>
        {!canSeeContent && <LockOverlay />}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"><Music size={22} /></div>
          <div>
            <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Soundtrack <span className="text-rose-500">Slots</span></h3>
            <p className="text-rose-500/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic">Audio & Video Collection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[user.song1, user.song2, user.song3].map((url, i) => {
            const embedUrl = getEmbedUrl(url);
            return (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-video rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden relative group">
                  {embedUrl ? (
                    <iframe 
                      src={embedUrl}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : url?.includes("cloudinary") ? (
                     <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-rose-500/10 to-transparent">
                        <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                          <Play fill="black" size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-rose-500">Audio Upload 0{i+1}</span>
                        <audio controls className="h-8 w-[80%] opacity-40 hover:opacity-100 transition-opacity">
                          <source src={url} type="audio/mpeg" />
                        </audio>
                     </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="text-white/5" size={40} />
                    </div>
                  )}
                </div>
                <div className="px-6 flex items-center justify-between">
                   <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Track 0{i+1}</span>
                   {url && <Sparkles size={12} className="text-rose-500/30" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Kleine Hilfskomponente für den Lock-Status
const LockOverlay = () => (
  <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm bg-slate-950/10">
    <div className="bg-slate-900/90 border border-white/10 p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 text-center scale-90 md:scale-100">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500"><Lock size={28} /></div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-white italic">Protected Content</p>
        <p className="text-[9px] font-bold text-white/30 uppercase mt-1">Friends Only</p>
      </div>
    </div>
  </div>
);