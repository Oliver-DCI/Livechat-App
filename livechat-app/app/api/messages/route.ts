import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

// 1. NACHRICHTEN LADEN (GET)
// Pfad: /api/messages?userId=ID_DES_FREUNDES
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (!session?.user?.id || !otherUserId) {
      return new NextResponse("Nicht autorisiert oder fehlende User-ID", { status: 400 });
    }

    const currentUserId = session.user.id;

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("ERROR_GET_MESSAGES:", error);
    return new NextResponse("Fehler beim Laden der Nachrichten", { status: 500 });
  }
}

// 2. NACHRICHT SENDEN (POST)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    const { content, receiverId } = await req.json();

    if (!content || !receiverId) {
      return new NextResponse("Inhalt oder Empfänger fehlt", { status: 400 });
    }

    // Nachricht in der Datenbank erstellen
    const newMessage = await db.message.create({
      data: {
        body: content,
        senderId: session.user.id,
        recipientId: receiverId,
        isRead: false, // WICHTIG: Nachricht ist initial ungelesen
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // ECHTZEIT-TRIGGER: Informiere den Empfänger sofort
    // Wir senden das Event an den Kanal des Empfängers (seine User-ID)
    await pusherServer.trigger(receiverId, "message:new", {
      id: newMessage.id,
      body: newMessage.body,
      senderId: newMessage.senderId,
      createdAt: newMessage.createdAt,
      senderName: newMessage.sender?.name,
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("ERROR_POST_MESSAGE:", error);
    return new NextResponse("Serverfehler beim Senden", { status: 500 });
  }
}

// 3. CHATVERLAUF LEEREN (DELETE)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");

    if (!session?.user?.id || !otherUserId) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    const currentUserId = session.user.id;

    // Löscht alle Nachrichten zwischen diesen beiden Usern
    await db.message.deleteMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ],
      },
    });

    return NextResponse.json({ message: "Chat erfolgreich geleert" });
  } catch (error) {
    console.error("ERROR_DELETE_CHAT:", error);
    return new NextResponse("Fehler beim Löschen des Chats", { status: 500 });
  }
}