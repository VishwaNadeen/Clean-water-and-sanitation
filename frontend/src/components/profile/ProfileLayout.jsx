import DashboardLayout from "../staffManagement/DashboardLayout";

export default function ProfileLayout({
  title,
  subtitle,
  children,
  profile,
  storedUser,
}) {
  const resolvedTitle =
    title ||
    `${profile?.firstName || storedUser?.fullName || "User"} ${
      profile?.lastName || ""
    }`.trim();

  const resolvedSubtitle =
    subtitle || "Manage your account, password, and profile details.";

  return (
    <DashboardLayout title={resolvedTitle} subtitle={resolvedSubtitle}>
      <section className="rounded-[28px] border border-sky-200 bg-white p-5 lg:p-7">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">{resolvedTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{resolvedSubtitle}</p>
        </div>

        {children}
      </section>
    </DashboardLayout>
  );
}
