import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock3,
  Send,
  Droplets,
  ShieldCheck,
  MessageSquareWarning,
} from "lucide-react";
import FloatingToast from "../../components/common/FloatingToast";
import { submitContactForm } from "../../services/contactService";

export default function Contact() {
  const TOAST_DURATION_MS = 5000;
  const pageTopRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!feedback?.text) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback({ type: "", text: "" });
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      setFeedback({
        type: "success",
        text: result?.message ? "Message sent successfully." : "Message sent.",
      });
      pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Failed to send message.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail size={22} />,
      title: "Email Address",
      value: "support@cleansanitation.com",
      desc: "For general support and inquiries",
    },
    {
      icon: <Phone size={22} />,
      title: "Phone Number",
      value: "+94 77 123 4567",
      desc: "Available during working hours",
    },
    {
      icon: <MapPin size={22} />,
      title: "Office Location",
      value: "Colombo, Sri Lanka",
      desc: "Main administration office",
    },
  ];

  const supportItems = [
    {
      icon: <Droplets size={20} />,
      title: "Sanitation Support",
      text: "Reach us for questions related to public restroom cleanliness, water supply, and sanitation services.",
    },
    {
      icon: <MessageSquareWarning size={20} />,
      title: "Issue Reporting",
      text: "Need help with reporting damaged facilities, water leakage, blocked toilets, or maintenance concerns.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "General Assistance",
      text: "Contact us for account support, service information, and platform-related help.",
    },
  ];

  const faqItems = [
    {
      question: "How can I report a restroom issue?",
      answer:
        "You can contact us through this form or use the issue reporting feature available on the website.",
    },
    {
      question: "How long does it take to get a response?",
      answer:
        "Most inquiries are answered within 24 hours during working days.",
    },
    {
      question: "Can I contact you for sanitation and maintenance concerns?",
      answer:
        "Yes, this page can be used for all sanitation, maintenance, and general support questions.",
    },
  ];

  return (
    <div
      ref={pageTopRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100"
    >
      {feedback.text ? (
        <FloatingToast
          toast={feedback}
          onClose={() => setFeedback({ type: "", text: "" })}
          positionClassName="top-24 z-[120]"
        />
      ) : null}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="text-center max-w-3xl mx-auto">
          
          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
            Get in Touch With Our Team
          </h1>

          <p className="mt-4 text-gray-600 text-base md:text-lg">
            We are here to support clean water access, sanitation services, and
            public restroom maintenance. Contact us for assistance, questions,
            or issue reporting.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="mt-2 text-blue-700 font-medium">{item.value}</p>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm leading-6">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Form + Extra Info */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Send Us a Message
              </h2>
              <p className="mt-2 text-gray-600 text-sm">
                Fill out the form below and our team will respond as soon as
                possible.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-blue-200 bg-white text-slate-800 caret-blue-700 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-blue-200 bg-white text-slate-800 caret-blue-700 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                required
                placeholder="Enter message subject"
                className="w-full px-4 py-3 border border-blue-200 bg-white text-slate-800 caret-blue-700 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                required
                placeholder="Write your message here"
                className="w-full px-4 py-3 border border-blue-200 bg-white text-slate-800 caret-blue-700 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-500 text-white py-3 rounded-xl font-semibold hover:bg-sky-600 transition flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* Side Content */}
          <div className="space-y-6">
        
            <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Frequently Asked Questions
              </h3>

              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-blue-100 rounded-2xl p-4"
                  >
                    <h4 className="font-semibold text-slate-800">
                      {faq.question}
                    </h4>
                    <p className="mt-2 text-sm text-gray-600 leading-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold">
                Support for Better Public Facilities
              </h3>
              <p className="mt-3 text-sky-50 leading-7 text-sm">
                Our platform is committed to improving public restroom
                cleanliness, water availability, and sanitation management
                through better communication and service support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
