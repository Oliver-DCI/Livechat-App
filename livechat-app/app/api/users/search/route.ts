import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Nicht autorisiert", { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) return NextResponse.json([]);

    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        NOT: { id: session.user.id }, 
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        image: true,
        // Wir schauen nach, ob es eine Freundschaft zwischen mir und dem gefundenen User gibt
        sentRequests: {
          where: { receiverId: session.user.id }
        },
        receivedRequests: {
          where: { senderId: session.user.id }
        }
      },
    });

    // Wir "mappen" das Ergebnis, um dem Frontend einen einfachen Status zu geben
    const formattedUsers = users.map(user => {
      // Prüfen, ob irgendeine Verbindung (sent oder received) den Status "ACCEPTED" hat
      const isFriend = [...user.sentRequests, ...user.receivedRequests].some(f => f.status === "ACCEPTED");
      const isPending = [...user.sentRequests, ...user.receivedRequests].some(f => f.status === "PENDING");

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        friendshipStatus: isFriend ? "FRIEND" : isPending ? "PENDING" : "NONE"
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Search Error:", error);
    return new NextResponse("Server Fehler", { status: 500 });
  }
}