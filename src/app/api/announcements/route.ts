import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kicktvadmin123';

function isAuthorized(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return authHeader === `Bearer ${ADMIN_PASSWORD}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const matchId = searchParams.get("matchId");

    // Fetch announcements based on matchId filter (or global/all)
    let whereClause: any = {};
    if (!all) {
      whereClause.isActive = true;
      if (matchId) {
        whereClause.OR = [{ matchId: "global" }, { matchId: matchId }];
      } else {
        whereClause.matchId = "global";
      }
    } else if (matchId) {
      whereClause.OR = [{ matchId: "global" }, { matchId: matchId }];
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { content, matchId } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        content,
        matchId: matchId || "global",
        isActive: true,
      },
    });

    return NextResponse.json(announcement);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { id, isActive, content, matchId } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        content: content || undefined,
        matchId: matchId || undefined,
      },
    });

    return NextResponse.json(announcement);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
