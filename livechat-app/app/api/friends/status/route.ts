import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    // 1. Sicherheits-Check
    if (!session?.user?.id) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    const userId = session.user.id;

    // 2. Alle akzeptierten Freundschaften finden
    // Wir holen uns die User-Daten (isOnline, lastSeen) der Freunde
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" }
        ],
      },
      select: {
        sender: {
          select: {
            id: true,
            isOnline: true,
            lastSeen: true,
          }
        },
        receiver: {
          select: {
            id: true,
            isOnline: true,
            lastSeen: true,
          }
        }
      }
    });

    // 3. Daten flachklopfen (Wir filtern uns selbst aus dem Ergebnis)
    const friendStatus = friendships.map((fs) => {
      const friendData = fs.sender.id === userId ? fs.receiver : fs.sender;
      return {
        id: friendData.id,
        isOnline: friendData.isOnline,
        lastSeen: friendData.lastSeen
      };
    });

    return NextResponse.json(friendStatus);
  } catch (error) {
    console.error("STATUS_ROUTE_ERROR:", error);
    return new NextResponse("Interner Fehler", { status: 500 });
  }
}