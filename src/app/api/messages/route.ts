import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const badWords = [
  "kasar1",
  "kasar2",
  "spamlink.com",
  "anjing",
  "bangsat",
  "goblok",
  "tolol",
  "fuck",
  "shit",
  "babi",
  "kontol",
  "memek",
  "ngentot",
];

export async function GET(req: Request) {
  try {
    const messages = await prisma.message.findMany({
      where: { matchId: "global" },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
      take: 50, // Limit to last 50 messages
    });

    // Map to client format
    const formatted = messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      matchId: m.matchId,
      user: {
        username: m.user.username,
        role: m.user.role,
      },
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content, userId, matchId, username } = await req.json();

    if (!content || !userId || !matchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Ensure user exists and has correct username
    let user;
    try {
      user = await prisma.user.upsert({
        where: { id: userId },
        update: { username: username || undefined },
        create: {
          id: userId,
          username: username || `Guest_${userId.slice(0, 4)}`,
          role: "USER",
        },
      });
    } catch (e) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const fallbackUsername = username
        ? `${username}_${randomSuffix}`
        : `Guest_${userId.slice(0, 4)}_${randomSuffix}`;
      user = await prisma.user.upsert({
        where: { id: userId },
        update: { username: fallbackUsername },
        create: {
          id: userId,
          username: fallbackUsername,
          role: "USER",
        },
      });
    }

    // 2. Slow Mode check (5 seconds)
    const lastMessage = await prisma.message.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (lastMessage) {
      const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
      if (timeDiff < 5000) {
        return NextResponse.json(
          { error: "Tunggu 5 detik sebelum mengirim pesan kembali." },
          { status: 429 }
        );
      }
    }

    // 3. Profanity filter
    let filteredContent = content;
    badWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b|${word}`, "gi");
      filteredContent = filteredContent.replace(regex, "***");
    });

    // 4. Save to DB under "global"
    const savedMessage = await prisma.message.create({
      data: {
        content: filteredContent,
        userId,
        matchId: "global",
      },
      include: {
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    const formatted = {
      id: savedMessage.id,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt.toISOString(),
      matchId: savedMessage.matchId,
      user: {
        username: savedMessage.user.username,
        role: savedMessage.user.role,
      },
    };

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}
