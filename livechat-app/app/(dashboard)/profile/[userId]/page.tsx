"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Music, 
  ImageIcon, 
  Loader2, 
  Lock,
  UserPlus,
  Clock,
  Settings,
  MessageSquare,
  Sparkles,
  Users,
  History,
  Zap,
  Trash2,
  AlertCircle 
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

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // VERBESSERTER YOUTUBE EXTRACTOR
  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string' || url.trim() === "") return null;
    
    // Erkennt ID aus: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  const openDeleteModal = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/delete?id=${postToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setUser((prev: any) => ({
          ...prev,
          posts: prev.posts.filter((p: any) => p.id !== postToDelete)
        }));
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Löschfehler:", err);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
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

  if (!user) return <div className="text-white text-center p-20 font-black italic uppercase tracking-widest text-white/20">Profil nicht gefunden.</div>;

  // --- LOGIK-ERWEITERUNG: ADMIN BYPASS ---
  const isOwnProfile = session?.user?.id === userId;
  const isFriend = user.friendshipStatus === "ACCEPTED";
  const isPending = user.friendshipStatus === "PENDING";
  // Hier prüfen wir auf die isAdmin Eigenschaft aus deiner auth.ts
  const isAdmin = (session?.user as any)?.isAdmin === true || (session?.user as any)?.role === "ADMIN";
  
  // Der Admin darf den Content sehen, auch wenn er kein Freund ist
  const canSeeContent = isOwnProfile || isFriend || isAdmin;

  const filteredPosts = user.posts?.filter((post: any) => {
    if (post.type === "IMAGE_UPDATE" || post.type === "PROFILE_UPDATE") return false;
    const c = post.content?.toLowerCase() || "";
    return !(c.includes("aktualisiert") || c.includes("profilbild") || c.includes("aufgefrischt") || c.includes("hinzugefügt"));
  }) || [];

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 space-y-8 animate-in fade-in duration-1000 text-white relative">
      
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => !isDeleting && setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900/90 border border-violet-500/30 rounded-[40px] p-10 shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 blur-[80px] rounded-full" />
             <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-fuchsia-600/10 blur-[80px] rounded-full" />
             
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="p-5 bg-violet-500/10 border border-violet-500/20 rounded-3xl text-violet-400 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                   <AlertCircle size={32} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Moment <span className="text-violet-500">löschen?</span></h3>
                <p className="text-[10px] text-violet-100/40 uppercase font-black tracking-[0.3em] leading-relaxed mb-10 px-4">
                  Dieser digitale Fußabdruck wird permanent aus deiner Timeline entfernt.
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isDeleting ? <Loader2 className="animate-spin" size={14} /> : "Final Bestätigen"}
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="w-full py-4 text-white/30 font-black uppercase text-[9px] tracking-widest hover:text-white transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="relative bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[50px] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] group/header">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-[40px] bg-slate-900 border-2 border-white/10 shadow-2xl overflow-hidden group shrink-0 transition-all duration-500 group-hover/header:border-cyan-500/50">
            {user.image ? (
              <img src={user.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white/5 bg-slate-800 uppercase italic">{user.name?.charAt(0)}</div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
             <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-[0.4em] italic">
                  {isAdmin ? "Admin Access" : isOwnProfile ? "Active Identity" : "Member Profile"}
                </span>
             </div>
             <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none group-hover/header:text-cyan-50 transition-colors">{user.name}</h1>
             <p className="text-cyan-500/40 text-[9px] font-black uppercase tracking-[0.6em] mt-3 flex items-center justify-center md:justify-start gap-3">
               <span className="w-6 h-[1px] bg-cyan-500/20 group-hover/header:w-12 transition-all"></span> Established User
             </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[220px]">
            {isOwnProfile ? (
              <Link href="/settings/profile" className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-3">
                <Settings size={14} /> Configuration
              </Link>
            ) : isFriend ? (
              <Link href={`/dashboard?chat=${userId}`} className="w-full py-4 bg-cyan-500 text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20">
                <MessageSquare size={14} fill="currentColor" /> Open Chat
              </Link>
            ) : isPending ? (
              <div className="w-full py-4 bg-white/5 border border-white/5 text-white/30 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 italic">
                <Clock size={14} /> Pending
              </div>
            ) : (
              <button onClick={handleAddFriend} disabled={requestLoading} className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                {requestLoading ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                Add Connection
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* VISUAL MOMENTS */}
          <div className={cn("bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[50px] p-8 relative overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]", !canSeeContent && "opacity-40")}>
            {!canSeeContent && <LockOverlay />}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"><ImageIcon size={22} /></div>
              <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Visual <span className="text-cyan-500">Moments</span></h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[user.image1, user.image2, user.image3, user.image4].map((img, i) => (
                <div key={i} className="aspect-square rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden relative shadow-2xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] group/img">
                  {img ? (
                    <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5 font-black italic uppercase text-[10px] tracking-widest">Slot 0{i+1}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SOUNDTRACK / VIDEO LINKS */}
          <div className={cn("bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[50px] p-8 relative overflow-hidden transition-all duration-500 hover:border-rose-500/40 hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]", !canSeeContent && "opacity-40")}>
            {!canSeeContent && <LockOverlay />}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]"><Music size={22} /></div>
              <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Soundtrack <span className="text-rose-500">Links</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[user.video1, user.video2, user.video3, user.video4].map((url, i) => {
                const embedUrl = getEmbedUrl(url);
                return (
                  <div key={i} className="aspect-video rounded-[30px] bg-slate-900 border border-white/10 overflow-hidden relative shadow-2xl transition-all duration-500 hover:border-rose-500/60 hover:shadow-[0_0_35px_rgba(244,63,94,0.3)] group/song">
                    {embedUrl ? (
                      <iframe 
                        src={embedUrl} 
                        className="w-full h-full opacity-80 group-hover/song:opacity-100 transition-all border-0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/5 font-black italic uppercase text-[10px] tracking-widest gap-2 bg-slate-950/20">
                        <Music size={16} className="opacity-10" />
                        Empty Slot 0{i+1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISCOVERY FEED */}
          <div className={cn("space-y-8 relative", !canSeeContent && "opacity-40")}>
            {!canSeeContent && <LockOverlay />}
            <div className="pt-12 pb-4">
              <div className="flex items-center gap-6 px-4">
                <div className="p-4 bg-violet-600 border border-violet-400 rounded-[25px] text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                  <History size={28} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-3xl font-black uppercase italic tracking-[0.2em] text-white leading-none">
                    Discovery <span className="text-violet-500">Feed</span>
                  </h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.5em] mt-2 italic flex items-center gap-2">
                    <Zap size={10} className="text-violet-500" /> Digital Timeline & Memories
                  </p>
                </div>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-violet-500 to-transparent opacity-20 ml-4" />
              </div>
            </div>
            
            {filteredPosts.map((post: any) => {
              const postImages = Array.isArray(post.images) ? post.images : (typeof post.images === 'string' ? JSON.parse(post.images || "[]") : []);
              const postVids = Array.isArray(post.youtubeLinks) ? post.youtubeLinks : (typeof post.youtubeLinks === 'string' ? JSON.parse(post.youtubeLinks || "[]") : []);
              const totalMedia = postImages.length + postVids.length;

              return (
                <div key={post.id} className="group/post bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 hover:border-violet-500/50 hover:shadow-[0_0_45px_rgba(139,92,246,0.2)] transition-all duration-500 overflow-hidden relative shadow-2xl">
                  
                  {isOwnProfile && (
                    <button 
                      onClick={() => openDeleteModal(post.id)}
                      className="absolute top-6 right-6 p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 opacity-0 group-hover/post:opacity-100 transition-all hover:bg-violet-600 hover:text-white z-20 active:scale-90 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/post:opacity-20 transition-opacity">
                      <Sparkles className="text-violet-500" size={40} />
                  </div>

                  {post.content && (
                    <div className="relative z-10 mb-6">
                       <p className="text-[15px] text-white/90 leading-relaxed font-medium italic border-l-2 border-violet-500/30 pl-4">
                         "{post.content}"
                       </p>
                    </div>
                  )}

                  {totalMedia > 0 && (
                    <div className={cn("grid gap-3 mb-6 relative z-10", totalMedia === 1 ? "grid-cols-1" : "grid-cols-2")}>
                      {postImages.map((img: string, idx: number) => (
                        <div key={`img-${idx}`} className="aspect-square relative overflow-hidden rounded-3xl border border-white/10 group/media bg-slate-900">
                          <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" alt="" />
                        </div>
                      ))}
                      {postVids.map((link: string, idx: number) => {
                        const embedUrl = getEmbedUrl(link);
                        return embedUrl ? (
                          <div key={`vid-${idx}`} className="aspect-square relative rounded-3xl border border-white/10 overflow-hidden bg-black">
                            <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{new Date(post.createdAt).toLocaleDateString('de-DE')}</span>
                        <span className="text-[7px] text-violet-400 font-bold uppercase tracking-tighter">Verified Content</span>
                     </div>
                     {post.comments?.length > 0 && (
                       <span className="text-[7px] text-white/20 font-black uppercase tracking-widest flex items-center gap-1">
                         <MessageSquare size={8} /> {post.comments.length} Discussion Logs
                       </span>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN - NETWORK CIRCLE */}
        <div className="lg:col-span-4">
          <div className={cn(
            "bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[50px] p-8 sticky top-8 max-h-[85vh] flex flex-col shadow-2xl transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,182,129,0.2)]", 
            !canSeeContent && "opacity-40"
          )}>
            {!canSeeContent && <LockOverlay />}
            <div className="flex items-center gap-4 mb-8 shrink-0">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-[0_0_15px_rgba(16,182,129,0.2)]"><Users size={22} /></div>
              <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Network <span className="text-emerald-500">Circle</span></h3>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar">
              {user.friends && user.friends.length > 0 ? (
                user.friends.map((friend: any) => (
                  <div key={friend.id} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-[30px] hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all duration-500 group shadow-lg">
                    <Link href={`/profile/${friend.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-[20px] bg-slate-800 overflow-hidden shrink-0 border border-white/10 group-hover:border-emerald-500 transition-colors">
                        <img src={friend.image || "/api/placeholder/48/48"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-white uppercase truncate italic group-hover:text-emerald-50 transition-colors">{friend.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full", friend.isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-white/10")} />
                          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{friend.isOnline ? "Active" : "Away"}</span>
                        </div>
                      </div>
                    </Link>
                    <Link href={`/dashboard?chat=${friend.id}`} className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-[20px] hover:bg-emerald-500 hover:text-slate-950 transition-all shadow-xl active:scale-90">
                      <MessageSquare size={16} fill="currentColor" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center opacity-20 italic text-[10px] uppercase font-black tracking-widest">No Connections</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LockOverlay = () => (
  <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-xl bg-slate-950/40">
    <div className="bg-slate-900/80 border border-white/10 p-10 rounded-[50px] shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col items-center gap-4 text-center">
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[25px] text-rose-500 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.3)]">
        <Lock size={28} />
      </div>
      <div>
        <p className="text-[14px] font-black uppercase tracking-[0.4em] text-white italic">Protected</p>
        <p className="text-[8px] text-white/30 uppercase mt-2 font-bold tracking-widest">Establish friendship to unlock</p>
      </div>
    </div>
  </div>
);