import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const userProfile = await db.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        image: true,
        image1: true,
        image2: true,
        image3: true,
        song1: true,
        song2: true,
        song3: true,
        isOnline: true,
      }
    });

    if (!userProfile) return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });

    return NextResponse.json(userProfile);
  } catch (error) {
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}