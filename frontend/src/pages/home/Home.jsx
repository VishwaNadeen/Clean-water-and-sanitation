import { useState, useEffect, useRef } from "react";

const HERO_PARTICLES = [
  { size: 10, left: "12%", bottom: "6%", duration: "10s", delay: "0.2s", opacity: 0.3 },
  { size: 8, left: "24%", bottom: "14%", duration: "11s", delay: "1.1s", opacity: 0.24 },
  { size: 12, left: "38%", bottom: "10%", duration: "12s", delay: "0.6s", opacity: 0.28 },
  { size: 9, left: "52%", bottom: "4%", duration: "10.5s", delay: "1.8s", opacity: 0.22 },
  { size: 11, left: "68%", bottom: "12%", duration: "11.5s", delay: "0.9s", opacity: 0.26 },
  { size: 8, left: "82%", bottom: "8%", duration: "10.8s", delay: "1.4s", opacity: 0.22 },
];

/* —— Reduced motion hook —— */
function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return reducedMotion;
}

/* —— Animated counter hook —— */
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

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [start, target, duration]);

  return val;
}

/* —— Intersection observer hook —— */
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

/* —— Stat card —— */
function Stat({ title, value, hint, icon, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const num = useCounter(parseInt(value), 1600, inView);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[18px] border border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-5 py-[22px] shadow-[0_4px_18px_rgba(125,211,252,0.14)] transition-transform duration-300 hover:-translate-y-1"
      style={{
        animation: "statPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        animationDelay: `${delay}ms`,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
      <div className="mb-[10px] text-[22px]">{icon}</div>

      <div className="bg-gradient-to-br from-sky-500 to-blue-400 bg-clip-text font-['DM_Serif_Display'] text-[2.2rem] font-extrabold leading-none text-transparent">
        {inView ? num : 0}
        {typeof value === "string" && value.includes("+") ? "+" : ""}
      </div>

      <div className="mt-[6px] text-[13px] font-semibold text-slate-800">
        {title}
      </div>

      <div className="mt-[3px] text-[11px] tracking-[0.2px] text-slate-500">
        {hint}
      </div>
    </div>
  );
}

/* —— Feature card —— */
function Feature({ icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[20px] border border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-6 py-7 shadow-[0_4px_18px_rgba(125,211,252,0.12)] transition-all duration-500 hover:-translate-y-1 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/30 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />

      <div className="relative z-[1]">
        <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-[14px] border border-sky-200 bg-sky-100 text-[20px] transition-transform duration-300 hover:scale-105">
          {icon}
        </div>

        <div className="mb-2 text-[15.5px] font-bold text-slate-800">
          {title}
        </div>

        <p className="text-[13.5px] leading-[1.65] text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes particleFloat {
          0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.45; }
          100% { transform: translate3d(0, -90px, 0) scale(0.7); opacity: 0; }
        }

        @keyframes statPop {
          from { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.98); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes impactGlow {
          from { opacity: 0.35; transform: scale(1); }
          to   { opacity: 0.7; transform: scale(1.12); }
        }

        @keyframes hmFadeDown {
          from { opacity: 0; transform: translate3d(0, -12px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div
        className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_50%,rgba(224,242,254,1)_100%)] font-['Poppins'] text-slate-800"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 82% 54% at 12% 2%, rgba(125,211,252,0.28) 0%, transparent 58%),
            radial-gradient(ellipse 44% 30% at 78% 14%, rgba(96,165,250,0.14) 0%, transparent 62%),
            radial-gradient(ellipse 62% 42% at 90% 80%, rgba(186,230,253,0.34) 0%, transparent 55%),
            linear-gradient(180deg, rgba(248,252,255,1) 0%, rgba(236,248,255,1) 48%, rgba(219,241,255,1) 100%)
          `,
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {/* —— HERO —— */}
        <section className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-[60px] pt-20 text-center">
          {!reducedMotion && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {HERO_PARTICLES.map((particle, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: particle.left,
                    bottom: particle.bottom,
                    animation: `particleFloat ${particle.duration} linear infinite`,
                    animationDelay: particle.delay,
                    opacity: particle.opacity,
                    background:
                      "radial-gradient(circle, rgba(56,189,248,0.35), transparent 72%)",
                    willChange: "transform, opacity",
                    transform: "translate3d(0,0,0)",
                  }}
                />
              ))}
            </div>
          )}

          <h1
            className="relative z-[1] max-w-[980px] font-['Poppins'] text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.1] tracking-[-1px] text-slate-900"
            style={{
              animation: reducedMotion ? "none" : "hmFadeDown 0.55s 0.15s both",
            }}
          >
            Access to{" "}
            <em className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-500 bg-clip-text not-italic text-transparent">
              CWAS
            </em>{" "}
            is a
            <br />
            fundamental human right
          </h1>

          <p
            className="relative z-[1] mt-5 max-w-[520px] text-[16px] leading-[1.7] text-slate-600"
            style={{
              animation: reducedMotion ? "none" : "hmFadeDown 0.55s 0.25s both",
            }}
          >
            A community-driven platform to report, track, and improve clean
            water access, sanitation issues, and public restroom conditions
            across districts.
          </p>
        </section>

        {/* —— IMPACT —— */}
        <div className="mx-auto max-w-[1200px] px-6 pb-20" id="impact">
          <div
            className="relative overflow-hidden rounded-[24px] border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-10 py-12 shadow-[0_6px_26px_rgba(125,211,252,0.14)]"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            {!reducedMotion && (
              <div
                className="pointer-events-none absolute -right-[60px] -top-[60px] h-[260px] w-[260px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(56,189,248,0.10), transparent 65%)",
                  animation: "impactGlow 5s ease-in-out infinite alternate",
                }}
              />
            )}

            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11.5px] font-semibold tracking-[0.4px] text-sky-600">
              💙 Why it matters
            </div>

            <h2 className="mb-[18px] max-w-[580px] font-['Poppins'] text-[clamp(1.7rem,3vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.3px] text-slate-900">
              Every data point brings us{" "}
              <em className="not-italic text-sky-500">closer to change</em>
            </h2>

            <p className="max-w-[620px] text-[15px] leading-[1.75] text-slate-600">
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
                  className="cursor-default rounded-full border border-sky-200 bg-sky-50 px-4 py-[7px] text-[12.5px] font-medium text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
