"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // WICHTIG: Wir prüfen das Ergebnis manuell
      });

      // Sicherheits-Abfrage: Wenn NextAuth einen Fehler meldet
      if (result?.error) {
        setError("Ungültige E-Mail oder Passwort.");
        setIsLoading(false);
        return;
      }

      // Nur wenn der Login wirklich erfolgreich war (ok === true)
      if (result?.ok) {
        router.push("/dashboard");
        router.refresh(); 
      }
    } catch (err) {
      setError("Verbindungsfehler zur Datenbank.");
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 p-4">
      
      {/* Hintergrund-Effekte */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10 animate-vibrant-flow bg-[length:400%_400%]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-cyan-500/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>

      <div className="z-10 w-full max-w-[440px]">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[48px] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
          
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
              YOU<span className="text-cyan-400">&</span>ME
            </h1>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Welcome Back</p>
          </div>

          {/* Fehlermeldung */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-[20px] text-rose-400 text-[11px] font-black uppercase tracking-wider text-center animate-in zoom-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                <Mail size={12} /> Email
              </label>
              <input 
                name="email" required type="email" 
                className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="name@beispiel.de"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
                <Lock size={12} /> Passwort
              </label>
              <input 
                name="password" required type="password" 
                className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              disabled={isLoading}
              className="group relative w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-3xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                {isLoading ? "Verbindung..." : "Login bestätigen"}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>

            <div className="text-center pt-4">
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">
                Neu hier?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-white underline underline-offset-8 transition-all ml-1">
                  KONTO ERSTELLEN
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}