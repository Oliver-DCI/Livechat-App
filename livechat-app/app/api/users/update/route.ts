import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// STUFE 1: Bildbeschreibung (Bleibt gleich)
async function analyzeImage(imageUrl: string) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: imageUrl }),
      }
    );

    const result = await response.json();
    return result[0]?.generated_text || null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

// STUFE 2: Neon-Transformation (Bleibt gleich)
async function generateNeonArtwork(description: string) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return null;

    const neonPrompt = `Futuristic neon cyberpunk style portrait, theme: ${description}, vibrant electric blue and violet lighting, glowing highlights, sleek pearl finish, high-end digital art, 8k resolution, cinematic aesthetic.`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: neonPrompt }),
      }
    );

    if (!response.ok) return null;

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Art Gen Error:", error);
    return null;
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();
    
    // EXTRAKTION: song1-4 entfernt, da im Schema gelöscht!
    const { 
      name, 
      image, 
      image1, image2, image3, image4, 
      video1, video2, video3, video4 
    } = body;

    // 1. Profil-Daten in DB speichern (Ohne song-Felder)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(image !== undefined && { image }),
        ...(image1 !== undefined && { image1 }),
        ...(image2 !== undefined && { image2 }),
        ...(image3 !== undefined && { image3 }),
        ...(image4 !== undefined && { image4 }),
        ...(video1 !== undefined && { video1 }),
        ...(video2 !== undefined && { video2 }),
        ...(video3 !== undefined && { video3 }),
        ...(video4 !== undefined && { video4 }),
      },
    });

    // 2. Magic AI & Discovery Feed Logik
    // Wir nehmen Video 1 als "Featured Media", wenn kein neues Galeriebild da ist
    const featuredMedia = image1 || image2 || image3 || image4 || video1;
    const isVideo = !image1 && !image2 && !image3 && !image4 && !!video1;

    if (featuredMedia) {
      const targetTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Suche nach bestehendem Post (Typ auf VIDEO_UPDATE geändert)
      const existingRecentPost = await db.post.findFirst({
        where: {
          userId: userId,
          type: { in: ["IMAGE_UPDATE", "VIDEO_UPDATE"] },
          createdAt: { gte: targetTime }
        }
      });

      let aiDescription = null;
      let neonArt = null;

      // Nur Bilder analysieren, keine YouTube Links
      if (!isVideo && (image1 || image2 || image3 || image4)) {
        aiDescription = await analyzeImage(featuredMedia);
        if (aiDescription) {
          neonArt = await generateNeonArtwork(aiDescription);
        }
      }

      const postData = {
        type: isVideo ? "VIDEO_UPDATE" : "IMAGE_UPDATE",
        mediaUrl: featuredMedia, 
        image: neonArt,          
        content: isVideo 
          ? "Hat einen neuen Track geteilt 🎥" 
          : `Magic AI Vibe: ${aiDescription || "Neon-Profil aufgefrischt ✨"}`,
        aiAnalysis: aiDescription ? `Vibe Check: ${aiDescription}` : null,
        createdAt: new Date(),
      };

      if (existingRecentPost) {
        await db.post.update({
          where: { id: existingRecentPost.id },
          data: { ...postData, userId: userId }
        });
      } else {
        await db.post.create({
          data: { ...postData, userId: userId }
        });
      }
    }

    return NextResponse.json({ 
      message: "Profil & Magic AI aktualisiert", 
      user: updatedUser 
    });

  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}