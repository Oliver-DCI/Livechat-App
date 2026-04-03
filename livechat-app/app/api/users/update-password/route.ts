import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Stelle sicher, dass bcryptjs installiert ist

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ message: "Fehlende Daten" }, { status: 400 });
    }

    // 1. User aus der Datenbank holen
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // 2. Altes Passwort prüfen
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: "Altes Passwort ist nicht korrekt" }, { status: 403 });
    }

    // 3. Neues Passwort hashen
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update in der DB
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Passwort erfolgreich geändert" }, { status: 200 });

  } catch (error) {
    console.error("PASSWORD_UPDATE_ERROR:", error);
    return NextResponse.json({ message: "Interner Serverfehler" }, { status: 500 });
  }
}