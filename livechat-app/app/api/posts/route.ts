import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// --- VERBESSERTE KI-FUNKTION ---
async function generateAIAnalysis(content: string, hasVideo: boolean) {
  if (!content || content.trim().length === 0) {
    return hasVideo 
      ? "Ein multimedialer Vibe für die Community! 🎬✨" 
      : "Ein visueller Moment voller Inspiration. ✨";
  }

  const text = content.toLowerCase();
  
  if (text.includes("sonne") || text.includes("sommer") || text.includes("strand")) {
    return "Sonnige Energie detektiert! Genieße das Licht und den Moment. ☀️🏝️";
  }
  if (text.includes("party") || text.includes("feiern") || text.includes("dance")) {
    return "Party-Vibe erkannt! YOU&ME wünscht dir eine unvergessliche Nacht. 🕺🎉";
  }
  if (text.includes("traurig") || text.includes("schade") || text.includes("allein")) {
    return "Kopf hoch! Die Community ist für dich da. 🫂💙";
  }
  if (text.includes("musik") || text.includes("song") || text.includes("youtube") || hasVideo) {
    return "Sound on! Ein starker Beat für den Feed. 🎶🎧";
  }

  return "Ein interessanter Gedanke! Dieser Post bereichert den YOU&ME Feed. 🪄✨";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        comments: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" }
        }
      },
      take: 50,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();
    const { content, images, youtubeLinks, type } = body;

    // Prüfung auf leeren Post (Text, Bilder oder Videos müssen vorhanden sein)
    const hasImages = Array.isArray(images) && images.length > 0;
    const hasVideos = Array.isArray(youtubeLinks) && youtubeLinks.length > 0;

    if (!content?.trim() && !hasImages && !hasVideos) {
      return NextResponse.json({ error: "Post darf nicht leer sein" }, { status: 400 });
    }

    const generatedAnalysis = await generateAIAnalysis(content || "", hasVideos);

    const post = await db.post.create({
      data: {
        content: content?.trim() || null,
        // MongoDB mag echte Arrays!
        images: hasImages ? images : [], 
        youtubeLinks: hasVideos ? youtubeLinks : [],
        // Wir füllen 'image' (altes Feld) für Abwärtskompatibilität mit dem ersten Bild
        image: hasImages ? images[0] : null,
        type: type || "TEXT",
        aiAnalysis: generatedAnalysis,
        userId: session.user.id 
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        comments: true 
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Datenbank-Fehler. Hast du npx prisma generate nach der Schema-Änderung gemacht?" }, 
      { status: 500 }
    );
  }
}