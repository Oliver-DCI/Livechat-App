"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, Plus, Trash } from "lucide-react";
import Image from "next/image";

interface MediaUploadProps {
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
  // Wir lassen das Prop hier stehen, damit andere Seiten nicht abstürzen
  type?: "image" | "audio"; 
}

export default function MediaUpload({ 
  onChange, 
  onRemove, 
  value,
  type = "image" // Default bleibt image
}: MediaUploadProps) {
  
  return (
    <div className="w-full h-full">
      <CldUploadWidget 
        onSuccess={(result: any) => onChange(result.info.secure_url)} 
        uploadPreset="livechatapp"
        options={{
          maxFiles: 1,
          resourceType: "image", // Wir erzwingen Bild-Uploads
          clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "webp", "avif"]
        }}
      >
        {({ open }) => {
          return (
            <div 
              onClick={() => open?.()}
              className="relative cursor-pointer transition-all duration-300 border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 rounded-[30px] min-h-[160px] h-full flex flex-col items-center justify-center gap-3 overflow-hidden group"
            >
              {value ? (
                <>
                  <div className="absolute z-20 top-3 right-3 transform scale-90 group-hover:scale-100 transition-transform">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); onRemove(); }}
                      className="bg-rose-500/80 backdrop-blur-md text-white p-2.5 rounded-2xl hover:bg-rose-500 transition-colors shadow-2xl border border-white/10"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <div className="relative w-full h-full animate-in fade-in zoom-in duration-500">
                    <Image 
                      fill 
                      src={value} 
                      alt="Upload Preview" 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-white/5 rounded-[22px] group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all duration-500 border border-white/5 group-hover:border-cyan-500/20">
                    <ImageIcon className="text-white/20 group-hover:text-cyan-400 transition-colors" size={28} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">
                      Add Visual
                    </span>
                    <span className="text-[7px] font-bold text-white/10 uppercase tracking-widest">
                      WebP, AVIF, JPG, PNG
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 p-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={12} className="text-cyan-500" />
                  </div>
                </>
              )}
            </div>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}