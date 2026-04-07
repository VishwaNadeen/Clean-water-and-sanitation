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
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ── Stat card ── */
function Stat({ title, value, hint, icon, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const num = useCounter(parseInt(value), 1600, inView);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[18px] border border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-5 py-[22px] shadow-[0_4px_20px_rgba(125,211,252,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(56,189,248,0.16),0_0_0_1px_rgba(56,189,248,0.12)]"
      style={{
        animation: "statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        animationDelay: `${delay}ms`,
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

/* ── Feature card ── */
function Feature({ icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`relative cursor-pointer overflow-hidden rounded-[20px] border border-sky-200/80 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-6 py-7 shadow-[0_4px_20px_rgba(125,211,252,0.14)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(56,189,248,0.14),0_0_0_1px_rgba(56,189,248,0.12)] ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
      <div className="relative z-[1]">
        <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-[14px] border border-sky-200 bg-sky-100 text-[20px] transition-transform duration-300 hover:scale-110 hover:-rotate-3">
          {icon}
        </div>
        <div className="mb-2 text-[15.5px] font-bold text-slate-800">
          {title}
        </div>
        <p className="text-[13.5px] leading-[1.65] text-slate-500">{desc}</p>
        <div className="mt-[18px] translate-x-[-6px] text-[16px] text-sky-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          →
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [heroRef] = useInView(0.1);
  const [statsRef] = useInView(0.2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes particleFloat {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
        }

        @keyframes badgePulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(0.7); }
        }

        @keyframes statPop {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes impactGlow {
          from { opacity: 0.5; transform: scale(1); }
          to   { opacity: 1; transform: scale(1.2); }
        }

        @keyframes hmFadeDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes hmFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_50%,rgba(224,242,254,1)_100%)] font-['Outfit'] text-slate-800"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(125,211,252,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 80%, rgba(186,230,253,0.35) 0%, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,249,255,1) 50%, rgba(224,242,254,1) 100%)
          `,
        }}
      >
        {/* ── HERO ── */}
        <section
          className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-[60px] pt-20 text-center"
          ref={heroRef}
        >
          {/* Floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${6 + Math.random() * 10}px`,
                  height: `${6 + Math.random() * 10}px`,
                  left: `${10 + Math.random() * 80}%`,
                  bottom: `${Math.random() * 30}%`,
                  animation: `particleFloat ${4 + Math.random() * 5}s linear infinite`,
                  animationDelay: `${Math.random() * 4}s`,
                  opacity: 0.4 + Math.random() * 0.4,
                  background:
                    "radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)",
                }}
              />
            ))}
          </div>

          <div
            className="relative z-[1] mb-7 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[12.5px] font-medium tracking-[0.4px] text-sky-600"
            style={{ animation: "hmFadeDown 0.5s 0.1s both" }}
          >
            <span
              className="h-[6px] w-[6px] rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              style={{ animation: "badgePulse 2s ease-in-out infinite" }}
            />
            Clean Water & Sanitation Platform
          </div>

          <h1
            className="relative z-[1] max-w-[800px] font-['DM_Serif_Display'] text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.1] tracking-[-1px] text-slate-900"
            style={{ animation: "hmFadeDown 0.6s 0.2s both" }}
          >
            Access to{" "}
            <em className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-500 bg-clip-text not-italic text-transparent">
              clean water
            </em>{" "}
            is a fundamental human right
          </h1>

          <p
            className="relative z-[1] mt-5 max-w-[520px] text-[16px] leading-[1.7] text-slate-600"
            style={{ animation: "hmFadeDown 0.6s 0.3s both" }}
          >
            A community-driven platform to report, track, and resolve water
            quality and sanitation issues across districts.
          </p>

          <div
            className="relative z-[1] mt-9 flex flex-wrap justify-center gap-3"
            id="get-started"
            style={{ animation: "hmFadeDown 0.6s 0.4s both" }}
          >
            <button className="relative overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-400 to-blue-400 px-7 py-[13px] text-[14px] font-semibold text-white shadow-[0_2px_20px_rgba(56,189,248,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(56,189,248,0.32)]">
              Submit a Report
            </button>
            <button className="rounded-xl border border-sky-200 bg-white px-7 py-[13px] text-[14px] font-medium text-sky-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-[0_4px_18px_rgba(56,189,248,0.10)]">
              Explore Dashboard →
            </button>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="mx-auto max-w-[1200px] px-6 pb-16" ref={statsRef}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon="📋"
              title="Reports Filed"
              value="128"
              hint="last 30 days"
              delay={0}
            />
            <Stat
              icon="✅"
              title="Issues Resolved"
              value="76"
              hint="community verified"
              delay={80}
            />
            <Stat
              icon="⚠️"
              title="High Risk Zones"
              value="12"
              hint="needs attention"
              delay={160}
            />
            <Stat
              icon="🗺️"
              title="Districts Active"
              value="9"
              hint="areas covered"
              delay={240}
            />
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="mx-auto max-w-[1200px] px-6 pb-[72px]" id="features">
          <div className="mb-[10px] text-[11px] font-semibold uppercase tracking-[1.8px] text-sky-500">
            What we offer
          </div>
          <div className="mb-9 font-['DM_Serif_Display'] text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal leading-[1.15] tracking-[-0.5px] text-slate-900">
            Tools built for <em className="not-italic text-sky-500">real impact</em>
          </div>

          <div className="grid gap-[14px] md:grid-cols-3">
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
        <div className="mx-auto max-w-[1200px] px-6 pb-20" id="impact">
          <div className="relative overflow-hidden rounded-[24px] border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-10 py-12 shadow-[0_8px_40px_rgba(125,211,252,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div
              className="pointer-events-none absolute -right-[60px] -top-[60px] h-[260px] w-[260px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(56,189,248,0.12), transparent 65%)",
                animation: "impactGlow 5s ease-in-out infinite alternate",
              }}
            />

            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11.5px] font-semibold tracking-[0.4px] text-sky-600">
              💙 Why it matters
            </div>

            <h2 className="mb-[18px] max-w-[580px] font-['DM_Serif_Display'] text-[clamp(1.7rem,3vw,2.4rem)] font-normal leading-[1.15] tracking-[-0.3px] text-slate-900">
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