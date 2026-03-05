import { useState, useEffect, useRef } from "react";

/* ── Animated counter hook ── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ── Intersection observer hook ── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ── Stat card ── */
function Stat({ title, value, hint, icon, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const num = useCounter(parseInt(value), 1600, inView);
  return (
    <div
      ref={ref}
      className="ft-stat-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="ft-stat-icon">{icon}</div>
      <div className="ft-stat-value">{inView ? num : 0}{typeof value === "string" && value.includes("+") ? "+" : ""}</div>
      <div className="ft-stat-title">{title}</div>
      <div className="ft-stat-hint">{hint}</div>
    </div>
  );
}

/* ── Feature card ── */
function Feature({ icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`ft-feat-card ${inView ? "ft-in-view" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="ft-feat-icon">{icon}</div>
      <div className="ft-feat-title">{title}</div>
      <p className="ft-feat-desc">{desc}</p>
      <div className="ft-feat-arrow">→</div>
    </div>
  );
}

export default function Home() {
  const [heroRef, heroIn] = useInView(0.1);
  const [statsRef, statsIn] = useInView(0.2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        :root {
          --accent: #38bdf8;
          --accent-bright: #7dd3fc;
          --accent-dim: rgba(56,189,248,0.18);
          --text: rgba(235,248,255,0.95);
          --text-muted: rgba(190,224,255,0.65);
          --glass-bg: rgba(14,80,170,0.18);
          --glass-border: rgba(56,189,248,0.18);
          --deep-bg: rgba(4,25,65,0.70);
        }

        .hm-root {
          font-family: 'Outfit', sans-serif;
          color: var(--text);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14,80,200,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 80%, rgba(6,50,130,0.18) 0%, transparent 55%),
            linear-gradient(180deg, rgba(3,18,50,1) 0%, rgba(4,25,70,1) 50%, rgba(2,14,40,1) 100%);
        }

        /* ════════════════════════════════
           HERO
        ════════════════════════════════ */
        .hm-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        /* Floating water particles */
        .hm-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .hm-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,0.55), transparent 70%);
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
        }

        .hm-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          background: rgba(56,189,248,0.10);
          border: 1px solid rgba(56,189,248,0.25);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--accent-bright);
          letter-spacing: 0.4px;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
          animation: hmFadeDown 0.5s 0.1s both;
        }
        .hm-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: badgePulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px var(--accent);
        }
        @keyframes badgePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(0.7); }
        }

        .hm-hero-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          font-weight: 400;
          line-height: 1.10;
          letter-spacing: -1px;
          color: var(--text);
          max-width: 800px;
          position: relative;
          z-index: 1;
          animation: hmFadeDown 0.6s 0.2s both;
        }
        .hm-hero-heading em {
          font-style: italic;
          background: linear-gradient(135deg, #7dd3fc, #38bdf8, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hm-hero-sub {
          margin-top: 20px;
          font-size: 16px;
          font-weight: 400;
          color: var(--text-muted);
          max-width: 520px;
          line-height: 1.7;
          position: relative;
          z-index: 1;
          animation: hmFadeDown 0.6s 0.3s both;
        }

        .hm-hero-cta {
          margin-top: 36px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
          z-index: 1;
          animation: hmFadeDown 0.6s 0.4s both;
        }
        .hm-btn-primary {
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, rgba(14,120,220,0.85), rgba(56,189,248,0.80));
          border: 1px solid rgba(125,211,252,0.35);
          box-shadow: 0 2px 20px rgba(14,120,220,0.30);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .hm-btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.4s ease;
        }
        .hm-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(14,120,220,0.45);
        }
        .hm-btn-primary:hover::before { left: 100%; }

        .hm-btn-ghost {
          padding: 13px 28px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: var(--accent-bright);
          background: rgba(56,189,248,0.07);
          border: 1px solid rgba(56,189,248,0.22);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.25s ease;
        }
        .hm-btn-ghost:hover {
          background: rgba(56,189,248,0.15);
          border-color: rgba(56,189,248,0.40);
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(56,189,248,0.14);
        }

        /* ════════════════════════════════
           STATS STRIP
        ════════════════════════════════ */
        .hm-stats-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 64px;
        }
        .hm-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .hm-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .ft-stat-card {
          border-radius: 18px;
          padding: 22px 20px;
          background: linear-gradient(135deg, rgba(14,80,170,0.22), rgba(8,50,120,0.18));
          border: 1px solid var(--glass-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(125,211,252,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          position: relative;
          overflow: hidden;
        }
        .ft-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(125,211,252,0.35), transparent);
        }
        .ft-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 32px rgba(14,100,220,0.22), 0 0 0 1px rgba(56,189,248,0.20);
        }
        @keyframes statPop {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ft-stat-icon { font-size: 22px; margin-bottom: 10px; }
        .ft-stat-value {
          font-size: 2.2rem;
          font-weight: 800;
          font-family: 'DM Serif Display', serif;
          background: linear-gradient(135deg, #e0f2fe, #7dd3fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .ft-stat-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-top: 6px;
        }
        .ft-stat-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
          letter-spacing: 0.2px;
        }

        /* ════════════════════════════════
           FEATURES
        ════════════════════════════════ */
        .hm-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 72px;
        }
        .hm-section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 1.8px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .hm-section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 400;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 36px;
        }
        .hm-section-title em {
          font-style: italic;
          color: var(--accent-bright);
        }

        .hm-feat-grid {
          display: grid;
          gap: 14px;
        }
        @media (min-width: 768px) {
          .hm-feat-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .ft-feat-card {
          border-radius: 20px;
          padding: 28px 24px;
          background: linear-gradient(145deg, rgba(14,80,170,0.18), rgba(6,40,100,0.22));
          border: 1px solid var(--glass-border);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
        }
        .ft-feat-card.ft-in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .ft-feat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(56,189,248,0.06), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .ft-feat-card:hover {
          box-shadow: 0 8px 32px rgba(14,100,220,0.22), 0 0 0 1px rgba(56,189,248,0.25);
          transform: translateY(-4px) !important;
        }
        .ft-feat-card:hover::before { opacity: 1; }
        .ft-feat-icon {
          height: 46px; width: 46px;
          border-radius: 14px;
          background: rgba(56,189,248,0.12);
          border: 1px solid rgba(56,189,248,0.22);
          display: grid; place-items: center;
          font-size: 20px;
          margin-bottom: 18px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ft-feat-card:hover .ft-feat-icon { transform: scale(1.12) rotate(-4deg); }
        .ft-feat-title {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .ft-feat-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          line-height: 1.65;
        }
        .ft-feat-arrow {
          margin-top: 18px;
          font-size: 16px;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.25s ease;
        }
        .ft-feat-card:hover .ft-feat-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ════════════════════════════════
           IMPACT
        ════════════════════════════════ */
        .hm-impact {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .hm-impact-card {
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(10,60,140,0.35), rgba(6,35,90,0.45));
          border: 1px solid rgba(56,189,248,0.20);
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(6,30,90,0.40), inset 0 1px 0 rgba(125,211,252,0.10);
        }
        .hm-impact-card::after {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(56,189,248,0.10), transparent 65%);
          pointer-events: none;
          animation: impactGlow 5s ease-in-out infinite alternate;
        }
        @keyframes impactGlow {
          from { opacity: 0.5; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        .hm-impact-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(56,189,248,0.10);
          border: 1px solid rgba(56,189,248,0.22);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-bright);
          letter-spacing: 0.4px;
          margin-bottom: 20px;
        }
        .hm-impact-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 400;
          color: var(--text);
          max-width: 580px;
          line-height: 1.15;
          margin-bottom: 18px;
          letter-spacing: -0.3px;
        }
        .hm-impact-title em {
          font-style: italic;
          color: var(--accent-bright);
        }
        .hm-impact-body {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 620px;
          line-height: 1.75;
        }
        .hm-impact-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }
        .hm-impact-pill {
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 12.5px;
          font-weight: 500;
          background: rgba(56,189,248,0.09);
          border: 1px solid rgba(56,189,248,0.20);
          color: var(--accent-bright);
          transition: all 0.22s ease;
          cursor: default;
        }
        .hm-impact-pill:hover {
          background: rgba(56,189,248,0.18);
          border-color: rgba(56,189,248,0.40);
          transform: translateY(-2px);
        }

        /* ── Shared entrance animations ── */
        @keyframes hmFadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hmFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hm-root">

        {/* ── HERO ── */}
        <section className="hm-hero" ref={heroRef}>
          {/* Floating particles */}
          <div className="hm-particles">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="hm-particle"
                style={{
                  width: `${6 + Math.random() * 10}px`,
                  height: `${6 + Math.random() * 10}px`,
                  left: `${10 + Math.random() * 80}%`,
                  bottom: `${Math.random() * 30}%`,
                  animationDuration: `${4 + Math.random() * 5}s`,
                  animationDelay: `${Math.random() * 4}s`,
                  opacity: 0.4 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>

          <div className="hm-badge">
            <span className="hm-badge-dot" />
            Clean Water & Sanitation Platform
          </div>

          <h1 className="hm-hero-heading">
            Access to <em>clean water</em> is a fundamental human right
          </h1>

          <p className="hm-hero-sub">
            A community-driven platform to report, track, and resolve
            water quality and sanitation issues across districts.
          </p>

          <div className="hm-hero-cta" id="get-started">
            <button className="hm-btn-primary">Submit a Report</button>
            <button className="hm-btn-ghost">Explore Dashboard →</button>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="hm-stats-wrap" ref={statsRef}>
          <div className="hm-stats-grid">
            <Stat icon="📋" title="Reports Filed"    value="128" hint="last 30 days"         delay={0}   />
            <Stat icon="✅" title="Issues Resolved"  value="76"  hint="community verified"   delay={80}  />
            <Stat icon="⚠️" title="High Risk Zones"  value="12"  hint="needs attention"      delay={160} />
            <Stat icon="🗺️" title="Districts Active"  value="9"   hint="areas covered"        delay={240} />
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="hm-section" id="features">
          <div className="hm-section-label">What we offer</div>
          <div className="hm-section-title">
            Tools built for <em>real impact</em>
          </div>
          <div className="hm-feat-grid">
            <Feature
              icon="🧾"
              title="Issue Reporting"
              desc="Submit water or sanitation issues with precise location details, photos, and severity ratings for faster verification."
              delay={0}
            />
            <Feature
              icon="📊"
              title="Live Dashboard"
              desc="Monitor trends, track resolution rates, and view status summaries across all districts in real time."
              delay={100}
            />
            <Feature
              icon="📍"
              title="Location Insights"
              desc="Pinpoint and organise issues by district or area, helping authorities prioritise where intervention is needed most."
              delay={200}
            />
            <Feature
              icon="🔔"
              title="Alert System"
              desc="Receive instant notifications when a high-risk zone is identified or when a report status changes."
              delay={300}
            />
            <Feature
              icon="🤝"
              title="Community Verify"
              desc="Residents can verify and upvote reports, building trust and ensuring data accuracy at a grassroots level."
              delay={400}
            />
            <Feature
              icon="📁"
              title="Export & Share"
              desc="Download district-level reports as PDFs or share live dashboard links with NGOs, media, and government bodies."
              delay={500}
            />
          </div>
        </section>

        {/* ── IMPACT ── */}
        <div className="hm-impact" id="impact">
          <div className="hm-impact-card">
            <div className="hm-impact-tag">💙 Why it matters</div>
            <h2 className="hm-impact-title">
              Every data point brings us <em>closer to change</em>
            </h2>
            <p className="hm-impact-body">
              Clean water and proper sanitation reduce waterborne diseases, improve
              school attendance, and raise overall quality of life. By collecting
              precise, community-verified data, this platform helps authorities and
              NGOs direct resources where they create the most impact.
            </p>
            <div className="hm-impact-pills">
              {["Reduce Disease", "Improve Education", "Empower Communities", "Data-Driven Policy", "Faster Response"].map((p) => (
                <span key={p} className="hm-impact-pill">{p}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}