import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Greift direkt auf deine zentrale auth.ts zu
import { prisma } from "@/lib/db";

export async function GET() {
  // In NextAuth v5 ist 'auth()' der Standardweg, um die Session im Server zu holen
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. User anhand der Email aus der Session finden
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Anzahl der ungelesenen Nachrichten zählen, die für diesen User bestimmt sind
    const count = await prisma.message.count({
      where: {
        recipientId: currentUser.id,
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Notification Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}