import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// STUFE 1: Bildbeschreibung (Was ist auf dem Foto?)
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
    return null;
  }
}

// STUFE 2: Neon-Transformation (Das eigentliche Magic-Artwork)
async function generateNeonArtwork(description: string) {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return null;

    // Der "YOU&ME" Style-Prompt
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
    const { name, image, image1, image2, image3, song1, song2, song3 } = body;

    // 1. Profil-Daten in DB speichern
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(image !== undefined && { image }),
        ...(image1 !== undefined && { image1 }),
        ...(image2 !== undefined && { image2 }),
        ...(image3 !== undefined && { image3 }),
        ...(song1 !== undefined && { song1 }),
        ...(song2 !== undefined && { song2 }),
        ...(song3 !== undefined && { song3 }),
      },
    });

    // 2. Magic AI & Discovery Feed Logik
    const featuredMedia = image1 || image2 || image3 || song1;
    const isSong = !image1 && !image2 && !image3 && !!song1;

    if (featuredMedia) {
      const targetTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const existingRecentPost = await db.post.findFirst({
        where: {
          userId: userId,
          type: { in: ["IMAGE_UPDATE", "SONG_UPDATE"] },
          createdAt: { gte: targetTime }
        }
      });

      let aiDescription = null;
      let neonArt = null;

      if (!isSong) {
        // Erst analysieren...
        aiDescription = await analyzeImage(featuredMedia);
        // ...dann das Neon-Bild generieren!
        if (aiDescription) {
          neonArt = await generateNeonArtwork(aiDescription);
        }
      }

      const postData = {
        type: isSong ? "SONG_UPDATE" : "IMAGE_UPDATE",
        mediaUrl: featuredMedia, // Original-Bild
        image: neonArt,          // HIER wird das Neon-Bild gespeichert
        content: isSong 
          ? "Hat einen neuen Vibe geteilt 🎵" 
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

    return NextResponse.json({ message: "Profil & Magic AI aktualisiert", user: updatedUser });

  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}