import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  }

  function addRipple(e) {
    const id = rippleId.current++;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 600);
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/rest-rooms", label: "Rest Rooms" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
    { to: "/manager/dashboard", label: "Staff Manager" },//temppery
    { to: "/staff/role", label: "Staff Role" },//temppery
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --blue-glass: rgba(14, 110, 200, 0.10);
          --blue-border: rgba(99, 179, 237, 0.25);
          --blue-glow: rgba(56, 149, 255, 0.18);
          --blue-deep: rgba(15, 80, 160, 0.85);
          --text-primary: rgba(235, 248, 255, 0.95);
          --text-muted: rgba(190, 224, 255, 0.70);
          --accent: #38bdf8;
          --accent-bright: #7dd3fc;
        }

        .navbar-root {
          font-family: 'Outfit', sans-serif;
        }

        /* ── Header ── */
        .nb-header {
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nb-header.scrolled {
          padding-top: 0;
          padding-bottom: 0;
        }

        /* Glass panel */
        .nb-glass {
          background: linear-gradient(
            135deg,
            rgba(8, 60, 130, 0.55) 0%,
            rgba(14, 90, 180, 0.45) 40%,
            rgba(6, 50, 110, 0.60) 100%
          );
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          border-bottom: 1px solid var(--blue-border);
          box-shadow:
            0 4px 32px rgba(14, 80, 200, 0.18),
            0 1px 0 rgba(120, 200, 255, 0.10) inset,
            0 -1px 0 rgba(14, 80, 200, 0.12) inset;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nb-header.scrolled .nb-glass {
          background: linear-gradient(
            135deg,
            rgba(6, 45, 100, 0.82) 0%,
            rgba(10, 70, 150, 0.75) 50%,
            rgba(5, 40, 95, 0.82) 100%
          );
          box-shadow:
            0 8px 40px rgba(10, 60, 160, 0.30),
            0 1px 0 rgba(120, 200, 255, 0.15) inset;
        }

        .nb-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: padding 0.4s ease;
        }
        .nb-header.scrolled .nb-inner {
          padding-top: 10px;
          padding-bottom: 10px;
        }

        /* ── Logo ── */
        .nb-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          position: relative;
          z-index: 1;
        }
        .nb-logo-icon {
          height: 42px;
          width: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.30), rgba(99, 179, 237, 0.20));
          border: 1px solid rgba(125, 211, 252, 0.35);
          box-shadow: 0 0 18px rgba(56, 189, 248, 0.20), 0 2px 8px rgba(0,0,0,0.15);
          display: grid;
          place-items: center;
          font-size: 20px;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: logoFloat 4s ease-in-out infinite;
        }
        .nb-logo:hover .nb-logo-icon {
          transform: scale(1.12) rotate(-5deg);
          box-shadow: 0 0 28px rgba(56, 189, 248, 0.40), 0 4px 16px rgba(0,0,0,0.2);
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.45), rgba(99, 179, 237, 0.30));
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .nb-logo-text-main {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        .nb-logo-text-main .amp {
          color: var(--accent);
          font-weight: 300;
          margin: 0 3px;
        }
        .nb-logo-text-sub {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          line-height: 1;
          margin-top: 2px;
        }

        /* ── Nav Links ── */
        .nb-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nb-link {
          position: relative;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          overflow: hidden;
          transition: color 0.25s ease, background 0.25s ease;
          letter-spacing: 0.1px;
        }
        .nb-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: rgba(56, 189, 248, 0.08);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .nb-link:hover {
          color: var(--text-primary);
        }
        .nb-link:hover::before {
          opacity: 1;
        }
        .nb-link.active {
          color: var(--accent-bright);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.20);
        }
        /* animated underline */
        .nb-link::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          border-radius: 2px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nb-link:hover::after,
        .nb-link.active::after {
          width: 60%;
        }

        /* Ripple */
        .nb-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(125, 211, 252, 0.30);
          transform: scale(0);
          animation: rippleAnim 0.6s linear forwards;
          pointer-events: none;
        }
        @keyframes rippleAnim {
          to { transform: scale(4); opacity: 0; }
        }

        /* ── Right side ── */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* CTA Button */
        .nb-cta {
          position: relative;
          padding: 9px 18px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          letter-spacing: 0.2px;
          background: linear-gradient(135deg, rgba(14, 120, 220, 0.80), rgba(56, 189, 248, 0.80));
          border: 1px solid rgba(125, 211, 252, 0.35);
          box-shadow: 0 2px 14px rgba(14, 120, 220, 0.25), 0 0 0 0 rgba(56, 189, 248, 0.4);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .nb-cta::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s ease;
        }
        .nb-cta:hover {
          box-shadow: 0 4px 24px rgba(14, 120, 220, 0.45), 0 0 0 3px rgba(56, 189, 248, 0.15);
          transform: translateY(-1px);
        }
        .nb-cta:hover::before {
          left: 100%;
        }

        /* Auth Buttons */
        .nb-btn-login {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-bright);
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.22);
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.1px;
          font-family: 'Outfit', sans-serif;
        }
        .nb-btn-login:hover {
          background: rgba(56, 189, 248, 0.16);
          border-color: rgba(56, 189, 248, 0.40);
          color: #fff;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.18);
        }

        .nb-btn-profile {
          height: 38px;
          width: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.22);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: var(--accent-bright);
          font-family: 'Outfit', sans-serif;
        }
        .nb-btn-profile:hover {
          background: rgba(56, 189, 248, 0.18);
          border-color: rgba(56, 189, 248, 0.45);
          transform: scale(1.08);
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.22);
        }

        .nb-btn-logout {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(252, 165, 165, 0.90);
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.22);
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.1px;
          font-family: 'Outfit', sans-serif;
        }
        .nb-btn-logout:hover {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.40);
          color: #fca5a5;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.18);
        }

        /* ── Shimmer line ── */
        .nb-shimmer-line {
          height: 1.5px;
          width: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(56, 189, 248, 0.20) 20%,
            rgba(125, 211, 252, 0.55) 50%,
            rgba(56, 189, 248, 0.20) 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* ── Navbar entrance animation ── */
        .nb-glass {
          animation: navbarSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes navbarSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .nb-logo {
          animation: fadeSlideLeft 0.5s 0.1s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .nb-nav .nb-link:nth-child(1) { animation: fadeSlideDown 0.4s 0.15s both; }
        .nb-nav .nb-link:nth-child(2) { animation: fadeSlideDown 0.4s 0.22s both; }
        .nb-nav .nb-link:nth-child(3) { animation: fadeSlideDown 0.4s 0.29s both; }
        .nb-nav .nb-link:nth-child(4) { animation: fadeSlideDown 0.4s 0.36s both; }
        .nb-right > * { animation: fadeSlideRight 0.4s 0.3s both; }

        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Mobile menu ── */
        .nb-mobile-toggle {
          display: none;
          height: 36px;
          width: 36px;
          border-radius: 9px;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.20);
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0;
          transition: all 0.25s ease;
        }
        .nb-mobile-toggle:hover {
          background: rgba(56, 189, 248, 0.16);
        }
        .nb-mobile-toggle span {
          display: block;
          height: 1.5px;
          width: 18px;
          background: var(--accent-bright);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .nb-mobile-toggle.open span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }
        .nb-mobile-toggle.open span:nth-child(2) {
          opacity: 0; transform: scaleX(0);
        }
        .nb-mobile-toggle.open span:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        .nb-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 4px;
          padding: 12px 20px 16px;
          border-top: 1px solid rgba(56, 189, 248, 0.12);
          background: rgba(6, 40, 95, 0.50);
          animation: mobileMenuOpen 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes mobileMenuOpen {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nb-mobile-link {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .nb-mobile-link:hover, .nb-mobile-link.active {
          background: rgba(56, 189, 248, 0.12);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .nb-nav { display: none; }
          .nb-cta { display: none; }
          .nb-mobile-toggle { display: flex; }
          .nb-mobile-menu { display: flex; }
        }
      `}</style>

      <header className={`nb-header navbar-root ${scrolled ? "scrolled" : ""}`}>
        <div className="nb-glass">
          <div className="nb-inner">
            {/* Logo */}
            <NavLink to="/" className="nb-logo">
              <div className="nb-logo-icon">💧</div>
              <div>
                <div className="nb-logo-text-main">
                  Clean Water<span className="amp">&</span>Sanitation
                </div>
                <div className="nb-logo-text-sub">Safe water · Hygiene · Health</div>
              </div>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="nb-nav">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nb-link${isActive ? " active" : ""}`}
                  onClick={addRipple}
                >
                  {label}
                  {ripples.map((r) => (
                    <span
                      key={r.id}
                      className="nb-ripple"
                      style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
                    />
                  ))}
                </NavLink>
              ))}
            </nav>

            {/* Right Side */}
            <div className="nb-right">
              <a href="#get-started" className="nb-cta">
                Get Started
              </a>

              {!isLoggedIn ? (
                <button className="nb-btn-login" onClick={() => navigate("/login")}>
                  Login
                </button>
              ) : (
                <>
                  <button
                    className="nb-btn-profile"
                    onClick={() => navigate("/profile")}
                    title="Profile"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z"
                        stroke="currentColor" strokeWidth="1.8"
                      />
                      <path
                        d="M20 20.5c-1.6-4-5-6-8-6s-6.4 2-8 6"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button className="nb-btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}

              {/* Mobile toggle */}
              <button
                className={`nb-mobile-toggle ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="nb-mobile-menu">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nb-mobile-link${isActive ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Shimmer line */}
          <div className="nb-shimmer-line" />
        </div>
      </header>
    </>
  );
}