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
    const grouped = searchParams.get("grouped") === "true";

    if (grouped) {
      // Group reports by matchId and count them
      const reports = await prisma.report.groupBy({
        by: ["matchId", "matchTitle", "status"],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });
      return NextResponse.json(reports);
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { id, status, matchId } = await req.json();

    if (matchId && status) {
      // Resolve/ignore all reports for a specific match
      const updated = await prisma.report.updateMany({
        where: { matchId },
        data: { status },
      });
      return NextResponse.json({ success: true, count: updated.count });
    }

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update report status" },
      { status: 500 }
    );
  }
}
