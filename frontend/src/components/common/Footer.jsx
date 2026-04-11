import { Link } from "react-router-dom";

const FOOTER_LOGO_URL =
  "https://api.iconify.design/material-symbols/wc-rounded.svg?color=%230369a1";

export default function Footer() {
  const year = new Date().getFullYear();

  const footerLinkClass =
    "flex w-full items-center justify-between rounded-2xl border border-white/40 bg-white/20 px-4 py-3 text-[14px] font-medium text-sky-900 no-underline backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/35 hover:text-sky-950";

  const socialLinkClass =
    "grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-white/20 text-sky-800 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/40";

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-sky-200/90 via-sky-300/95 to-sky-400">
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-52 w-52 rounded-full bg-white/15 blur-3xl" />

      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-6 pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr_0.9fr]">
          <div className="rounded-[28px] border border-white/40 bg-white/20 p-6 shadow-lg shadow-sky-900/10 backdrop-blur-[10px]">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/80 shadow-md shadow-sky-900/10 animate-[bounce_3.5s_ease-in-out_infinite]">
                <img
                  src={FOOTER_LOGO_URL}
                  alt="CWAS footer logo"
                  className="h-7 w-7"
                />
              </div>
              <span className="text-[28px] font-bold tracking-tight text-sky-900">
                CWAS
              </span>
            </Link>

            <p className="mt-4 max-w-[420px] text-[14px] leading-7 text-sky-900/75">
              Community platform for reporting, tracking, and improving water
              and sanitation conditions with clear public visibility.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/35 bg-white/15 p-6 shadow-lg shadow-sky-900/8 backdrop-blur-[8px]">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[1.6px] text-sky-900/60">
              Explore
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/" className={footerLinkClass}>
                <span>Home</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>

              <a href="/#features" className={footerLinkClass}>
                <span>Features</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>

              <a href="/#impact" className={footerLinkClass}>
                <span>Impact</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/35 bg-white/15 p-6 shadow-lg shadow-sky-900/8 backdrop-blur-[8px]">
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[1.6px] text-sky-900/60">
              Quick Links
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/about" className={footerLinkClass}>
                <span>About Us</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>

              <Link to="/contact" className={footerLinkClass}>
                <span>Contact</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>

              <Link to="/rest-rooms" className={footerLinkClass}>
                <span>Rest Rooms</span>
                <svg
                  className="h-3.5 w-3.5 opacity-40"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/35 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-sky-900/70">
            © {year} <span className="font-semibold text-sky-950">CWAS</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <a href="#" className={socialLinkClass} aria-label="Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.836L2.25 2.25h6.928l4.255 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </a>

            <a href="#" className={socialLinkClass} aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
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
  );
}