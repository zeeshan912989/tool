"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, Loader2, Rocket, Zap,
  Hash, MessageSquare, Mic2, Clock, Trash2, ChevronDown,
  Search, BarChart3, User, Globe, TrendingUp, ShieldCheck, UserCircle,
  ExternalLink, LogOut, Camera, Play, Eye, Target, Link
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface GeneratedResult {
  hooks: string[];
  caption: string;
  hashtags: string[];
}

interface HistoryItem {
  id: string;
  product: string;
  style: string;
  platform: string;
  result: GeneratedResult;
  timestamp: number;
}

// ── Helpers ────────────────────────────────────────────────
const STYLES = [
  { id: "luxury",    label: "💎 Luxury",    desc: "Aspirational & exclusive" },
  { id: "viral",     label: "🔥 Viral",     desc: "Bold & scroll-stopping" },
  { id: "emotional", label: "💕 Emotional", desc: "Story-driven & heartfelt" },
  { id: "funny",     label: "😂 Funny",     desc: "Witty & relatable" },
];

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",     icon: "🎵" },
  { id: "instagram", label: "Instagram",  icon: "📸" },
  { id: "youtube",   label: "YT Shorts",  icon: "▶️" },
];

function CopyButton({ text, size = "sm", onCopy }: { text: string; size?: "sm" | "md"; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`copy-btn ${size}`} onClick={copy} title="Copy to clipboard">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {size === "md" && <span>{copied ? "Copied!" : "Copy"}</span>}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function Home() {
  const [product, setProduct]   = useState("");
  const [style, setStyle]       = useState("luxury");
  const [platform, setPlatform] = useState("tiktok");
  const [result, setResult]     = useState<GeneratedResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");

  // Hashtag Research State
  const [tagQuery, setTagQuery] = useState("");
  const [tagResults, setTagResults] = useState<any>(null);
  const [tagLoading, setTagLoading] = useState(false);

  // TikTok / Client Dashboard State
  const [clientData, setClientData] = useState<any>(null);
  const [clientLoading, setClientLoading] = useState(false);

  // Spy Tool State
  const [spyUsername, setSpyUsername] = useState("");
  const [spyPlatform, setSpyPlatform] = useState("tiktok");
  const [spyData, setSpyData] = useState<any>(null);
  const [spyLoading, setSpyLoading] = useState(false);

  // URL Scraper State
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState<GeneratedResult | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlScrapedData, setUrlScrapedData] = useState("");

  // Calendar State
  const [scheduledPosts, setScheduledPosts] = useState<Record<string, any[]>>({
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Google Trends State
  const [trendQuery, setTrendQuery] = useState("jewellery");
  const [trendData, setTrendData] = useState<any[] | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  // Image Generator State
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgResult, setImgResult] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgDescription, setImgDescription] = useState("");

  const isConnected = !!clientData;

  // Snackbar State
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false
  });

  const showSnackbar = (message: string, type: "success" | "error" | "info" = "success") => {
    setSnackbar({ message, type, visible: true });
    setTimeout(() => setSnackbar(prev => ({ ...prev, visible: false })), 4000);
  };

  // Load initial data and handle redirect callback
  useEffect(() => {
    const saved = localStorage.getItem("tiktok-ai-history");
    if (saved) setHistory(JSON.parse(saved));
    
    const savedSchedule = localStorage.getItem("tiktok-ai-schedule");
    if (savedSchedule) setScheduledPosts(JSON.parse(savedSchedule));
  }, []);

  const saveToHistory = (r: GeneratedResult) => {
    const item: HistoryItem = {
      id: Date.now().toString(),
      product,
      style,
      platform,
      result: r,
      timestamp: Date.now(),
    };
    const updated = [item, ...history].slice(0, 20); // keep last 20
    setHistory(updated);
    localStorage.setItem("tiktok-ai-history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("tiktok-ai-history");
  };

  const generate = async () => {
    if (!product.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, style, platform }),
      });
      const data = await res.json();
      if (data.error) {
        setResult(data);
        saveToHistory(data);
        showSnackbar("Content generated successfully!", "success");
      }
    } catch {
      showSnackbar("Cannot connect to backend.", "error");
      setError("Cannot connect to backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const generateFromUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlResult(null);
    setUrlScrapedData("");
    setError("");

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/scrape-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, style, platform }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUrlScrapedData(data.scrapedData);
        setUrlResult({ hooks: data.hooks, caption: data.caption, hashtags: data.hashtags });
        // Optionally save to history with URL as the product
        saveToHistory({ hooks: data.hooks, caption: data.caption, hashtags: data.hashtags });
      }
    } catch (e) {
      console.error(e);
      setError("Failed to scrape URL. Make sure it is public.");
    } finally {
      setUrlLoading(false);
    }
  };

  const researchTags = async () => {
    if (!tagQuery.trim()) return;
    setTagLoading(true);
    setTagResults(null);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/hashtags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: tagQuery }),
      });
      const data = await res.json();
      setTagResults(data);
      showSnackbar("Hashtags found!", "success");
    } catch {
      showSnackbar("Hashtag research failed.", "error");
      setError("Failed to connect to hashtag researcher.");
    } finally {
      setTagLoading(false);
    }
  };

  const scrapeCompetitor = async () => {
    if (!spyUsername.trim()) return;
    setSpyLoading(true);
    setSpyData(null);
    setError(""); // Clear global error
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: spyUsername, platform: spyPlatform }),
      });
      const data = await res.json();
      setSpyData(data);
      showSnackbar("Competitor data scraped!", "success");
    } catch {
      showSnackbar("Competitor scraping failed.", "error");
      setError("Cannot reach the research server. Please try again.");
    } finally {
      setSpyLoading(false);
    }
  };

  const fetchClientDashboard = async () => {
    setClientLoading(true);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/scrape/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "bhaijewelers" })
      });
      const data = await res.json();
      if (!data.error) {
        setClientData(data);
        showSnackbar("Dashboard updated!", "success");
      } else {
        alert(data.error);
        showSnackbar("Dashboard update failed.", "error");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load dashboard");
      showSnackbar("Failed to load dashboard.", "error");
    } finally {
      setClientLoading(false);
    }
  };

  const fetchTrendsData = async () => {
    setTrendLoading(true);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const res = await fetch(`${baseUrl}/trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trendQuery })
      });
      const data = await res.json();
      if (!data.error) {
        setTrendData(data.trend);
        showSnackbar("Trends updated!", "success");
      } else {
        alert(data.error);
        showSnackbar("Trends update failed.", "error");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch Google Trends data");
      showSnackbar("Failed to fetch trends.", "error");
    } finally {
      setTrendLoading(false);
    }
  };

  const generateImage = async () => {
    if (!imgPrompt.trim()) return alert("Please enter a prompt");
    setImgLoading(true);
    setImgResult(null);
    setImgDescription("");
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    try {
      const formData = new FormData();
      formData.append("prompt", imgPrompt);
      if (imgFile) formData.append("image", imgFile);

      const res = await fetch(`${baseUrl}/image-gen/generate`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.image) {
        setImgResult(data.image);
        setImgDescription(data.description || "");
        showSnackbar("Banner generated successfully!", "success");
      } else {
        alert(data.error || "Image generation failed");
        showSnackbar("Banner generation failed.", "error");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to Gemini API");
      showSnackbar("Connection error.", "error");
    } finally {
      setImgLoading(false);
    }
  };

  const handleImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Drag & Drop Handlers ──
  const onDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const onDrop = (e: React.DragEvent, day: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const newSchedule = { ...scheduledPosts };
    
    // Optional: remove from another day if dragging between days
    Object.keys(newSchedule).forEach(d => {
      newSchedule[d] = newSchedule[d].filter(post => post.id !== draggedItem.id);
    });

    newSchedule[day].push(draggedItem);
    setScheduledPosts(newSchedule);
    localStorage.setItem("tiktok-ai-schedule", JSON.stringify(newSchedule));
    setDraggedItem(null);
    showSnackbar("Post scheduled successfully!", "success");
  };

  const removeFromSchedule = (day: string, id: string) => {
    const newSchedule = { ...scheduledPosts };
    newSchedule[day] = newSchedule[day].filter(post => post.id !== id);
    setScheduledPosts(newSchedule);
    localStorage.setItem("tiktok-ai-schedule", JSON.stringify(newSchedule));
    showSnackbar("Post removed from schedule.", "info");
  };

  const onTimeChange = (day: string, id: string, newTime: string) => {
    const newSchedule = { ...scheduledPosts };
    newSchedule[day] = newSchedule[day].map(post => 
      post.id === id ? { ...post, scheduledTime: newTime } : post
    );
    setScheduledPosts(newSchedule);
    localStorage.setItem("tiktok-ai-schedule", JSON.stringify(newSchedule));
  };

  const autoPlanWeeklySchedule = () => {
    if (history.length === 0) return alert("Generate some content first to auto-plan!");
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const bestTimes = ["09:00", "13:00", "18:00"]; // Optimal times
    
    const newSchedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    } as Record<string, any[]>;

    // Distribute up to 14 items across the week (2 per day max)
    const itemsToSchedule = [...history].slice(0, 14);
    
    itemsToSchedule.forEach((item, index) => {
      const day = days[index % 7];
      const time = bestTimes[index % bestTimes.length];
      newSchedule[day].push({ ...item, scheduledTime: time });
    });

    setScheduledPosts(newSchedule);
    localStorage.setItem("tiktok-ai-schedule", JSON.stringify(newSchedule));
    showSnackbar("Weekly schedule auto-planned!", "success");
  };

  const loadFromHistory = (item: HistoryItem) => {
    setProduct(item.product);
    setStyle(item.style);
    setPlatform(item.platform);
    setResult(item.result);
    setShowHistory(false);
  };

  const allText = result
    ? `HOOKS:\n${result.hooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags.join(" ")}`
    : "";

  return (
    <>
    <div className="min-h-screen bg-[#060608]">
      {/* Mobile Top Header */}
      <header className="md-hidden-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", display: "flex", alignItems: "center", justifyCenter: "center", color: "white", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)" }}>
            <Zap size={18} style={{ margin: "auto" }} />
          </div>
          <span style={{ fontWeight: 800, color: "white", fontSize: "16px", letterSpacing: "-0.02em" }}>Jewellery AI</span>
        </div>
        <div className="connection-pill">
          {isConnected ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", textTransform: "uppercase" }}>Linked</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Off</span>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-layout">
        {/* ── Sidebar Navigation (Desktop Only) ─────── */}
        <aside className="sidebar desktop-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Rocket size={24} />
            </div>
            <div className="brand-text">
              <h2>JewelleryAI</h2>
              <span>Growth Engine</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === "generator" ? "active" : ""}`} onClick={() => setActiveTab("generator")}><Zap size={20} /><span>Generator</span></button>
            <button className={`nav-item ${activeTab === "url-to-post" ? "active" : ""}`} onClick={() => setActiveTab("url-to-post")}><Link size={20} /><span>Scraper</span></button>
            <button className={`nav-item ${activeTab === "hashtags" ? "active" : ""}`} onClick={() => setActiveTab("hashtags")}><Hash size={20} /><span>Tags</span></button>
            <button className={`nav-item ${activeTab === "spy" ? "active" : ""}`} onClick={() => setActiveTab("spy")}><Eye size={20} /><span>Spy Tool</span></button>
            <button className={`nav-item ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}><Clock size={20} /><span>Calendar</span></button>
            <button className={`nav-item ${activeTab === "trends" ? "active" : ""}`} onClick={() => setActiveTab("trends")}><TrendingUp size={20} /><span>Trends</span></button>
            <button className={`nav-item ${activeTab === "image-gen" ? "active" : ""}`} onClick={() => setActiveTab("image-gen")}><Sparkles size={20} /><span>Banner</span></button>
            <button className={`nav-item ${activeTab === "account" ? "active" : ""}`} onClick={() => { setActiveTab("account"); if(!clientData) fetchClientDashboard(); }}><UserCircle size={20} /><span>Account</span></button>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              {clientData ? (
                <div className="user-pill" onClick={() => setActiveTab("account")}>
                  <img src={clientData.profile.avatar_url} alt="User" />
                  <span>{clientData.profile.username}</span>
                </div>
              ) : (
                <button className="connect-mini" onClick={() => setActiveTab("account")}><ShieldCheck size={14} />Client Account</button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Mobile Navigation Bar (Mobile Only) ─────── */}
        <nav className="mobile-nav">
          <div className="mobile-nav-container no-scrollbar">
            {[
              { id: "generator", icon: Zap, label: "Magic" },
              { id: "url-to-post", icon: Link, label: "Scrape" },
              { id: "hashtags", icon: Hash, label: "Tags" },
              { id: "spy", icon: Eye, label: "Spy" },
              { id: "calendar", icon: Clock, label: "Plan" },
              { id: "trends", icon: TrendingUp, label: "Trends" },
              { id: "image-gen", icon: Sparkles, label: "Banner" },
              { id: "account", icon: UserCircle, label: "Account" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`mobile-nav-item ${activeTab === item.id ? "active" : ""}`}
              >
                <div className="icon-wrapper">
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── Main Content Area ──────────────────────── */}
        <section className="main-stage">
          <div className="stage-container">

          {/* ── ERROR DISPLAY (Tab Specific) ────────── */}
          {error && activeTab !== "generator" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">
              <ShieldCheck size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* ── CONTENT GENERATOR VIEW ────────────────── */}
          {activeTab === "generator" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="view-content"
            >
              {/* ── Header ─────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="header"
              >
                <div className="badge">
                  <Rocket size={14} />
                  <span>TikTok AI Growth</span>
                </div>
                <h1 className="gradient-text">Jewellery AI Assistant</h1>
                <p className="subtitle">
                  Generate viral hooks, captions &amp; hashtags for your jewellery brand — in seconds.
                </p>
              </motion.div>

              {/* ── Input Card ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card main-form"
              >
                {/* Product input */}
                <div className="input-group">
                  <label htmlFor="product">Describe your jewellery piece</label>
                  <div className="input-wrapper">
                    <input
                      id="product"
                      placeholder="e.g. 18k Rose Gold Necklace with Emerald Pendant..."
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && generate()}
                    />
                  </div>
                </div>

                {/* Style selector */}
                <div className="selector-group">
                  <label>Content Style</label>
                  <div className="pills">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        className={`pill ${style === s.id ? "active" : ""}`}
                        onClick={() => setStyle(s.id)}
                        title={s.desc}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform selector */}
                <div className="selector-group">
                  <label>Platform</label>
                  <div className="pills">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        className={`pill ${platform === p.id ? "active" : ""}`}
                        onClick={() => setPlatform(p.id)}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions row */}
                <div className="actions-row">
                  <button
                    className="primary"
                    onClick={generate}
                    disabled={loading || !product.trim()}
                  >
                    {loading ? (
                      <Loader2 className="spin" size={20} />
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Generate Content</span>
                      </>
                    )}
                  </button>

                  {history.length > 0 && (
                    <button
                      className="secondary-btn"
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <Clock size={16} />
                      <span>History ({history.length})</span>
                      <ChevronDown
                        size={14}
                        style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}
                      />
                    </button>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="error-box">⚠️ {error}</div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ── History Panel (Inline) ────────────────── */}
          <AnimatePresence>
            {showHistory && history.length > 0 && activeTab === "generator" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card history-panel"
              >
                <div className="history-header">
                  <h3><Clock size={16} /> Recent Generations</h3>
                  <button className="danger-btn" onClick={clearHistory}><Trash2 size={14} /> Clear All</button>
                </div>
                <div className="history-list">
                  {history.map((item) => (
                    <button key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                      <div className="history-product">{item.product}</div>
                      <div className="history-meta">
                        <span className="tag">{item.style}</span>
                        <span className="tag">{item.platform}</span>
                        <span className="time">{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── HASHTAG RESEARCH VIEW ─────────────────── */}
          {activeTab === "hashtags" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="glass-card research-card">
                <div className="input-group">
                  <label>Deep Hashtag Research</label>
                  <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input 
                      placeholder="Enter jewellery type (e.g. Diamond Rings, Boho Bracelets)..." 
                      value={tagQuery}
                      onChange={(e) => setTagQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && researchTags()}
                    />
                    <button 
                      className="primary search-btn" 
                      onClick={researchTags}
                      disabled={tagLoading || !tagQuery.trim()}
                    >
                      {tagLoading ? <Loader2 className="spin" size={18} /> : "Search"}
                    </button>
                  </div>
                </div>

                {tagResults && (
                  <div className="tag-results-container">
                    <div className="strategy-box">
                      <TrendingUp size={16} />
                      <p>{tagResults.strategy}</p>
                    </div>

                    <div className="tag-grid">
                      <div className="tag-column">
                        <h4>💎 Niche Tags</h4>
                        <div className="hashtags-wrap">
                          {tagResults.niche.map((t: string, i: number) => (
                            <span key={i} className="hashtag-chip niche" onClick={() => { navigator.clipboard.writeText(t); showSnackbar("Copied tag!", "info"); }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="tag-column">
                        <h4>💕 Community</h4>
                        <div className="hashtags-wrap">
                          {tagResults.community.map((t: string, i: number) => (
                            <span key={i} className="hashtag-chip community" onClick={() => { navigator.clipboard.writeText(t); showSnackbar("Copied tag!", "info"); }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="tag-column">
                        <h4>🚀 Broad</h4>
                        <div className="hashtags-wrap">
                          {tagResults.broad.map((t: string, i: number) => (
                            <span key={i} className="hashtag-chip broad" onClick={() => { navigator.clipboard.writeText(t); showSnackbar("Copied tag!", "info"); }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CLIENT DASHBOARD VIEW ──────────────────── */}
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="section-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "24px" }}>Client Analytics (@bhaijewelers)</h2>
                  <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>Real-time TikTok data and AI insights</p>
                </div>
                <button 
                  className="primary spy-btn" 
                  onClick={fetchClientDashboard}
                  disabled={clientLoading}
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: "10px 20px" }}
                >
                  {clientLoading ? <Loader2 className="spin" size={18} /> : "Scrape Latest Data"}
                </button>
              </div>

              {clientLoading && !clientData ? (
                <div style={{ textAlign: "center", padding: "100px 0" }}>
                  <Loader2 className="spin" size={40} style={{ color: "#10b981", margin: "0 auto 16px auto" }} />
                  <p style={{ color: "#94a3b8" }}>Scraping TikTok for @bhaijewelers...</p>
                </div>
              ) : clientData ? (
                <div className="account-dashboard" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Top Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div className="glass-card profile-card" style={{ padding: "24px" }}>
                      <div className="profile-info" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                        <img src={clientData.profile.avatar_url} alt="Profile" className="avatar" style={{ width: "64px", height: "64px", borderRadius: "50%" }} />
                        <div className="profile-text">
                          <h3 style={{ margin: 0, fontSize: "20px" }}>{clientData.profile.display_name}</h3>
                          <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>@{clientData.profile.username}</p>
                        </div>
                      </div>
                      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <div className="stat-item" style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                          <span className="stat-value" style={{ display: "block", fontSize: "24px", fontWeight: "bold", color: "white" }}>{(clientData.profile.follower_count / 1000).toFixed(1)}k</span>
                          <span className="stat-label" style={{ fontSize: "12px", color: "#94a3b8" }}>Followers</span>
                        </div>
                        <div className="stat-item" style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                          <span className="stat-value" style={{ display: "block", fontSize: "24px", fontWeight: "bold", color: "white" }}>{(clientData.profile.likes_count / 1000).toFixed(1)}k</span>
                          <span className="stat-label" style={{ fontSize: "12px", color: "#94a3b8" }}>Total Likes</span>
                        </div>
                        <div className="stat-item" style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                          <span className="stat-value" style={{ display: "block", fontSize: "24px", fontWeight: "bold", color: "white" }}>{clientData.profile.video_count}</span>
                          <span className="stat-label" style={{ fontSize: "12px", color: "#94a3b8" }}>Videos</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Sparkles className="icon-purple" size={18} /> AI Growth Engine</h3>
                      
                      <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                        <strong style={{ display: "block", marginBottom: "4px", color: "#c4b5fd", fontSize: "13px" }}>Best Posting Times:</strong>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {clientData.analytics.best_posting_times.map((t: string, i: number) => (
                            <span key={i} className="tag" style={{ background: "#8b5cf6", color: "white" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <strong style={{ display: "block", marginBottom: "4px", color: "#6ee7b7", fontSize: "13px" }}>Engagement Rate:</strong>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>{clientData.analytics.avg_engagement_rate}%</span>
                        <span style={{ marginLeft: "8px", color: "#94a3b8", fontSize: "13px" }}>(from last 15 videos)</span>
                      </div>
                    </div>
                  </div>

                  {/* Competitor & Watch Time Tips */}
                  <div className="glass-card" style={{ padding: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 12px 0", color: "#fca5a5", display: "flex", alignItems: "center", gap: "8px" }}><Target size={16} /> Competitor Gap</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5 }}>{clientData.analytics.competitor_analysis}</p>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 12px 0", color: "#fcd34d", display: "flex", alignItems: "center", gap: "8px" }}><Eye size={16} /> Watch Time Tip</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5 }}>{clientData.analytics.watch_time_tip}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Videos Grid */}
                  <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}><Play className="icon-red" size={18} /> Latest Videos Performance</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                      {clientData.analytics.recent_videos.map((vid: any) => (
                        <div key={vid.id} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <img src={vid.cover} alt="Cover" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                          <div style={{ padding: "12px" }}>
                            <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#cbd5e1", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{vid.desc || "No caption"}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Eye size={12} /> {(vid.views / 1000).toFixed(1)}k</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f43f5e" }}><Zap size={12} /> {(vid.likes / 1000).toFixed(1)}k</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "100px 0", color: "#64748b" }}>
                  <BarChart3 size={48} style={{ opacity: 0.2, margin: "0 auto 16px auto" }} />
                  <p>Click "Scrape Latest Data" to generate the client dashboard.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── GOOGLE TRENDS VIEW ─────────────────────── */}
          {activeTab === "trends" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="glass-card research-card">
                <div className="section-header" style={{ marginBottom: "20px" }}>
                  <TrendingUp size={24} className="icon-purple" />
                  <h2 style={{ margin: 0 }}>Google Trends Explorer</h2>
                </div>
                
                <div className="input-group">
                  <label>Search Keyword for Trend Analysis (Past 12 Months)</label>
                  <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input 
                      placeholder="e.g. quantum computing, gold necklace, diamond ring..." 
                      value={trendQuery}
                      onChange={(e) => setTrendQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchTrendsData()}
                    />
                    <button 
                      className="primary search-btn" 
                      onClick={fetchTrendsData}
                      disabled={trendLoading || !trendQuery.trim()}
                    >
                      {trendLoading ? <Loader2 className="spin" size={18} /> : "Search Trends"}
                    </button>
                  </div>
                </div>

                {trendData && trendData.length > 0 && (
                  <div className="tag-results-container" style={{ marginTop: "24px" }}>
                    <div className="strategy-box">
                      <Sparkles size={16} />
                      <p>Trend data fetched successfully for: <strong>{trendQuery}</strong></p>
                    </div>

                    <div className="trend-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginTop: "16px" }}>
                      {trendData.slice().reverse().slice(0, 12).map((item, index) => (
                        <div key={index} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>{item.date}</div>
                          <div style={{ fontSize: "20px", fontWeight: "bold", color: item.values[0].extracted_value > 50 ? "#10b981" : "#e2e8f0" }}>
                            {item.values[0].extracted_value}
                          </div>
                          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Interest</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {trendData && trendData.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    No trend data available for this keyword.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── AI BANNER (IMAGE GENERATOR) VIEW ─────── */}
          {activeTab === "image-gen" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="glass-card research-card">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <div style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", padding: "10px", borderRadius: "12px" }}>
                    <Sparkles size={22} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px" }}>AI Product Banner Generator</h2>
                    <p style={{ margin: "2px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>Powered by Google Gemini 2.0 — Upload a product image + prompt → get a viral banner</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Left: Inputs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Image Upload */}
                    <div className="input-group">
                      <label>Upload Product Image (Optional)</label>
                      <label htmlFor="img-upload" style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: "12px", padding: "24px", border: "2px dashed rgba(139,92,246,0.4)",
                        borderRadius: "12px", cursor: "pointer", background: "rgba(139,92,246,0.05)",
                        transition: "all 0.2s", minHeight: "160px"
                      }}>
                        {imgPreview ? (
                          <img src={imgPreview} alt="Preview" style={{ maxHeight: "140px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }} />
                        ) : (
                          <>
                            <div style={{ width: "48px", height: "48px", background: "rgba(139,92,246,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Sparkles size={24} color="#8b5cf6" />
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <p style={{ margin: 0, color: "#c4b5fd", fontWeight: 600 }}>Click to upload product photo</p>
                              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "12px" }}>PNG, JPG, WEBP up to 10MB</p>
                            </div>
                          </>
                        )}
                      </label>
                      <input id="img-upload" type="file" accept="image/*" onChange={handleImgFileChange} style={{ display: "none" }} />
                      {imgFile && (
                        <button onClick={() => { setImgFile(null); setImgPreview(null); }} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", marginTop: "4px" }}>
                          ✕ Remove image
                        </button>
                      )}
                    </div>

                    {/* Prompt Input */}
                    <div className="input-group">
                      <label>Describe Your Banner</label>
                      <textarea
                        placeholder="e.g. Luxury gold necklace with emerald stones on dark velvet, elegant bokeh background, TikTok viral style, premium feel..."
                        value={imgPrompt}
                        onChange={(e) => setImgPrompt(e.target.value)}
                        rows={5}
                        style={{
                          width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px", padding: "14px", color: "white", fontSize: "14px",
                          resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box"
                        }}
                      />
                    </div>

                    {/* Quick Prompts */}
                    <div>
                      <label style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", display: "block" }}>✨ Quick Prompts</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["Luxury dark background", "Gold & diamonds TikTok", "Bridal jewellery banner", "Pakistani traditional gold", "Minimalist white studio"].map((p) => (
                          <button key={p} onClick={() => setImgPrompt(p)} style={{
                            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                            color: "#c4b5fd", padding: "5px 10px", borderRadius: "20px", fontSize: "12px", cursor: "pointer"
                          }}>{p}</button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      className="primary spy-btn"
                      onClick={generateImage}
                      disabled={imgLoading || !imgPrompt.trim()}
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", padding: "14px", fontSize: "16px", fontWeight: 700, borderRadius: "12px" }}
                    >
                      {imgLoading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                          <Loader2 className="spin" size={20} /> Generating with Gemini...
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                          <Sparkles size={20} /> Generate AI Banner
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Right: Result */}
                  <div>
                    {imgLoading && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "#94a3b8" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.5s infinite" }}>
                          <Sparkles size={36} color="white" />
                        </div>
                        <p style={{ margin: 0, fontWeight: 600 }}>Gemini is creating your banner...</p>
                        <p style={{ margin: 0, fontSize: "13px" }}>This may take 10-20 seconds</p>
                      </div>
                    )}

                    {imgResult && !imgLoading && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: "2px solid rgba(139,92,246,0.4)", boxShadow: "0 0 30px rgba(139,92,246,0.2)" }}>
                          <img src={imgResult} alt="Generated Banner" style={{ width: "100%", display: "block", borderRadius: "14px" }} />
                          <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", color: "#c4b5fd" }}>
                            ✨ Gemini 2.0
                          </div>
                        </div>
                        {imgDescription && (
                          <div className="strategy-box" style={{ marginTop: "0" }}>
                            <Sparkles size={14} />
                            <p style={{ margin: 0, fontSize: "13px" }}>{imgDescription}</p>
                          </div>
                        )}
                        <a
                          href={imgResult}
                          download="ai-banner.png"
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            background: "linear-gradient(135deg, #10b981, #059669)", color: "white",
                            padding: "12px", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "14px"
                          }}
                        >
                          ⬇️ Download Banner
                        </a>
                      </div>
                    )}

                    {!imgResult && !imgLoading && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "#475569", textAlign: "center" }}>
                        <div style={{ width: "100px", height: "100px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Sparkles size={40} style={{ opacity: 0.2 }} />
                        </div>
                        <p style={{ margin: 0 }}>Your AI-generated banner will appear here</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#334155" }}>Upload a product image + enter prompt → Generate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SPY TOOL (COMPETITOR) VIEW ───────────── */}
          {activeTab === "spy" && (

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="glass-card research-card">
                <div className="input-group">
                  <label className="section-label">Competitor Platform</label>
                  <div className="platform-segmented-control" style={{ marginBottom: "20px" }}>
                    <button className={`segment-btn ${spyPlatform === "tiktok" ? "active" : ""}`} onClick={() => setSpyPlatform("tiktok")}>
                      <span className="icon-purple" style={{ fontSize: "16px", filter: "grayscale(0%)" }}>🎵</span> TikTok
                    </button>
                    <button className={`segment-btn ${spyPlatform === "instagram" ? "active" : ""}`} onClick={() => setSpyPlatform("instagram")}>
                      <Camera size={16} className={spyPlatform === "instagram" ? "icon-red" : "text-muted"} /> Instagram
                    </button>
                  </div>
                  <label className="section-label">Competitor Username</label>
                  <div className="search-bar spy-bar">
                    <Target size={20} className="search-icon icon-red" />
                    <input 
                      placeholder={`Enter ${spyPlatform === "tiktok" ? "TikTok" : "Instagram"} username (e.g. @cartier)...`} 
                      value={spyUsername}
                      onChange={(e) => setSpyUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && scrapeCompetitor()}
                    />
                    <button 
                      className="primary spy-btn" 
                      onClick={scrapeCompetitor}
                      disabled={spyLoading || !spyUsername.trim()}
                    >
                      {spyLoading ? <Loader2 className="spin" size={18} /> : "Spy Now"}
                    </button>
                  </div>
                  <p className="helper-text">Scrape public data and viral insights from any account — no login required.</p>
                </div>

                {spyData && spyData.username && (
                  <div className="spy-dashboard">
                    {spyData.is_mock && (
                      <div className="demo-badge">
                        <Zap size={12} />
                        <span>Demo Mode: Real Scraping limited by TikTok Firewall</span>
                      </div>
                    )}
                    
                    <div className="spy-profile-grid">
                      <div className="spy-profile-card glass-card">
                        <div className="spy-avatar-col">
                          <img src={spyData.avatar_url || "https://api.dicebear.com/7.x/initials/svg?seed=user"} alt="Avatar" className="spy-avatar" />
                          <div className="spy-badges-col">
                            {spyData.source && (
                              <div className="saas-badge ai-badge">
                                <span className="status-dot blue"></span>
                                {spyData.source}
                              </div>
                            )}
                            {spyData.limits && (
                              <div className="saas-badge limits-badge">
                                <span className="status-dot green"></span>
                                {spyData.limits.remaining} / {spyData.limits.limit} Requests
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="spy-profile-info">
                          <h3 className="profile-name">{spyData.display_name}</h3>
                          <p className="profile-handle">@{spyData.username}</p>
                          <div className="spy-bio">{spyData.bio || "No bio available."}</div>
                        </div>
                      </div>
                      <div className="spy-stats-grid">
                        <div className="spy-stat-card glass-card">
                          <span className="stat-label">Followers</span>
                          <span className="stat-value">{(spyData.follower_count / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="spy-stat-card glass-card">
                          <span className="stat-label">Total Likes</span>
                          <span className="stat-value">{(spyData.likes_count / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="spy-stat-card glass-card">
                          <span className="stat-label">Engagement</span>
                          <span className="stat-value">+{(spyData.likes_count / (spyData.follower_count * 10 || 1)).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {spyData.ai_analysis && (
                      <div className="ai-analysis-section glass-card" style={{ marginTop: "16px", padding: "24px", borderLeft: "4px solid #8b5cf6" }}>
                        <div className="section-header" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Sparkles size={18} className="icon-purple" />
                          <h3 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>AI Competitor Strategy Analysis</h3>
                        </div>
                        <div style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                          {spyData.ai_analysis}
                        </div>
                      </div>
                    )}

                    <div className="viral-videos-section">
                      <div className="section-header">
                        <TrendingUp size={18} className="icon-amber" />
                        <h3>Viral Content Insights</h3>
                      </div>
                      <div className="spy-video-grid">
                        {spyData.videos?.map((vid: any) => (
                          <div key={vid.id} className="spy-video-card glass-card">
                            <div className="video-meta-top">
                              <span className="view-badge">{(vid.views / 1000).toFixed(0)}k views</span>
                            </div>
                            <h4 className="video-desc">{vid.title}</h4>
                            <div className="video-footer-stats">
                              <span><Zap size={12} /> {vid.likes}</span>
                              <span><MessageSquare size={12} /> {vid.comments}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CALENDAR SCHEDULER VIEW ──────────────────── */}
          {activeTab === "calendar" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="calendar-container" style={{ display: "flex", gap: "24px", height: "calc(100vh - 140px)" }}>
                
                {/* Left Sidebar: Generated Content */}
                <div className="calendar-sidebar glass-card" style={{ width: "300px", display: "flex", flexDirection: "column", padding: "20px", overflowY: "auto" }}>
                  <div className="section-header" style={{ marginBottom: "16px" }}>
                    <Sparkles size={18} className="icon-purple" />
                    <h3 style={{ margin: 0, fontSize: "16px", color: "white" }}>Idea Bank</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>Drag these past generated ideas into your schedule.</p>
                  
                  <div className="ideas-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>No ideas yet. Generate some content first!</div>
                    ) : (
                      history.map((item) => (
                        <div 
                          key={item.id} 
                          className="idea-card"
                          draggable
                          onDragStart={(e) => onDragStart(e, item)}
                          style={{ 
                            padding: "12px", 
                            background: "rgba(255,255,255,0.03)", 
                            border: "1px solid rgba(255,255,255,0.1)", 
                            borderRadius: "12px",
                            cursor: "grab",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.product}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.result.caption}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <span className="tag">{item.platform}</span>
                            <span className="tag" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#34d399" }}>{item.style}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Side: Weekly Grid */}
                <div className="calendar-grid glass-card" style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                  <div className="section-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Clock size={20} className="icon-green" />
                      <h2 style={{ margin: 0, fontSize: "20px", color: "white" }}>Weekly Schedule</h2>
                    </div>
                    <button 
                      onClick={autoPlanWeeklySchedule}
                      className="primary spy-btn"
                      style={{ padding: "8px 16px", display: "flex", gap: "8px", alignItems: "center", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "8px", fontSize: "13px" }}
                    >
                      <Sparkles size={14} /> Auto-Plan (AI)
                    </button>
                  </div>

                  <div className="week-columns" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px" }}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                      <div 
                        key={day} 
                        className="day-column"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, day)}
                        style={{ 
                          background: "rgba(0,0,0,0.2)", 
                          borderRadius: "12px", 
                          padding: "12px",
                          minHeight: "400px",
                          border: "1px dashed rgba(255,255,255,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px"
                        }}
                      >
                        <h4 style={{ textAlign: "center", margin: "0 0 10px 0", fontSize: "14px", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em" }}>{day}</h4>
                        
                        {scheduledPosts[day]?.map((post: any) => (
                          <div 
                            key={post.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, post)}
                            style={{ 
                              background: "rgba(139, 92, 246, 0.1)", 
                              border: "1px solid rgba(139, 92, 246, 0.3)", 
                              borderRadius: "8px", 
                              padding: "10px",
                              cursor: "grab",
                              position: "relative"
                            }}
                          >
                            <button 
                              onClick={() => removeFromSchedule(day, post.id)}
                              style={{ position: "absolute", top: "4px", right: "4px", background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "2px" }}
                            >
                              <Trash2 size={12} />
                            </button>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "4px", paddingRight: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {post.product}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                              <div style={{ fontSize: "10px", color: "#c4b5fd", padding: "2px 6px", background: "rgba(139, 92, 246, 0.2)", borderRadius: "4px" }}>
                                {post.platform}
                              </div>
                              <input 
                                type="time" 
                                value={post.scheduledTime || ""}
                                onChange={(e) => onTimeChange(day, post.id, e.target.value)}
                                style={{ 
                                  background: "rgba(0,0,0,0.3)", 
                                  border: "1px solid rgba(255,255,255,0.1)", 
                                  color: "#cbd5e1", 
                                  fontSize: "11px", 
                                  borderRadius: "4px", 
                                  padding: "2px 4px",
                                  outline: "none"
                                }}
                                title="Set upload time"
                              />
                            </div>
                          </div>
                        ))}

                        {scheduledPosts[day]?.length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px 0", color: "#475569", fontSize: "12px", fontStyle: "italic" }}>
                            Drop here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── URL TO POST VIEW ──────────────────── */}
          {activeTab === "url-to-post" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="view-content"
            >
              <div className="glass-card main-form">
                <div className="input-group">
                  <label htmlFor="url">Paste Product Link (Shopify, Etsy, etc.)</label>
                  <div className="search-bar spy-bar">
                    <Link size={20} className="search-icon icon-red" style={{ color: "#3b82f6" }} />
                    <input 
                      id="url"
                      placeholder="e.g. https://store.com/products/diamond-ring..." 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && generateFromUrl()}
                      style={{ width: "100%", padding: "12px", border: "none", background: "transparent", color: "white" }}
                    />
                    <button 
                      className="primary spy-btn" 
                      onClick={generateFromUrl}
                      disabled={urlLoading || !urlInput.trim()}
                      style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", padding: "10px 24px" }}
                    >
                      {urlLoading ? <Loader2 className="spin" size={18} /> : "Scrape & Generate"}
                    </button>
                  </div>
                  <p className="helper-text">Our AI will scrape the product details from the URL and convert it into a viral TikTok post.</p>
                </div>

                <div className="selector-group">
                  <label>Content Style</label>
                  <div className="pills">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        className={`pill ${style === s.id ? "active" : ""}`}
                        onClick={() => setStyle(s.id)}
                        title={s.desc}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="selector-group">
                  <label>Platform</label>
                  <div className="pills">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        className={`pill ${platform === p.id ? "active" : ""}`}
                        onClick={() => setPlatform(p.id)}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && <div className="error-box">⚠️ {error}</div>}
                
                {urlScrapedData && (
                  <div className="strategy-box" style={{ background: "rgba(59, 130, 246, 0.1)", borderColor: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" }}>
                    <Search size={16} />
                    <p style={{ margin: 0, fontSize: "13px" }}><strong>Scraped Data:</strong> {urlScrapedData}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {(result && activeTab === "generator") || (urlResult && activeTab === "url-to-post") ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="results-grid"
              >
                {/* Copy All button */}
                <div className="copy-all-row">
                  <div className="result-label">
                    <Zap size={16} className="icon-zap" />
                    <span>Viral Blueprint {activeTab === "url-to-post" && "(From URL)"}</span>
                  </div>
                  <CopyButton text={activeTab === "url-to-post" ? `HOOKS:\n${urlResult?.hooks?.join("\n")}\n\nCAPTION:\n${urlResult?.caption}\n\nHASHTAGS:\n${urlResult?.hashtags?.join(" ")}` : allText} size="md" onCopy={() => showSnackbar("All content copied!", "success")} />
                </div>

                {/* Hooks Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card result-card"
                >
                  <div className="card-header">
                    <div className="card-title">
                      <Sparkles size={18} className="icon-purple" />
                      <h3>Hooks</h3>
                    </div>
                  </div>
                  <div className="hooks-list">
                    {(activeTab === "url-to-post" ? urlResult?.hooks : result?.hooks)?.map((hook, i) => (
                      <div key={i} className="hook-item">
                        <span className="hook-number">{i + 1}</span>
                        <p>{hook}</p>
                        <CopyButton text={hook} onCopy={() => showSnackbar("Hook copied!", "info")} />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Caption Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card result-card"
                >
                  <div className="card-header">
                    <div className="card-title">
                      <MessageSquare size={18} className="icon-green" />
                      <h3>Caption</h3>
                    </div>
                    <div className="card-header-right">
                      <span className="char-count">{(activeTab === "url-to-post" ? urlResult?.caption : result?.caption)?.length} chars</span>
                      <CopyButton text={(activeTab === "url-to-post" ? urlResult?.caption : result?.caption) || ""} size="md" />
                    </div>
                  </div>
                  <p className="caption-text">{activeTab === "url-to-post" ? urlResult?.caption : result?.caption}</p>
                </motion.div>

                {/* Hashtags Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-card result-card"
                >
                  <div className="card-header">
                    <div className="card-title">
                      <Hash size={18} className="icon-amber" />
                      <h3>Hashtags</h3>
                    </div>
                    <CopyButton text={(activeTab === "url-to-post" ? urlResult?.hashtags : result?.hashtags)?.join(" ") || ""} size="md" />
                  </div>
                  <div className="hashtags-wrap">
                    {(activeTab === "url-to-post" ? urlResult?.hashtags : result?.hashtags)?.map((tag, i) => (
                      <button
                        key={i}
                        className="hashtag-chip"
                        onClick={() => navigator.clipboard.writeText(tag)}
                        title="Click to copy"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          </div>
        </section>

      <style jsx global>{`
        /* ── Dashboard Layout ────────────────────────── */
        .dashboard-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #060608;
        }

        @media (max-width: 768px) {
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }
        }

        /* ── Sidebar ─────────────────────────────────── */
        .sidebar {
          width: 260px;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          z-index: 50;
        }

        /* ── Visibility Control ── */
        .desktop-sidebar { display: flex; }
        .mobile-nav { display: none; }
        .md-hidden-header { display: none; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { 
            display: flex; 
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 72px;
            background: rgba(13, 13, 18, 0.95);
            backdrop-filter: blur(25px);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            z-index: 2000;
            padding: 0 10px;
            align-items: center;
          }
          .md-hidden-header { 
            display: flex; 
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(10, 10, 15, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            z-index: 2000;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
          }
          
          .dashboard-layout {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }
          .main-stage {
            padding: 85px 16px 110px !important;
            height: auto !important;
            min-height: calc(100vh - 150px);
          }
        }
        
        .mobile-nav-container {
          display: flex;
          width: 100%;
          items-center: center;
          justify-content: flex-start;
          gap: 5px;
          overflow-x: auto;
          height: 100%;
          align-items: center;
        }
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 68px;
          gap: 4px;
          background: transparent;
          border: none;
          color: #64748b;
          transition: all 0.3s;
          padding: 8px 0;
        }
        .mobile-nav-item.active { color: #a78bfa; }
        .mobile-nav-item .icon-wrapper {
          padding: 6px;
          border-radius: 12px;
          transition: all 0.3s;
        }
        .mobile-nav-item.active .icon-wrapper { background: rgba(139, 92, 246, 0.1); }
        .mobile-nav-item span { font-size: 10px; font-weight: 700; }
        
        /* ── All Pages Mobile Fixes ── */
        @media (max-width: 640px) {
          .upload-zone { padding: 30px 20px !important; }
          .upload-zone h4 { font-size: 14px; }
          .upload-zone p { font-size: 10px; }
          
          .prompt-chips { gap: 8px !important; }
          .chip { padding: 8px 12px !important; font-size: 11px !important; }
          
          .spy-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .spy-header h2 { font-size: 22px !important; }
          
          .analysis-box { padding: 16px !important; }
          .analysis-content p { font-size: 13px !important; line-height: 1.6; }
          
          .hashtag-card { padding: 16px !important; }
          .tag-list { gap: 6px !important; }
          .tag-pill { font-size: 11px !important; padding: 4px 10px !important; }

          .trend-chart-container { height: 220px !important; margin: 10px -10px; }
          .trend-item { flex-direction: column; gap: 12px; }
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px 32px;
        }
        .brand-icon {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          padding: 8px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
        }
        .brand-text h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(to bottom, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-text span {
          font-size: 10px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .nav-item:hover {
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-item.active {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.2);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 12px;
          border-radius: 100px;
          cursor: pointer;
        }
        .user-pill img { width: 24px; height: 24px; border-radius: 50%; }
        .user-pill span { font-size: 13px; font-weight: 500; color: #cbd5e1; }
        .connect-mini {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        /* ── Main Stage ──────────────────────────────── */
        .main-stage {
          flex: 1;
          overflow-y: auto;
          padding: 48px;
          position: relative;
        }

        @media (max-width: 768px) {
          .calendar-container {
            flex-direction: column;
            height: auto !important;
            gap: 16px;
          }
          .calendar-sidebar {
            width: 100% !important;
            max-height: 300px;
          }
          .week-columns {
            grid-template-columns: 1fr !important;
            gap: 16px;
          }
          .day-column {
            min-height: auto !important;
          }
        }
        
        .main-stage {
          background-image: 
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 40%);
        }
        .stage-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 40px 100px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* ── Override existing Layout ───────────────── */
        .main-container { display: none; }
        
        /* ── Rest of the Styles... ──────────────────── */
        .secondary-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 13px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .secondary-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: white;
          background: rgba(255,255,255,0.07);
        }

          background: rgba(255,255,255,0.07);
        }
        
        /* ── Tabs ─────────────────────────────────────── */
        .nav-tabs {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: fit-content;
          margin: 0 auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
        .nav-item.active {
          background: #8b5cf6;
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        /* ── Views ────────────────────────────────────── */
        .view-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Research View ────────────────────────────── */
        .research-card { padding: 32px; }
        .search-bar {
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 16px;
          align-items: center;
        }
        .search-icon { color: #475569; margin-left: 12px; }
        .search-bar input { border: none; background: transparent; padding: 8px; }
        .search-bar input:focus { box-shadow: none; }
        .search-btn { padding: 10px 24px !important; }

        .tag-results-container {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .strategy-box {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          color: #c4b5fd;
          font-size: 14px;
          line-height: 1.5;
        }
        .tag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }
        .tag-column h4 {
          font-size: 13px;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .hashtag-chip.niche { background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.2); color: #a78bfa; }
        .hashtag-chip.community { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); color: #34d399; }
        .hashtag-chip.broad { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); color: #fbbf24; }

        /* ── Account View ─────────────────────────────── */
        .connect-card { padding: 60px 40px; text-align: center; }
        .connect-hero { max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
        .platform-icons { display: flex; justify-content: center; gap: -10px; margin-bottom: 10px; }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          border: 4px solid #0a0a0c;
          color: white;
        }
        .icon-circle.tiktok { background: #000; margin-right: -15px; z-index: 2; }
        .icon-circle.instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); z-index: 1; }
        .connect-hero h2 { font-size: 24px; font-weight: 800; }
        .connect-hero p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .connect-btn { padding: 16px !important; font-size: 16px !important; border-radius: 16px !important; }
        .secure-note { font-size: 11px !important; color: #475569 !important; }

        /* Dashboard */
        .account-dashboard { display: flex; flex-direction: column; gap: 24px; }
        .profile-card { padding: 24px; }
        .profile-info { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #8b5cf6; }
        .profile-text h3 { font-size: 18px; margin: 0; }
        .profile-text p { color: #94a3b8; font-size: 14px; margin: 0; }
        .logout-btn { margin-left: auto; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 8px; border-radius: 8px; cursor: pointer; }
        
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
        .stat-item { text-align: center; display: flex; flex-direction: column; }
        .stat-value { font-size: 20px; font-weight: 800; color: white; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

        .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; color: #94a3b8; }
        .video-list { display: flex; flex-direction: column; gap: 12px; }
        .video-item { padding: 12px 16px; display: flex; align-items: center; gap: 16px; transition: 0.2s; }
        .video-item:hover { border-color: rgba(139, 92, 246, 0.3); background: rgba(139, 92, 246, 0.04); }
        .video-thumb { width: 48px; height: 48px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: #8b5cf6; }
        .video-details { flex: 1; }
        .video-details h4 { font-size: 14px; margin: 0 0 4px 0; }
        .video-stats { display: flex; gap: 12px; font-size: 12px; color: #64748b; }
        .video-stats span { display: flex; align-items: center; gap: 4px; }
        .view-btn { background: transparent; border: none; color: #475569; cursor: pointer; padding: 4px; }
        .view-btn:hover { color: white; }

        .view-btn:hover { color: white; }

        /* ── Spy Tool Enhancements ────────────────────── */
        .section-label { font-size: 13px; font-weight: 600; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }
        
        .platform-segmented-control {
          display: inline-flex;
          background: rgba(15, 15, 20, 0.8);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          gap: 4px;
        }
        
        .segment-btn {
          padding: 8px 24px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .segment-btn:hover { color: #e2e8f0; }
        
        .segment-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .text-muted { color: #64748b; }

        .spy-bar { 
          border-color: rgba(239, 68, 68, 0.3); 
          background: rgba(18, 18, 26, 0.6); 
          transition: all 0.3s;
        }
        .spy-bar:focus-within {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
        
        .icon-red { color: #f87171; }
        .spy-btn { background: linear-gradient(135deg, #ef4444, #b91c1c) !important; }
        .spy-btn:hover { box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4) !important; transform: translateY(-2px) !important; }
        
        .spy-profile-card { 
          padding: 24px 32px; 
          display: flex; 
          align-items: flex-start; 
          gap: 32px; 
          background: linear-gradient(145deg, rgba(30, 30, 40, 0.8) 0%, rgba(18, 18, 26, 0.9) 100%);
          border-left: 4px solid #ef4444;
        }

        @media (max-width: 640px) {
          .spy-profile-card {
            flex-direction: column;
            align-items: center;
            gap: 20px;
            text-align: center;
            padding: 24px 20px;
          }
          .spy-avatar-col { min-width: unset; }
          .spy-stat-card .stat-value { font-size: 18px; }
          .spy-video-grid { grid-template-columns: 1fr !important; }
        }
        
        .spy-avatar-col { display: flex; flex-direction: column; align-items: center; gap: 16px; min-width: 120px; }
        .spy-avatar { width: 90px; height: 90px; border-radius: 50%; border: 3px solid rgba(239, 68, 68, 0.8); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); }
        
        .spy-badges-col { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        
        .saas-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-family: var(--font-geist-mono), monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
          justify-content: center;
        }
        
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.blue { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }
        .status-dot.green { background: #10b981; box-shadow: 0 0 8px #10b981; }

        .profile-name { font-size: 24px; font-weight: 800; margin: 0; color: #f8fafc; letter-spacing: -0.02em; }
        .profile-handle { font-size: 15px; color: #ef4444; margin: 4px 0 16px; font-weight: 500; }
        .spy-bio { font-size: 14px; color: #cbd5e1; line-height: 1.6; }
        
        .spy-stat-card { 
          padding: 16px 20px; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }
        .spy-stat-card:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.1); }
        .spy-stat-card .stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .spy-stat-card .stat-value { font-size: 22px; font-weight: 800; color: #f8fafc; }

        @media (max-width: 768px) {
          .spy-stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .spy-stat-card .stat-value { font-size: 18px; }
          .spy-stat-card .stat-label { font-size: 9px; }
          .ai-analysis-section { padding: 16px !important; }
        }

        /* ── Form Inputs ─────────────────────────────── */
        .main-form { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .input-group label, .selector-group label {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
          display: block;
        }
        
        .input-wrapper input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(15, 15, 20, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 15px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .input-wrapper input:focus {
          outline: none;
          border-color: #8b5cf6;
          background: rgba(18, 18, 26, 0.9);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }


        /* ── Premium Styling Overrides ──────────────── */
        .glass-card {
          background: rgba(18, 18, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02);
        }

        .pills {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 12px;
        }

        .actions-row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 16px;
        }

        .pill {
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pill:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          color: white;
        }

        .pill.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
          border-color: #8b5cf6;
          color: #ddd6fe;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
        }

        .primary {
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          border: none !important;
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4) !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em;
        }

        .primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 15px 35px rgba(124, 58, 237, 0.5) !important;
        }

        /* ── Error Box ──────────────────────────────── */
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #f87171;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }
        .copy-btn.sm { padding: 5px 8px; }
        .copy-btn.md { padding: 7px 14px; }
        .copy-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: white;
        }

        .danger-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.08);
          color: #f87171;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .danger-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
        }

        /* ── Error ────────────────────────────────────── */
        .error-box {
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 14px;
        }

        /* ── History ──────────────────────────────────── */
        .history-panel { padding: 20px; }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .history-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .history-list { display: flex; flex-direction: column; gap: 6px; }
        .history-item {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.15s;
        }
        .history-item:hover {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.2);
        }
        .history-product {
          font-size: 13px;
          color: #e2e8f0;
          font-weight: 500;
          margin-bottom: 4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .history-meta { display: flex; align-items: center; gap: 6px; }
        .tag {
          padding: 2px 8px;
          border-radius: 100px;
          background: rgba(139, 92, 246, 0.12);
          color: #a78bfa;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .time { font-size: 11px; color: #475569; margin-left: auto; }

        /* ── Results ──────────────────────────────────── */
        .results-grid { display: flex; flex-direction: column; gap: 16px; }
        .copy-all-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }
        .result-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
        }
        .result-card { padding: 24px; }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-title h3 { font-size: 1.05rem; font-weight: 700; color: white; }
        .card-header-right { display: flex; align-items: center; gap: 10px; }
        .char-count { font-size: 12px; color: #475569; }

        /* icons */
        .icon-zap    { color: #f59e0b; }
        .icon-purple { color: #a78bfa; }
        .icon-green  { color: #34d399; }
        .icon-amber  { color: #fbbf24; }

        /* ── Hooks ────────────────────────────────────── */
        .hooks-list { display: flex; flex-direction: column; gap: 12px; }
        .hook-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.12);
          transition: border-color 0.2s;
        }
        .hook-item:hover { border-color: rgba(139, 92, 246, 0.25); }
        .hook-number {
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: rgba(139, 92, 246, 0.2);
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .hook-text {
          flex: 1;
          font-size: 14px;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0;
        }

        /* ── Caption ──────────────────────────────────── */
        .caption-text {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        /* ── Hashtags ─────────────────────────────────── */
        .hashtags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .hashtag-chip {
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.2);
          color: #fde68a;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hashtag-chip:hover {
          background: rgba(251, 191, 36, 0.15);
          border-color: rgba(251, 191, 36, 0.35);
          transform: translateY(-1px);
        }

        /* ── Spinner ──────────────────────────────────── */
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ───────────────────────────────── */
        @media (max-width: 600px) {
          .main-stage { padding: 16px 12px 100px; }
          .stage-container { max-width: 100%; }
          .glass-card { padding: 16px; }
          .main-form { padding: 16px; }
          
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
          h3 { font-size: 18px !important; }

          .pills { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 8px; 
          }
          .pill { 
            width: 100%; 
            justify-content: center; 
            padding: 10px; 
            font-size: 12px; 
          }

          button.primary { min-width: unset; width: 100%; height: 50px; font-size: 15px; }
          .actions-row { flex-direction: column; width: 100%; gap: 12px; }
          .secondary-btn { width: 100%; justify-content: center; height: 46px; }
          
          .history-panel { padding: 16px; margin-top: 12px; }
          .history-product { font-size: 12px; font-weight: 700; }
          .history-meta .time { display: none; }
          
          .search-bar { 
            flex-direction: column; 
            height: auto; 
            padding: 8px; 
            gap: 8px; 
            background: rgba(255,255,255,0.03);
          }
          .search-bar input { 
            border-bottom: 1px solid rgba(255,255,255,0.1) !important; 
            padding: 12px !important; 
            text-align: center;
          }
          .search-btn { width: 100%; }
          
          .result-grid { grid-template-columns: 1fr !important; }
          .card-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .card-header-right { width: 100%; justify-content: space-between; }
          
          .trend-chart-container { height: 250px; }
          .trend-stats { grid-template-columns: 1fr !important; }
        }

        .snackbar-toast {
          position: fixed;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }
        .snackbar-toast.success { background: rgba(16, 185, 129, 0.9); border-color: rgba(16, 185, 129, 0.4); }
        .snackbar-toast.error { background: rgba(239, 68, 68, 0.9); border-color: rgba(239, 68, 68, 0.4); }
        .snackbar-toast.info { background: rgba(139, 92, 246, 0.9); border-color: rgba(139, 92, 246, 0.4); }

        @media (min-width: 769px) {
          .snackbar-toast {
            bottom: 40px;
            left: calc(260px + (100% - 260px) / 2);
          }
        }
      `}</style>
      </main>

      {/* Global Snackbar */}
      <AnimatePresence>
        {snackbar.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`snackbar-toast ${snackbar.type}`}
          >
            {snackbar.type === "success" && <ShieldCheck size={18} />}
            {snackbar.type === "error" && <Trash2 size={18} />}
            {snackbar.type === "info" && <Sparkles size={18} />}
            <span>{snackbar.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </>
  );
}
