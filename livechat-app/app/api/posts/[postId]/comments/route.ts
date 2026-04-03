import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { prisma } from "@/lib/db"; 

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> } // Typ als Promise definieren
) {
  try {
    // 1. Authentifizierung
    const session = await auth();
    
    // 2. PARAMS ENTPACKEN (Wichtig für Next.js 15)
    const { postId } = await params; 
    
    const { text } = await req.json();

    if (!session?.user?.id) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    // 3. Validierung
    if (!text || text.trim().length === 0) {
      return new NextResponse("Text darf nicht leer sein", { status: 400 });
    }

    if (text.length > 255) {
      return new NextResponse("Maximal 255 Zeichen erlaubt", { status: 400 });
    }

    // 4. Kommentar erstellen
    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        postId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST_ERROR]", error);
    return new NextResponse("Interner Fehler im Server", { status: 500 });
  }
}