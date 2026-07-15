# kickTvStreams

Live Sports Streaming Platform providing free, high-quality streams for Soccer, Basketball, Hockey, Baseball, Tennis, Cricket, Combat, and Racing.

## Features
- **Live Match Tracking**: Real-time listing of active and upcoming matches.
- **Dynamic SEO**: Optimized OpenGraph, JSON-LD, Twitter Cards, and dynamic sitemaps for maximum search engine visibility.
- **Admin Dashboard**: Manage active streams, ads (Popunder/Banner/Native), and site-wide announcements.
- **Categorization**: Easily navigate through various sports categories.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Prisma ORM (SQLite/PostgreSQL/MySQL)
- **Styling**: Tailwind CSS & Custom Modern UI
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the Database:**
   Create a `.env` file and configure your database connection string and admin password.
   ```env
   DATABASE_URL="file:./dev.db" # Or your remote database
   ADMIN_PASSWORD="your-secure-password"
   NEXT_PUBLIC_BASE_URL="https://kicktvstreams.my.id"
   ```
   Apply the database schema:
   ```bash
   npx prisma db push
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Administration
Access the admin panel at `/admin` to manage broken link reports, update ad scripts, and broadcast announcements. Ensure you set the `ADMIN_PASSWORD` in your `.env` to secure the dashboard.

## License
MIT
