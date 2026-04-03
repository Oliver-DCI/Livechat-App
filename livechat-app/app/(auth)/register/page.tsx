"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      alert("Etwas ist schiefgelaufen. Email schon vergeben?");
    }
    setIsLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 p-4">
      
      {/* Dynamischer Hintergrund (Vibrant Flow) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10 animate-vibrant-flow bg-[length:400%_400%]" />
      
      {/* Animierte Hintergrund-Elemente */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>

      <div className="z-10 w-full max-w-[440px] transition-all duration-500">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[48px] p-10 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden">
          
          {/* Top Glossy Effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
              YOU<span className="text-cyan-400">&</span>ME
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-white/20" />
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Join the Crew</p>
              <span className="h-px w-8 bg-white/20" />
            </div>
          </div>

          {success ? (
            <div className="py-12 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-400/30">
                <UserPlus className="text-cyan-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Willkommen!</h3>
              <p className="text-cyan-100/60 font-medium">Dein Account wird vorbereitet...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                  <User size={12} /> Username
                </label>
                <input 
                  name="name" required type="text" 
                  className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-300"
                  placeholder="Wie sollen wir dich nennen?"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                  <Mail size={12} /> Email
                </label>
                <input 
                  name="email" required type="email" 
                  className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-300"
                  placeholder="name@beispiel.de"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                  <Lock size={12} /> Passwort
                </label>
                <input 
                  name="password" required type="password" 
                  className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                disabled={isLoading}
                className="group relative w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-3xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_-12px_rgba(6,182,212,0.5)] disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                  {isLoading ? "Wird erstellt..." : "Konto erstellen"}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <div className="text-center pt-4">
                <p className="text-white/30 text-[11px] font-bold">
                  Bereits Mitglied?{" "}
                  <Link href="/login" className="text-cyan-400 hover:text-white underline underline-offset-8 transition-all ml-1">
                    JETZT EINLOGGEN
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}