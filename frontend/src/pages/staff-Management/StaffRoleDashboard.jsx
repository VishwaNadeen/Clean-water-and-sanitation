import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

// ─── API 
const API_BASE = "http://localhost:5001/api";

// Commented out for testing without authentication
// const getToken = () => localStorage.getItem("token");

const authConfig = (extra = {}) => ({
  // headers: {
  //   Authorization: `Bearer ${getToken()}`,
  //   ...extra,
  // },
});

const TODAY = new Date().toISOString().split("T")[0];

// ─── HELPERS 
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isToday = (d) => d?.slice(0, 10) === TODAY;

// ─── STATUS CONFIGURATION
const STATUS_CFG = {
  Assigned: { label: "Assigned", bg: "rgba(59,130,246,0.12)", color: "#60a5fa", dot: "#3b82f6" },
  InProgress: { label: "In Progress", bg: "rgba(251,191,36,0.12)", color: "#fbbf24", dot: "#f59e0b" },
  Completed: { label: "Completed", bg: "rgba(167,139,250,0.12)", color: "#a78bfa", dot: "#8b5cf6" },
  Verified: { label: "Verified", bg: "rgba(52,211,153,0.12)", color: "#34d399", dot: "#10b981" },
  Rejected: { label: "Rejected", bg: "rgba(248,113,113,0.12)", color: "#f87171", dot: "#ef4444" },
  Cancelled: { label: "Cancelled", bg: "rgba(107,114,128,0.12)", color: "#9ca3af", dot: "#6b7280" },
};

const PRIORITY_CFG = {
  High: { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  Low: { color: "#34d399", bg: "rgba(52,211,153,0.12)" },
};

// ─── ENHANCED UI COMPONENTS 
const GlassCard = ({ children, hover = false, accent = "#00b4d8" }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${accent}25`,
      borderRadius: 20,
      padding: 24,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      ...(hover && {
        cursor: "pointer",
      }),
    }}
    onMouseEnter={(e) => {
      if (hover) {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 20px 40px ${accent}30`;
        e.currentTarget.style.borderColor = `${accent}50`;
      }
    }}
    onMouseLeave={(e) => {
      if (hover) {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = `${accent}25`;
      }
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
        borderRadius: "20px 20px 0 0",
      }}
    />
    {children}
  </div>
);

const StatCard = ({ label, value, icon, color, trend, size = "medium" }) => {
  const sizes = {
    small: { padding: "16px", iconSize: 24, valueSize: 24 },
    medium: { padding: "20px", iconSize: 32, valueSize: 32 },
    large: { padding: "24px", iconSize: 40, valueSize: 40 },
  };
  const s = sizes[size];
  
  return (
    <GlassCard accent={color} hover={true}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div
          style={{
            width: s.iconSize,
            height: s.iconSize,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: s.iconSize * 0.6,
            filter: `drop-shadow(0 4px 8px ${color}40)`,
          }}
        >
          {icon}
        </div>
        {trend && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: trend > 0 ? "#10b981" : "#ef4444",
            fontWeight: 600,
          }}>
            {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: s.valueSize, fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
    </GlassCard>
  );
};

const TaskCard = ({ task, onStart, onUpload, onComplete, accent = "#00b4d8" }) => {
  const canStart = task.status === "Assigned";
  const canUpload = task.status === "InProgress";
  const canComplete = task.status === "InProgress" && (task.proofImages?.length || 0) > 0;
  
  return (
    <GlassCard accent={accent} hover={true}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: STATUS_CFG[task.status]?.dot || accent,
              boxShadow: `0 0 12px ${STATUS_CFG[task.status]?.dot || accent}60`,
            }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
              {task.title}
            </h3>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              📍 {task.restroomLabel}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              🕐 {task.startTime} – {task.endTime}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge status={task.status} />
            <span style={{
              background: `${accent}15`,
              color: accent,
              border: `1px solid ${accent}30`,
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 600,
            }}>
              {task.taskType}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {canStart && (
          <button
            onClick={() => onStart(task._id)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 20px ${accent}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ▶️ Start Work
          </button>
        )}
        {canUpload && (
          <button
            onClick={() => onUpload(task)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid ${accent}40`,
              background: `${accent}10`,
              color: accent,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${accent}20`;
              e.currentTarget.style.borderColor = `${accent}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${accent}10`;
              e.currentTarget.style.borderColor = `${accent}40`;
            }}
          >
            📸 Upload Proof
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => onComplete(task)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(16,185,129,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ✅ Complete
          </button>
        )}
      </div>
    </GlassCard>
  );
};

