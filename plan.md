

Dokumen ini adalah instruksi kerja terstruktur untuk Agen AI Google Antigravity guna membangun platform streaming olahraga bernama **kickTvStreams** menggunakan API dari `streamfree.top`.

Aplikasi ini menggunakan framework **Next.js (App Router)**, database **PostgreSQL/MySQL** via **Prisma ORM**, dan memanfaatkan fitur **Vercel WebSockets** melalui `@vercel/functions` untuk fitur *live chat* real-time langsung ke database tanpa Supabase.

---

## DAFTAR TUGAS (TASK LIST)

### TUGAS 1: Inisialisasi Proyek & Instalasi Dependensi
Jalankan perintah terminal untuk mengonfigurasi proyek Next.js baru dengan TypeScript, Tailwind CSS, dan Prisma.

1. Gunakan perintah terminal untuk menginstal dependensi tambahan berikut:
   ```bash
   npm install @vercel/functions @prisma/client lucide-react
   npm install -D prisma typescript @types/node
   ```
2. Lakukan inisialisasi Prisma:
   ```bash
   npx prisma init
   ```

---

### TUGAS 2: Konfigurasi Database Prisma
Buat dan edit file `prisma/schema.prisma` dengan skema relasional berikut untuk mengakomodasi data pengguna, log obrolan, laporan link rusak, pengumuman, dan iklan.

```prisma
datasource db {
  provider = "postgresql" // Bisa diubah ke mysql tergantung koneksi target Anda
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  messages  Message[]
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

model Message {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  matchId   String   // ID pertandingan dari API streamfree.top
}

model Report {
  id          String       @id @default(uuid())
  matchId     String
  matchTitle  String
  reporterIp  String?      
  status      ReportStatus @default(PENDING)
  createdAt   DateTime     @default(now())
}

enum ReportStatus {
  PENDING
  RESOLVED
  IGNORED
}

model Announcement {
  id        String   @id @default(uuid())
  content   String
  matchId   String   // "global" jika untuk semua, atau diisi ID pertandingan tertentu
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model AdConfig {
  id         String   @id @default(uuid())
  adType     String   // Popunder, Native, Banner
  placement  String   // UnderPlayer, Sidebar
  scriptCode String   // Skrip HTML mentah dari Adsterra
  isActive   Boolean  @default(true)
  updatedAt  DateTime @updatedAt
}
```

*Setelah membuat file ini, jalankan perintah:*
```bash
npx prisma generate
```

---

### TUGAS 3: Implementasi WebSocket Backend (Vercel Native)
Buat file handler WebSocket di `app/api/ws/route.ts` menggunakan API dari `@vercel/functions`. 

Implementasikan logika berikut di dalam handler tersebut:
1. **Slow Mode**: Batasi pengguna agar hanya bisa mengirim pesan setiap 5 detik sekali dengan memeriksa pesan terakhir mereka di database Prisma.
2. **Profanity Filter**: Sensor kata-kata kasar dari daftar hitam lokal sebelum menyimpannya ke database via Prisma.

```typescript
// app/api/ws/route.ts
import { experimental_upgradeWebSocket, type WebSocketData } from '@vercel/functions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const badWords = ["kasar1", "kasar2", "spamlink.com"]; // Gantilah dengan daftar kata sensor Anda

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    
    ws.on('message', async (data: WebSocketData) => {
      try {
        const payload = JSON.parse(data.toString());
        const { content, userId, matchId } = payload;

        if (!content || !userId || !matchId) return;

        // 1. Verifikasi Slow Mode (5 Detik)
        const lastMessage = await prisma.message.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });

        if (lastMessage) {
          const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
          if (timeDiff < 5000) {
            ws.send(JSON.stringify({ 
              event: "error", 
              message: "Tunggu 5 detik sebelum mengirim pesan kembali." 
            }));
            return;
          }
        }

        // 2. Terapkan Penyaring Sensor Kata Kasar
        let filteredContent = content;
        badWords.forEach((word) => {
          const regex = new RegExp(word, "gi");
          filteredContent = filteredContent.replace(regex, "***");
        });

        // 3. Simpan Pesan ke Database via Prisma
        const savedMessage = await prisma.message.create({
          data: {
            content: filteredContent,
            userId,
            matchId
          },
          include: {
            user: { select: { username: true, role: true } }
          }
        });

        // 4. Kirim kembali ke client
        ws.send(JSON.stringify({
          event: "new_message",
          data: savedMessage
        }));

      } catch (err) {
        console.error('WebSocket Error:', err);
      }
    });
  });
}
```

