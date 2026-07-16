import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchList from "@/components/MatchList";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { fetchAllMatches, getMatchStatus } from "@/lib/api";

function MatchGridSkeleton() {
  return (
    <>
      <div className="sport-tabs">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: 90 + Math.random() * 30,
              height: 36,
              borderRadius: 100,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <div className="section-header">
        <div className="skeleton skeleton-line w-40 h-6" style={{ marginBottom: 0 }} />
      </div>
      <div className="match-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-line w-40" />
            <div style={{ height: 12 }} />
            <div className="skeleton skeleton-line w-80 h-4" />
            <div style={{ height: 8 }} />
            <div className="skeleton skeleton-line w-60 h-4" />
            <div style={{ height: 16 }} />
            <div
              style={{
                height: 1,
                background: "var(--border-subtle)",
                margin: "0 -18px",
                width: "calc(100% + 36px)",
              }}
            />
            <div style={{ height: 14 }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton skeleton-line" style={{ width: 100 }} />
              <div className="skeleton skeleton-line" style={{ width: 80 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

async function MatchContent() {
  const matches = await fetchAllMatches();
  const liveCount = matches.filter((m) => getMatchStatus(m) === "live").length;

  return (
    <>
      <HeroSection liveCount={liveCount} />
      <AdBanner placement="TopBanner" />
      <div className="hidden md:block w-full my-6">
        <AdBanner placement="DesktopBanner" />
      </div>
      <MatchList matches={matches} />
      <AdBanner placement="BottomBanner" />

      {/* Floating Side Banners for Desktop */}
      <div className="hidden xl:block fixed bottom-6 left-6 z-40 w-[320px] rounded-lg overflow-hidden shadow-2xl">
        <AdBanner placement="SideBanner" />
      </div>
      <div className="hidden xl:block fixed bottom-6 right-6 z-40 w-[320px] rounded-lg overflow-hidden shadow-2xl">
        <AdBanner placement="SideBanner" />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <Suspense fallback={
        <>
          <section className="hero-section">
            <div className="hero-inner">
              <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 100, marginBottom: 14 }} />
              <div className="skeleton" style={{ width: "60%", height: 42, borderRadius: 8, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "40%", height: 18, borderRadius: 6 }} />
            </div>
          </section>
          <MatchGridSkeleton />
        </>
      }>
        <MatchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
