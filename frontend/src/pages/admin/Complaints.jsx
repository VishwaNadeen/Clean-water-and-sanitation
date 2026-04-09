import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function Complaints() {
  const [issues, setIssues] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    issueNumber: "",
    provinceId: "",
    districtId: "",
    cityId: "",
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
  }, [filters.page, filters.status, filters.issueNumber]);

  useEffect(() => {
    async function loadProvinces() {
      try {
        const response = await fetch(`${API_BASE_URL}/locations/provinces`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load provinces.");
        }

        setProvinces(data?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load provinces.");
      }
    }

    loadProvinces();
  }, []);

  useEffect(() => {
    if (!filters.provinceId) {
      setDistricts([]);
      setCities([]);
      return;
    }

    async function loadDistricts() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/locations/provinces/${filters.provinceId}/districts`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load districts.");
        }

        setDistricts(data?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load districts.");
        setDistricts([]);
      }
    }

    loadDistricts();
  }, [filters.provinceId]);

  useEffect(() => {
    if (!filters.districtId) {
      setCities([]);
      return;
    }

    async function loadCities() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/locations/districts/${filters.districtId}/cities`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load cities.");
        }

        setCities(data?.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load cities.");
        setCities([]);
      }
    }

    loadCities();
  }, [filters.districtId]);

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
      if (currentFilters.issueNumber.trim()) {
        search.set("issueNumber", currentFilters.issueNumber.trim());
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

      syncIssue(issueId, {
        status: "RESOLVED",
        resolutionNote: resolutionNote.trim(),
        resolvedAt: new Date().toISOString(),
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
    return issues.filter((issue) => {
      const provinceId = issue.provinceId?._id || "";
      const districtId = issue.districtId?._id || "";
      const cityId = issue.cityId?._id || "";

      if (filters.provinceId && provinceId !== filters.provinceId) return false;
      if (filters.districtId && districtId !== filters.districtId) return false;
      if (filters.cityId && cityId !== filters.cityId) return false;

      return true;
    });
  }, [issues, filters.provinceId, filters.districtId, filters.cityId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Complaints</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Manage reported complaints from one clear admin table and open full
          details only when needed.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All Complaints" value={stats.all} />
        <StatCard label="Open" value={stats.OPEN} />
        <StatCard label="In Progress" value={stats.IN_PROGRESS} />
        <StatCard label="Resolved" value={stats.RESOLVED} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_220px_220px_220px_220px]">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Search by issue number
            <input
              type="text"
              value={filters.issueNumber}
              onChange={(event) => updateFilter("issueNumber", event.target.value)}
              placeholder="Enter issue number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Filter by status
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Province
            <select
              value={filters.provinceId}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  provinceId: event.target.value,
                  districtId: "",
                  cityId: "",
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All provinces</option>
              {provinces.map((province) => (
                <option key={province._id} value={province._id}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            District
            <select
              value={filters.districtId}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  districtId: event.target.value,
                  cityId: "",
                }))
              }
              disabled={!filters.provinceId}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All districts</option>
              {districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            City
            <select
              value={filters.cityId}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  cityId: event.target.value,
                }))
              }
              disabled={!filters.districtId}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
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

      {selectedIssue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 lg:left-[260px]">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
                  Complaint Details
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {selectedIssue.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Issue #{selectedIssue.issueNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close details"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Complaint Information
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200">
                    <DetailRow
                      label="Category"
                      value={selectedIssue.categoryId?.name}
                    />
                    <DetailRow
                      label="Subcategory"
                      value={selectedIssue.subCategoryName}
                    />
                    <DetailRow label="Priority" value={selectedIssue.priority} />
                    <DetailRow
                      label="Reporter"
                      value={[
                        selectedIssue.reportedBy?.firstName,
                        selectedIssue.reportedBy?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <DetailRow
                      label="Email"
                      value={selectedIssue.reportedBy?.email}
                    />
                    <DetailRow
                      label="Reported"
                      value={formatDate(selectedIssue.createdAt)}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                    Description
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedIssue.description || "No description available."}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Location
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200">
                    <DetailRow
                      label="Province"
                      value={selectedIssue.provinceId?.name}
                    />
                    <DetailRow
                      label="District"
                      value={selectedIssue.districtId?.name}
                    />
                    <DetailRow label="City" value={selectedIssue.cityId?.name} />
                    <DetailRow
                      label="Restroom"
                      value={selectedIssue.restroomId?.name}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                    Uploaded Photos
                  </p>
                  {selectedIssue.images?.length ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedIssue.images.map((image, index) => (
                        <a
                          key={image.publicId || image.url || index}
                          href={image.url}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={image.url}
                            alt={`Complaint upload ${index + 1}`}
                            className="h-44 w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No uploaded photos.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                    Status
                  </p>
                  <div className="mt-4 space-y-3">
                    <IssueBadge status={selectedIssue.status} />
                    <select
                      value={selectedIssue.status}
                      onChange={(event) =>
                        handleStatusChange(selectedIssue._id, event.target.value)
                      }
                      disabled={Boolean(actionLoading[selectedIssue._id])}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                    Resolution
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Resolved: {formatDate(selectedIssue.resolvedAt)}
                  </p>
                  <textarea
                    value={resolutionNote}
                    onChange={(event) => setResolutionNote(event.target.value)}
                    rows={5}
                    placeholder="Explain how this complaint was resolved"
                    className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedIssue._id)}
                    disabled={Boolean(actionLoading[selectedIssue._id])}
                    className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading[selectedIssue._id]
                      ? "Saving..."
                      : "Resolve Complaint"}
                  </button>
                  {selectedIssue.resolutionNote ? (
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {selectedIssue.resolutionNote}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-red-500">
                    Danger Zone
                  </p>
                  <p className="mt-3 text-sm text-red-600">
                    Delete this complaint permanently if it is invalid or should
                    be removed by admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedIssue._id)}
                    disabled={Boolean(actionLoading[selectedIssue._id])}
                    className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading[selectedIssue._id]
                      ? "Processing..."
                      : "Delete Complaint"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-[160px_1fr] sm:items-start">
      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800">
        {value || "Not available"}
      </p>
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

function PriorityBadge({ priority }) {
  const classes =
    priority === "URGENT"
      ? "bg-red-50 text-red-700"
      : priority === "HIGH"
        ? "bg-orange-50 text-orange-700"
        : priority === "MEDIUM"
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {priority || "Not set"}
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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
