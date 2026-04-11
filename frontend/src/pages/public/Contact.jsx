import { useEffect, useRef, useState } from "react";
import FloatingToast from "../../components/common/FloatingToast";
import { submitContactForm } from "../../services/contactService";

/* ── Icons ─────────────────────────────────────────────── */
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

function MailIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m3 5.5 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.3 3.8h2.1l1 3-1.5 1.5a11 11 0 0 0 3.8 3.8l1.5-1.5 3 1v2.1a1.6 1.6 0 0 1-1.8 1.6A12.9 12.9 0 0 1 4.7 5.6a1.6 1.6 0 0 1 1.6-1.8Z" />
    </svg>
  );
}

function MapPinIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function DropletsIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05Z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </svg>
  );
}

function AlertIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SendIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Shared tokens ──────────────────────────────────────── */
const fieldClass =
  "w-full rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-900 placeholder:text-sky-300 caret-sky-600 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

const labelClass =
  "block mb-1.5 text-xs font-semibold text-sky-800 tracking-wide uppercase";

/* ── Data ───────────────────────────────────────────────── */
const CONTACT_INFO = [
  {
    icon: <MailIcon size={20} />,
    title: "Email Address",
    value: "support@cleansanitation.com",
    desc: "For general support and inquiries",
  },
  {
    icon: <PhoneIcon size={20} />,
    title: "Phone Number",
    value: "+94 77 123 4567",
    desc: "Available during working hours",
  },
  {
    icon: <MapPinIcon size={20} />,
    title: "Office Location",
    value: "Colombo, Sri Lanka",
    desc: "Main administration office",
  },
];

const SUPPORT_ITEMS = [
  {
    icon: <DropletsIcon size={20} />,
    title: "Sanitation Support",
    text: "Reach us for questions related to public restroom cleanliness, water supply, and sanitation services.",
  },
  {
    icon: <AlertIcon size={20} />,
    title: "Issue Reporting",
    text: "Need help with reporting damaged facilities, water leakage, blocked toilets, or maintenance concerns.",
  },
  {
    icon: <ShieldIcon size={20} />,
    title: "General Assistance",
    text: "Contact us for account support, service information, and platform-related help.",
  },
];

const FAQ_ITEMS = [
  {
    question: "How can I report a restroom issue?",
    answer:
      "You can contact us through this form or use the issue reporting feature available on the website.",
  },
  {
    question: "How long does it take to get a response?",
    answer: "Most inquiries are answered within 24 hours during working days.",
  },
  {
    question: "Can I contact you for sanitation and maintenance concerns?",
    answer:
      "Yes, this page can be used for all sanitation, maintenance, and general support questions.",
  },
];

/* ── Component ─────────────────────────────────────────── */
export default function Contact() {
  const TOAST_DURATION_MS = 5000;
  const pageTopRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!feedback?.text) return undefined;
    const id = window.setTimeout(() => setFeedback({ type: "", text: "" }), TOAST_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFeedback({ type: "", text: "" });
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      };
      const result = await submitContactForm(payload);
      setFeedback({ type: "success", text: result?.message ? "Message sent successfully." : "Message sent." });
      pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Failed to send message." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={pageTopRef} className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-200">

      {feedback.text && (
        <FloatingToast
          toast={feedback}
          onClose={() => setFeedback({ type: "", text: "" })}
          positionClassName="top-24 z-[120]"
        />
      )}

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-200 bg-sky-100/80">
          <RestroomIcon />
        </div>
        <h1 className="text-4xl font-bold leading-tight text-sky-900 md:text-5xl">
          Get in Touch With Our Team
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-sky-700">
          We are here to support clean water access, sanitation services, and
          public restroom maintenance. Contact us for assistance, questions, or
          issue reporting.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 space-y-10">

        {/* ── Contact info cards ── */}
        <div className="grid gap-5 md:grid-cols-3">
          {CONTACT_INFO.map((item) => (
            <div key={item.title}
              className="group rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-lg shadow-sky-100/40 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/50">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-600">
                {item.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-sky-900">{item.title}</h3>
              <p className="mt-1.5 text-sm font-semibold text-sky-600">{item.value}</p>
              <p className="mt-1 text-xs text-sky-400">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Support items ── */}
        <div className="grid gap-5 md:grid-cols-3">
          {SUPPORT_ITEMS.map((item) => (
            <div key={item.title}
              className="rounded-2xl border border-sky-100 bg-sky-50/60 p-6 transition-all duration-200 hover:-translate-y-0.5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/80 text-sky-600">
                {item.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-sky-900">{item.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-6 text-sky-600">{item.text}</p>
            </div>
          ))}
        </div>

        {/* ── Form + Side ── */}
        <div className="grid gap-8 lg:grid-cols-2 items-start">

          {/* Contact form */}
          <div className="rounded-3xl border border-sky-200/70 bg-white/75 p-8 shadow-xl shadow-sky-100/40 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-sky-900">Send Us a Message</h2>
            <p className="mt-1.5 text-xs text-sky-500">
              Fill out the form below and our team will respond as soon as possible.
            </p>

            {/* Divider */}
            <div className="my-5 h-px bg-sky-100" />

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  spellCheck={false} autoComplete="off" required
                  placeholder="Enter your full name" className={fieldClass} />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  spellCheck={false} autoComplete="off" required
                  placeholder="Enter your email" className={fieldClass} />
              </div>

              <div>
                <label className={labelClass}>Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange}
                  spellCheck={false} autoComplete="off" required
                  placeholder="Enter message subject" className={fieldClass} />
              </div>

              <div>
                <label className={labelClass}>Message</label>
                <textarea name="message" rows={5} value={form.message} onChange={handleChange}
                  spellCheck={false} required
                  placeholder="Write your message here..."
                  className={`${fieldClass} resize-none`} />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-sky-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <SendIcon size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Side content */}
          <div className="space-y-6">

            {/* FAQ */}
            <div className="rounded-3xl border border-sky-200/70 bg-white/75 p-8 shadow-xl shadow-sky-100/40 backdrop-blur-xl">
              <h3 className="text-[17px] font-bold text-sky-900 mb-5">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {FAQ_ITEMS.map((faq) => (
                  <div key={faq.question}
                    className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                    <h4 className="text-[13.5px] font-semibold text-sky-900">
                      {faq.question}
                    </h4>
                    <p className="mt-2 text-xs leading-6 text-sky-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Support banner */}
            <div className="rounded-3xl border border-sky-300/50 bg-gradient-to-br from-sky-400 to-blue-500 p-8 shadow-xl shadow-sky-300/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                <ShieldIcon size={20} />
              </div>
              <h3 className="text-[17px] font-bold text-white">
                Support for Better Public Facilities
              </h3>
              <p className="mt-3 text-[13px] leading-7 text-sky-100">
                Our platform is committed to improving public restroom
                cleanliness, water availability, and sanitation management
                through better communication and service support.
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-white/20" />

              <div className="flex flex-col gap-2.5">
                {[
                  "24h response for urgent issues",
                  "Dedicated sanitation support team",
                  "Secure & private communication",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-[12.5px] text-sky-100">
                    <svg className="h-3.5 w-3.5 flex-shrink-0 text-white" viewBox="0 0 16 16"
                      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l4 4 6-7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}