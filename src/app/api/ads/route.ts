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

    const ads = await prisma.adConfig.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(ads);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch ads config" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { adType, placement, scriptCode, isActive } = await req.json();
    if (!adType || !placement || !scriptCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ad = await prisma.adConfig.create({
      data: {
        adType,
        placement,
        scriptCode,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(ad);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create ads config" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  try {
    const { id, isActive, adType, placement, scriptCode } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const ad = await prisma.adConfig.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        adType: adType || undefined,
        placement: placement || undefined,
        scriptCode: scriptCode || undefined,
      },
    });

    return NextResponse.json(ad);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update ads config" },
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

    await prisma.adConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete ads config" },
      { status: 500 }
    );
  }
}
