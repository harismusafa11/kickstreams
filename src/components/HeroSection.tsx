import { PlayCircle } from "lucide-react";

export default function HeroSection({ liveCount }: { liveCount: number }) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-elements">
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-grid-overlay"></div>
      </div>
      
      <div className="hero-inner">
        {liveCount > 0 && (
          <div className="hero-label">
            <span className="pulse-dot" />
            <span className="hero-label-text">{liveCount} Pertandingan Live</span>
            <div className="hero-label-glow"></div>
          </div>
        )}
        <h1 className="hero-title">
          Streaming Olahraga <span>Tanpa Batas</span>
        </h1>
        <p className="hero-subtitle">
          Nikmati pengalaman menonton sepak bola, basket, dan berbagai cabang olahraga lainnya secara langsung. Kualitas HD, 100% gratis, dan dilengkapi live chat interaktif.
        </p>
        <div className="hero-actions">
          <a href="#live-section" className="btn-primary">
            <PlayCircle size={18} /> Tonton Sekarang
          </a>
          <a href="#schedule-section" className="btn-secondary">
            Lihat Jadwal
          </a>
        </div>
      </div>
    </section>
  );
}
