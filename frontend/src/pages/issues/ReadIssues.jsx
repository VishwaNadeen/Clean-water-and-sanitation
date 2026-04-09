import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

const STATUSES = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PAGE_SIZE = 6;

export default function ReadIssues() {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    issueNumber: "",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIssues() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        if (!token) {
          throw new Error("Please log in first to view your issues.");
        }

        const params = new URLSearchParams({
          page: String(filters.page),
          limit: String(PAGE_SIZE),
        });

        if (filters.status) {
          params.set("status", filters.status);
        }

        if (filters.issueNumber.trim()) {
          params.set("issueNumber", filters.issueNumber.trim());
        }

        const response = await fetch(`${API_BASE_URL}/issues?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load issues.");
        }

        setIssues(data?.data || []);
        setPagination(data?.pagination || null);
      } catch (loadError) {
        setError(loadError.message || "Failed to load issues.");
        setIssues([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, [filters]);

  function handleStatusChange(event) {
    const value = event.target.value;

    setFilters((prev) => ({
      ...prev,
      status: value,
      page: 1,
    }));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    setFilters((prev) => ({
      ...prev,
      issueNumber: searchInput,
      page: 1,
    }));
  }

  function handleReset() {
    setSearchInput("");
    setFilters({
      status: "",
      issueNumber: "",
      page: 1,
    });
  }

  function changePage(nextPage) {
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_16px_50px_rgba(56,189,248,0.12)] md:p-8">
        <div className="flex flex-col gap-4 border-b border-sky-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3px] text-sky-600">
              Issue Reporting
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              My Issues
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Review the issues you have reported, filter by status, and search
              by issue number.
            </p>
          </div>

          <Link
            to="/issues/create"
            className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)]"
          >
            Create New Issue
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid gap-4 rounded-3xl border border-sky-100 bg-sky-50/60 p-5 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-end">
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Search by Issue Number
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Enter issue number"
                className={inputClassName}
              />
            </form>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Filter by Status
              </span>
              <select
                value={filters.status}
                onChange={handleStatusChange}
                className={inputClassName}
              >
                <option value="">All statuses</option>
                {STATUSES.filter(Boolean).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="rounded-xl border border-sky-300 bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-5 py-10 text-sm text-slate-500">
              Loading your issues...
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                No issues found
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Create your first issue report, or adjust the current filters to
                see more results.
              </p>
              <Link
                to="/issues/create"
                className="mt-6 inline-flex rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)]"
              >
                Create Issue
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-5">
                {issues.map((issue) => (
                  <article
                    key={issue._id}
                    className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3px] text-sky-600">
                          Issue #{issue.issueNumber || "Pending"}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                          {issue.title}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {issue.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge color="blue">{issue.status}</Badge>
                        <Badge color="amber">{issue.priority}</Badge>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoCard
                        label="Category"
                        value={issue.categoryId?.name || "Not available"}
                      />
                      <InfoCard
                        label="Subcategory"
                        value={issue.subCategoryName || "Not available"}
                      />
                      <InfoCard
                        label="Location"
                        value={[
                          issue.cityId?.name,
                          issue.districtId?.name,
                          issue.provinceId?.name,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Not available"}
                      />
                      <InfoCard
                        label="Restroom"
                        value={issue.restroomId?.name || "Not available"}
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-sky-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500">
                        Created on {formatDate(issue.createdAt)}
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={`/issues/me/${issue._id}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Issue
                        </Link>
                        <Link
                          to={`/issues/me/${issue._id}/edit`}
                          className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)]"
                        >
                          Edit Issue
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => changePage(pagination.currentPage - 1)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => changePage(pagination.currentPage + 1)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function Badge({ color, children }) {
  const classes =
    color === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3px] ${classes}`}
    >
      {children}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

const inputClassName =
  "w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";
