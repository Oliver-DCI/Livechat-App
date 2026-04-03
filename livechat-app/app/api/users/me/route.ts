import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });
  return NextResponse.json(user);
}