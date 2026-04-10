import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FloatingToast from "../../../components/common/FloatingToast";
import {
  assignIssueToStaff,
  getManagerStaff,
} from "../../../services/staffManagementService";

const TOAST_DURATION_MS = 5000;

const AssignIssues = () => {
  const [searchParams] = useSearchParams();
  const [staffMembers, setStaffMembers] = useState([]);
  const [form, setForm] = useState({
    issueId: "",
    issueNumber: "",
    staffId: "",
    date: "",
    startTime: "",
    endTime: "",
    title: "",
    issueTaskType: "Inspection",
    restroomId: "",
    restroomLabel: "",
    managerNote: "",
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const issueId = searchParams.get("issueId") || "";
    const issueNumber = searchParams.get("issueNumber") || "";
    const restroomId = searchParams.get("restroomId") || "";
    const restroomLabel = searchParams.get("restroomLabel") || "";
    const title = searchParams.get("title") || "";
    const prefillsExist =
      issueId || issueNumber || restroomId || restroomLabel || title;
    const fallbackTitle = issueNumber || issueId ? `Complaint #${issueNumber || issueId}` : "";

    if (!prefillsExist) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      issueId: issueId || prev.issueId,
      issueNumber: issueNumber || prev.issueNumber,
      restroomId: restroomId || prev.restroomId,
      restroomLabel: restroomLabel || prev.restroomLabel,
      title: title || fallbackTitle || prev.title,
    }));
  }, [searchParams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await assignIssueToStaff(form.issueId, {
        staffId: form.staffId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        title: form.title,
        issueTaskType: form.issueTaskType,
        restroomId: form.restroomId || undefined,
        restroomLabel: form.restroomLabel,
        managerNote: form.managerNote,
      });

      setToast({ type: "success", text: "Issue assigned successfully" });

      setForm({
        issueId: "",
        issueNumber: "",
        staffId: "",
        date: "",
        startTime: "",
        endTime: "",
        title: "",
        issueTaskType: "Inspection",
        restroomId: "",
        restroomLabel: "",
        managerNote: "",
      });
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
          <span aria-hidden="true">←</span>
          Back to Staff Management
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800">Assign Issue to Staff</h3>
        <p className="mt-2 text-slate-500">
          Link an open issue with a schedule and assign it to a staff member.
        </p>

        {toast ? <FloatingToast toast={toast} onClose={() => setToast(null)} /> : null}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder={form.issueNumber ? "Complaint title" : "Issue ID"}
            value={
              form.issueNumber
                ? form.title || `Complaint #${form.issueNumber}`
                : form.issueId
            }
            onChange={(e) =>
              setForm({
                ...form,
                ...(form.issueNumber
                  ? { title: e.target.value }
                  : { issueId: e.target.value }),
              })
            }
            className={`rounded-xl border border-slate-200 px-4 py-3 ${
              form.issueNumber ? "bg-slate-50 text-slate-700" : ""
            }`}
            required
          />

          <select
            value={form.staffId}
            onChange={(e) => setForm({ ...form, staffId: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
            required
          >
            <option value="">Select staff member</option>
            {staffMembers.map((staff) => (
              <option key={staff._id} value={staff._id}>
                {staff.fullName || staff.name || "Unnamed"} - {staff.role || "Staff"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
            required
          />

          <select
            value={form.issueTaskType}
            onChange={(e) => setForm({ ...form, issueTaskType: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inspection">Inspection</option>
          </select>

          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
            required
          />

          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3"
            required
          />

          {form.restroomLabel ? (
            <input
              type="text"
              value={form.restroomLabel}
              readOnly
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 md:col-span-2"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Restroom ID (optional)"
                value={form.restroomId}
                onChange={(e) => setForm({ ...form, restroomId: e.target.value })}
                className="rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Restroom Label"
                value={form.restroomLabel}
                onChange={(e) => setForm({ ...form, restroomLabel: e.target.value })}
                className="rounded-xl border border-slate-200 px-4 py-3"
              />
            </>
          )}

          <textarea
            placeholder="Manager Note"
            value={form.managerNote}
            onChange={(e) => setForm({ ...form, managerNote: e.target.value })}
            className="rounded-xl border border-slate-200 px-4 py-3 md:col-span-2"
            rows="4"
          />

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-5 py-3 text-white font-semibold hover:bg-blue-800"
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
