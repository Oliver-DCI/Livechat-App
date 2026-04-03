"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, Plus, Trash, Music } from "lucide-react";
import Image from "next/image";

interface MediaUploadProps {
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
  type?: "image" | "audio"; // Unterscheidung für das Icon
}

export default function MediaUpload({ onChange, onRemove, value, type = "image" }: MediaUploadProps) {
  return (
    <div className="w-full">
      <CldUploadWidget 
        onSuccess={(result: any) => onChange(result.info.secure_url)} 
        uploadPreset="livechatapp"
        options={{
          maxFiles: 1,
          resourceType: "auto", // WICHTIG: Erlaubt Bilder UND Musik
          clientAllowedFormats: type === "image" ? ["png", "jpg", "jpeg", "gif"] : ["mp3", "wav"]
        }}
      >
        {({ open }) => {
          return (
            <div 
              onClick={() => open?.()}
              className="relative cursor-pointer hover:bg-white/10 transition border-2 border-dashed border-white/10 bg-white/5 rounded-[25px] h-32 flex flex-col items-center justify-center gap-2 overflow-hidden group"
            >
              {value ? (
                <>
                  <div className="absolute z-10 top-2 right-2">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600 transition shadow-lg"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                  {type === "image" ? (
                    <Image fill src={value} alt="Upload" className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-cyan-400">
                       <Music size={32} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Track bereit</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                    {type === "image" ? <Plus className="text-white/40" size={24} /> : <Music className="text-white/40" size={24} />}
                  </div>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                    {type === "image" ? "Bild hochladen" : "MP3 hochladen"}
                  </span>
                </>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}