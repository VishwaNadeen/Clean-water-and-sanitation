import { useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";

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
  const location = useLocation();

  const {
    profile,
    loading,
    pageError,
    storedUser,
    token,
  } = useProfileData();

  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

  const profileImageSrc = profile?.profileImageUrl || "";
  const profileImageInitial = String(
    profile?.firstName || storedUser?.fullName || storedUser?.email || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="h-32 animate-pulse bg-slate-100" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4">
                <div className="h-20 w-20 rounded-[24px] bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-[340px_1fr]">
                <div className="h-72 rounded-[24px] bg-slate-100" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-32 rounded-[24px] bg-slate-100" />
                  <div className="h-32 rounded-[24px] bg-slate-100" />
                  <div className="h-32 rounded-[24px] bg-slate-100" />
                  <div className="h-32 rounded-[24px] bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="My Profile"
      subtitle="Manage your account information and personal details."
      token={token}
      profile={profile}
      storedUser={storedUser}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {pageError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : null}

        {/* HERO */}
        <section
          className="relative overflow-hidden rounded-[30px] border border-sky-100 shadow-[0_20px_55px_rgba(56,189,248,0.12)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(143,208,251,0.88) 0%, rgba(83,179,245,0.94) 45%, rgba(67,160,232,0.98) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-14 top-0 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.22), transparent 72%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18), transparent 72%)",
            }}
          />

          <div className="relative flex min-h-[140px] items-center justify-start px-5 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-row items-center justify-start gap-5">
                {profileImageSrc ? (
                  <img
                    src={profileImageSrc}
                    alt="Profile"
                    className="h-28 w-28 rounded-[28px] border-4 border-white object-cover bg-white shadow-[0_18px_38px_rgba(59,130,246,0.18)]"
                  />
                ) : (
                  <div className="grid h-28 w-28 place-items-center rounded-[28px] border-4 border-white bg-white text-4xl font-bold text-sky-700 shadow-[0_18px_38px_rgba(59,130,246,0.18)]">
                    {profileImageInitial}
                  </div>
                )}

                <div>
                  <h2 className="whitespace-nowrap text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {fullName}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Profile since {profileCreatedAt}
                  </p>
                </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="space-y-6">
          <div className="space-y-6">
            {/* DETAILS PANEL */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Profile Information
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review your personal information and keep it up to date.
                  </p>
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

              <div className="mt-6 space-y-6">
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
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Password & Security</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Update your password to keep your account secure.
              </p>

              <button
                type="button"
                onClick={() => navigate(`${profileBasePath}/password`)}
                className="mt-4 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Change Password
              </button>
            </div>

            <div className="rounded-[28px] border border-red-100 bg-gradient-to-br from-white to-red-50 p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Danger Zone</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Permanently remove your account and associated profile data.
              </p>

              <button
                type="button"
                onClick={() => navigate(`${profileBasePath}/delete`)}
                className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
}

function InfoCard({ label, value, className = "", breakWord = false }) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </p>
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
