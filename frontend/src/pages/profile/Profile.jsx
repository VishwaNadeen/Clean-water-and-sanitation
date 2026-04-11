import { useNavigate, useOutletContext } from "react-router-dom";

function formatProfileDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function Profile() {
  const navigate = useNavigate();

  const { profile, storedUser, profileBasePath } = useOutletContext();

  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    storedUser?.fullName ||
    "User";

  const email = profile?.email || storedUser?.email || "-";
  const firstName = profile?.firstName || "-";
  const lastName = profile?.lastName || "-";
  const phone = profile?.phone || "-";
  const gender = profile?.gender || "-";
  const address = profile?.address || "-";
  const city = profile?.city || "-";
  const country = profile?.country || "-";
  const provinceState = profile?.provinceState || "-";
  const district = profile?.district || "-";
  const dateOfBirth = formatProfileDate(profile?.dob);
  const profileCreatedAt = formatProfileDate(profile?.createdAt);

  return (
    <section className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.125a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Profile Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Review your personal information and keep it up to date.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`${profileBasePath}/edit`)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.75 18.54 4.5 19.5l.96-4.25L16.862 4.487Z"
            />
          </svg>
          Edit Information
        </button>
      </div>

      <div className="mt-6 flex-1 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="First Name" value={firstName} />
          <InfoCard label="Last Name" value={lastName} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Email Address" value={email} breakWord />
          <InfoCard label="Phone Number" value={phone} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Gender" value={gender} />
          <InfoCard label="Date of Birth" value={dateOfBirth} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Address" value={address} className="md:col-span-2" />
          <InfoCard label="City" value={city} />
          <InfoCard label="District" value={district} />
          <InfoCard label="Province / State" value={provinceState} />
          <InfoCard label="Country" value={country} />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value, className = "", breakWord = false }) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
        <p
          className={`text-sm font-semibold text-slate-900 ${
            breakWord ? "break-all" : ""
          }`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}