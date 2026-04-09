import React, { useMemo } from "react";
import useMySchedules from "../../hooks/staffManagement/useMySchedules";
import SummaryStatCard from "../../components/staffManagement/staff/SummaryStatCard";
import EmptyState from "../../components/staffManagement/staff/EmptyState";

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const value = String(timeStr).trim().toUpperCase();

  // Supports formats like:
  // 08:00
  // 8:00 AM
  // 08:30 PM
  const amPmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3];

    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  const normalMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (normalMatch) {
    const hours = parseInt(normalMatch[1], 10);
    const minutes = parseInt(normalMatch[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
};

const getDurationHours = (startTime, endTime) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (!start && !end) return 0;
  if (end <= start) return 0;

  return (end - start) / 60;
};

const getStartOfWeek = (date) => {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getEndOfWeek = (date) => {
  const value = getStartOfWeek(date);
  value.setDate(value.getDate() + 6);
  value.setHours(23, 59, 59, 999);
  return value;
};

const formatWeekDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const WorkSummary = () => {
  const { schedules, loading, message, loadSchedules } = useMySchedules();

  const summary = useMemo(() => {
    const completedSchedules = schedules.filter(
      (item) => item.status === "Completed" || item.status === "Verified"
    );

    const assignedSchedules = schedules.filter((item) => item.status === "Assigned");
    const verifiedSchedules = schedules.filter((item) => item.status === "Verified");
    const rejectedSchedules = schedules.filter((item) => item.status === "Rejected");
    const inProgressSchedules = schedules.filter((item) => item.status === "InProgress");

    const totalHours = completedSchedules.reduce((total, item) => {
      return total + getDurationHours(item.startTime, item.endTime);
    }, 0);

    const completionRate =
      schedules.length > 0
        ? Math.round((completedSchedules.length / schedules.length) * 100)
        : 0;

    const today = new Date();
    const currentWeekStart = getStartOfWeek(today);
    const currentWeekEnd = getEndOfWeek(today);

    const weeklyCompleted = completedSchedules.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= currentWeekStart && itemDate <= currentWeekEnd;
    });

    const weeklyHours = weeklyCompleted.reduce((total, item) => {
      return total + getDurationHours(item.startTime, item.endTime);
    }, 0);

    return {
      totalSchedules: schedules.length,
      completedCount: completedSchedules.length,
      assignedCount: assignedSchedules.length,
      verifiedCount: verifiedSchedules.length,
      rejectedCount: rejectedSchedules.length,
      inProgressCount: inProgressSchedules.length,
      totalHours: totalHours.toFixed(1),
      weeklyHours: weeklyHours.toFixed(1),
      completionRate,
      weekRangeLabel: `${formatWeekDate(currentWeekStart)} - ${formatWeekDate(currentWeekEnd)}`,
    };
  }, [schedules]);

  const summaryText = useMemo(() => {
    return `You have completed ${summary.completedCount} schedules with ${summary.totalHours} total working hours. Right now, ${summary.assignedCount} task(s) are assigned, ${summary.inProgressCount} task(s) are in progress, and your overall completion rate is ${summary.completionRate}%.`;
  }, [summary]);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 pb-6 pt-2 md:px-6 md:pb-8 md:pt-3">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-100">
            Staff Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Work Summary</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 md:text-base">
            View your performance, completed schedules, pending tasks, and total work hours in one place.
          </p>
        </div>

        {message.text && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Performance Overview</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{summaryText}</p>
            </div>

            <button
              onClick={loadSchedules}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Refresh Summary
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
            <p className="mt-4 text-sm font-medium text-slate-600">Loading summary...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No work summary available"
              description="Your assigned schedules are needed to generate the work summary."
              buttonText="Refresh"
              onReload={loadSchedules}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryStatCard
                title="Total Working Hours"
                value={`${summary.totalHours}h`}
                subtitle="Completed and verified schedules"
              />
              <SummaryStatCard
                title="Completed Tasks"
                value={summary.completedCount}
                subtitle="Completed + verified schedules"
              />
              <SummaryStatCard
                title="Assigned Tasks"
                value={summary.assignedCount}
                subtitle="Waiting to be started"
              />
              <SummaryStatCard
                title="Completion Rate"
                value={`${summary.completionRate}%`}
                subtitle="Based on all schedules"
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800">This Week</h3>
                <p className="mt-2 text-sm text-slate-500">
                  A quick look at your current week performance.
                </p>
                <p className="mt-1 text-sm font-medium text-blue-700">
                  {summary.weekRangeLabel}
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <span className="text-sm font-medium text-slate-700">Hours worked this week</span>
                    <span className="text-lg font-bold text-blue-700">{summary.weeklyHours}h</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <span className="text-sm font-medium text-slate-700">Assigned tasks</span>
                    <span className="text-lg font-bold text-blue-700">{summary.assignedCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <span className="text-sm font-medium text-slate-700">Tasks in progress</span>
                    <span className="text-lg font-bold text-blue-700">{summary.inProgressCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <span className="text-sm font-medium text-slate-700">Verified tasks</span>
                    <span className="text-lg font-bold text-blue-700">{summary.verifiedCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
                    <span className="text-sm font-medium text-slate-700">Rejected tasks</span>
                    <span className="text-lg font-bold text-blue-700">{summary.rejectedCount}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800">Work Insights</h3>
                <p className="mt-2 text-sm text-slate-500">
                  A simple explanation of your current work situation.
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">
                    {summary.completedCount > 0
                      ? `Great job. You have already finished ${summary.completedCount} schedules and recorded ${summary.totalHours} working hours. Keep focusing on the remaining ${summary.assignedCount} assigned task(s) and ${summary.inProgressCount} active task(s) to improve your completion rate.`
                      : `You have not completed any schedules yet. Start your assigned tasks, upload proof, and complete them to build your work summary.`}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Strong Point
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {summary.verifiedCount > 0
                        ? `${summary.verifiedCount} task(s) verified by manager.`
                        : "No verified tasks yet."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Need Attention
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {summary.assignedCount > 0 || summary.inProgressCount > 0
                        ? `${summary.assignedCount} assigned and ${summary.inProgressCount} in-progress task(s) still need action.`
                        : "No active tasks right now."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkSummary;
