import { experimental_upgradeWebSocket, type WebSocketData } from "@vercel/functions";
import { prisma } from "@/lib/db";

// Keep track of connected clients on this instance
const clients = new Set<any>();

const broadcastViewerCount = () => {
  const countPayload = JSON.stringify({
    event: "viewer_count",
    count: clients.size,
  });
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(countPayload);
    }
  });
};

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

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    clients.add(ws);
    broadcastViewerCount();

    ws.on("message", async (data: WebSocketData) => {
      try {
        const payload = JSON.parse(data.toString());
        const { content, userId, username } = payload;

        if (!content || !userId) return;

        // 1. Ensure user exists in database and has correct username
        let user;
        try {
          user = await prisma.user.upsert({
            where: { id: userId },
            update: {
              username: username || undefined,
            },
            create: {
              id: userId,
              username: username || `Guest_${userId.slice(0, 4)}`,
              role: "USER",
            },
          });
        } catch (e) {
          // Fallback if username is taken
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const fallbackUsername = username
            ? `${username}_${randomSuffix}`
            : `Guest_${userId.slice(0, 4)}_${randomSuffix}`;
          user = await prisma.user.upsert({
            where: { id: userId },
            update: {
              username: fallbackUsername,
            },
            create: {
              id: userId,
              username: fallbackUsername,
              role: "USER",
            },
          });
        }

        // 2. Verify Slow Mode (5 Seconds limit per user)
        const lastMessage = await prisma.message.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (lastMessage) {
          const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
          if (timeDiff < 5000) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Tunggu 5 detik sebelum mengirim pesan kembali.",
              })
            );
            return;
          }
        }

        // 3. Profanity filter
        let filteredContent = content;
        badWords.forEach((word) => {
          const regex = new RegExp(`\\b${word}\\b|${word}`, "gi");
          filteredContent = filteredContent.replace(regex, "***");
        });

        // 4. Save Message to Database under "global"
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

        const broadcastPayload = JSON.stringify({
          event: "new_message",
          data: {
            id: savedMessage.id,
            content: savedMessage.content,
            createdAt: savedMessage.createdAt,
            matchId: "global",
            user: {
              username: savedMessage.user.username,
              role: savedMessage.user.role,
            },
          },
        });

        // 5. Broadcast message to all connected clients on this instance
        clients.forEach((client) => {
          if (client.readyState === 1) {
            // WebSocket.OPEN
            client.send(broadcastPayload);
          }
        });
      } catch (err) {
        console.error("WebSocket Error:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      broadcastViewerCount();
    });

    ws.on("error", () => {
      clients.delete(ws);
      broadcastViewerCount();
    });
  });
}
