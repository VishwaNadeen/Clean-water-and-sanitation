export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .ft-root {
          font-family: 'Outfit', sans-serif;
          position: relative;
          background: linear-gradient(
            180deg,
            rgba(4, 30, 75, 0.92) 0%,
            rgba(6, 40, 100, 0.97) 50%,
            rgba(3, 22, 58, 1) 100%
          );
          border-top: 1px solid rgba(56, 189, 248, 0.18);
          overflow: hidden;
        }

        /* Ambient glow blobs */
        .ft-glow-left {
          position: absolute;
          top: -60px; left: -80px;
          width: 320px; height: 220px;
          background: radial-gradient(ellipse, rgba(56, 189, 248, 0.10) 0%, transparent 70%);
          pointer-events: none;
          animation: ftGlowPulse 5s ease-in-out infinite alternate;
        }
        .ft-glow-right {
          position: absolute;
          bottom: -40px; right: -60px;
          width: 260px; height: 180px;
          background: radial-gradient(ellipse, rgba(99, 179, 237, 0.08) 0%, transparent 70%);
          pointer-events: none;
          animation: ftGlowPulse 6s 1s ease-in-out infinite alternate;
        }
        @keyframes ftGlowPulse {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.12); }
        }

        /* Shimmer top line */
        .ft-shimmer-line {
          height: 1.5px;
          width: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(56, 189, 248, 0.18) 20%,
            rgba(125, 211, 252, 0.55) 50%,
            rgba(56, 189, 248, 0.18) 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: ftShimmer 3.5s linear infinite;
        }
        @keyframes ftShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .ft-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 28px;
          position: relative;
          z-index: 1;
        }

        /* ── Top row ── */
        .ft-top {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (min-width: 768px) {
          .ft-top {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }
        }

        /* Brand */
        .ft-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          animation: ftFadeLeft 0.6s 0.1s cubic-bezier(0.4,0,0.2,1) both;
        }
        .ft-brand-icon {
          height: 42px; width: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(56,189,248,0.22), rgba(99,179,237,0.14));
          border: 1px solid rgba(125, 211, 252, 0.28);
          box-shadow: 0 0 18px rgba(56,189,248,0.14), 0 2px 8px rgba(0,0,0,0.18);
          display: grid; place-items: center;
          font-size: 20px;
          animation: ftFloat 4s ease-in-out infinite;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ft-brand:hover .ft-brand-icon {
          transform: scale(1.1) rotate(-5deg);
          box-shadow: 0 0 28px rgba(56,189,248,0.35);
        }
        @keyframes ftFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .ft-brand-name {
          font-size: 15px; font-weight: 700;
          color: rgba(235,248,255,0.95);
          letter-spacing: -0.2px; line-height: 1.2;
        }
        .ft-brand-name .amp {
          color: #38bdf8; font-weight: 300; margin: 0 3px;
        }
        .ft-brand-tagline {
          font-size: 12px; font-weight: 400;
          color: rgba(190,224,255,0.60);
          margin-top: 3px; letter-spacing: 0.3px;
        }

        /* Links columns */
        .ft-cols {
          display: flex;
          gap: 40px;
          animation: ftFadeRight 0.6s 0.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        .ft-col-title {
          font-size: 11px; font-weight: 600;
          color: rgba(125,211,252,0.70);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .ft-col-links {
          display: flex; flex-direction: column; gap: 8px;
        }
        .ft-link {
          font-size: 13.5px; font-weight: 400;
          color: rgba(190,224,255,0.65);
          text-decoration: none;
          transition: all 0.22s ease;
          display: inline-flex; align-items: center; gap: 5px;
          width: fit-content;
        }
        .ft-link::before {
          content: '';
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #38bdf8;
          opacity: 0;
          transform: scale(0);
          transition: all 0.22s ease;
        }
        .ft-link:hover {
          color: rgba(235,248,255,0.95);
          transform: translateX(4px);
        }
        .ft-link:hover::before {
          opacity: 1; transform: scale(1);
        }

        /* Divider */
        .ft-divider {
          margin: 28px 0 20px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(56,189,248,0.18) 30%,
            rgba(56,189,248,0.18) 70%,
            transparent
          );
          animation: ftFadeIn 0.6s 0.35s both;
        }

        /* ── Bottom row ── */
        .ft-bottom {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: ftFadeIn 0.6s 0.4s both;
        }
        @media (min-width: 640px) {
          .ft-bottom {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .ft-copyright {
          font-size: 12px;
          color: rgba(190,224,255,0.40);
          letter-spacing: 0.2px;
        }
        .ft-copyright span {
          color: rgba(125,211,252,0.55);
        }

        /* Social icons */
        .ft-socials {
          display: flex; gap: 8px;
        }
        .ft-social-btn {
          height: 32px; width: 32px;
          border-radius: 9px;
          display: grid; place-items: center;
          background: rgba(56,189,248,0.07);
          border: 1px solid rgba(56,189,248,0.18);
          color: rgba(125,211,252,0.70);
          text-decoration: none;
          transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ft-social-btn:hover {
          background: rgba(56,189,248,0.18);
          border-color: rgba(56,189,248,0.45);
          color: #7dd3fc;
          transform: scale(1.14) translateY(-2px);
          box-shadow: 0 4px 14px rgba(56,189,248,0.20);
        }

        /* Entrance animations */
        @keyframes ftFadeLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ftFadeRight {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ftFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <footer className="ft-root">
        <div className="ft-glow-left" />
        <div className="ft-glow-right" />
        <div className="ft-shimmer-line" />

        <div className="ft-inner">
          {/* Top row */}
          <div className="ft-top">
            {/* Brand */}
            <a href="/" className="ft-brand">
              <div className="ft-brand-icon">💧</div>
              <div>
                <div className="ft-brand-name">
                  Clean Water<span className="amp">&</span>Sanitation
                </div>
                <div className="ft-brand-tagline">Safe water · Hygiene · Health</div>
              </div>
            </a>

            {/* Link columns */}
            <div className="ft-cols">
              <div>
                <div className="ft-col-title">Explore</div>
                <div className="ft-col-links">
                  <a href="#features" className="ft-link">Features</a>
                  <a href="#impact" className="ft-link">Impact</a>
                  <a href="#get-started" className="ft-link">Get Started</a>
                </div>
              </div>
              <div>
                <div className="ft-col-title">Company</div>
                <div className="ft-col-links">
                  <a href="/about" className="ft-link">About Us</a>
                  <a href="/contact" className="ft-link">Contact</a>
                  <a href="/rest-rooms" className="ft-link">Rest Rooms</a>
                </div>
              </div>
            </div>
          </div>

          <div className="ft-divider" />

          {/* Bottom row */}
          <div className="ft-bottom">
            <div className="ft-copyright">
              © {year} <span>Clean Water &amp; Sanitation</span>. All rights reserved.
            </div>

            {/* Social icons */}
            <div className="ft-socials">
              {/* Twitter/X */}
              <a href="#" className="ft-social-btn" aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.836L2.25 2.25h6.928l4.255 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="ft-social-btn" aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* Globe / Website */}
              <a href="#" className="ft-social-btn" aria-label="Website">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}