"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Settings,
  AlertTriangle,
  Megaphone,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Tv,
  ExternalLink,
} from "lucide-react";

interface ReportGrouped {
  matchId: string;
  matchTitle: string;
  status: string;
  _count: {
    id: number;
  };
}

interface Announcement {
  id: string;
  content: string;
  matchId: string;
  isActive: boolean;
  createdAt: string;
}

interface AdConfig {
  id: string;
  adType: string;
  placement: string;
  scriptCode: string;
  isActive: boolean;
}

interface MatchEvent {
  id: string;
  name: string;
  stream_key: string;
  category: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "ads" | "announcements">("reports");
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Data states
  const [reports, setReports] = useState<ReportGrouped[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [matches, setMatches] = useState<MatchEvent[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Form states
  const [annContent, setAnnContent] = useState("");
  const [annMatchId, setAnnMatchId] = useState("global");
  
  const [adType, setAdType] = useState("Banner");
  const [adPlacement, setAdPlacement] = useState("UnderPlayer");
  const [adScript, setAdScript] = useState("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${password}`
  });

  const fetchData = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${password}` };
      const [reportsRes, announcementsRes, adsRes, matchesRes] = await Promise.all([
        fetch("/api/reports?grouped=true", { headers }),
        fetch("/api/announcements?all=true", { headers }),
        fetch("/api/ads?all=true", { headers }),
        fetch("/api/matches"),
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
      if (adsRes.ok) setAds(await adsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem("admin_password");
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, password]);

  // Handle report action (Resolve or Ignore)
  const handleReportAction = async (matchId: string, status: "RESOLVED" | "IGNORED") => {
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ matchId, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annContent.trim()) return;

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content: annContent, matchId: annMatchId }),
      });
      if (res.ok) {
        setAnnContent("");
        setAnnMatchId("global");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle announcement
  const handleToggleAnnouncement = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${password}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Ad Config
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adScript.trim()) return;

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          adType,
          placement: adPlacement,
          scriptCode: adScript,
        }),
      });
      if (res.ok) {
        setAdScript("");
        fetchData();
        alert("Script berhasil ditambahkan!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menyimpan script: ${errorData.error || res.statusText}\n(Apakah Anda menggunakan Adblocker? Matikan Adblocker saat mengatur iklan!)`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error jaringan: ${err.message}\n\nPastikan ekstensi AdBlocker (seperti uBlock, Adblock Plus, atau browser Brave) DIMATIKAN! Adblocker biasanya memblokir request yang mengandung kata "ads".`);
    }
  };

  // Toggle Ad
  const handleToggleAd = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Ad
  const handleDeleteAd = async (id: string) => {
    try {
      const res = await fetch(`/api/ads?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${password}` },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      localStorage.setItem("admin_password", password);
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="admin-container" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 24px" }}>
          <div style={{ background: "var(--bg-card)", padding: 40, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-primary)", maxWidth: 400, width: "100%", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 20 }}>Admin Login</h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                required
              />
              <button type="submit" style={{ padding: 12, borderRadius: "var(--radius-md)", border: "none", background: "var(--accent-live)", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                Login
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="admin-container" style={{ flex: 1, padding: "40px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        
        {/* Header dashboard */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Admin Panel</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Control center for kickTvStreams</p>
          </div>
          <button 
            onClick={fetchData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              transition: "all var(--transition-fast)"
            }}
            className="hover-bright"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Tab buttons */}
        <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--border-primary)", paddingBottom: 16, marginBottom: 32 }}>
          <button
            onClick={() => setActiveTab("reports")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: activeTab === "reports" ? "var(--bg-card)" : "transparent",
              color: activeTab === "reports" ? "var(--accent-live)" : "var(--text-secondary)",
              transition: "all var(--transition-fast)"
            }}
          >
            <AlertTriangle size={16} />
            Moderasi Laporan ({reports.filter(r => r.status === "PENDING").length})
          </button>
          
          <button
            onClick={() => setActiveTab("ads")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: activeTab === "ads" ? "var(--bg-card)" : "transparent",
              color: activeTab === "ads" ? "var(--accent-live)" : "var(--text-secondary)",
              transition: "all var(--transition-fast)"
            }}
          >
            <Settings size={16} />
            Manajemen Iklan
          </button>
          
          <button
            onClick={() => setActiveTab("announcements")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: activeTab === "announcements" ? "var(--bg-card)" : "transparent",
              color: activeTab === "announcements" ? "var(--accent-live)" : "var(--text-secondary)",
              transition: "all var(--transition-fast)"
            }}
          >
            <Megaphone size={16} />
            Pengumuman
          </button>
        </div>

        {/* Tab contents */}
        <div style={{ minHeight: 400 }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300, color: "var(--text-secondary)" }}>
              <RefreshCw size={24} className="animate-spin" />
              <span style={{ marginLeft: 10 }}>Loading database content...</span>
            </div>
          )}

          {!loading && activeTab === "reports" && (
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 16 }}>Reports from Users ("Link Rusak")</h2>
              {reports.length === 0 ? (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
                  No reports submitted yet. Excellent! All streams are working.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {reports.map((report) => (
                    <div 
                      key={report.matchId}
                      style={{
                        background: "var(--bg-card)",
                        border: `1px solid ${report.status === "PENDING" ? "var(--accent-red)" : "var(--border-primary)"}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "20px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 20
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: report.status === "PENDING" ? "var(--accent-red-dim)" : "var(--border-active)",
                            color: report.status === "PENDING" ? "var(--accent-red)" : "var(--text-secondary)"
                          }}>
                            {report.status}
                          </span>
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            Reports count: <strong>{report._count.id}</strong>
                          </span>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                          {report.matchTitle}
                          <Link href={`/watch/${report.matchId}`} target="_blank" style={{ color: "var(--accent-blue)", display: "flex", alignItems: "center" }}>
                            <ExternalLink size={14} />
                          </Link>
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
                          Match ID: {report.matchId}
                        </p>
                      </div>

                      {report.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 12 }}>
                          <button
                            onClick={() => handleReportAction(report.matchId, "RESOLVED")}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              borderRadius: "var(--radius-md)",
                              border: "none",
                              background: "rgba(0, 230, 118, 0.15)",
                              color: "var(--accent-live)",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.85rem"
                            }}
                            className="hover-bright"
                          >
                            <CheckCircle size={14} />
                            Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(report.matchId, "IGNORED")}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              borderRadius: "var(--radius-md)",
                              border: "none",
                              background: "rgba(255, 255, 255, 0.05)",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.85rem"
                            }}
                            className="hover-bright"
                          >
                            <XCircle size={14} />
                            Ignore
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "ads" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {/* Form Create */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20 }}>Configure Adsterra Script</h3>
                <form onSubmit={handleSaveAd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>Ad Type</label>
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 10,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)"
                      }}
                    >
                      <option value="Popunder">Popunder</option>
                      <option value="Native">Native</option>
                      <option value="Banner">Banner</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>Placement Area</label>
                    <select
                      value={adPlacement}
                      onChange={(e) => setAdPlacement(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 10,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)"
                      }}
                    >
                      <option value="UnderPlayer">Under Player</option>
                      <option value="Sidebar">Sidebar</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>Adsterra Script Code (raw HTML/JS)</label>
                    <textarea
                      value={adScript}
                      onChange={(e) => setAdScript(e.target.value)}
                      rows={6}
                      placeholder='<!-- Adsterra script code here -->'
                      style={{
                        width: "100%",
                        padding: 12,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        resize: "vertical"
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "12px",
                      background: "var(--accent-live)",
                      color: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontWeight: 700,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8
                    }}
                    className="hover-bright"
                  >
                    <Plus size={16} />
                    Save Ad Script
                  </button>
                </form>
              </div>

              {/* List Configs */}
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20 }}>Active Ad Configurations</h3>
                {ads.length === 0 ? (
                  <div style={{ color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center" }}>
                    No ad script configurations saved yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {ads.map((ad) => (
                      <div 
                        key={ad.id} 
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-primary)",
                          borderRadius: "var(--radius-lg)",
                          padding: 20
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ background: "var(--border-active)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600 }}>
                              {ad.adType}
                            </span>
                            <span style={{ marginLeft: 8, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                              Placement: {ad.placement}
                            </span>
                          </div>
                          
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <button
                              onClick={() => handleToggleAd(ad.id, ad.isActive)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: ad.isActive ? "var(--accent-live)" : "var(--text-muted)"
                              }}
                            >
                              {ad.isActive ? "ACTIVE" : "INACTIVE"}
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)" }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <div style={{ marginTop: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: 10, border: "1px solid var(--border-subtle)" }}>
                          <pre style={{ margin: 0, fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", overflowX: "auto" }}>
                            {ad.scriptCode.substring(0, 100)}
                            {ad.scriptCode.length > 100 && "..."}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === "announcements" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {/* Form Create */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20 }}>Publish Announcement</h3>
                <form onSubmit={handleAddAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>Target Destination</label>
                    <select
                      value={annMatchId}
                      onChange={(e) => setAnnMatchId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: 10,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)"
                      }}
                    >
                      <option value="global">All Pages (Global Banner)</option>
                      {matches.map((m) => (
                        <option key={m.id} value={m.stream_key}>
                          Match: {m.name} ({m.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>Content / Message</label>
                    <textarea
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      rows={4}
                      placeholder="Enter announcement text..."
                      style={{
                        width: "100%",
                        padding: 12,
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        resize: "vertical"
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "12px",
                      background: "var(--accent-live)",
                      color: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontWeight: 700,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8
                    }}
                    className="hover-bright"
                  >
                    <Plus size={16} />
                    Publish Banner
                  </button>
                </form>
              </div>

              {/* List */}
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 20 }}>Existing Announcements</h3>
                {announcements.length === 0 ? (
                  <div style={{ color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-lg)", padding: 40, textAlign: "center" }}>
                    No announcements published yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-primary)",
                          borderRadius: "var(--radius-lg)",
                          padding: 20
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ background: ann.matchId === "global" ? "var(--accent-blue-dim)" : "var(--accent-live-dim)", color: ann.matchId === "global" ? "var(--accent-blue)" : "var(--accent-live)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 700 }}>
                              {ann.matchId === "global" ? "GLOBAL" : "MATCH SPECIFIC"}
                            </span>
                            {ann.matchId !== "global" && (
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginLeft: 8 }}>
                                Target: {ann.matchId}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <button
                              onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: ann.isActive ? "var(--accent-live)" : "var(--text-muted)"
                              }}
                            >
                              {ann.isActive ? "ACTIVE" : "INACTIVE"}
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)" }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p style={{ marginTop: 12, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {ann.content}
                        </p>
                        <span style={{ display: "block", marginTop: 8, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Published: {new Date(ann.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
