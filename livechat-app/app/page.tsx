"use client";

import Link from 'next/link';
import { Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950 selection:bg-cyan-500 selection:text-white">
      
      {/* DYNAMISCHER HINTERGRUND (Vibrant Flow - wie Login Page) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10 animate-vibrant-flow bg-[length:400%_400%]" />
      
      {/* Animierte Hintergrund-Elemente (Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-cyan-500/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[800px] h-[800px] bg-indigo-500/20 blur-[150px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>

      {/* CONTENT CONTAINER */}
      <div className="z-10 text-center px-6 max-w-5xl animate-in fade-in zoom-in duration-1000">
        
        {/* BRANDING LOGO BEREICH */}
        <div className="mb-12 inline-block group">
          <div className="flex items-center justify-center gap-3 mb-4 text-cyan-400">
             <div className="h-[1px] w-8 bg-cyan-500/50" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em]">Digital Experience 2026</span>
             <div className="h-[1px] w-8 bg-cyan-500/50" />
          </div>
          
          <h1 className="text-8xl md:text-[11rem] font-black text-white tracking-tighter leading-none mb-2 italic drop-shadow-2xl">
            YOU<span className="text-cyan-400 not-italic">&</span>ME
          </h1>
          
          <p className="text-sm font-black text-white/40 uppercase tracking-[0.5em] mt-6 flex items-center justify-center gap-2">
            <Zap size={14} className="text-cyan-500 fill-cyan-500" />
            Livechat Messenger
          </p>
        </div>
        
        {/* TEXT BEREICH */}
        <div className="space-y-6 mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Echtzeit-Verbindung. <br /> 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
              Dein Moment, jetzt geteilt.
            </span>
          </h2>
          
          <p className="text-lg md:text-2xl text-cyan-100/60 leading-relaxed max-w-2xl mx-auto font-medium">
            Entdecke Profile, höre die Musik deiner Freunde und chatte ohne Grenzen.
          </p>
        </div>

        {/* BUTTON BEREICH */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/register" 
            className="group relative w-full sm:w-auto px-14 py-6 bg-white text-slate-950 font-black rounded-full transition-all shadow-[0_20px_60px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/50 text-xl uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
          >
            Jetzt starten <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-14 py-6 bg-white/5 border-2 border-white/10 hover:border-cyan-400 text-white font-black rounded-full transition-all backdrop-blur-xl text-xl uppercase tracking-widest hover:bg-white/10 active:scale-95 text-center"
          >
            Anmelden
          </Link>
        </div>
      </div>

      {/* FOOTER BEREICH */}
      <div className="absolute bottom-10 flex flex-col items-center gap-6 z-10 w-full">
        <div className="flex items-center justify-center gap-4 md:gap-8 font-black text-[9px] uppercase tracking-[0.4em]">
          <span className="flex items-center gap-2 text-cyan-400"><Sparkles size={12} className="text-cyan-500" /> Einfach</span>
          <div className="h-1 w-1 bg-white/20 rounded-full" />
          <span className="flex items-center gap-2 text-cyan-400"><Zap size={12} className="text-cyan-500" /> Schnell</span>
          <div className="h-1 w-1 bg-white/20 rounded-full" />
          <span className="flex items-center gap-2 text-cyan-400"><Shield size={12} className="text-cyan-500" /> Sicher</span>
        </div>
        <p className="text-[10px] text-white/40 font-black tracking-[0.6em] uppercase">
          © 2026 <span className="text-white">YOU&ME</span> PLATFORM
        </p>
      </div>
    </main>
  );
}