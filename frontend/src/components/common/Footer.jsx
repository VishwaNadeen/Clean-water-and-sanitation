export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes ftGlowPulse {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 1; transform: scale(1.12); }
        }

        @keyframes ftShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes ftFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

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

      <footer
        className="relative overflow-hidden border-t border-sky-200/70 bg-gradient-to-b from-white via-sky-50 to-blue-100 font-[Outfit]"
      >
        {/* Ambient glow blobs */}
        <div
          className="pointer-events-none absolute -left-20 -top-[60px] h-[220px] w-[320px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(56, 189, 248, 0.10) 0%, transparent 70%)",
            animation: "ftGlowPulse 5s ease-in-out infinite alternate",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -right-[60px] h-[180px] w-[260px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99, 179, 237, 0.08) 0%, transparent 70%)",
            animation: "ftGlowPulse 6s 1s ease-in-out infinite alternate",
          }}
        />

        {/* Shimmer top line */}
        <div
          className="h-[1.5px] w-full bg-[length:200%_100%]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.18) 20%, rgba(125, 211, 252, 0.55) 50%, rgba(56, 189, 248, 0.18) 80%, transparent 100%)",
            animation: "ftShimmer 3.5s linear infinite",
          }}
        />

        <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-7 pt-10">
          {/* Top row */}
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <a
              href="/"
              className="flex items-center gap-[11px] no-underline"
              style={{
                animation:
                  "ftFadeLeft 0.6s 0.1s cubic-bezier(0.4,0,0.2,1) both",
              }}
            >
              <div
                className="grid h-[42px] w-[42px] place-items-center rounded-[14px] border border-sky-200/80 bg-gradient-to-br from-sky-100 to-white text-[20px] shadow-[0_0_18px_rgba(56,189,248,0.10),0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300"
                style={{ animation: "ftFloat 4s ease-in-out infinite" }}
              >
                💧
              </div>

              <div>
                <div className="text-[15px] font-bold leading-[1.2] tracking-[-0.2px] text-slate-800">
                  Clean Water<span className="mx-[3px] font-light text-sky-500">&</span>
                  Sanitation
                </div>
                <div className="mt-[3px] text-[12px] font-normal tracking-[0.3px] text-sky-700/60">
                  Safe water · Hygiene · Health
                </div>
              </div>
            </a>

            {/* Link columns */}
            <div
              className="flex gap-10"
              style={{
                animation:
                  "ftFadeRight 0.6s 0.2s cubic-bezier(0.4,0,0.2,1) both",
              }}
            >
              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-sky-500/70">
                  Explore
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="#features"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    Features
                  </a>
                  <a
                    href="#impact"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    Impact
                  </a>
                  <a
                    href="#get-started"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    Get Started
                  </a>
                </div>
              </div>

              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-sky-500/70">
                  Company
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href="/about"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    About Us
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    Contact
                  </a>
                  <a
                    href="/rest-rooms"
                    className="inline-flex w-fit items-center gap-[5px] text-[13.5px] text-sky-700/80 transition-all duration-200 before:inline-block before:h-1 before:w-1 before:scale-0 before:rounded-full before:bg-sky-400 before:opacity-0 before:transition-all before:duration-200 before:content-[''] hover:translate-x-1 hover:text-slate-900 hover:before:scale-100 hover:before:opacity-100"
                  >
                    Rest Rooms
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className="my-7 mb-5 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(56,189,248,0.18) 30%, rgba(56,189,248,0.18) 70%, transparent)",
              animation: "ftFadeIn 0.6s 0.35s both",
            }}
          />

          {/* Bottom row */}
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ animation: "ftFadeIn 0.6s 0.4s both" }}
          >
            <div className="text-[12px] tracking-[0.2px] text-sky-800/50">
              © {year} <span className="text-sky-600/70">Clean Water &amp; Sanitation</span>. All rights reserved.
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              {/* Twitter/X */}
              <a
                href="#"
                className="grid h-8 w-8 place-items-center rounded-[9px] border border-sky-200 bg-white/70 text-sky-500 no-underline transition-all duration-300 hover:-translate-y-[2px] hover:scale-110 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 hover:shadow-[0_4px_14px_rgba(56,189,248,0.14)]"
                aria-label="Twitter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.836L2.25 2.25h6.928l4.255 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                className="grid h-8 w-8 place-items-center rounded-[9px] border border-sky-200 bg-white/70 text-sky-500 no-underline transition-all duration-300 hover:-translate-y-[2px] hover:scale-110 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 hover:shadow-[0_4px_14px_rgba(56,189,248,0.14)]"
                aria-label="LinkedIn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* Globe / Website */}
              <a
                href="#"
                className="grid h-8 w-8 place-items-center rounded-[9px] border border-sky-200 bg-white/70 text-sky-500 no-underline transition-all duration-300 hover:-translate-y-[2px] hover:scale-110 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-600 hover:shadow-[0_4px_14px_rgba(56,189,248,0.14)]"
                aria-label="Website"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}