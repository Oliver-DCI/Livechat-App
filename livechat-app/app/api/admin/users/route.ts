import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as any;

    // Nur Admins dürfen die User-Liste sehen
    if (!session || (user?.role !== "ADMIN" && !user?.isAdmin)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: "desc" }
    });

    // Statistiken berechnen
    const totalUsers = users.length;
    // Beispiel für Freundschaften (falls du sie hier mitzählen willst)
    const activeFriendships = await db.friendship.count(); 

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        activeFriendships
      }
    });
  } catch (error) {
    console.error("Admin GET Error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Daten" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const currentUser = session?.user as any;

    // Sicherheits-Check: Nur Admins dürfen löschen
    if (!session || (currentUser?.role !== "ADMIN" && !currentUser?.isAdmin)) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idToDelete = searchParams.get("id");

    if (!idToDelete) {
      return NextResponse.json({ error: "Keine ID übermittelt" }, { status: 400 });
    }

    // VERHINDERN: Admin löscht sich selbst
    if (idToDelete === currentUser.id) {
      return NextResponse.json({ error: "Selbstlöschung nicht möglich" }, { status: 400 });
    }

    // Löscht den User (Cascade erledigt den Rest in der DB)
    await db.user.delete({ 
      where: { id: idToDelete } 
    });

    return NextResponse.json({ message: "User erfolgreich gelöscht" });
  } catch (error) {
    console.error("Admin DELETE Error:", error);
    return NextResponse.json({ error: "Löschen fehlgeschlagen" }, { status: 500 });
  }
}