// ─── SHARED COMPONENTS
function Badge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.Assigned;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.dot}33`,
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}

const priorityBadge = (p) => ({
  background: PRIORITY_CFG[p]?.bg || "rgba(52,211,153,0.12)",
  color: PRIORITY_CFG[p]?.color || "#34d399",
  border: `1px solid ${(PRIORITY_CFG[p]?.color || "#34d399")}33`,
  borderRadius: 99,
  padding: "2px 10px",
  fontSize: 11,
  fontWeight: 700,
});

// ─── LOGIN SCREEN
function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #060d18 0%, #1a1f2e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <GlassCard accent="#00b4d8" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧹</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", margin: "0 0 8px 0" }}>
            Staff Portal
          </h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>Sign in to access your dashboard</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #00b4d8, #0077b6)",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 14,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── PROOF UPLOAD MODAL
function ProofModal({ schedule, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <GlassCard accent="#00b4d8" style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            Upload Proof Image
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          Upload proof for: <b style={{ color: "#e2e8f0" }}>{schedule.title}</b>
        </p>

        <div
          style={{
            border: "2px dashed rgba(0,180,216,0.3)",
            borderRadius: 12,
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba(0,180,216,0.02)",
            marginBottom: 16,
          }}
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
              <p style={{ fontSize: 14, color: "#64748b" }}>Click to upload image</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!file) return alert("Select an image first");
              onUpload(schedule._id, file);
            }}
            disabled={!file}
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: file ? "linear-gradient(135deg,#00b4d8,#0077b6)" : "rgba(0,180,216,0.3)",
              color: file ? "#fff" : "#64748b",
              cursor: file ? "pointer" : "not-allowed",
              fontWeight: 600,
              opacity: file ? 1 : 0.6,
            }}
          >
            Upload Proof
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── COMPLETE WORK MODAL
function CompleteModal({ schedule, onClose, onComplete }) {
  const [form, setForm] = useState({
    staffNote: "",
    materialsUsed: "",
    issuesFound: "",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <GlassCard accent="#8b5cf6" style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            Mark as Completed
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          <b style={{ color: "#e2e8f0" }}>{schedule.title}</b>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Staff Note
            </label>
            <textarea
              value={form.staffNote}
              onChange={(e) => setForm({ ...form, staffNote: e.target.value })}
              rows={3}
              placeholder="Add any notes about the work done..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Materials Used
            </label>
            <input
              type="text"
              value={form.materialsUsed}
              onChange={(e) => setForm({ ...form, materialsUsed: e.target.value })}
              placeholder="List materials used..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Issues Found
            </label>
            <input
              type="text"
              value={form.issuesFound}
              onChange={(e) => setForm({ ...form, issuesFound: e.target.value })}
              placeholder="Any issues encountered..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onComplete(schedule._id, form)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ✓ Complete
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── ISSUE DETAIL MODAL
function IssueDetailModal({ issue, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <GlassCard accent="#f59e0b" style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
            Issue Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ ...priorityBadge(issue.priority) }}>{issue.priority} Priority</span>
          <span style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
            {issue.status}
          </span>
        </div>

        <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 8 }}>{issue.title}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          📍 {issue.restroomLabel} · 🗓 {fmtDate(issue.reportedAt || issue.createdAt)}
        </div>

        <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16 }}>
          {issue.description}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "#94a3b8",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Close
        </button>
      </GlassCard>
    </div>
  );
}

// ─── CLEANER DASHBOARD 
function CleanerDashboard({ user, schedules, refreshSchedules, onLogout }) {
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null);

  const mine = schedules.filter((s) => (s.staffId?._id || s.staffId) === user._id);
  const todayMine = mine.filter((s) => isToday(s.date));
  const historyMine = mine.filter((s) => !isToday(s.date));

  const stats = {
    total: mine.length,
    inProgress: mine.filter((s) => s.status === "InProgress").length,
    completed: mine.filter((s) => ["Completed", "Verified"].includes(s.status)).length,
    pending: mine.filter((s) => s.status === "Assigned").length,
  };

  const ACCENT = "#14b8a6";
  const TABS = [
    { id: "today", label: "Today", count: todayMine.length },
    { id: "history", label: "History", count: historyMine.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f18 0%, #1a1f2e 100%)", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Animated Background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 50%)",
          animation: "float 20s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-50%",
          right: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 50%)",
          animation: "float 25s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, background: "rgba(10,15,24,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(20,184,166,0.2)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,rgba(20,184,166,0.2),rgba(20,184,166,0.1))", border: "1px solid rgba(20,184,166,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🧹
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#e2e8f0", marginBottom: 2 }}>Cleaner Portal</div>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>My Work Dashboard</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Cleaner · Active</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,rgba(20,184,166,0.8),rgba(20,184,166,0.6))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
              {user.fullName?.[0] || "C"}
            </div>
            <button
              onClick={onLogout}
              style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 10 }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 32 }}>
          <StatCard label="Total Tasks" value={stats.total} icon="📋" color={ACCENT} trend={12} size="medium" />
          <StatCard label="In Progress" value={stats.inProgress} icon="⚙️" color="#f59e0b" trend={-5} size="medium" />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="#10b981" trend={18} size="medium" />
          <StatCard label="Pending" value={stats.pending} icon="⏰" color="#64748b" trend={0} size="medium" />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 6, width: "fit-content", border: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: tab === t.id ? `linear-gradient(135deg,${ACCENT},#0d9488)` : "transparent",
                color: tab === t.id ? "#fff" : "#64748b",
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: 400 }}>
          {tab === "today" && (
            <div style={{ display: "grid", gap: 20 }}>
              {todayMine.length === 0 ? (
                <GlassCard accent={ACCENT}>
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>🧹</div>
                    <div style={{ fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>No tasks for today</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Enjoy your day off!</div>
                  </div>
                </GlassCard>
              ) : (
                todayMine.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accent={ACCENT}
                    onStart={(id) => {
                      console.log("Starting work:", id);
                    }}
                    onUpload={(task) => {
                      setModal({ type: "proof", data: task });
                    }}
                    onComplete={(task) => {
                      setModal({ type: "complete", data: task });
                    }}
                  />
                ))
              )}
            </div>
          )}

          {tab === "history" && (
            <div style={{ display: "grid", gap: 20 }}>
              {historyMine.length === 0 ? (
                <GlassCard accent={ACCENT}>
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>📋</div>
                    <div style={{ fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>No work history yet</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Your completed tasks will appear here</div>
                  </div>
                </GlassCard>
              ) : (
                historyMine.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accent={ACCENT}
                    onStart={() => {}}
                    onUpload={() => {}}
                    onComplete={() => {}}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "proof" && <ProofModal schedule={modal.data} onClose={() => setModal(null)} onUpload={() => {}} />}
      {modal?.type === "complete" && <CompleteModal schedule={modal.data} onClose={() => setModal(null)} onComplete={() => {}} />}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}

// ─── MAINTAINER DASHBOARD 
function MaintainerDashboard({ user, schedules, issues, refreshSchedules, refreshIssues, onLogout }) {
  const [tab, setTab] = useState("today");
  const [modal, setModal] = useState(null);

  const mine = schedules.filter((s) => (s.staffId?._id || s.staffId) === user._id);
  const todayMine = mine.filter((s) => isToday(s.date));
  const historyMine = mine.filter((s) => !isToday(s.date));
  const myIssues = issues.filter((i) => (i.assignedStaffId?._id || i.assignedStaffId) === user._id);

  const stats = {
    total: mine.length,
    inProgress: mine.filter((s) => s.status === "InProgress").length,
    completed: mine.filter((s) => ["Completed", "Verified"].includes(s.status)).length,
    issues: myIssues.length,
  };

  const ACCENT = "#f59e0b";
  const TABS = [
    { id: "today", label: "Today", count: todayMine.length },
    { id: "issues", label: "My Issues", count: myIssues.length },
    { id: "history", label: "History", count: historyMine.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f18 0%, #1a1f2e 100%)", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Animated Background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 50%)",
          animation: "float 20s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-50%",
          right: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 50%)",
          animation: "float 25s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, background: "rgba(10,15,24,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(245,158,11,0.2)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.1))", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🔧
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#e2e8f0", marginBottom: 2 }}>Maintainer Portal</div>
              <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Maintenance & Inspection</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Technician · Active</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,rgba(245,158,11,0.8),rgba(245,158,11,0.6))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#0a1628" }}>
              {user.fullName?.[0] || "T"}
            </div>
            <button
              onClick={onLogout}
              style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 10 }}>
        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 32 }}>
          <StatCard label="Total Tasks" value={stats.total} icon="📋" color={ACCENT} trend={8} size="medium" />
          <StatCard label="In Progress" value={stats.inProgress} icon="⚙️" color="#f59e0b" trend={-3} size="medium" />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="#10b981" trend={15} size="medium" />
          <StatCard label="Issues" value={stats.issues} icon="⚠️" color="#ef4444" trend={5} size="medium" />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 6, width: "fit-content", border: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                background: tab === t.id ? `linear-gradient(135deg,${ACCENT},#d97706)` : "transparent",
                color: tab === t.id ? "#0a1628" : "#64748b",
                transition: "all 0.3s ease",
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: 400 }}>
          {tab === "today" && (
            <div style={{ display: "grid", gap: 20 }}>
              {todayMine.length === 0 ? (
                <GlassCard accent={ACCENT}>
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>🔧</div>
                    <div style={{ fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>No tasks for today</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Enjoy your day off!</div>
                  </div>
                </GlassCard>
              ) : (
                todayMine.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accent={ACCENT}
                    onStart={(id) => {
                      console.log("Starting work:", id);
                    }}
                    onUpload={(task) => {
                      setModal({ type: "proof", data: task });
                    }}
                    onComplete={(task) => {
                      setModal({ type: "complete", data: task });
                    }}
                  />
                ))
              )}
            </div>
          )}

          {tab === "issues" && (
            <div style={{ display: "grid", gap: 20 }}>
              {myIssues.length === 0 ? (
                <GlassCard accent={ACCENT}>
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>✅</div>
                    <div style={{ fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>No issues assigned</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>All caught up!</div>
                  </div>
                </GlassCard>
              ) : (
                myIssues.map((issue) => (
                  <GlassCard key={issue._id} accent={ACCENT}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ ...priorityBadge(issue.priority) }}>{issue.priority} Priority</span>
                          <span style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                            {issue.status}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 4 }}>{issue.title}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          📍 {issue.restroomLabel} · 🗓 {fmtDate(issue.reportedAt || issue.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>
                      {issue.description}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => setModal({ type: "issueDetail", data: issue })}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 10,
                          border: `1px solid ${ACCENT}40`,
                          background: `${ACCENT}10`,
                          color: ACCENT,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {tab === "history" && (
            <div style={{ display: "grid", gap: 20 }}>
              {historyMine.length === 0 ? (
                <GlassCard accent={ACCENT}>
                  <div style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.7 }}>📋</div>
                    <div style={{ fontSize: 18, color: "#e2e8f0", marginBottom: 8 }}>No work history yet</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Your completed tasks will appear here</div>
                  </div>
                </GlassCard>
              ) : (
                historyMine.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    accent={ACCENT}
                    onStart={() => {}}
                    onUpload={() => {}}
                    onComplete={() => {}}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "proof" && <ProofModal schedule={modal.data} onClose={() => setModal(null)} onUpload={() => {}} />}
      {modal?.type === "complete" && <CompleteModal schedule={modal.data} onClose={() => setModal(null)} onComplete={() => {}} />}
      {modal?.type === "issueDetail" && <IssueDetailModal issue={modal.data} onClose={() => setModal(null)} />}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}

// ─── ROOT APP 
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Commented out for testing without authentication
  const fetchCurrentUser = async () => {
    try {
      // const token = getToken();
      // if (!token) {
      //   setCurrentUser(null);
      //   setLoading(false);
      //   return;
      // }

      // const res = await axios.get(`${API_BASE}/auth/me`, authConfig());
      // setCurrentUser(res.data);
      
      // Mock user for testing
      setCurrentUser({
        _id: "test-user-123",
        fullName: "Test User",
        email: "test@example.com",
        role: "Cleaner" // Change this to test different roles
      });
    } catch (err) {
      console.error(err);
      // localStorage.removeItem("token");
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSchedules = async () => {
    try {
      // const res = await axios.get(`${API_BASE}/staff/work-schedules/me`, authConfig());
      // setSchedules(Array.isArray(res.data) ? res.data : []);
      
      // Mock schedules for testing
      setSchedules([
        {
          _id: "schedule-1",
          title: "Clean Restroom A",
          taskType: "Cleaning",
          date: TODAY,
          startTime: "09:00",
          endTime: "10:00",
          status: "Assigned",
          staffId: "test-user-123",
          restroomLabel: "Floor 1 - Restroom A"
        },
        {
          _id: "schedule-2",
          title: "Maintenance Check",
          taskType: "Maintenance",
          date: TODAY,
          startTime: "11:00",
          endTime: "12:00",
          status: "InProgress",
          staffId: "test-user-123",
          restroomLabel: "Floor 2 - Restroom B"
        }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshIssues = async () => {
    try {
      // const res = await axios.get(`${API_BASE}/staff/issues/me`, authConfig());
      // setIssues(Array.isArray(res.data) ? res.data : []);
      
      // Mock issues for testing
      setIssues([
        {
          _id: "issue-1",
          title: "Broken Pipe",
          priority: "High",
          status: "Open",
          restroomLabel: "Floor 1 - Restroom A",
          reportedAt: new Date().toISOString(),
          assignedStaffId: "test-user-123"
        }
      ]);
    } catch (err) {
      console.error(err);
      setIssues([]);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    refreshSchedules();

    if (currentUser.role === "Technician" || currentUser.role === "Maintainer") {
      refreshIssues();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setSchedules([]);
    setIssues([]);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#060d18",
          color: "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  if (currentUser.role === "Cleaner") {
    return (
      <CleanerDashboard
        user={currentUser}
        schedules={schedules}
        refreshSchedules={refreshSchedules}
        onLogout={handleLogout}
      />
    );
  }

  if (currentUser.role === "Technician" || currentUser.role === "Maintainer") {
    return (
      <MaintainerDashboard
        user={currentUser}
        schedules={schedules}
        issues={issues}
        refreshSchedules={refreshSchedules}
        refreshIssues={refreshIssues}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
        <div>Unknown role: {currentUser.role}</div>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: "#14b8a6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
