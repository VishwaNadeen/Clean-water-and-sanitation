import { Link } from "react-router-dom";

function RestroomIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8"
      stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="14" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M14 13v9M14 22l-4 7M14 22l4 7M10 16h8" />
      <circle cx="34" cy="8" r="3.5" fill="#0369a1" stroke="none" />
      <path d="M34 13v5" />
      <path d="M28 18h12l-2 11h-8l-2-11Z" fill="rgba(3,105,161,0.15)" />
      <path d="M34 29v6" />
      <line x1="24" y1="4" x2="24" y2="38" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

const OFFERS = [
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Public Restroom Information",
    desc: "Users can view important details about available public restroom facilities and access useful information quickly and easily.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Issue Reporting",
    desc: "Our system allows users to report sanitation issues such as water leakage, blocked toilets, lack of water, bad odor, or damaged facilities.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Maintenance Support",
    desc: "The platform helps staff and managers coordinate cleaning, maintenance, and inspection activities to improve service quality.",
  },
];

const MATTERS = [
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Better Hygiene",
    desc: "Supports cleaner public facilities and promotes healthier public spaces for everyone.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Faster Response",
    desc: "Helps issues reach responsible staff quickly for faster action and maintenance.",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: "Better Management",
    desc: "Makes it easier to track problems, assign work, and improve sanitation service quality.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200">

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/80">
          <RestroomIcon />
        </div>

        <h1 className="text-4xl font-bold leading-tight text-sky-900 md:text-5xl">
          Improving Public Restroom Cleanliness and Sanitation
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-8 text-sky-700">
          Our platform is designed to support clean water access, sanitation
          services, and public restroom management through smart digital
          solutions. We help users report issues, access facility information,
          and support better hygiene standards in public spaces.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Public Health", "Smart Sanitation", "Community Driven", "Faster Response"].map((tag) => (
            <span key={tag}
              className="rounded-full border border-sky-200/80 bg-white/60 px-4 py-1.5 text-xs font-semibold text-sky-700 backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              icon: (
                <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              ),
              label: "Our Mission",
              text: "To improve public sanitation and restroom management by providing a reliable platform for issue reporting, facility monitoring, and service coordination that supports cleaner and safer public spaces.",
            },
            {
              icon: (
                <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              ),
              label: "Our Vision",
              text: "To build a smarter future where public restrooms are clean, accessible, safe, and properly maintained through effective use of technology and sanitation management.",
            },
          ].map(({ icon, label, text }) => (
            <div key={label}
              className="rounded-3xl border border-sky-200/70 bg-white/75 p-8 shadow-xl shadow-sky-100/40 backdrop-blur-xl">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80">
                {icon}
              </div>
              <h2 className="text-xl font-bold text-sky-900">{label}</h2>
              <p className="mt-3 text-[14px] leading-7 text-sky-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-sky-900">What We Offer</h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-sky-600">
            A complete toolkit for public sanitation management, built for users, staff, and administrators alike.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {OFFERS.map(({ icon, title, desc }) => (
            <div key={title}
              className="group rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-lg shadow-sky-100/40 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80">
                {icon}
              </div>
              <h3 className="text-[15px] font-semibold text-sky-900">{title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-sky-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why It Matters ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-3xl border border-sky-200/70 bg-white/75 p-8 shadow-xl shadow-sky-100/40 backdrop-blur-xl md:p-12">

          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-sky-200 bg-sky-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600">
              Why It Matters
            </span>
          </div>

          <h2 className="mt-4 text-center text-3xl font-bold text-sky-900">
            Why This Platform Matters
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-center text-[14px] leading-8 text-sky-700">
            Clean and well-maintained public restrooms are essential for public
            health, dignity, and comfort. By improving communication between
            users, staff members, and management, our system helps create better
            sanitation services and a healthier environment for everyone.
          </p>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-sky-100" />
            <span className="text-xs text-sky-300">key benefits</span>
            <div className="h-px flex-1 bg-sky-100" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {MATTERS.map(({ icon, title, desc }) => (
              <div key={title}
                className="rounded-2xl border border-sky-100 bg-sky-50/60 p-6 transition-all duration-200 hover:-translate-y-0.5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/80">
                  {icon}
                </div>
                <h3 className="text-[14px] font-semibold text-sky-900">{title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-6 text-sky-600">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/rest-rooms"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 no-underline">
              View Rest Rooms
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/70 px-6 py-3 text-sm font-semibold text-sky-700 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/90 no-underline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}