const FOOTER_LOGO_URL =
  "https://api.iconify.design/material-symbols/wc-rounded.svg?color=%23000000";

export default function Footer() {
  const year = new Date().getFullYear();

  const footerLinkClass =
    "flex w-full items-center justify-between rounded-2xl border border-white/35 bg-white/14 px-4 py-3 text-[14px] font-medium text-slate-900/90 no-underline shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/26 hover:text-slate-950";

  const socialLinkClass =
    "grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-white/14 text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/30";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        @keyframes ftFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ftFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      <footer
        className="relative overflow-hidden font-['Poppins']"
        style={{
          background:
            "linear-gradient(180deg, rgba(143,208,251,0.88) 0%, rgba(83,179,245,0.94) 45%, rgba(67,160,232,0.98) 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.22), transparent 72%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 right-0 h-52 w-52 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 72%)",
          }}
        />

        <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-6 pt-10">
          <div
            className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr_0.9fr]"
            style={{ animation: "ftFadeUp 0.5s ease-out both" }}
          >
            <div className="rounded-[28px] border border-white/40 bg-white/18 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-[10px]">
              <a href="/" className="flex items-center gap-3 no-underline">
                <div
                  className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.10)]"
                  style={{ animation: "ftFloat 3.5s ease-in-out infinite" }}
                >
                  <img
                    src={FOOTER_LOGO_URL}
                    alt="CWAS footer logo"
                    className="h-7 w-7"
                  />
                </div>
                <div className="text-[28px] font-bold tracking-[-0.4px] text-black">
                  CWAS
                </div>
              </a>

              <p className="mt-4 max-w-[420px] text-[14px] leading-7 text-slate-900/75">
                Community platform for reporting, tracking, and improving water
                and sanitation conditions with clear public visibility.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/35 bg-white/12 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[8px]">
              <div className="mb-5 text-[12px] font-semibold uppercase tracking-[1.6px] text-slate-900/65">
                Explore
              </div>
              <div className="flex flex-col gap-3">
                <a href="/" className={footerLinkClass}>
                  <span>Home</span>
                </a>
                <a href="#features" className={footerLinkClass}>
                  <span>Features</span>
                </a>
                <a href="#impact" className={footerLinkClass}>
                  <span>Impact</span>
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/35 bg-white/12 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[8px]">
              <div className="mb-5 text-[12px] font-semibold uppercase tracking-[1.6px] text-slate-900/65">
                Quick Links
              </div>
              <div className="flex flex-col gap-3">
                <a href="/about" className={footerLinkClass}>
                  <span>About Us</span>
                </a>
                <a href="/contact" className={footerLinkClass}>
                  <span>Contact</span>
                </a>
                <a href="/rest-rooms" className={footerLinkClass}>
                  <span>Rest Rooms</span>
                </a>
              </div>
            </div>
          </div>

          <div
            className="mt-8 flex flex-col gap-4 border-t border-white/35 pt-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ animation: "ftFadeUp 0.5s 0.08s ease-out both" }}
          >
            <div className="text-[12.5px] text-slate-900/70">
              © {year} <span className="font-semibold text-slate-950">CWAS</span>. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
              <a href="#" className={socialLinkClass} aria-label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.836L2.25 2.25h6.928l4.255 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
              </a>
              <a href="#" className={socialLinkClass} aria-label="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className={socialLinkClass} aria-label="Website">
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
