import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
    }

    // Wir fügen "as any" am Ende hinzu, um den TS-Fehler zu umgehen
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { comments: true } 
        },
        sentRequests: {
          where: { status: "ACCEPTED" },
          include: { receiver: { select: { id: true, name: true, image: true, isOnline: true } } }
        },
        receivedRequests: {
          where: { status: "ACCEPTED" },
          include: { sender: { select: { id: true, name: true, image: true, isOnline: true } } }
        }
      },
    }) as any;

    if (!user) {
      return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
    }

    const friendsList = [
      ...(user.sentRequests?.map((f: any) => f.receiver) || []),
      ...(user.receivedRequests?.map((f: any) => f.sender) || [])
    ];

    let friendshipStatus = "NONE";
    if (session?.user?.id) {
      const currentUserId = session.user.id;
      if (currentUserId === targetUserId) {
        friendshipStatus = "OWN";
      } else {
        const friendship = await db.friendship.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: currentUserId }
            ]
          }
        });
        if (friendship) friendshipStatus = friendship.status;
      }
    }

    // Jetzt erkennt TS video1, video2 etc. ohne Fehlermeldung
    const responseData = {
      id: user.id,
      name: user.name,
      image: user.image,
      image1: user.image1,
      image2: user.image2,
      image3: user.image3,
      image4: user.image4, 
      video1: user.video1,
      video2: user.video2,
      video3: user.video3,
      video4: user.video4,
      song1: user.song1,
      song2: user.song2,
      song3: user.song3,
      song4: user.song4,
      createdAt: user.createdAt,
      friendshipStatus,
      posts: user.posts,
      friends: friendsList
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}