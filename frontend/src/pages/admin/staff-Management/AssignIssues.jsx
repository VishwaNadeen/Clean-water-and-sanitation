import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import {
  assignIssueToStaff,
  getManagerStaff,
} from "../../../services/staffManagementService";

const TOAST_DURATION_MS = 5000;

const emptyForm = {
  issueId: "",
  staffId: "",
  date: "",
  startTime: "",
  endTime: "",
  title: "",
  issueTaskType: "Inspection",
  restroomId: "",
  restroomLabel: "",
  managerNote: "",
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const readOnlyInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-700 outline-none";

const AssignIssues = () => {
  const [searchParams] = useSearchParams();
  const [staffMembers, setStaffMembers] = useState([]);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    issueId: searchParams.get("issueId") || "",
    title:
      searchParams.get("title") ||
      (searchParams.get("issueNumber")
        ? `Complaint #${searchParams.get("issueNumber")}`
        : ""),
    restroomId: searchParams.get("restroomId") || "",
    restroomLabel: searchParams.get("restroomLabel") || "",
  }));
  const [toast, setToast] = useState(null);

  const activeStaffMembers = useMemo(
    () =>
      staffMembers.filter(
        (staff) => String(staff.status || "").toLowerCase() === "active"
      ),
    [staffMembers]
  );

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    async function loadStaffMembers() {
      try {
        const data = await getManagerStaff();
        setStaffMembers(Array.isArray(data) ? data : []);
      } catch (error) {
        setToast({
          type: "error",
          text: error?.response?.data?.message || "Failed to load staff members",
        });
      }
    }

    loadStaffMembers();
  }, []);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      issueId: searchParams.get("issueId") || "",
      title:
        searchParams.get("title") ||
        (searchParams.get("issueNumber")
          ? `Complaint #${searchParams.get("issueNumber")}`
          : ""),
      restroomId: searchParams.get("restroomId") || "",
      restroomLabel: searchParams.get("restroomLabel") || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await assignIssueToStaff(form.issueId, {
        staffId: form.staffId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        title: form.title,
        issueTaskType: form.issueTaskType,
        restroomId: form.restroomId,
        restroomLabel: form.restroomLabel,
        managerNote: form.managerNote,
      });

      setToast({ type: "success", text: "Issue assigned successfully" });
      resetForm();
    } catch (error) {
      setToast({
        type: "error",
        text: error?.response?.data?.message || "Failed to assign issue",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/staff"
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <span aria-hidden="true">&larr;</span>
          Back to Staff Management
        </Link>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800">Assign Issue to Staff</h3>
        <p className="mt-2 text-base text-slate-500">
          Link an open issue with a schedule and assign it to a staff member.
        </p>

        {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Complaint title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className={readOnlyInputClassName}
            readOnly={Boolean(searchParams.get("title") || searchParams.get("issueNumber"))}
            required
          />

          <select
            value={form.staffId}
            onChange={(event) => setForm({ ...form, staffId: event.target.value })}
            className={inputClassName}
            required
          >
            <option value="">Select staff member</option>
            {activeStaffMembers.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.fullName || staff.name || "Unnamed"} - {staff.role || "Staff"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            className={inputClassName}
            required
          />

          <select
            value={form.issueTaskType}
            onChange={(event) =>
              setForm({ ...form, issueTaskType: event.target.value })
            }
            className={inputClassName}
          >
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inspection">Inspection</option>
          </select>

          <input
            type="time"
            value={form.startTime}
            onChange={(event) => setForm({ ...form, startTime: event.target.value })}
            className={inputClassName}
            required
          />

          <input
            type="time"
            value={form.endTime}
            onChange={(event) => setForm({ ...form, endTime: event.target.value })}
            className={inputClassName}
            required
          />

          <input
            type="text"
            placeholder="Restroom name"
            value={form.restroomLabel}
            onChange={(event) =>
              setForm({ ...form, restroomLabel: event.target.value })
            }
            className={`${searchParams.get("restroomLabel") ? readOnlyInputClassName : inputClassName} md:col-span-2`}
            readOnly={Boolean(searchParams.get("restroomLabel"))}
            required
          />

          <textarea
            placeholder="Manager Note"
            value={form.managerNote}
            onChange={(event) =>
              setForm({ ...form, managerNote: event.target.value })
            }
            className={`${inputClassName} min-h-[140px] resize-none md:col-span-2`}
            rows={5}
          />

          <input
            type="hidden"
            value={form.issueId}
            onChange={() => {}}
          />
          <input
            type="hidden"
            value={form.restroomId}
            onChange={() => {}}
          />

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Assign Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignIssues;
