import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Greift auf deine exportierte auth-Funktion zu
import { db } from "@/lib/db"; // Du nutzt "db" statt "prisma" laut deiner auth.ts

export async function DELETE() {
  try {
    // In NextAuth v5/Auth.js nutzt man die auth() Funktion für die Session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Nicht autorisiert. Bitte melde dich neu an." },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Den User löschen
    // Hinweis: Ich nutze "db", da du es in deiner auth.ts auch so importierst
    const deletedUser = await db.user.delete({
      where: {
        email: userEmail,
      },
    });

    console.log(`Account gelöscht: ${deletedUser.email}`);

    return NextResponse.json(
      { message: "Dein Account wurde erfolgreich gelöscht." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE_USER_ERROR:", error);
    
    // Falls der User nicht gefunden wurde (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Benutzer konnte nicht gefunden werden." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Ein interner Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}