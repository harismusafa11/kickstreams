import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { matchId, matchTitle } = await req.json();
    if (!matchId || !matchTitle) {
      return NextResponse.json(
        { error: "Missing matchId or matchTitle" },
        { status: 400 }
      );
    }

    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0] ||
      headerList.get("x-real-ip") ||
      "127.0.0.1";

    const report = await prisma.report.create({
      data: {
        matchId,
        matchTitle,
        reporterIp: ip,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error("Report error:", err);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