---

### TUGAS 4: Integrasi API streamfree.top (Data Fetching)
Buat modul utilitas untuk menarik data dari `https://streamfree.top/api`. Bungkus data fetching ini menggunakan server-side fetching Next.js agar API asli tersembunyi dari publik.

*Kategori olahraga yang wajib ditangani:*
*   `Basketball`
*   `Soccer`
*   `Hockey`
*   `Baseball`
*   `Combat`
*   `Racing`
*   `Tennis`
*   `Cricket`

Gunakan revalidation berdurasi pendek (misalnya 60 detik) untuk menjaga performa rendering tetap optimal.

---

### TUGAS 5: Pembuatan UI/UX Premium (Anti-AI & Tanpa Emoji)
Desain tampilan frontend dengan ketentuan estetika berikut:
1. **Latar Belakang**: Gunakan warna hitam pekat `#090a0f` dengan batas elemen abu-abu gelap `#1f2937` (bukan grid kaku standar bootstrap/AI generik).
2. **Warna Aksen**: Hijau neon `#00e676` khusus untuk status siaran langsung (*LIVE*).
3. **Ikonografi**: Gunakan library `lucide-react` untuk semua kebutuhan ikon. **Jangan gunakan emoji berwarna bawaan sistem.**
4. **Layout**: Layout terpisah antara pemutar video (kiri) dan obrolan chat (kanan). Buat panel obrolan tersebut agar dapat disembunyikan (*collapsible*) dengan transisi animasi yang mulus.

---

### TUGAS 6: Fitur Pelaporan & Pengumuman Sistem
Buat komponen dan rute API untuk menangani:
1. **Laporan Link Rusak**:
   * Sediakan tombol *"Laporkan Gangguan Siaran"* di bawah pemutar video.
   * Buat API route `POST /api/report` untuk menyimpan laporan tersebut ke database via Prisma dengan status awal `PENDING`.
2. **Pengumuman Admin (Announcement Banner)**:
   * Sediakan komponen banner di atas kolom chat yang akan menampilkan data pengumuman aktif dari tabel `Announcement` di database.

---

### TUGAS 7: Admin Panel & Integrasi Adsterra
Buat halaman admin khusus di `/admin` dengan fungsi berikut:
1. **Manajemen Iklan**: Input form untuk menyimpan, memperbarui, dan mengaktifkan skrip iklan dari Adsterra (Popunder, Native, atau Banner) ke dalam tabel `AdConfig`.
2. **Moderasi Laporan**: Tampilkan daftar pertandingan yang memiliki jumlah laporan "Link Rusak" tertinggi dari model `Report` agar admin bisa memperbarui tautan streaming secepat mungkin.
3. **Pemuatan Iklan**: Di frontend utama, buat logika untuk menyisipkan skrip Adsterra yang aktif dari database ke elemen pemutar video dan area di bawah video menggunakan komponen `<Script />` dari Next.js.

---

### TUGAS 8: Optimasi SEO & Custom Domain Setup
1. Buat generator metadata dinamis pada halaman `/watch/[id]` untuk menghasilkan judul, deskripsi, dan metadata Open Graph yang ramah SEO berdasarkan data pertandingan aktif dari API.
2. Tambahkan markup JSON-LD berskema `SportsEvent` di halaman detail pertandingan untuk mengoptimalkan tampilan kaya (*rich snippets*) di hasil pencarian Google.
3. Konfigurasikan berkas panduan deployment Vercel agar mengarahkan DNS domain custom Anda ke IP Vercel (`76.76.21.21`) dan CNAME ke `cname.vercel-dns.com`.
```