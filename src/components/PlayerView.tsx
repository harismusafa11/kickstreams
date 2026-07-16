"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import AdBanner from "@/components/AdBanner";
import {
  ArrowLeft,
  Radio,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Send,
  Play,
  Users,
  Megaphone,
  User,
  CheckCircle,
} from "lucide-react";
import {
  type MatchEvent,
  getMatchStatus,
  formatMatchTime,
  getTeamNames,
  getCategoryDisplayName,
} from "@/lib/api";

interface PlayerViewProps {
  match: MatchEvent;
}

interface MessageData {
  id: string;
  content: string;
  createdAt: string;
  matchId: string;
  user: {
    username: string;
    role: string;
  };
}

interface AdConfig {
  id: string;
  adType: string;
  placement: string;
  scriptCode: string;
  isActive: boolean;
}

interface Announcement {
  id: string;
  content: string;
  matchId: string;
  isActive: boolean;
}

export default function PlayerView({ match }: PlayerViewProps) {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<MessageData[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // User States
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  // WebSocket Connection States
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [wsViewers, setWsViewers] = useState<number>(0);

  // Announcements & Ads States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Server Selection State
  const [selectedServer, setSelectedServer] = useState<number>(1);

  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const status = getMatchStatus(match);
  const { home, away } = getTeamNames(match);

  const streamUrl = `https://streamfree.top/embed/${match.category}/${match.stream_key}${selectedServer !== 1 ? `?server=${selectedServer}` : ""}`;

  // 1. Initial configuration on mount
  useEffect(() => {
    // Generate/Fetch User ID and Username from LocalStorage
    let storedUser = localStorage.getItem("kicktv_user");
    let userObj = storedUser ? JSON.parse(storedUser) : null;
    if (!userObj) {
      const newId = Math.random().toString(36).substring(2, 11);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      userObj = { id: newId, username: `Guest_${randomNum}` };
      localStorage.setItem("kicktv_user", JSON.stringify(userObj));
    }
    setUserId(userObj.id);
    setUsername(userObj.username);
    setUsernameInput(userObj.username);

    // Fetch initial chat messages (Global room)
    fetch(`/api/messages?matchId=global`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setChatMessages(data))
      .catch((err) => console.error("Error loading chat history:", err));

    // Fetch Announcements specific to this match (or global)
    fetch(`/api/announcements?matchId=${match.stream_key}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAnnouncements(data))
      .catch((err) => console.error("Error fetching announcements:", err));
  }, [match.stream_key]);

  // 1.5 Poll messages if WS is not connected
  useEffect(() => {
    if (wsStatus === "connected" || !match.stream_key) return;

    const interval = setInterval(() => {
      fetch(`/api/messages?matchId=global`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setChatMessages(data);
        })
        .catch((err) => console.error("Error polling messages:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [wsStatus, match.stream_key]);

  // 2. WebSocket Connection Lifecycle
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      setWsStatus("connecting");
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsStatus("connected");
        setErrorMsg("");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.event === "new_message") {
            const msg: MessageData = payload.data;
            if (msg.matchId === "global") {
              setChatMessages((prev) => [...prev, msg]);
            }
          } else if (payload.event === "viewer_count") {
            setWsViewers(payload.count);
          } else if (payload.event === "error") {
            setErrorMsg(payload.message);
            setTimeout(() => setErrorMsg(""), 4000);
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onclose = () => {
        setWsStatus("disconnected");
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setWsStatus("disconnected");
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, match.stream_key]);

  // Scroll chat to bottom without scrolling the whole page
  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      const parent = chatEndRef.current.parentElement;
      parent.scrollTo({
        top: parent.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatMessages]);

  // Send message over WebSocket or REST Fallback
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const content = chatInput.trim();
    setChatInput(""); // Clear input immediately for snappy UX

    const payload = {
      content,
      userId,
      username,
      matchId: "global",
    };

    if (socketRef.current && wsStatus === "connected") {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newMsg: MessageData = await res.json();
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        } else {
          const data = await res.json();
          setErrorMsg(data.error || "Gagal mengirim pesan.");
          setTimeout(() => setErrorMsg(""), 4000);
        }
      } catch (err) {
        console.error("REST Fallback Chat Error:", err);
      }
    }
  };

  // Submit stream report
  const handleSendReport = async () => {
    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.stream_key,
          matchTitle: `${home}${away ? ` vs ${away}` : ""}`,
        }),
      });
      if (res.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReport(false);
          setReportSubmitted(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Update username
  const handleSaveUsername = () => {
    if (!usernameInput.trim()) return;
    const cleanUsername = usernameInput.trim();
    setUsername(cleanUsername);
    localStorage.setItem(
      "kicktv_user",
      JSON.stringify({ id: userId, username: cleanUsername })
    );
    setIsEditingUsername(false);
  };

  return (
    <div className="player-layout">

      <div className="player-main">
        {/* Back button */}
        <div className="player-topbar">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to matches</span>
          </Link>
          <div className="player-match-info">
            <span className={`match-status ${status}`}>
              {status === "live" && <span className="status-dot" />}
              {status === "live"
                ? "LIVE"
                : status === "upcoming"
                ? "Upcoming"
                : "Ended"}
            </span>
            <span className="match-league-label">
              {match.league || getCategoryDisplayName(match.category)}
            </span>
          </div>
        </div>

        {/* Video Player */}
        <div className="player-container">
          <div className="player-embed">
            {status !== "upcoming" ? (
              <iframe
                src={streamUrl}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="player-iframe"
                title={`${home}${away ? ` vs ${away}` : ""} Stream`}
              />
            ) : (
              <div className="player-placeholder">
                <Play size={48} />
                <p>Stream starts at {formatMatchTime(match.match_timestamp)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Match details below player */}
        <div className="player-details">
          {/* Server Selection UI */}
          {status !== "upcoming" && (
            <div className="server-selection">
              <span className="server-label">
                <Radio size={14} /> Server
              </span>
              <div className="server-buttons">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    className={`server-btn ${selectedServer === num ? "active" : ""}`}
                    onClick={() => setSelectedServer(num)}
                  >
                    Server {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="player-details-top">
            <div>
              <h1 className="player-title">
                {home}
                {away ? ` vs ${away}` : ""}
              </h1>
              <div className="player-meta">
                <span className="player-meta-item">
                  <Clock size={13} />
                  {formatMatchTime(match.match_timestamp)}
                </span>
                <span className="player-meta-item">
                  {match.league || getCategoryDisplayName(match.category)}
                </span>
                {match.viewers && (
                  <span className="player-meta-item">
                    <Users size={13} />
                    {match.viewers} viewers
                  </span>
                )}
              </div>
            </div>
            <button
              className="chat-toggle-btn"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare size={16} />
              {chatOpen ? "Hide Chat" : "Show Chat"}
              {chatOpen ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronLeft size={14} />
              )}
            </button>
          </div>

          {/* Report button */}
          <div className="player-actions">
            <button
              className="report-btn"
              onClick={() => setShowReport(!showReport)}
              disabled={reportSubmitted}
            >
              <AlertTriangle size={14} />
              {reportSubmitted ? "Report Sent" : "Report Stream Issue"}
            </button>
          </div>

          {showReport && (
            <div className="report-panel" style={{ marginTop: 12 }}>
              {reportSubmitted ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-live)", fontSize: "0.9rem" }}>
                  <CheckCircle size={16} />
                  <span>Thank you! Stream issue has been reported to moderators.</span>
                </div>
              ) : (
                <>
                  <p className="report-text">
                    Is the stream lagging, down, or displaying wrong match? Click confirm to let us know.
                  </p>
                  <button
                    className="report-submit"
                    onClick={handleSendReport}
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? "Submitting..." : "Confirm & Submit Report"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* UnderPlayer Ad space */}
          <AdBanner placement="UnderPlayer" />
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`chat-panel ${chatOpen ? "open" : "closed"}`}>
        <div className="chat-header">
          <div className="chat-header-title">
            <MessageSquare size={15} />
            <span>Live Chat</span>
            <span
              style={{
                marginLeft: 8,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  wsStatus === "connected"
                    ? "var(--accent-live)"
                    : wsStatus === "connecting"
                    ? "var(--accent-amber)"
                    : "var(--accent-red)",
              }}
              title={`Chat status: ${wsStatus}`}
            />
          </div>
          <div className="chat-header-viewers">
            <Users size={13} />
            <span>{wsViewers > 0 ? wsViewers : (match.viewers || 0)}</span>
          </div>
        </div>

        {/* Username section */}
        <div
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <User size={13} />
            {isEditingUsername ? (
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={20}
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-sm)",
                  padding: "2px 6px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  width: 120,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
                autoFocus
              />
            ) : (
              <span>
                Chatting as: <strong>{username}</strong>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (isEditingUsername) {
                handleSaveUsername();
              } else {
                setIsEditingUsername(true);
              }
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--accent-live)",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            {isEditingUsername ? "Save" : "Change Nick"}
          </button>
        </div>

        {/* Active announcements inside chat panel */}
        {announcements.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              background: "var(--accent-live-dim)",
              borderBottom: "1px solid var(--accent-live-glow)",
              fontSize: "0.8rem",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Megaphone size={14} style={{ color: "var(--accent-live)", flexShrink: 0, marginTop: 2 }} />
            <div>
              {announcements.map((ann) => (
                <p key={ann.id} style={{ marginBottom: 4 }}>
                  {ann.content}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Slow Mode / WebSocket Warnings */}
        {errorMsg && (
          <div
            style={{
              padding: "8px 16px",
              background: "var(--accent-red-dim)",
              borderBottom: "1px solid var(--accent-red)",
              fontSize: "0.8rem",
              color: "var(--accent-red)",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div style={{ color: "var(--text-muted)", padding: 20, textAlign: "center", fontSize: "0.85rem", marginTop: 40 }}>
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <span
                  className="chat-user"
                  style={{
                    color:
                      msg.user.role === "ADMIN"
                        ? "var(--accent-amber)"
                        : msg.user.role === "MODERATOR"
                        ? "var(--accent-blue)"
                        : undefined,
                  }}
                >
                  {msg.user.username}
                  {msg.user.role !== "USER" && (
                    <span style={{ fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px", background: "var(--border-active)", marginLeft: 4 }}>
                      {msg.user.role}
                    </span>
                  )}
                </span>
                <span className="chat-text">{msg.content}</span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Sidebar ad container inside chat */}
        <AdBanner placement="Sidebar" />

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ketik pesan..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="chat-input"
          />
          <button
            className="chat-send"
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
