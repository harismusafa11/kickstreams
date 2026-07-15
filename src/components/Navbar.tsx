"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X, Tv, Home, Compass, Star, Settings } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim()) {
      router.push(`/?q=${encodeURIComponent(val)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="navbar-search" id="search-bar">
      <Search size={15} color="var(--text-muted)" />
      <input
        type="text"
        placeholder="Search matches..."
        value={searchValue}
        onChange={handleSearchChange}
        id="search-input"
      />
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    
    // Listen to hash change
    window.addEventListener("hashchange", handleHashChange);
    
    // Check hash on interval/navigation fallback
    const interval = setInterval(() => {
      if (window.location.hash !== activeHash) {
        setActiveHash(window.location.hash);
      }
    }, 500);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      clearInterval(interval);
    };
  }, [activeHash]);

  const isHome = pathname === "/";

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" id="brand-link">
          <Image
            src="/log0.webp"
            alt="kickTvStreams"
            width={120}
            height={38}
            priority
            style={{ height: 38, width: "auto" }}
          />
        </Link>

        <ul className={`navbar-nav ${menuOpen ? "open" : ""}`} id="nav-menu">
          <li>
            <Link
              href="/"
              className={`nav-link ${isHome && !activeHash ? "active" : ""}`}
              id="nav-home"
            >
              <Home size={15} />
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/#live-section"
              className={`nav-link ${
                isHome && activeHash === "#live-section" ? "active" : ""
              }`}
              id="nav-live"
            >
              <Tv size={15} />
              Live Now
            </Link>
          </li>
          <li>
            <Link
              href="/#schedule-section"
              className={`nav-link ${
                isHome && activeHash === "#schedule-section" ? "active" : ""
              }`}
              id="nav-schedule"
            >
              <Compass size={15} />
              Schedule
            </Link>
          </li>
          <li>
            <Link
              href="/#popular-section"
              className={`nav-link ${
                isHome && activeHash === "#popular-section" ? "active" : ""
              }`}
              id="nav-popular"
            >
              <Star size={15} />
              Popular
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          <Suspense
            fallback={
              <div className="navbar-search" id="search-bar">
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  id="search-input"
                  disabled
                />
              </div>
            }
          >
            <SearchInput />
          </Suspense>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="menu-toggle-btn"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
