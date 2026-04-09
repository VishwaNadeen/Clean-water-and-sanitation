import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/staffManagement/DashboardLayout";
import { getMySchedules } from "../../services/staffManagementService";

const statusToneMap = {
  Assigned: "bg-sky-100 text-sky-700",
  InProgress: "bg-amber-100 text-amber-700",
  Completed: "bg-indigo-100 text-indigo-700",
  Verified: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Cancelled: "bg-slate-100 text-slate-700",
};

const statCardConfig = [
  { key: "assigned", label: "Assigned", tone: "from-sky-500 to-cyan-400" },
  {
    key: "inProgress",
    label: "In Progress",
    tone: "from-amber-500 to-orange-400",
  },
  {
    key: "completed",
    label: "Completed",
    tone: "from-indigo-500 to-blue-500",
  },
  {
    key: "verified",
    label: "Verified",
    tone: "from-emerald-500 to-green-400",
  },
  { key: "rejected", label: "Rejected", tone: "from-rose-500 to-red-400" },
];

export default function Dashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    loadMySchedules();
  }, []);

  const loadMySchedules = async () => {
    try {
      const data = await getMySchedules();
      setSchedules(data || []);
    } catch (error) {
      console.error("Failed to load staff dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const todayDateString = new Date().toDateString();

  const stats = useMemo(
    () => ({
      assigned: schedules.filter((s) => s.status === "Assigned").length,
      inProgress: schedules.filter((s) => s.status === "InProgress").length,
      completed: schedules.filter((s) => s.status === "Completed").length,
      verified: schedules.filter((s) => s.status === "Verified").length,
      rejected: schedules.filter((s) => s.status === "Rejected").length,
    }),
    [schedules]
  );

  const todaySchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) => new Date(schedule.date).toDateString() === todayDateString
      ),
    [schedules, todayDateString]
  );

  const profile = useMemo(() => {
    if (schedules.length > 0 && schedules[0].staffId) {
      return schedules[0].staffId;
    }
    return currentUser;
  }, [schedules, currentUser]);

  if (loading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="View your profile, today work, and schedule summary."
      >
        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 px-6 py-8 text-sm font-medium text-slate-600">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="View your profile, today work, and schedule summary."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(135deg,_rgba(14,165,233,0.08),_rgba(255,255,255,0.96)_45%,_rgba(186,230,253,0.35))] p-6 shadow-[0_18px_40px_rgba(56,189,248,0.08)]">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
                Staff Dashboard
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back, {profile?.fullName || profile?.name || "Staff"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Track your assignments, review today&apos;s work, and keep an eye
                on completed tasks from one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <InfoPill label="Role" value={profile?.role || "Staff"} />
                <InfoPill label="Email" value={profile?.email || "Not added"} />
                <InfoPill label="Phone" value={profile?.phone || "Not added"} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MiniPanel
                label="Today"
                value={todaySchedules.length}
                note="Tasks scheduled for today"
              />
              <MiniPanel
                label="Recent Activity"
                value={schedules.length}
                note="Total schedules visible in your account"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statCardConfig.map((item) => (
            <article
              key={item.key}
              className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <div
                className={`inline-flex rounded-full bg-gradient-to-r ${item.tone} px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white`}
              >
                {item.label}
              </div>
              <p className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                {stats[item.key]}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Current schedules in this status
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Today Work
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  Your active schedule
                </h3>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {todaySchedules.length} item{todaySchedules.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {todaySchedules.length === 0 ? (
                <EmptyState message="No work assigned for today." />
              ) : (
                todaySchedules.map((item) => (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.taskType || "General task"} in{" "}
                          {item.restroomLabel || "Unassigned restroom"}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <DataTile label="Time" value={`${item.startTime} - ${item.endTime}`} />
                      <DataTile
                        label="Date"
                        value={new Date(item.date).toLocaleDateString()}
                      />
                      <DataTile
                        label="Task Type"
                        value={item.taskType || "Not specified"}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Recent Schedules
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Latest assigned work
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              Showing the latest {Math.min(schedules.length, 5)} schedule entries
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Title</th>
                    <th className="px-5 py-4 font-semibold">Task Type</th>
                    <th className="px-5 py-4 font-semibold">Restroom</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Time</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                        No schedules found.
                      </td>
                    </tr>
                  ) : (
                    schedules.slice(0, 5).map((item) => (
                      <tr key={item._id} className="hover:bg-sky-50/50">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {item.title}
                        </td>
                        <td className="px-5 py-4">{item.taskType}</td>
                        <td className="px-5 py-4">
                          {item.restroomLabel || "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          {item.startTime} - {item.endTime}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusToneMap[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-sm text-slate-700">
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </div>
  );
}

function MiniPanel({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-[0_10px_24px_rgba(56,189,248,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function DataTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-5 py-10 text-center text-sm font-medium text-slate-500">
      {message}
    </div>
  );
}
