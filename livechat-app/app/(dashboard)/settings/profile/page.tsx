"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { 
  Save, 
  User as UserIcon, 
  Music, 
  Trash2, 
  Video, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Camera, 
  KeyRound 
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import { cn } from "@/lib/utils";

// --- MODAL KOMPONENTE FÜR PASSWORTÄNDERUNG ---
const PasswordModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/users/update-password", {
        method: "POST",
        body: JSON.stringify(passData),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        await signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        setError(data.message || "Fehler beim Ändern des Passworts");
      }
    } catch (err) {
      setError("Serverfehler. Bitte später versuchen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/5 p-10 rounded-[50px] max-w-md w-full shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full" />
        <div className="flex flex-col items-center gap-4 text-rose-500 relative z-10 text-center">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <KeyRound size={28} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Security <span className="text-rose-500">Reset</span></h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 relative z-10">
          <input 
            type="password" 
            placeholder="Altes Passwort"
            required
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-rose-500/50 transition-all shadow-inner"
            onChange={e => setPassData(prev => ({...prev, oldPassword: e.target.value}))}
          />
          <input 
            type="password" 
            placeholder="Neues Passwort"
            required
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-rose-500/50 transition-all shadow-inner"
            onChange={e => setPassData(prev => ({...prev, newPassword: e.target.value}))}
          />
          {error && <p className="text-rose-500 text-[11px] font-bold uppercase text-center">{error}</p>}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Abbrechen</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white px-8 py-5 rounded-2xl text-xs font-black uppercase transition-all shadow-lg shadow-rose-500/10">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- HAUPTSEITE ---
export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    image1: "", image2: "", image3: "",
    song1: "", song2: "", song3: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = (session?.user as any)?.id;
        if (!userId) return;

        const res = await fetch(`/api/users/profile?id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            image: data.image || "",
            image1: data.image1 || "",
            image2: data.image2 || "",
            image3: data.image3 || "",
            song1: data.song1 || "",
            song2: data.song2 || "",
            song3: data.song3 || "",
          });
        }
      } catch (error) {
        console.error("Profil-Ladefehler:", error);
      }
    };
    fetchUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PATCH",
        body: JSON.stringify({ ...formData, userId: (session?.user as any)?.id }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.ok) {
        setSaved(true);
        await update({
          ...session,
          user: { ...session?.user, name: formData.name, image: formData.image }
        });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Update Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 no-scrollbar">
      <PasswordModal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <UserIcon className="text-cyan-400" size={32} />
            </div>
            Profile <span className="text-cyan-500">Setup</span>
          </h1>
          <p className="text-cyan-500/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2 flex items-center gap-3">
            <span className="w-12 h-[1px] bg-cyan-500/20"></span> Customize Identity
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-full border border-emerald-500/20 shadow-lg animate-in zoom-in duration-300">
            <CheckCircle2 size={18} /> 
            <span className="text-[10px] font-black uppercase tracking-widest italic">Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* ROW 1: Identity & Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* IDENTITY CARD */}
          <div className="lg:col-span-4 bg-slate-950/40 backdrop-blur-3xl p-10 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-fit">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full" />
            
            <div className="relative z-10 space-y-8">
              <h3 className="text-cyan-500/50 text-[9px] font-black uppercase tracking-[0.4em] italic">Identity</h3>
              
              <div className="flex flex-col items-center gap-8">
                <div className="relative group/avatar">
                  <div className="w-40 h-40 rounded-[45px] overflow-hidden bg-slate-900 border-2 border-white/5 group-hover/avatar:border-cyan-500/40 transition-all duration-700 shadow-2xl relative z-10">
                    <MediaUpload 
                      type="image"
                      value={formData.image} 
                      onChange={(url) => setFormData(prev => ({...prev, image: url}))}
                      onRemove={() => setFormData(prev => ({...prev, image: ""}))}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-cyan-500 p-3 rounded-2xl text-slate-950 shadow-xl border-[6px] border-[#0f172a] z-20">
                     <Upload size={18} />
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-cyan-400/60 uppercase ml-2 tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white font-bold focus:border-cyan-500/50 outline-none transition-all shadow-inner"
                      placeholder="Username..."
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => setIsPassModalOpen(true)}
                    className="w-full h-[52px] flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl group/pass hover:bg-rose-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3 text-rose-500">
                      <KeyRound size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Security</span>
                    </div>
                    <span className="text-[9px] font-bold text-rose-500/40 group-hover/pass:text-rose-500 transition-colors uppercase italic">Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GALLERY CARD */}
          <div className="lg:col-span-8 bg-slate-950/40 backdrop-blur-3xl p-10 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-full">
            <h3 className="text-cyan-500/50 text-[9px] font-black uppercase tracking-[0.4em] mb-8 italic">Visual Moments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              <div className="md:col-span-2 h-[270px] rounded-[40px] overflow-hidden bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 transition-all duration-700 group relative">
                <div className="absolute top-4 left-6 z-20">
                    <span className="text-[8px] font-black text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-400/20">Featured</span>
                </div>
                <MediaUpload 
                  type="image"
                  value={formData.image1} 
                  onChange={(url) => setFormData(prev => ({...prev, image1: url}))}
                  onRemove={() => setFormData(prev => ({...prev, image1: ""}))} 
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
                <div className="md:h-[123px] rounded-[35px] overflow-hidden bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all duration-700 group shadow-lg">
                  <MediaUpload 
                    type="image"
                    value={formData.image2} 
                    onChange={(url) => setFormData(prev => ({...prev, image2: url}))}
                    onRemove={() => setFormData(prev => ({...prev, image2: ""}))} 
                  />
                </div>
                <div className="md:h-[123px] rounded-[35px] overflow-hidden bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all duration-700 group shadow-lg">
                  <MediaUpload 
                    type="image"
                    value={formData.image3} 
                    onChange={(url) => setFormData(prev => ({...prev, image3: url}))}
                    onRemove={() => setFormData(prev => ({...prev, image3: ""}))} 
                  />
                </div>
              </div>
            </div>

            {/* INFO-LEISTE */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[52px] p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-cyan-500">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Visibility</span>
                </div>
                <span className="text-[9px] font-bold text-white uppercase italic">Friends Only</span>
              </div>
              
              <div className="h-[52px] p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400">
                  <Camera size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Formats</span>
                </div>
                <span className="text-[9px] font-bold text-slate-100 uppercase italic tracking-tighter">JPG, PNG, GIF</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Soundtrack Slots */}
        <div className="bg-slate-950/40 backdrop-blur-3xl p-10 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"><Music size={24} /></div>
            <div>
              <h3 className="text-white font-black uppercase italic tracking-widest text-lg">Soundtrack <span className="text-rose-500">Slots</span></h3>
              <p className="text-cyan-500/50 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic">Audio Uploads & Video Links</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => {
              const fieldName = `song${num}` as keyof typeof formData;
              const currentVal = formData[fieldName];
              const isCloudinary = currentVal?.includes("cloudinary");

              return (
                <div key={num} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-6 space-y-6 hover:border-rose-500/30 transition-all duration-500 group shadow-xl">
                  <span className="text-[10px] font-black text-rose-500/40 uppercase tracking-[0.2em] px-2">Track 0{num}</span>
                  <div className="h-28 rounded-[30px] overflow-hidden bg-slate-950 border border-white/5 group-hover:bg-black/40 transition-colors shadow-inner">
                    <MediaUpload 
                      type="audio"
                      value={isCloudinary ? currentVal : ""} 
                      onChange={(url) => setFormData(prev => ({...prev, [fieldName]: url}))}
                      onRemove={() => setFormData(prev => ({...prev, [fieldName]: ""}))}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50"><Video size={16} /></div>
                    <input 
                      type="text" 
                      placeholder="YouTube URL..."
                      value={currentVal || ""}
                      onChange={e => setFormData(prev => ({...prev, [fieldName]: e.target.value}))}
                      className={cn(
                        "w-full bg-white/[0.02] border rounded-2xl py-4 pl-12 pr-4 text-[11px] text-white outline-none font-bold tracking-tight",
                        !isCloudinary && currentVal ? "border-rose-500/40 bg-rose-500/5" : "border-white/5 focus:border-rose-500/30"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINAL SAVE BUTTON */}
        <div className="pt-6 relative group">
          <div className="absolute -inset-1 bg-cyan-500/20 rounded-[40px] blur opacity-10 group-hover:opacity-60 transition duration-1000 group-hover:duration-300"></div>
          <button 
            type="submit" 
            disabled={loading}
            className="relative w-full bg-slate-900/40 border border-white/5 text-white font-black uppercase py-8 rounded-[40px] hover:border-cyan-400 hover:bg-cyan-600 hover:text-slate-950 hover:scale-[1.01] transition-all duration-300 shadow-2xl flex items-center justify-center gap-5 active:scale-[0.98] disabled:opacity-50 group/btn"
          >
            {loading ? (
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            ) : (
              <>
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover/btn:bg-slate-950/20 group-hover/btn:text-slate-950 transition-all duration-300">
                   <Save size={24} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg tracking-tighter leading-none italic group-hover/btn:text-slate-950 transition-colors">Save Configuration</span>
                  <span className="text-[8px] font-black text-cyan-400/60 tracking-[0.4em] uppercase mt-0.5 group-hover/btn:text-slate-950/70">Update YOU&ME Database</span>
                </div>
                <Sparkles className="text-cyan-500/30 group-hover/btn:text-slate-950 transition-colors" size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}