import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Fehlende Felder", { status: 400 });
    }

    const userExists = await db.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return new NextResponse("Email wird bereits verwendet", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // WICHTIG: Wir füllen hier alles aus, was dein Schema verlangt
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: false,       // Das Feld ist im Schema kein Optional (kein ?), muss also rein
        role: "USER",         // Standard-Rolle aus deinem Enum
        isOnline: false,
        // Die Medien-Felder sind im Schema mit ? markiert, 
        // die müssen wir hier also nicht zwingend mitschicken.
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.log("REGISTRATION_ERROR:", error);
    return new NextResponse("Interner Fehler", { status: 500 });
  }
}