import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMP: just console log (you can connect backend later)
    console.log("Contact Form:", form);

    alert("Message sent successfully!");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center text-slate-800">
          Contact Us
        </h1>
        <p className="mt-4 text-center text-gray-600">
          Have questions? We'd love to hear from you.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-lg text-slate-800">
                Email
              </h3>
              <p className="mt-2 text-gray-600">
                support@smarthealth.com
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-lg text-slate-800">
                Phone
              </h3>
              <p className="mt-2 text-gray-600">+94 77 123 4567</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-lg text-slate-800">
                Address
              </h3>
              <p className="mt-2 text-gray-600">
                Colombo, Sri Lanka
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-sm space-y-5"
          >
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Message</label>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}