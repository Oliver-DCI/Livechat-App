import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const session = await auth();
    const { commentId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Nicht autorisiert", { status: 401 });
    }

    // Kommentar finden
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return new NextResponse("Kommentar nicht gefunden", { status: 404 });
    }

    // Prüfen: Ist es der eigene Kommentar oder ist der User Admin?
    const isOwner = comment.userId === session.user.id;
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return new NextResponse("Nicht erlaubt", { status: 403 });
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    return new NextResponse("Gelöscht", { status: 200 });
  } catch (error) {
    console.error("[COMMENT_DELETE_ERROR]", error);
    return new NextResponse("Interner Fehler", { status: 500 });
  }
}