import React, { useMemo, useState } from "react";
import useMySchedules from "../../hooks/staffManagement/useMySchedules";
import EmptyState from "../../components/staffManagement/staff/EmptyState";
import ScheduleCard from "../../components/staffManagement/staff/ScheduleCard";
import ScheduleFilters from "../../components/staffManagement/staff/ScheduleFilters";

const statusStyles = {
  Assigned: "bg-amber-100 text-amber-700 border border-amber-200",
  InProgress: "bg-sky-100 text-sky-700 border border-sky-200",
  Completed: "bg-violet-100 text-violet-700 border border-violet-200",
  Verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
  Cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
};

const formatGroupLabel = (dateValue) => {
  const date = new Date(dateValue);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const MySchedules = () => {
  const {
    filteredSchedules,
    loading,
    busyAction,
    filter,
    setFilter,
    timeFilter,
    setTimeFilter,
    searchTerm,
    setSearchTerm,
    proofFiles,
    proofMessageById,
    taskMessageById,
    formState,
    loadSchedules,
    handleStart,
    handleRevertStart,
    handleRedoTask,
    handleFileChange,
    handleUploadProof,
    handleRemoveProof,
    handleFormChange,
    handleComplete,
  } = useMySchedules();
  const [selectedScheduleId, setSelectedScheduleId] = useState("");

  const selectedSchedule = useMemo(() => {
    return filteredSchedules.find((schedule) => schedule._id === selectedScheduleId) || null;
  }, [filteredSchedules, selectedScheduleId]);

  const groupedSchedules = useMemo(() => {
    const groups = new Map();

    filteredSchedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const key = Number.isNaN(scheduleDate.getTime())
        ? "unknown"
        : scheduleDate.toISOString().split("T")[0];

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: Number.isNaN(scheduleDate.getTime()) ? "No Date" : formatGroupLabel(schedule.date),
          dateValue: Number.isNaN(scheduleDate.getTime()) ? null : scheduleDate,
          items: [],
        });
      }

      groups.get(key).items.push(schedule);
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (!a.dateValue) return 1;
      if (!b.dateValue) return -1;
      return b.dateValue.getTime() - a.dateValue.getTime();
    });
  }, [filteredSchedules]);

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 pb-6 pt-2 md:px-6 md:pb-8 md:pt-3">
      <div className="mx-auto max-w-7xl">
        <ScheduleFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          onRefresh={loadSchedules}
        />

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
              <p className="mt-4 text-sm font-medium text-slate-600">Loading schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <EmptyState
              title="No schedules found"
              description="Try changing the search, status, or time filter."
              buttonText="Refresh"
              onReload={loadSchedules}
            />
          ) : (
            <div className="space-y-6">
              {groupedSchedules.map((group) => (
                <section
                  key={group.key}
                  className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{group.label}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {group.items.length} schedule{group.items.length > 1 ? "s" : ""} found
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {group.items.map((schedule) => {
                      const isSelected = schedule._id === selectedScheduleId;

                      return (
                        <button
                          key={schedule._id}
                          type="button"
                          onClick={() => setSelectedScheduleId(schedule._id)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-blue-300 bg-blue-50/70 shadow-sm"
                              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-semibold text-slate-800">
                                  {schedule.title || "Untitled"}
                                </h4>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                    statusStyles[schedule.status] ||
                                    "border border-slate-200 bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {schedule.status}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-600">
                                {schedule.taskType || "Task"}
                                {schedule.restroomLabel ? ` - ${schedule.restroomLabel}` : ""}
                              </p>
                            </div>

                            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:min-w-[280px]">
                              <div className="rounded-xl bg-blue-50 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                  Date
                                </p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {schedule.date
                                    ? new Date(schedule.date).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div className="rounded-xl bg-blue-50 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                  Time
                                </p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {schedule.startTime || "--"} - {schedule.endTime || "--"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSchedule ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Schedule Details</h3>
                <p className="text-sm text-slate-500">Full information for the selected schedule.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScheduleId("")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-4 md:p-5">
              <ScheduleCard
                schedule={selectedSchedule}
                formState={formState}
                proofFile={proofFiles[selectedSchedule._id]}
                proofMessage={proofMessageById[selectedSchedule._id]}
                taskMessage={taskMessageById[selectedSchedule._id]}
                busyAction={busyAction}
                embedded
                onStart={handleStart}
                onRevertStart={handleRevertStart}
                onFileChange={handleFileChange}
                onUploadProof={handleUploadProof}
                onRemoveProof={handleRemoveProof}
                onFormChange={handleFormChange}
                onComplete={handleComplete}
                onRedoTask={handleRedoTask}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MySchedules;
