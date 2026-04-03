import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> } 
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    // 1. Extraktion der ID aus dem Promise
    const { postId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: "Keine Post-ID übergeben" }, { status: 400 });
    }

    // 2. Post suchen, um Berechtigung zu prüfen
    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post nicht gefunden" }, { status: 404 });
    }

    // 3. Sicherheitscheck: Gehört der Post dem User?
    if (post.userId !== userId) {
      return NextResponse.json(
        { error: "Du darfst nur deine eigenen Momente löschen!" }, 
        { status: 403 }
      );
    }

    // 4. Löschvorgang in der Datenbank
    // Da wir die Bilder nur als URL-String in der DB speichern, 
    // löscht dieser Befehl den Eintrag inklusive des Bild-Strings.
    await db.post.delete({
      where: {
        id: postId,
      },
    });

    return NextResponse.json({ message: "Moment erfolgreich gelöscht" });
  } catch (error) {
    console.error("POST_DELETE_ERROR:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler beim Löschen" }, 
      { status: 500 }
    );
  }
}