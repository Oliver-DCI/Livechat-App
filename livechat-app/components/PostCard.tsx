"use client";

import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  User, 
  Sparkles, 
  Send, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface PostCardProps {
  post: any;
  onDelete?: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

export const PostCard = ({ post, onDelete, currentUserId, isAdmin }: PostCardProps) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);

  useEffect(() => {
    if (post.comments) setComments(post.comments);
  }, [post.comments]);

  const isOwner = currentUserId === post.userId;

  const getImages = () => {
    if (Array.isArray(post.images) && post.images.length > 0) return post.images;
    if (typeof post.image === "string" && post.image.trim() !== "") {
      if (post.image.includes(",")) return post.image.split(",").filter(Boolean);
      return [post.image];
    }
    if (typeof post.imageUrl === "string" && post.imageUrl.trim() !== "") return [post.imageUrl];
    return [];
  };

  const imageUrls = getImages();
  const youtubeLinks = Array.isArray(post.youtubeLinks) ? post.youtubeLinks : typeof post.youtubeLinks === "string" ? post.youtubeLinks.split(",").filter(Boolean) : [];
  
  const isSystemPost = post.content?.includes("aufgefrischt") || post.type === "SYSTEM";
  const displayAiText = post.aiAnalysis || (isSystemPost ? post.content : null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCommentSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: commentText }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentText("");
        toast.success("Vibe geteilt! ✨");
      }
    } catch (err) { toast.error("Fehler"); } finally { setIsSubmitting(false); }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success("Entfernt");
      }
    } catch (err) { toast.error("Fehler"); }
  };

  const renderComment = (c: any) => {
    const canDeleteComment = currentUserId === c.userId || isAdmin;
    return (
      <div key={c.id} className="flex gap-2 items-start bg-white/5 p-2 rounded-xl border border-white/5 relative group/comment transition-all hover:bg-white/[0.08]">
        <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-cyan-500/30">
          {c.user?.image ? <img src={c.user.image} className="w-full h-full object-cover" alt="" /> : <div className="bg-slate-800 w-full h-full flex items-center justify-center text-white/20"><User size={10} /></div>}
        </div>
        <div className="flex-1 min-w-0 pr-7"> 
          <p className="text-[10px] text-white/70 leading-tight break-words">
            <span className="font-black text-cyan-400 uppercase text-[8px] mr-1">{c.user?.name || "User"}:</span>
            {c.text}
          </p>
        </div>
        {canDeleteComment && (
          <button onClick={() => handleCommentDelete(c.id)} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 transition-all rounded-lg hover:bg-rose-500/10 group/trash relative z-40">
            <Trash2 size={11} className="text-cyan-500/40 group-hover/trash:text-rose-500 transition-colors" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="block group perspective-1000 relative mb-4">
      <div className="absolute -inset-1 bg-cyan-400/0 group-hover:bg-cyan-400/10 blur-xl rounded-[40px] transition-all duration-500 -z-10" />
      <div className={cn("backdrop-blur-2xl border relative overflow-hidden flex flex-col h-full transition-all duration-500", isSystemPost ? "bg-slate-950/40 border-white/10 rounded-[25px] p-4" : "bg-slate-900/60 border-white/15 rounded-[35px] p-5 shadow-2xl hover:border-cyan-400/40")}>
        
        {/* SHINE EFFECT */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg]" />
        </div>

        {/* --- HEADER --- */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <Link href={`/profile/${post.userId}`} className="flex items-center gap-2.5 relative z-40 min-w-0 flex-1">
            <div className={cn("rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 transition-all group-hover:border-cyan-500/50", isSystemPost ? "w-8 h-8" : "w-10 h-10")}>
              {post.user?.image ? <img src={post.user.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><User size={isSystemPost ? 12 : 14} /></div>}
            </div>
            
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className={cn("font-black uppercase tracking-widest text-white leading-none truncate", isSystemPost ? "text-[10px]" : "text-[11px]")}>
                  {post.user?.name || "Unbekannt"}
                </h4>
                <p className="text-[7px] font-bold text-cyan-500/30 uppercase mt-0.5 tracking-tighter">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* RECHTS: NUR NOCH DER KI-TEXT (Badge wurde entfernt) */}
              {isSystemPost && displayAiText && (
                <div className="ml-auto overflow-hidden max-w-[80%]">
                  <p className="text-[10px] text-cyan-400/70 italic leading-none truncate hidden sm:block font-bold">
                    "{displayAiText}"
                  </p>
                </div>
              )}
            </div>
          </Link>
          {(isOwner || isAdmin) && (
            <button onClick={onDelete} className="p-2 rounded-lg bg-rose-500/5 text-rose-500/20 hover:bg-rose-500 hover:text-white transition-all relative z-40 shrink-0 ml-2"><Trash2 size={12} /></button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="relative z-10 space-y-1.5">
          {post.content && !isSystemPost && (
            <div className="mb-3">
              <p className="leading-snug px-1 font-semibold italic text-cyan-100/70 text-[13px] whitespace-pre-wrap line-clamp-3">{post.content}</p>
            </div>
          )}

          {imageUrls.length > 0 && (
            <div className={cn("grid gap-1.5", imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {imageUrls.map((url: string, index: number) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-inner">
                  <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              ))}
            </div>
          )}

          {youtubeLinks.length > 0 && (
            <div className={cn("grid gap-1.5", youtubeLinks.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {youtubeLinks.map((link: string, index: number) => {
                const videoId = getYoutubeId(link);
                if (!videoId) return null;
                return (
                  <div key={index} className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 group/vid shadow-2xl">
                    <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1`} allowFullScreen />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {post.aiAnalysis && !isSystemPost && (
          <div className="mt-2.5 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-xl p-2 relative z-10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles size={8} className="text-cyan-400/60" />
              <span className="text-[7px] font-black uppercase text-cyan-400/60 tracking-widest">AI Analysis</span>
            </div>
            <p className="text-[9px] text-cyan-100/40 italic leading-tight line-clamp-2">"{post.aiAnalysis}"</p>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-white/5 space-y-2 relative z-20">
          {comments.length > 0 && (
            <div className="space-y-2">
              {renderComment(comments[0])}
              {comments.length > 1 && (
                <>
                  {showAllComments && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">{comments.slice(1).map((c) => renderComment(c))}</div>
                  )}
                  <button onClick={() => setShowAllComments(!showAllComments)} className="flex items-center gap-1 text-[9px] font-black uppercase text-cyan-400/60 hover:text-cyan-400 transition-colors pl-1 mt-1 relative z-40">
                    {showAllComments ? <><ChevronUp size={10} /> Zuklappen</> : <><ChevronDown size={10} /> Alle {comments.length} Kommentare</>}
                  </button>
                </>
              )}
            </div>
          )}
          <div className="relative group/input pt-1">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(e)} placeholder="QUICK REPLY..." className="w-full bg-black/40 border border-white/5 rounded-xl py-1.5 px-3 pr-8 text-[9px] text-white focus:border-cyan-500/30 transition-all uppercase font-bold tracking-widest placeholder:text-white/10 outline-none relative z-40" />
            <button onClick={handleCommentSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500/40 hover:text-cyan-400 transition-colors z-50"><Send size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};