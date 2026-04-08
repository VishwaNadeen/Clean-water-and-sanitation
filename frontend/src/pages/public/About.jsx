import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          About Our Platform
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Smart Healthcare Platform is designed to make healthcare accessible,
          fast, and efficient through online consultations, appointment booking,
          and intelligent health tools.
        </p>
      </section>

      {/* Mission / Vision */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">Our Mission</h2>
          <p className="mt-4 text-gray-600 leading-7">
            To provide seamless digital healthcare services that connect
            patients and doctors anytime, anywhere with ease and reliability.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-blue-600">Our Vision</h2>
          <p className="mt-4 text-gray-600 leading-7">
            To become a leading smart healthcare platform that improves lives
            through technology-driven medical solutions.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-slate-800 text-center">
          What We Offer
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg text-slate-800">
              Online Appointments
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Easily book and manage doctor appointments without waiting in
              queues.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg text-slate-800">
              Telemedicine
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Consult doctors online with secure video sessions anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-semibold text-lg text-slate-800">
              Smart Health Tools
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              AI-based symptom checking and health insights for better decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-14 text-center">
        <h2 className="text-3xl font-bold">
          Start Your Smart Healthcare Journey Today
        </h2>
        <p className="mt-3 text-blue-100">
          Join our platform and experience modern healthcare.
        </p>

        <div className="mt-6">
          <Link
            to="/register"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}