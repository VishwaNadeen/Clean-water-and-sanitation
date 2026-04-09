import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../../config/api";
import { getToken } from "../../../utils/auth";
import ViewComplaint from "./ViewComplaint";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function Complaints() {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    location: "",
    page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    loadIssues(filters);
  }, [filters.page, filters.status, filters.search]);

  async function loadIssues(currentFilters) {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in as admin first.");
      }

      const search = new URLSearchParams({
        page: String(currentFilters.page || 1),
        limit: "10",
      });

      if (currentFilters.status) search.set("status", currentFilters.status);
      if (currentFilters.search.trim()) {
        search.set("issueNumber", currentFilters.search.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/issues/admin?${search.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load complaints.");
      }

      setIssues(data?.data || []);
      setPagination(
        data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        }
      );
    } catch (loadError) {
      setError(loadError.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  }

  function setItemLoading(issueId, value) {
    setActionLoading((prev) => ({ ...prev, [issueId]: value }));
  }

  function syncIssue(updatedIssueId, patch) {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === updatedIssueId ? { ...issue, ...patch } : issue
      )
    );

    setSelectedIssue((prev) =>
      prev && prev._id === updatedIssueId ? { ...prev, ...patch } : prev
    );
  }

  async function handleStatusChange(issueId, nextStatus) {
    try {
      setItemLoading(issueId, true);
      setError("");
      setSuccessMessage("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in as admin first.");
      }
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update complaint status.");
      }

      syncIssue(issueId, { status: nextStatus });
      setSuccessMessage(data?.message || "Complaint status updated.");
    } catch (statusError) {
      setError(statusError.message || "Failed to update complaint status.");
    } finally {
      setItemLoading(issueId, false);
    }
  }

  async function handleResolve(issueId) {
    try {
      if (resolutionNote.trim().length < 10) {
        throw new Error("Resolution note must be at least 10 characters.");
      }

      setItemLoading(issueId, true);
      setError("");
      setSuccessMessage("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in as admin first.");
      }
      const formData = new FormData();
      formData.append("resolutionNote", resolutionNote.trim());

      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/resolve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to resolve complaint.");
      }

      const resolvedIssue =
        data?.data?.issue || data?.data || data?.issue || null;

      syncIssue(issueId, {
        status: resolvedIssue?.status || "RESOLVED",
        resolutionNote: resolvedIssue?.resolutionNote || resolutionNote.trim(),
        resolvedAt: resolvedIssue?.resolvedAt || null,
        resolutionImages:
          resolvedIssue?.resolutionImages || resolvedIssue?.images || [],
      });
      setResolutionNote("");
      setSuccessMessage(data?.message || "Complaint resolved successfully.");
    } catch (resolveError) {
      setError(resolveError.message || "Failed to resolve complaint.");
    } finally {
      setItemLoading(issueId, false);
    }
  }

  async function handleDelete(issueId) {
    const confirmed = window.confirm(
      "Do you want to permanently delete this complaint?"
    );
    if (!confirmed) return;

    try {
      setItemLoading(issueId, true);
      setError("");
      setSuccessMessage("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in as admin first.");
      }
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete complaint.");
      }

      setIssues((prev) => prev.filter((issue) => issue._id !== issueId));
      setPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - 1),
      }));
      setSelectedIssue((prev) => (prev?._id === issueId ? null : prev));
      setSuccessMessage(data?.message || "Complaint deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete complaint.");
    } finally {
      setItemLoading(issueId, false);
    }
  }

  const stats = useMemo(() => {
    const counts = {
      all: pagination.totalItems || issues.length,
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    issues.forEach((issue) => {
      if (counts[issue.status] !== undefined) counts[issue.status] += 1;
    });

    return counts;
  }, [issues, pagination.totalItems]);

  const filteredIssues = useMemo(() => {
    const locationKeyword = filters.location.trim().toLowerCase();
    if (!locationKeyword) return issues;

    return issues.filter((issue) => {
      const locationText = [
        issue.provinceId?.name,
        issue.districtId?.name,
        issue.cityId?.name,
        issue.restroomId?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return locationText.includes(locationKeyword);
    });
  }, [issues, filters.location]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Complaint Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Review reported complaints, narrow them by location or status, and
            open the full details only when needed.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={stats.all} color="text-slate-800" />
        <StatCard label="Open" value={stats.OPEN} color="text-blue-600" />
        <StatCard
          label="In Progress"
          value={stats.IN_PROGRESS}
          color="text-amber-600"
        />
        <StatCard label="Resolved" value={stats.RESOLVED} color="text-green-600" />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search by issue number..."
            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            placeholder="Search by province, district, city..."
            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">
            Complaint Table
          </h2>
          <button
            type="button"
            onClick={() => loadIssues(filters)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
            Loading complaints...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No complaints found for the selected filters.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.3px] text-slate-500">
                    <th className="px-5 py-4 font-semibold">Issue No</th>
                    <th className="px-5 py-4 font-semibold">Title</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Reporter</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Reported</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold text-blue-700">
                        #{issue.issueNumber}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {issue.title}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        <p className="font-medium text-slate-800">
                          {issue.categoryId?.name || "Not available"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {[
                          issue.reportedBy?.firstName,
                          issue.reportedBy?.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "Not available"}
                      </td>
                      <td className="px-5 py-4">
                        <IssueBadge status={issue.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatDate(issue.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIssue(issue);
                            setResolutionNote(issue.resolutionNote || "");
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          title="View complaint details"
                          aria-label="View complaint details"
                        >
                          <ViewIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.currentPage} of {pagination.totalPages || 1}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateFilter("page", filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => updateFilter("page", filters.page + 1)}
                  disabled={filters.page >= (pagination.totalPages || 1)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ViewComplaint
        issue={selectedIssue}
        actionLoading={actionLoading}
        resolutionNote={resolutionNote}
        setResolutionNote={setResolutionNote}
        onClose={() => setSelectedIssue(null)}
        onResolve={handleResolve}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        statusOptions={STATUS_OPTIONS}
      />
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-800" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function IssueBadge({ status }) {
  const classes =
    status === "RESOLVED"
      ? "bg-green-50 text-green-700"
      : status === "IN_PROGRESS"
        ? "bg-amber-50 text-amber-700"
        : status === "CLOSED"
          ? "bg-slate-100 text-slate-700"
          : "bg-sky-50 text-sky-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {formatStatus(status)}
    </span>
  );
}

function ViewIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function formatStatus(status) {
  return String(status || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}
