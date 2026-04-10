import React from "react";

const statusStyles = {
  Assigned: "bg-amber-100 text-amber-700 border border-amber-200",
  InProgress: "bg-sky-100 text-sky-700 border border-sky-200",
  Completed: "bg-violet-100 text-violet-700 border border-violet-200",
  Verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
  Cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
};

const SchedulePreviewCard = ({ schedule, onDismiss, dismissLabel = "Close notification" }) => {
  const reviewTone =
    schedule.status === "Verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{schedule.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {schedule.taskType}
            {schedule.restroomLabel ? ` - ${schedule.restroomLabel}` : ""}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              statusStyles[schedule.status] || "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {schedule.status}
          </span>

          {onDismiss ? (
            <button
              type="button"
              onClick={() => onDismiss(schedule._id)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label={dismissLabel}
              title={dismissLabel}
            >
              x
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase text-blue-600">Date</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {new Date(schedule.date).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase text-blue-600">Time</p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {schedule.startTime} - {schedule.endTime}
          </p>
        </div>
      </div>

      {["Verified", "Rejected"].includes(schedule.status) ? (
        <div className={`mt-4 rounded-xl border px-3 py-3 ${reviewTone}`}>
          <p className="text-xs font-semibold uppercase tracking-wide">
            Manager Feedback
          </p>
          <p className="mt-1 text-sm font-medium">
            {schedule.managerReviewNote ||
              (schedule.status === "Verified" ? "Approved by manager." : "Rejected by manager.")}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default SchedulePreviewCard;
