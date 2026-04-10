import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">

        <h1 className="mt-5 text-4xl md:text-5xl font-bold text-slate-800">
          Improving Public Restroom Cleanliness and Sanitation
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
          Our platform is designed to support clean water access, sanitation
          services, and public restroom management through smart digital
          solutions. We help users report issues, access facility information,
          and support better hygiene standards in public spaces.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="max-w-7xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-600">Our Mission</h2>
          <p className="mt-4 text-gray-600 leading-7">
            To improve public sanitation and restroom management by providing a
            reliable platform for issue reporting, facility monitoring, and
            service coordination that supports cleaner and safer public spaces.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-600">Our Vision</h2>
          <p className="mt-4 text-gray-600 leading-7">
            To build a smarter future where public restrooms are clean,
            accessible, safe, and properly maintained through effective use of
            technology and sanitation management.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-slate-800 text-center">
          What We Offer
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition">
            <h3 className="font-semibold text-lg text-slate-800">
              Public Restroom Information
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-6">
              Users can view important details about available public restroom
              facilities and access useful information quickly and easily.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition">
            <h3 className="font-semibold text-lg text-slate-800">
              Issue Reporting
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-6">
              Our system allows users to report sanitation issues such as water
              leakage, blocked toilets, lack of water, bad odor, or damaged
              facilities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition">
            <h3 className="font-semibold text-lg text-slate-800">
              Maintenance Support
            </h3>
            <p className="mt-2 text-sm text-gray-600 leading-6">
              The platform helps staff and managers coordinate cleaning,
              maintenance, and inspection activities to improve service quality.
            </p>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center">
            Why This Platform Matters
          </h2>

          <p className="mt-6 text-gray-600 text-center max-w-4xl mx-auto leading-8">
            Clean and well-maintained public restrooms are essential for public
            health, dignity, and comfort. By improving communication between
            users, staff members, and management, our system helps create better
            sanitation services and a healthier environment for everyone.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Better Hygiene
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Supports cleaner public facilities and promotes healthier public
                spaces.
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Faster Response
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Helps issues reach responsible staff quickly for faster action
                and maintenance.
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Better Management
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Makes it easier to track problems, assign work, and improve
                sanitation service quality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}