import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── Reduced motion hook ─────────────────────────────────── */
function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener
      ? mq.addEventListener("change", handler)
      : mq.addListener(handler);
    return () =>
      mq.removeEventListener
        ? mq.removeEventListener("change", handler)
        : mq.removeListener(handler);
  }, []);
  return reducedMotion;
}

/* ── Animated counter hook ───────────────────────────────── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let frameId = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [start, target, duration]);
  return val;
}

/* ── Intersection observer hook ──────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Restroom icon ───────────────────────────────────────── */
function RestroomIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="h-8 w-8"
      stroke="#0369a1"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7M10 16h8" />
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />
      <line
        x1="24"
        y1="4"
        x2="24"
        y2="38"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

/* ── Stat card ───────────────────────────────────────────── */
function Stat({ title, value, hint, icon, delayClass = "" }) {
  const [ref, inView] = useInView(0.3);
  const num = useCounter(parseInt(value), 1600, inView);
  const hasPlus = typeof value === "string" && value.includes("+");

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border border-sky-200/70 bg-white/75 px-5 py-6 shadow-lg shadow-sky-100/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50 animate-[statPop_0.45s_cubic-bezier(0.34,1.56,0.64,1)_both] ${delayClass}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-600">
        {icon}
      </div>

      <div className="bg-gradient-to-br from-sky-500 to-blue-400 bg-clip-text text-[2.2rem] font-extrabold leading-none text-transparent">
        {inView ? num : 0}
        {hasPlus ? "+" : ""}
      </div>

      <div className="mt-1.5 text-[13px] font-semibold text-sky-900">
        {title}
      </div>
      <div className="mt-0.5 text-[11px] tracking-[0.2px] text-sky-500">
        {hint}
      </div>
    </div>
  );
}

/* ── Feature card ────────────────────────────────────────── */
function Feature({ icon, title, desc, delayClass = "" }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-sky-200/70 bg-white/75 px-6 py-7 shadow-lg shadow-sky-100/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${delayClass}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-100/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-[1]">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-600 transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        <div className="mb-2 text-[15px] font-bold text-sky-900">{title}</div>
        <p className="text-[13px] leading-[1.65] text-sky-600">{desc}</p>
      </div>
    </div>
  );
}

/* ── Icon helpers ────────────────────────────────────────── */
const icons = {
  map: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  users: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  check: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  bell: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  lock: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  chart: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M2 20h20" />
    </svg>
  ),
  reports: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  globe: (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  ),
};

const STATS = [
  {
    icon: icons.map,
    title: "Facilities Tracked",
    value: "1200+",
    hint: "Across all districts",
    delayClass: "[animation-delay:0ms]",
  },
  {
    icon: icons.users,
    title: "Active Users",
    value: "8400+",
    hint: "Community reporters",
    delayClass: "[animation-delay:80ms]",
  },
  {
    icon: icons.check,
    title: "Issues Resolved",
    value: "5600+",
    hint: "Verified & closed",
    delayClass: "[animation-delay:160ms]",
  },
  {
    icon: icons.reports,
    title: "Reports Submitted",
    value: "9200+",
    hint: "This year alone",
    delayClass: "[animation-delay:240ms]",
  },
];

const FEATURES = [
  {
    icon: icons.map,
    title: "Restroom Finder",
    desc: "Locate nearby public restrooms with real-time availability, cleanliness ratings, and accessibility info.",
    delayClass: "[transition-delay:0ms]",
  },
  {
    icon: icons.bell,
    title: "Instant Reporting",
    desc: "Report water leakage, blocked toilets, or damaged facilities in seconds. Our team is notified immediately.",
    delayClass: "[transition-delay:80ms]",
  },
  {
    icon: icons.check,
    title: "Issue Tracking",
    desc: "Follow the status of every report you submit — from open to in-progress to resolved — all in one place.",
    delayClass: "[transition-delay:160ms]",
  },
  {
    icon: icons.lock,
    title: "Secure & Private",
    desc: "Your data is protected with role-based access. Only verified staff and administrators can act on reports.",
    delayClass: "[transition-delay:240ms]",
  },
  {
    icon: icons.chart,
    title: "Impact Dashboard",
    desc: "See live stats on issues resolved, facilities improved, and community contributions across every district.",
    delayClass: "[transition-delay:320ms]",
  },
  {
    icon: icons.globe,
    title: "Community-Driven",
    desc: "Built on verified community data that helps authorities and NGOs allocate resources where they create most impact.",
    delayClass: "[transition-delay:400ms]",
  },
];

/* ── Hero slides ─────────────────────────────────────────── */
const HERO_SLIDES = [
  "/images/home-slide-1.jpg",
  "/images/home-slide-2.jpg",
  "/images/home-slide-3.jpg",
  "/images/home-slide-4.jpg",
];

