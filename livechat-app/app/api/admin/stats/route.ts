import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const currentUser = session?.user as any;

    if (!session || (currentUser?.role !== "ADMIN" && !currentUser?.isAdmin)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const [userCount, friendshipCount, allUsers] = await Promise.all([
      db.user.count(),
      db.friendship.count({ where: { status: "ACCEPTED" } }),
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          isOnline: true,
          _count: {
            select: {
              sentRequests: { where: { status: "ACCEPTED" } },
              receivedRequests: { where: { status: "ACCEPTED" } },
              posts: true, // NEU: Hier werden die Posts in der DB gezählt
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Daten mappen, damit das Frontend die bereinigten Werte direkt lesen kann
    const mappedUsers = allUsers.map(u => ({
      ...u,
      friendsCount: u._count.sentRequests + u._count.receivedRequests,
      postsCount: u._count.posts // NEU: Den Count in postsCount mappen
    }));

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        activeFriendships: friendshipCount,
      },
      users: mappedUsers
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}