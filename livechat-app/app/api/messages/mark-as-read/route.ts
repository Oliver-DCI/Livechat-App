import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { senderId } = await req.json(); // ID des Freundes

    if (!session?.user?.id || !senderId) {
      return new NextResponse("Fehlende Daten", { status: 400 });
    }

    // Alle Nachrichten von diesem Freund an mich auf 'gelesen' setzen
    await db.message.updateMany({
      where: {
        senderId: senderId,
        recipientId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Fehler", { status: 500 });
  }
}