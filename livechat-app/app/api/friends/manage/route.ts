import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 1. ANFRAGEN LADEN (GET)
// Lädt alle offenen (PENDING) Freundschaftsanfragen für den aktuellen User
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const requests = await db.friendship.findMany({
      where: {
        receiverId: session.user.id,
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET_REQUESTS_ERROR:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// 2. ANNEHMEN ODER ABLEHNEN (PATCH)
// Verarbeitet eingehende Anfragen basierend auf der requestId
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const { requestId, action } = await req.json();

    if (action === "DECLINED") {
      // Löschen bei Ablehnung
      await db.friendship.delete({
        where: { id: requestId },
      });
      return NextResponse.json({ message: "Anfrage abgelehnt und gelöscht" });
    }

    if (action === "ACCEPTED") {
      // Status ändern bei Annahme
      const updated = await db.friendship.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json({ error: "Serverfehler beim Verarbeiten" }, { status: 500 });
  }
}

// 3. FREUND ENTFERNEN & CHAT LÖSCHEN (DELETE)
// Löscht die bestehende Freundschaft und alle zugehörigen Nachrichten
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get("friendId");

    if (!friendId) {
      return NextResponse.json({ error: "Keine Friend-ID angegeben" }, { status: 400 });
    }

    const userId = session.user.id;

    // A: Freundschaft löschen (egal wer Sender oder Empfänger war)
    // Wir nutzen deleteMany, weil wir über die User-IDs suchen, nicht über die Friendship-ID
    await db.friendship.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
    });

    // B: Gesamten Chat-Verlauf zwischen diesen beiden Usern löschen
    await db.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, recipientId: friendId },
          { senderId: friendId, recipientId: userId },
        ],
      },
    });

    return NextResponse.json({ 
      message: "Freundschaft beendet und Chat-Verlauf unwiderruflich gelöscht." 
    });

  } catch (error) {
    console.error("DELETE_FRIEND_ERROR:", error);
    return NextResponse.json({ error: "Fehler beim Entfernen des Freundes" }, { status: 500 });
  }
}