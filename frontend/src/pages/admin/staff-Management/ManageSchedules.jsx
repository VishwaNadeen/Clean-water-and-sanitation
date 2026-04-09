import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import API_BASE_URL from "../../../config/api";
import {
  approveSchedule,
  assignSchedule,
  cancelSchedule,
  editSchedule,
  getAllSchedules,
  getManagerStaff,
  getRestrooms,
  rejectSchedule,
} from "../../../services/staffManagementService";

const emptyForm = {
  staffRole: "",
  staffId: "",
  taskType: "Cleaning",
  restroomId: "",
  restroomLabel: "",
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  managerNote: "",
  issueId: "",
};

const statusStyle = {
  Assigned: "bg-yellow-100 text-yellow-700",
  InProgress: "bg-blue-100 text-blue-700",
  Completed: "bg-purple-100 text-purple-700",
  Verified: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

const timeTabs = ["Today", "This Week", "This Month", "All"];
const taskTypeOptions = ["All", "Cleaning", "Maintenance", "Inspection"];
const TOAST_DURATION_MS = 5000;

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

const formatGroupLabel = (dateValue) => {
  const date = new Date(dateValue);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
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

const getProofImageSrc = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (/^(https?:|data:)/i.test(imagePath)) {
    return imagePath;
  }

  const normalizedBase = String(API_BASE_URL || "").replace(/\/api\/?$/, "");
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${normalizedBase}${normalizedPath}`;
};

export default function ManageSchedules() {
  const [searchParams] = useSearchParams();
  const [schedules, setSchedules] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [restrooms, setRestrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [staffFilter, setStaffFilter] = useState("All");
  const [restroomFilter, setRestroomFilter] = useState("All");
  const [taskTypeFilter, setTaskTypeFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const pageMode = searchParams.get("mode") === "reviews" ? "reviews" : "assign";
  const isReviewMode = pageMode === "reviews";

  const roleOptions = useMemo(() => {
    return [...new Set(staffMembers.map((staff) => staff.role).filter(Boolean))];
  }, [staffMembers]);

  const filteredStaffMembers = useMemo(() => {
    if (!form.staffRole) {
      return [];
    }

    return staffMembers.filter((staff) => staff.role === form.staffRole);
  }, [form.staffRole, staffMembers]);

  const restroomOptions = useMemo(() => {
    return restrooms.map((restroom) => ({
      id: restroom._id,
      label: [restroom.name, restroom.city].filter(Boolean).join(" - ") || restroom._id,
    }));
  }, [restrooms]);

  const staffFilterOptions = useMemo(() => {
    return [
      { id: "All", label: "All Staff Members" },
      ...staffMembers.map((staff) => ({
        id: staff._id,
        label: staff.fullName || staff.name || "Unnamed",
      })),
    ];
  }, [staffMembers]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const [scheduleData, staffData, restroomData] = await Promise.all([
        getAllSchedules(),
        getManagerStaff(),
        getRestrooms(),
      ]);

      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      setStaffMembers(Array.isArray(staffData) ? staffData : []);
      setRestrooms(Array.isArray(restroomData) ? restroomData : []);
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Failed to load schedules",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (isReviewMode) {
      setStatusFilter("Completed");
      setTimeFilter("All");
    }
  }, [isReviewMode]);

  const filteredSchedules = useMemo(() => {
    let data = schedules.filter((item) => item.status !== "Cancelled");
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = getEndOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    if (timeFilter !== "All") {
      data = data.filter((item) => {
        const scheduleDate = new Date(item.date);
        if (Number.isNaN(scheduleDate.getTime())) {
          return false;
        }

        if (timeFilter === "Today") {
          return scheduleDate.toDateString() === now.toDateString();
        }
        if (timeFilter === "This Week") {
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        }
        if (timeFilter === "This Month") {
          return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
        }
        return true;
      });
    }

    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (staffFilter !== "All") {
      data = data.filter((item) => {
        const assignedId =
          typeof item.staffId === "object" ? item.staffId?._id : item.staffId;
        return assignedId === staffFilter;
      });
    }

    if (restroomFilter !== "All") {
      data = data.filter((item) => String(item.restroomId || "") === restroomFilter);
    }

    if (taskTypeFilter !== "All") {
      data = data.filter((item) => item.taskType === taskTypeFilter);
    }

    return data.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.updatedAt || a.date || 0).getTime();
      const bTime = new Date(b.createdAt || b.updatedAt || b.date || 0).getTime();
      return bTime - aTime;
    });
  }, [schedules, timeFilter, statusFilter, staffFilter, restroomFilter, taskTypeFilter]);

  const groupedSchedules = useMemo(() => {
    const groups = new Map();

    filteredSchedules.forEach((item) => {
      const scheduleDate = new Date(item.date);
      const key = Number.isNaN(scheduleDate.getTime())
        ? "unknown"
        : scheduleDate.toISOString().split("T")[0];

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: Number.isNaN(scheduleDate.getTime()) ? "No Date" : formatGroupLabel(item.date),
          dateValue: Number.isNaN(scheduleDate.getTime()) ? null : scheduleDate,
          items: [],
        });
      }

      groups.get(key).items.push(item);
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (!a.dateValue) return 1;
      if (!b.dateValue) return -1;
      return b.dateValue.getTime() - a.dateValue.getTime();
    });
  }, [filteredSchedules]);

  const workloadStats = useMemo(() => {
    const activeSchedules = schedules.filter((item) => item.status !== "Cancelled");
    return [
      {
        label: "Assigned Schedule",
        value: activeSchedules.filter((item) => item.status === "Assigned").length,
        tone: "bg-amber-50 text-amber-700 border-amber-200",
      },
      {
        label: "Pending Reviews",
        value: activeSchedules.filter((item) => item.status === "Completed").length,
        tone: "bg-violet-50 text-violet-700 border-violet-200",
      },
      {
        label: "In Progress",
        value: activeSchedules.filter((item) => item.status === "InProgress").length,
        tone: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        label: "Verified",
        value: activeSchedules.filter((item) => item.status === "Verified").length,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
    ];
  }, [schedules]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleCancelEdit = () => {
    resetForm();
    setToast({ type: "success", text: "Edit cancelled" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await editSchedule(editingId, form);
        setToast({ type: "success", text: "Schedule updated successfully" });
      } else {
        await assignSchedule(form);
        setToast({ type: "success", text: "Schedule assigned successfully" });
      }

      resetForm();
      await loadSchedules();
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      staffRole: item.staffId?.role || "",
      staffId: item.staffId?._id || item.staffId || "",
      taskType: item.taskType || "Cleaning",
      restroomId: item.restroomId || "",
      restroomLabel: item.restroomLabel || "",
      title: item.title || "",
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      managerNote: item.managerNote || "",
      issueId: item.issueId || "",
    });
  };

  const handleCancel = async (id) => {
    try {
      await cancelSchedule(id);
      setToast({ type: "success", text: "Schedule cancelled successfully" });
      await loadSchedules();
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Cancel failed",
      });
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveSchedule(id, "Approved by admin");
      setToast({ type: "success", text: "Schedule approved successfully" });
      await loadSchedules();
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Approve failed",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectSchedule(id, "Rejected by admin");
      setToast({ type: "success", text: "Schedule rejected successfully" });
      await loadSchedules();
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Reject failed",
      });
    }
  };

  const handleRestroomChange = (restroomId) => {
    const selectedRestroom = restrooms.find((restroom) => restroom._id === restroomId);

    setForm((currentForm) => ({
      ...currentForm,
      restroomId,
      restroomLabel: selectedRestroom
        ? [selectedRestroom.name, selectedRestroom.city].filter(Boolean).join(" - ")
        : "",
    }));
  };

  return (
    <div className="space-y-6">
      {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}

      <div>
        <Link
          to="/admin/staff"
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <span aria-hidden="true">←</span>
          Back to Staff Management
        </Link>
      </div>

      {!isReviewMode ? (
        <section
          id="workload-overview-section"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {workloadStats.map((item) => (
            <article
              key={item.label}
              className={`rounded-[24px] border bg-white p-5 shadow-sm ${item.tone}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">{item.label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
            </article>
          ))}
        </section>
      ) : null}

      <div className={`grid grid-cols-1 gap-6 ${isReviewMode ? "" : "xl:grid-cols-3"}`}>
        {!isReviewMode ? (
          <div
            id="assign-schedule-section"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1"
          >
            <h3 className="text-2xl font-bold text-slate-800">
              {editingId ? "Edit Schedule" : "Assign New Schedule"}
            </h3>

            {editingId ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                You are editing an existing schedule. Click `Cancel` to leave edit mode.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <select
                value={form.staffRole}
                onChange={(e) =>
                  setForm({ ...form, staffRole: e.target.value, staffId: "" })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              >
                <option value="">Select staff role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={form.staffId}
                onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                required
                disabled={!form.staffRole}
              >
                <option value="">
                  {form.staffRole ? "Select staff member" : "Select role first"}
                </option>
                {filteredStaffMembers.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName || staff.name || "Unnamed"} - {staff.role || "Staff"}
                  </option>
                ))}
              </select>

              <select
                value={form.restroomId}
                onChange={(e) => handleRestroomChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              >
                <option value="">Select restroom </option>
                {restroomOptions.map((restroom) => (
                  <option key={restroom.id} value={restroom.id}>
                    {restroom.label}
                  </option>
                ))}
              </select>

              <select
                value={form.taskType}
                onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              >
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
              </select>

              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
              </div>

              <textarea
                placeholder="Manager Note"
                value={form.managerNote}
                onChange={(e) => setForm({ ...form, managerNote: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
                rows="4"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                >
                  {editingId ? "Update Schedule" : "Assign Schedule"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}

        <div
          id="all-schedules-section"
          className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${
            isReviewMode ? "" : "xl:col-span-2"
          }`}
        >
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">
                {isReviewMode ? "Pending Reviews" : "All Schedules"}
              </h3>
              {isReviewMode ? (
                <p className="mt-1 text-sm text-slate-500">
                  Only completed schedules are shown here for approve or reject actions.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Time Range
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {timeTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setTimeFilter(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      timeFilter === tab
                        ? "bg-blue-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Filters
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm"
                  disabled={isReviewMode}
                >
                  <option value="All">All Status</option>
                  <option value="Assigned">Assigned</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm"
                >
                  {staffFilterOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.label}
                    </option>
                  ))}
                </select>

                <select
                  value={restroomFilter}
                  onChange={(e) => setRestroomFilter(e.target.value)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm"
                >
                  <option value="All">All Restrooms</option>
                  {restroomOptions.map((restroom) => (
                    <option key={restroom.id} value={restroom.id}>
                      {restroom.label}
                    </option>
                  ))}
                </select>

                <select
                  value={taskTypeFilter}
                  onChange={(e) => setTaskTypeFilter(e.target.value)}
                  className="rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm"
                >
                  {taskTypeOptions.map((taskType) => (
                    <option key={taskType} value={taskType}>
                      {taskType === "All" ? "All Task Types" : taskType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-blue-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Filtered Schedule List
                </p>
                <span className="text-sm font-semibold text-blue-700">
                  {filteredSchedules.length} result{filteredSchedules.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 max-h-[780px] space-y-6 overflow-y-auto pr-2">
            {loading ? (
              <p className="text-slate-500">Loading schedules...</p>
            ) : filteredSchedules.length === 0 ? (
              <p className="text-slate-500">No schedules found.</p>
            ) : (
              groupedSchedules.map((group) => (
                <section key={group.key} className="space-y-4">
                  <div className="sticky top-0 z-10 rounded-3xl border border-blue-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 px-5 py-4 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">{group.label}</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Scheduled work for this date
                        </p>
                      </div>
                      <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-semibold text-blue-700">
                        {group.items.length} item{group.items.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {group.items.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-2xl font-bold text-slate-900">{item.title}</h4>
                              <span
                                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                                  statusStyle[item.status] || "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                                {item.taskType || "Task"}
                              </span>
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {item.restroomLabel || "No restroom"}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Date
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {new Date(item.date).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Time
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {item.startTime || "--"} - {item.endTime || "--"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Staff
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {item.staffId?.fullName || item.staffName || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {Array.isArray(item.proofImages) && item.proofImages.length > 0 ? (
                          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-4">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <h5 className="text-sm font-semibold text-slate-800">
                                  Uploaded Proof Photos
                                </h5>
                                <p className="text-xs text-slate-500">
                                  Review these photos before approving or rejecting this work.
                                </p>
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                {item.proofImages.length} image{item.proofImages.length > 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              {item.proofImages.map((image, index) => (
                                <button
                                  type="button"
                                  key={`${item._id}-proof-${index}`}
                                  className="group block"
                                  title="Preview proof image"
                                  onClick={() => setPreviewImage(getProofImageSrc(image.url))}
                                >
                                  <img
                                    src={getProofImageSrc(image.url)}
                                    alt={`Proof ${index + 1} for ${item.title}`}
                                    className="h-28 w-28 rounded-2xl border border-blue-200 object-cover shadow-sm transition group-hover:scale-[1.02]"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : item.status === "Completed" ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            No proof photos found for this completed task.
                          </div>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                          {!["Completed", "Verified", "Cancelled"].includes(item.status) ? (
                            <button
                              onClick={() => handleEdit(item)}
                              className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                          ) : null}

                          {!["Completed", "Verified", "Cancelled"].includes(item.status) ? (
                            <button
                              onClick={() => handleCancel(item._id)}
                              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          ) : null}

                          {item.status === "Completed" ? (
                            <>
                              <button
                                onClick={() => handleApprove(item._id)}
                                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleReject(item._id)}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ))
            )}
          </div>
        </div>
      </div>

      {previewImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setPreviewImage("")}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage("")}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
            >
              Close
            </button>
            <img
              src={previewImage}
              alt="Proof preview"
              className="max-h-[90vh] max-w-full rounded-3xl border border-white/10 bg-white object-contain shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