/* ── Component ───────────────────────────────────────────── */
export default function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (reducedMotion || HERO_SLIDES.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <>
      <style>{`
        @keyframes statPop {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hmFadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hmFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200">
        {/* ── HERO ── */}
        <section className="relative flex min-h-[72vh] w-full flex-col items-center overflow-hidden px-6 pb-16 pt-24 text-center">
          {/* Background slider */}
          <div className="absolute inset-0">
            {HERO_SLIDES.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}

            <div className="absolute inset-0 bg-sky-950/45" />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/50 via-sky-800/35 to-blue-900/45" />
          </div>

          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-32 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center">
            {/* Icon */}
            <div
              className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md ${
                !reducedMotion ? "animate-[hmFadeDown_0.5s_0.05s_both]" : ""
              }`}
            >
              <RestroomIcon />
            </div>

            <h1
              className={`max-w-[820px] text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.1] tracking-tight text-white ${
                !reducedMotion ? "animate-[hmFadeDown_0.55s_0.15s_both]" : ""
              }`}
            >
              Access to{" "}
              <span className="bg-gradient-to-br from-sky-200 via-sky-300 to-blue-300 bg-clip-text text-transparent">
                CWAS
              </span>{" "}
              is a
              <br className="hidden sm:block" /> fundamental human right
            </h1>

            <p
              className={`mt-6 max-w-[520px] text-[15px] leading-[1.75] text-sky-50 ${
                !reducedMotion ? "animate-[hmFadeDown_0.55s_0.25s_both]" : ""
              }`}
            >
              A community-driven platform to report, track, and improve clean
              water access, sanitation issues, and public restroom conditions
              across districts.
            </p>

            {/* CTA buttons */}
            <div
              className={`mt-8 flex flex-wrap items-center justify-center gap-3 ${
                !reducedMotion ? "animate-[hmFadeUp_0.55s_0.35s_both]" : ""
              }`}
            >
              <Link
                to="/rest-rooms"
                className="inline-flex w-auto items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 no-underline"
              >
                View Rest Rooms
                <svg
                  className="h-4 w-4"
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

              <Link
                to="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 no-underline"
              >
                Get Started
              </Link>
            </div>

            {/* Trust pills */}
            <div
              className={`mt-8 flex flex-wrap justify-center gap-2 ${
                !reducedMotion ? "animate-[hmFadeUp_0.55s_0.45s_both]" : ""
              }`}
            >
              {[
                "1,200+ Facilities",
                "8,400+ Users",
                "5,600+ Issues Resolved",
                "Sri Lanka Wide",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Slide dots */}
            <div className="mt-8 flex items-center gap-2">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-8 md:pt-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <Stat key={s.title} {...s} />
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="mx-auto max-w-5xl px-6 pb-16" id="features">
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full border border-sky-200 bg-sky-100/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-sky-600">
              Platform Features
            </span>
            <h2 className="mt-4 text-3xl font-bold text-sky-900">
              Everything you need in one place
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-sky-600">
              From finding clean restrooms to tracking your reports, CWAS gives
              every community member the tools to make a difference.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ── IMPACT ── */}
        <section className="mx-auto max-w-5xl px-6 pb-20" id="impact">
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-white/75 px-8 py-12 shadow-xl shadow-sky-100/40 backdrop-blur-xl md:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative z-[1]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11.5px] font-semibold tracking-[0.4px] text-sky-600">
                <svg
                  className="h-3 w-3 text-sky-400"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <circle cx="6" cy="6" r="5" />
                </svg>
                Why it matters
              </span>

              <h2 className="mt-5 max-w-[560px] text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-[1.15] tracking-tight text-sky-900">
                Every data point brings us{" "}
                <span className="text-sky-500">closer to change</span>
              </h2>

              <p className="mt-5 max-w-[620px] text-[14.5px] leading-[1.8] text-sky-700">
                Clean water and proper sanitation reduce waterborne diseases,
                improve school attendance, and raise overall quality of life. By
                collecting precise, community-verified data, this platform helps
                authorities and NGOs direct resources where they create the most
                impact.
              </p>

              <div className="mt-7 flex flex-wrap gap-[10px]">
                {[
                  "Reduce Disease",
                  "Improve Education",
                  "Empower Communities",
                  "Data-Driven Policy",
                  "Faster Response",
                ].map((p) => (
                  <span
                    key={p}
                    className="cursor-default rounded-full border border-sky-200 bg-sky-50/80 px-4 py-[7px] text-[12.5px] font-medium text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-sky-100" />
                <span className="text-[11px] text-sky-300 uppercase tracking-widest">
                  key benefits
                </span>
                <div className="h-px flex-1 bg-sky-100" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: icons.check,
                    title: "Better Hygiene",
                    desc: "Supports cleaner public facilities and promotes healthier public spaces for everyone.",
                  },
                  {
                    icon: icons.bell,
                    title: "Faster Response",
                    desc: "Issues reach responsible staff quickly for faster action and maintenance.",
                  },
                  {
                    icon: icons.chart,
                    title: "Better Management",
                    desc: "Track problems, assign work, and improve sanitation service quality with ease.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/80 text-sky-600">
                      {icon}
                    </div>
                    <p className="text-[13.5px] font-semibold text-sky-900">
                      {title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-6 text-sky-600">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
