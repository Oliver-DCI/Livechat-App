"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Save, 
  Music, 
  Video, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  KeyRound,
  ImageIcon
} from "lucide-react";
import MediaUpload from "@/components/MediaUpload";

// --- PASSWORT MODAL ---
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
      if (res.ok) await signOut({ callbackUrl: "/login" });
      else {
        const data = await res.json();
        setError(data.message || "Fehler beim Ändern");
      }
    } catch (err) { setError("Serverfehler"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/5 p-10 rounded-[50px] max-w-md w-full shadow-2xl space-y-8 relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-rose-600 relative z-10 text-center">
          <div className="p-4 bg-rose-600/10 border border-rose-600/20 rounded-3xl shadow-[0_0_20px_rgba(225,29,72,0.1)]"><KeyRound size={28} /></div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Security <span className="text-rose-600">Reset</span></h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input type="password" placeholder="Altes Passwort" required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-rose-600/50 transition-all" onChange={e => setPassData(prev => ({...prev, oldPassword: e.target.value}))} />
          <input type="password" placeholder="Neues Passwort" required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-rose-600/50 transition-all" onChange={e => setPassData(prev => ({...prev, newPassword: e.target.value}))} />
          {error && <p className="text-rose-600 text-[11px] font-bold uppercase text-center">{error}</p>}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Abbrechen</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-rose-600 hover:bg-rose-500 text-white px-8 py-5 rounded-2xl text-xs font-black uppercase transition-all shadow-lg shadow-rose-600/10">{loading ? <Loader2 className="animate-spin" size={18} /> : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", image: "",
    image1: "", image2: "", image3: "", image4: "",
    video1: "", video2: "", video3: "", video4: "",
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
            image4: data.image4 || "",
            video1: data.video1 || "", 
            video2: data.video2 || "", 
            video3: data.video3 || "", 
            video4: data.video4 || "",
          });
        }
      } catch (error) { console.error("Ladefehler:", error); }
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
        await update({ ...session, user: { ...session?.user, name: formData.name, image: formData.image } });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) { console.error("Update Fehler:", error); } finally { setLoading(false); }
  };

  const filledVideosCount = [formData.video1, formData.video2, formData.video3, formData.video4].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 animate-in fade-in duration-700">
      <PasswordModal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 rounded-full">
            <Sparkles size={12} className="text-cyan-400" />
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.2em]">Personal Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Profile <span className="text-cyan-500">Config</span>
          </h1>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-xl border border-emerald-500/20 animate-in zoom-in">
            <CheckCircle2 size={16} /> 
            <span className="text-[10px] font-black uppercase tracking-widest italic">Success: Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- IDENTITY BOX --- */}
        <div className="relative group/master">
            {/* OUTER GLOW */}
            <div className="absolute -inset-1 bg-cyan-400/0 group-hover/master:bg-cyan-400/5 blur-xl rounded-[40px] transition-all duration-500 -z-10" />
            
            <div className="bg-slate-950/40 backdrop-blur-3xl p-6 rounded-[40px] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all duration-500 group-hover/master:border-cyan-500/30">
                {/* SHINE SWEEP EFFECT */}
                <div className="absolute inset-0 opacity-0 group-hover/master:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover/master:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg]" />
                </div>

                <div className="relative group/avatar">
                    <div className="w-32 h-32 rounded-[35px] overflow-hidden bg-slate-900 border-2 border-white/5 group-hover/avatar:border-cyan-500/40 transition-all duration-700 shadow-xl relative z-10">
                        <MediaUpload 
                            value={formData.image} 
                            onChange={(url) => setFormData(prev => ({...prev, image: url}))}
                            onRemove={() => setFormData(prev => ({...prev, image: ""}))}
                        />
                    </div> 
                </div>

                <div className="flex-1 w-full space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-cyan-400/60 uppercase ml-2 tracking-widest italic">Master Identity</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                className="w-full h-[56px] bg-white/[0.03] border border-white/5 rounded-2xl px-5 text-white text-sm font-black italic focus:border-cyan-500/50 outline-none transition-all shadow-inner"
                                placeholder="Username..."
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <button 
                                type="button" 
                                onClick={() => setIsPassModalOpen(true)} 
                                className="flex items-center justify-between h-[56px] px-5 bg-rose-600/5 border border-rose-600/10 rounded-2xl group/pass hover:bg-rose-600/10 transition-all"
                            >
                                <div className="flex items-center gap-3 text-rose-600">
                                    <KeyRound size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Security Lock</span>
                                </div>
                                <span className="text-[8px] font-bold text-rose-600/40 uppercase italic group-hover/pass:text-rose-600 transition-colors">Edit Password</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* --- VISUAL MOMENTS BOX --- */}
          <div className="relative group/visual">
            <div className="absolute -inset-1 bg-cyan-400/0 group-hover/visual:bg-cyan-400/5 blur-xl rounded-[40px] transition-all duration-500 -z-10" />
            
            <div className="bg-slate-950/40 backdrop-blur-3xl p-6 rounded-[40px] border border-white/5 shadow-2xl flex flex-col space-y-6 relative overflow-hidden transition-all duration-500 group-hover/visual:border-cyan-500/30 h-full">
                {/* SHINE SWEEP */}
                <div className="absolute inset-0 opacity-0 group-hover/visual:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover/visual:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg]" />
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500"><ImageIcon size={20} /></div>
                        <div>
                            <h3 className="text-white font-black uppercase italic tracking-widest text-base">Visual <span className="text-cyan-500">Moments</span></h3>
                            <p className="text-[9px] italic font-black text-cyan-400/60 uppercase tracking-widest">Gallery Slots</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-40">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="h-40 group relative">
                            <MediaUpload 
                                value={(formData as any)[`image${num}`]} 
                                onChange={(url) => setFormData(prev => ({...prev, [`image${num}`]: url}))}
                                onRemove={() => setFormData(prev => ({...prev, [`image${num}`]: ""}))} 
                            />
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* --- SOUND & REELS BOX --- */}
          <div className="relative group/sound">
            <div className="absolute -inset-1 bg-rose-600/0 group-hover/sound:bg-rose-600/5 blur-xl rounded-[40px] transition-all duration-500 -z-10" />
            
            <div className="bg-slate-950/40 backdrop-blur-3xl p-6 rounded-[40px] border border-white/5 shadow-2xl flex flex-col space-y-6 relative overflow-hidden transition-all duration-500 group-hover/sound:border-rose-600/30 h-full">
                {/* SHINE SWEEP */}
                <div className="absolute inset-0 opacity-0 group-hover/sound:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover/sound:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg]" />
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-600/20 border border-rose-600/30 rounded-xl text-rose-600">
                            <Music size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase italic tracking-widest text-base">Sound & <span className="text-rose-600">Reels</span></h3>
                            <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">YouTube Integration</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter italic">{filledVideosCount} / 4</span>
                    </div>
                </div>

                <div className="space-y-2.5 overflow-y-auto pr-2 max-h-[400px] no-scrollbar relative z-40">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1.5 group/slot hover:border-rose-600/30 transition-all duration-500">
                            <label className="text-[8px] font-black text-rose-600 uppercase tracking-widest ml-1">
                                YouTube Video {num}
                            </label>
                            <div className="relative group/vid">
                                <Video size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/vid:text-rose-600 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={(formData as any)[`video${num}`]}
                                    onChange={e => setFormData(prev => ({...prev, [`video${num}`]: e.target.value}))}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2 pl-11 pr-4 text-[10px] font-medium text-white outline-none focus:border-rose-600/30 transition-all"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* --- SYNC BUTTON BOX --- */}
        <div className="pt-2 group/btnbox relative">
          <div className="absolute -inset-1 bg-cyan-400/0 group-hover/btnbox:bg-cyan-400/5 blur-xl rounded-[30px] transition-all duration-500 -z-10" />
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-950/60 border-2 border-white/5 p-6 rounded-[30px] hover:border-cyan-500/50 transition-all duration-500 flex items-center justify-center gap-4 group/btn active:scale-[0.98] relative overflow-hidden"
          >
            {/* SHINE SWEEP */}
            <div className="absolute inset-0 opacity-0 group-hover/btnbox:opacity-100 transition-opacity duration-1000 z-30 pointer-events-none">
                <div className="absolute inset-0 translate-x-[-100%] group-hover/btnbox:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg]" />
            </div>

            {loading ? (
              <Loader2 className="animate-spin text-cyan-400" size={24} />
            ) : (
              <>
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover/btn:scale-110 transition-transform duration-500 relative z-40"><Save size={20} /></div>
                <div className="flex flex-col items-start relative z-40">
                  <span className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Sync Profile</span>
                  <span className="text-[8px] font-black text-cyan-500/50 uppercase tracking-[0.4em] mt-1">Push updates to cloud</span>
                </div>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}