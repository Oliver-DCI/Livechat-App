import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    const userId = session.user.id;

    // 1. Hole alle akzeptierten Freundschaften
    const friendships = await db.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        // Diese Namen müssen exakt so im Schema stehen (tun sie bei dir!)
        sender: true, 
        receiver: true,
      },
    });

    // 2. Freunde extrahieren und ungelesene Nachrichten prüfen
    const friendsWithStatus = await Promise.all(
      friendships.map(async (fs) => {
        // Bestimme, wer der Freund ist
        const friend = fs.senderId === userId ? fs.receiver : fs.sender;

        // Zähle ungelesene Nachrichten von diesem Freund an MICH
        const unreadCount = await db.message.count({
          where: {
            senderId: friend.id,
            recipientId: userId,
            isRead: false
          }
        });

        return {
          id: friend.id,
          name: friend.name,
          email: friend.email,
          image: friend.image,
          hasUnread: unreadCount > 0
        };
      })
    );

    return NextResponse.json(friendsWithStatus);
  } catch (error) {
    console.error("FRIENDS_LIST_ERROR", error);
    return new NextResponse("Interner Fehler", { status: 500 });
  }
}