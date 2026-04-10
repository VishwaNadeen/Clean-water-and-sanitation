import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ProfileLayout from "../../components/profile/ProfileLayout";
import useProfileData from "../../hooks/useProfileData";

function getProfileImageInitial(profile, storedUser) {
  return String(
    profile?.firstName || storedUser?.fullName || storedUser?.email || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase();
}

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

const menuItems = [
  {
    key: "profile",
    label: "Profile Information",
    description: "Personal details and account profile",
    path: "",
    icon: (
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
    ),
  },
  {
    key: "security",
    label: "Password & Security",
    description: "Manage password protection",
    path: "/password",
    icon: (
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
          d="M16.5 10.5V7.875a4.5 4.5 0 1 0-9 0V10.5m-.75 0h10.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H6.75a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5Z"
        />
      </svg>
    ),
  },
  {
    key: "danger",
    label: "Danger Zone",
    description: "Delete account and profile data",
    path: "/delete",
    icon: (
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
          d="M6 7.5h12m-10.5 0v10.125A1.875 1.875 0 0 0 9.375 19.5h5.25a1.875 1.875 0 0 0 1.875-1.875V7.5M9.75 7.5V5.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V7.5"
        />
      </svg>
    ),
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    profile,
    loading,
    pageError,
    setPageError,
    storedUser,
    token,
  } = useProfileData();

  const profileImageSrc = profile?.profileImageUrl || "";
  const profileImageInitial = getProfileImageInitial(profile, storedUser);
  const fullName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    storedUser?.fullName ||
    "User";

  const resolvedHeroTitle = fullName;
  const resolvedHeroSubtitle = `Profile since ${formatProfileDate(
    profile?.createdAt
  )}`;

  const profileBasePath = location.pathname.startsWith("/staff/profile")
    ? "/staff/profile"
    : "/profile";

  const activeKey = location.pathname.endsWith("/password")
    ? "security"
    : location.pathname.endsWith("/delete")
    ? "danger"
    : "profile";

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
              <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
                <div className="h-72 rounded-[24px] bg-slate-100" />
                <div className="h-80 rounded-[24px] bg-slate-100" />
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
      <div className="mx-auto max-w-7xl space-y-6">
        {pageError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
            {pageError}
          </div>
        ) : null}

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
                  {resolvedHeroTitle}
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {resolvedHeroSubtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r lg:border-slate-200">
              <div className="px-5 py-5 sm:px-6">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  Account Settings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick access to your profile sections.
                </p>
              </div>

              <nav className="px-3 pb-3">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = activeKey === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setPageError("");
                          navigate(`${profileBasePath}${item.path}`);
                        }}
                        className={`group relative flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ease-out ${
                          isActive
                            ? "translate-x-1 border border-sky-100 bg-sky-50 shadow-sm"
                            : "border border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 hover:translate-x-0.5"
                        }`}
                      >
                        <span
                          className={`absolute inset-y-3 left-1 rounded-full bg-sky-500 transition-all duration-300 ease-out ${
                            isActive ? "w-1 opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ease-out ${
                            isActive
                              ? "scale-105 bg-sky-100 text-sky-700"
                              : item.key === "danger"
                              ? "bg-red-50 text-red-500 group-hover:scale-105"
                              : "bg-slate-100 text-slate-600 group-hover:scale-105"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold transition-colors duration-300 ${
                              isActive
                                ? "text-sky-700"
                                : item.key === "danger"
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </aside>

            <div className="min-h-[620px] p-5 sm:p-6 lg:min-h-[720px]">
              <Outlet
                context={{
                  profile,
                  storedUser,
                  token,
                  pageError,
                  setPageError,
                  profileBasePath,
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </ProfileLayout>
  );
}