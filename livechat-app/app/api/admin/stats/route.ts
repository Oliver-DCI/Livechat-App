import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const currentUser = session?.user as any;

    // STRENGER CHECK: Nur echte Admins dürfen rein
    if (!session || (currentUser?.role !== "ADMIN" && !currentUser?.isAdmin)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Parallel alle Daten abfragen für maximale Performance
    const [userCount, friendshipCount, allUsers] = await Promise.all([
      db.user.count(),
      // Wir zählen nur die bestätigten Freundschaften für die "Connections"
      db.friendship.count({ where: { status: "ACCEPTED" } }),
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        activeFriendships: friendshipCount,
      },
      users: allUsers
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Admin-Daten" }, { status: 500 });
  }
}