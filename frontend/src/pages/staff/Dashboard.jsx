import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FloatingToast from "../../components/common/FloatingToast";
import useMySchedules from "../../hooks/staffManagement/useMySchedules";
import { getStoredUser } from "../../utils/auth";
import EmptyState from "../../components/staffManagement/staff/EmptyState";
import SchedulePreviewCard from "../../components/staffManagement/staff/SchedulePreviewCard";
import StatCard from "../../components/staffManagement/staff/StatCard";

const DISMISSED_FEEDBACK_KEY = "staffDismissedFeedback";

const StaffDashboard = () => {
  const {
    loading,
    message,
    todaySchedules,
    upcomingSchedules,
    reviewedSchedules,
    weeklyStats,
    loadSchedules,
  } =
    useMySchedules();
  const [dismissedFeedbackIds, setDismissedFeedbackIds] = useState([]);
  const storedUser = getStoredUser();
  const mustChangePassword = Boolean(storedUser?.mustChangePassword);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DISMISSED_FEEDBACK_KEY) || "[]");
      setDismissedFeedbackIds(Array.isArray(stored) ? stored : []);
    } catch {
      setDismissedFeedbackIds([]);
    }
  }, []);

  const visibleReviewedSchedules = useMemo(() => {
    return reviewedSchedules.filter((schedule) => !dismissedFeedbackIds.includes(schedule._id));
  }, [reviewedSchedules, dismissedFeedbackIds]);

  const handleDismissFeedback = (id) => {
    setDismissedFeedbackIds((current) => {
      if (current.includes(id)) {
        return current;
      }

      const next = [...current, id];
      localStorage.setItem(DISMISSED_FEEDBACK_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 pb-6 pt-2 md:px-6 md:pb-8 md:pt-3">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-100">
            Staff Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100 md:text-base">
            View your work summary, today’s schedules, and quick access to assigned tasks.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/staff/my-schedules"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              View My Schedules
            </Link>

            <button
              onClick={loadSchedules}
              className="rounded-xl border border-blue-200 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {mustChangePassword ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Change your temporary password
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  This is your first staff login. Please change the NIC-based temporary password to secure your account.
                </p>
              </div>
              <Link
                to="/staff/profile/password"
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Change Password
              </Link>
            </div>
          </div>
        ) : null}

        {message.text ? <FloatingToast toast={message} /> : null}

        <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">This Week's Work Summary</h2>
              <p className="mt-1 text-sm text-slate-500">
                Task counts for the current week.
              </p>
            </div>
            <p className="text-sm font-medium text-blue-700">{weeklyStats.rangeLabel}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Total Tasks" value={weeklyStats.total} subtitle="Scheduled this week" />
            <StatCard title="Assigned" value={weeklyStats.assigned} subtitle="Ready to start this week" />
            <StatCard title="In Progress" value={weeklyStats.inProgress} subtitle="Currently working this week" />
            <StatCard title="Completed" value={weeklyStats.completed} subtitle="Submitted this week" />
            <StatCard title="Verified" value={weeklyStats.verified} subtitle="Approved this week" />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Manager Feedback</h2>
              <p className="mt-1 text-sm text-slate-500">
                Approval and rejection updates for your submitted work.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
              <p className="mt-4 text-sm text-slate-600">Loading...</p>
            </div>
          ) : visibleReviewedSchedules.length === 0 ? (
            <EmptyState
              title="No manager feedback yet"
              description="Approved or rejected schedules will appear here. Closed feedback stays hidden like notifications."
              buttonText="Refresh"
              onReload={loadSchedules}
            />
          ) : (
            <div className="space-y-4">
              {visibleReviewedSchedules.slice(0, 3).map((schedule) => (
                <SchedulePreviewCard
                  key={schedule._id}
                  schedule={schedule}
                  onDismiss={handleDismissFeedback}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Today’s Schedules</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Work assigned for today.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
                <p className="mt-4 text-sm text-slate-600">Loading...</p>
              </div>
            ) : todaySchedules.length === 0 ? (
              <EmptyState
                title="No schedules for today"
                description="You do not have any assigned schedules for today."
                buttonText="Refresh"
                onReload={loadSchedules}
              />
            ) : (
              <div className="space-y-4">
                {todaySchedules.slice(0, 3).map((schedule) => (
                  <SchedulePreviewCard key={schedule._id} schedule={schedule} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Upcoming Tasks</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your next few schedules.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
                <p className="mt-4 text-sm text-slate-600">Loading...</p>
              </div>
            ) : upcomingSchedules.length === 0 ? (
              <EmptyState
                title="No upcoming tasks"
                description="Your future schedules will appear here."
                buttonText="Refresh"
                onReload={loadSchedules}
              />
            ) : (
              <div className="space-y-4">
                {upcomingSchedules.map((schedule) => (
                  <SchedulePreviewCard key={schedule._id} schedule={schedule} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
