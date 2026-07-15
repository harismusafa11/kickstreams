import Image from "next/image";
import Link from "next/link";
import { Mail, ShieldAlert, Heart, Compass, MessageSquare } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="site-footer"
      id="footer"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        padding: "48px 24px 32px",
      }}
    >
      <div
        className="footer-inner"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 32,
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {/* Brand Section */}
        <div
          className="footer-brand"
          style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 300 }}
        >
          <Image
            src="/log0.webp"
            alt="kickTvStreams"
            width={120}
            height={38}
            style={{ height: 38, width: "auto" }}
          />
          <span
            className="footer-text"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            kickTvStreams adalah platform streaming olahraga terlengkap yang menyediakan siaran sepak bola, basket, balapan, kriket, dan olahraga lainnya secara gratis dengan live chat interaktif.
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            <span>Made with</span>
            <Heart
              size={10}
              color="var(--accent-live)"
              fill="var(--accent-live)"
            />
            <span>for sports fans worldwide</span>
          </div>
          <p
            className="footer-copy"
            style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 4 }}
          >
            &copy; {currentYear} kickTvStreams. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>

        {/* Quick Links Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Tautan Cepat
          </h4>
          <ul
            className="footer-links"
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Compass size={13} color="var(--accent-live)" />
              <Link
                href="/"
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                className="hover-white"
              >
                Beranda
              </Link>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={13} color="var(--accent-live)" />
              <a
                href="https://discord.gg/XkkAQ2PEDz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                className="hover-white"
              >
                Discord Community
              </a>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={13} color="var(--accent-live)" />
              <Link
                href="/dmca"
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                className="hover-white"
              >
                DMCA Policy
              </Link>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={13} color="var(--accent-live)" />
              <Link
                href="/contact"
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
                className="hover-white"
              >
                Hubungi Kami
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
