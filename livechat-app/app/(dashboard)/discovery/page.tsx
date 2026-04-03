"use client";

import React, { useEffect, useState } from "react";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Search,
  Users,
  PlusCircle,
  Image as ImageIcon,
  Trash2,
  Music,
  Video,
  FileImage,
  Activity
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload"; 
import { PostCard } from "@/components/PostCard"; 
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function DiscoveryPage() {
  const { data: session } = useSession();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState("");
  
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [ytUrl1, setYtUrl1] = useState("");
  const [ytUrl2, setYtUrl2] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = posts.filter(post => 
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.aiAnalysis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async () => {
    if (!content && !image1 && !image2 && !ytUrl1 && !ytUrl2) return;
    setIsSubmitting(true);
    
    const images = [image1, image2].filter(Boolean);
    const youtubeLinks = [ytUrl1, ytUrl2].filter(Boolean);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ content, images, youtubeLinks }), 
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data, ...posts]);
        setContent("");
        setImage1("");
        setImage2("");
        setYtUrl1("");
        setYtUrl2("");
        toast.success("Moment geteilt! ✨");
      }
    } catch (err) {
      toast.error("Fehler beim Posten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
        toast.success("Moment gelöscht");
      }
    } catch (err) {
      toast.error("Löschen fehlgeschlagen");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex items-end justify-between mt-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            Discovery <span className="text-cyan-400">Feed</span>
          </h1>
          <p className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 opacity-80">
            <Sparkles size={12} className="animate-pulse text-cyan-400" /> Connect with the World
          </p>
        </div>
        <button onClick={fetchPosts} className="p-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-cyan-500/20 transition-all text-white active:scale-95">
          <RefreshCw size={18} className={loading ? "animate-spin text-cyan-400" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* CREATE BOX */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-white font-black italic uppercase text-sm tracking-tighter leading-none">Share <span className="text-cyan-400">Moment</span></h3>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">What's on your mind?</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10 flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TEILE DEINEN MOMENT..."
              className="w-full bg-white/[0.05] border border-white/10 focus:border-cyan-400/50 rounded-2xl p-4 focus:outline-none text-[12px] text-cyan-400 font-bold resize-none min-h-[100px] transition-all placeholder:text-[9px] placeholder:text-white/20 uppercase shadow-inner"
            />

            {/* YOUTUBE SECTION */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Music size={10} className="text-red-500" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Upload Musik Youtube</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative group">
                  <input 
                    type="text"
                    value={ytUrl1}
                    onChange={(e) => setYtUrl1(e.target.value)}
                    placeholder="LINK 1..."
                    className="w-full h-10 bg-white/[0.05] border border-white/10 focus:border-red-500/50 rounded-xl px-9 text-[10px] text-white font-bold transition-all placeholder:text-white/20 uppercase"
                  />
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition-colors" size={14} />
                </div>
                <div className="relative group">
                  <input 
                    type="text"
                    value={ytUrl2}
                    onChange={(e) => setYtUrl2(e.target.value)}
                    placeholder="LINK 2..."
                    className="w-full h-10 bg-white/[0.05] border border-white/10 focus:border-red-500/50 rounded-xl px-9 text-[10px] text-white font-bold transition-all placeholder:text-white/20 uppercase"
                  />
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-red-500 transition-colors" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* IMAGE SECTION */}
          <div className="space-y-2 pt-4 mt-auto border-t border-white/5 relative z-10">
            <div className="flex items-center gap-2 px-1">
              <FileImage size={10} className="text-cyan-400" />
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Upload your Moments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center hover:bg-cyan-500/10 transition-all relative overflow-hidden group">
                <MediaUpload value={image1} onChange={(url) => setImage1(url)} onRemove={() => setImage1("")} type="image" />
                {!image1 && <ImageIcon size={16} className="text-white/20 group-hover:text-cyan-400 absolute pointer-events-none transition-colors" />}
              </div>
              <div className="flex-1 h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center hover:bg-cyan-500/10 transition-all relative overflow-hidden group">
                <MediaUpload value={image2} onChange={(url) => setImage2(url)} onRemove={() => setImage2("")} type="image" />
                {!image2 && <ImageIcon size={16} className="text-white/20 group-hover:text-cyan-400 absolute pointer-events-none transition-colors" />}
              </div>
              <button
                onClick={onSubmit}
                disabled={isSubmitting || (!content && !image1 && !image2 && !ytUrl1 && !ytUrl2)}
                className="h-12 px-6 rounded-xl bg-cyan-500 text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all hover:bg-cyan-400 disabled:opacity-20 flex items-center gap-2 shrink-0 shadow-lg active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Post
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-inner">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-white font-black italic uppercase text-sm tracking-tighter leading-none">Live <span className="text-cyan-400">Search</span></h3>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">Smart filtering</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-start mt-1">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">Alle Feeds</span>
              <span className="text-sm font-black text-cyan-400 italic tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                {posts.length.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="relative group/search z-10">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SUCHEN..."
              className="w-full h-14 bg-white/[0.05] border border-white/10 focus:border-cyan-400/50 rounded-2xl p-4 pl-12 focus:outline-none text-[12px] text-cyan-400 font-bold transition-all placeholder:text-[9px] placeholder:text-white/20 uppercase shadow-inner"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-cyan-400 transition-colors" size={18} />
          </div>

          {/* NEW LIVE SEARCH ELEMENTS (Trending) */}
          <div className="mt-6 flex-1 relative z-10">
            <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest italic opacity-50 mb-3">Trending Tags</p>
            <div className="flex flex-wrap gap-2">
              {['Music', 'Vibes', 'Daily', 'Art'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[8px] text-white/40 font-black uppercase hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-[24px] bg-cyan-500/[0.02] border border-white/5 flex items-center gap-3">
               <Activity size={16} className="text-cyan-400 animate-pulse" />
               <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Real-time indexing active</span>
            </div>
          </div>

          {/* TREFFER-ZÄHLER: Unverändert */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-white/30">
               <Users size={14} />
               <span className="text-[9px] uppercase font-black tracking-widest">Treffer im Feed:</span>
            </div>
            {searchQuery.trim().length > 0 ? (
               <span className="text-cyan-400 font-black text-sm drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-in zoom-in duration-300">
                 {filteredPosts.length.toLocaleString()}
               </span>
            ) : (
               <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest italic">Bereit zum Filtern...</span>
            )}
          </div>
        </div>
      </div>

      {/* FEED GRID */}
      <div className="columns-1 md:columns-2 gap-8 space-y-8 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 w-full col-span-full">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-[40px] bg-white/[0.01] w-full break-inside-avoid">
            <p className="text-white/20 uppercase tracking-[0.4em] font-black text-xs italic">Keine Treffer gefunden</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="break-inside-avoid mb-8">
              <PostCard 
                post={post} 
                onDelete={() => setDeleteId(post.id)} 
                currentUserId={(session?.user as any)?.id} 
              />
            </div>
          ))
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => !isDeleting && setDeleteId(null)} />
          <div className="relative bg-[#0f172a] border border-cyan-500/40 rounded-[40px] p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
              <Trash2 className="text-cyan-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white italic uppercase mb-8 tracking-tighter">Moment <span className="text-cyan-400">löschen?</span></h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="w-full py-4 bg-cyan-500 text-slate-950 font-black uppercase text-[11px] rounded-2xl active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-cyan-500/20"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Ja, Entfernen"}
              </button>
              <button onClick={() => setDeleteId(null)} className="w-full py-4 bg-white/5 text-white/40 font-black uppercase text-[11px] rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}