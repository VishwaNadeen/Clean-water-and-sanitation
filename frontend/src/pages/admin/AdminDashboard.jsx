import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";
import { getAllIssues } from "../../services/issueService";
import { adminFetchAllRestrooms } from "../../services/restroomAdminService";
import { getManagerStaff } from "../../services/staffManagementService";

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function formatIssueStatus(status) {
  return String(status || "OPEN")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getIssueStatusTone(status) {
  if (status === "RESOLVED") return "bg-emerald-50 text-emerald-700";
  if (status === "IN_PROGRESS") return "bg-amber-50 text-amber-700";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700";
  return "bg-sky-50 text-sky-700";
}

function getRestroomConditionTone(condition) {
  if (condition === "GOOD") return "bg-emerald-50 text-emerald-700";
  if (condition === "OK") return "bg-amber-50 text-amber-700";
  if (condition === "BAD") return "bg-orange-50 text-orange-700";
  if (condition === "OUT_OF_ORDER") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

async function fetchUsers() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load users.");
  }

  return Array.isArray(data?.users) ? data.users : [];
}

async function fetchCategories() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/categories/admin`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Failed to load categories.");
  }

  return Array.isArray(data?.data) ? data.data : [];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    staff: [],
    restrooms: [],
    issues: [],
    categories: [],
    issuePagination: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        usersResult,
        staffResult,
        restroomsResult,
        issuesResult,
        categoriesResult,
      ] = await Promise.allSettled([
        fetchUsers(),
        getManagerStaff(),
        adminFetchAllRestrooms(),
        getAllIssues({ page: 1, limit: 50 }),
        fetchCategories(),
      ]);

      const nextUsers =
        usersResult.status === "fulfilled" ? usersResult.value : [];
      const nextStaff =
        staffResult.status === "fulfilled" ? staffResult.value : [];
      const nextRestrooms =
        restroomsResult.status === "fulfilled" ? restroomsResult.value : [];
      const nextIssues =
        issuesResult.status === "fulfilled"
          ? issuesResult.value?.data || []
          : [];
      const nextIssuePagination =
        issuesResult.status === "fulfilled"
          ? issuesResult.value?.pagination || null
          : null;
      const nextCategories =
        categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

      setDashboardData({
        users: nextUsers,
        staff: nextStaff,
        restrooms: nextRestrooms,
        issues: nextIssues,
        categories: nextCategories,
        issuePagination: nextIssuePagination,
      });
      setLastUpdated(new Date().toISOString());

      const failedSections = [
        usersResult,
        staffResult,
        restroomsResult,
        issuesResult,
        categoriesResult,
      ].filter((result) => result.status === "rejected");

      if (failedSections.length > 0) {
        setError(
          "Some dashboard sections could not be loaded. Available data is shown."
        );
      }
    } catch (loadError) {
      setError(loadError.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const activeUsers = dashboardData.users.filter(
      (user) => String(user.status || "").toLowerCase() === "active"
    ).length;
    const activeStaff = dashboardData.staff.filter(
      (member) => String(member.status || "").toLowerCase() === "active"
    ).length;
    const openIssues = dashboardData.issues.filter((issue) =>
      ["OPEN", "IN_PROGRESS"].includes(String(issue.status || "").toUpperCase())
    ).length;
    const issueTotal =
      dashboardData.issuePagination?.totalItems || dashboardData.issues.length;
    const activeCategories = dashboardData.categories.filter(
      (category) => Boolean(category.isActive)
    ).length;
    const needsAttentionRestrooms = dashboardData.restrooms.filter((restroom) =>
      ["BAD", "OUT_OF_ORDER"].includes(String(restroom.condition || "").toUpperCase())
    ).length;

    return [
      {
        label: "Total Users",
        value: dashboardData.users.length,
        note: `${activeUsers} active accounts`,
      },
      {
        label: "Staff Members",
        value: dashboardData.staff.length,
        note: `${activeStaff} currently active`,
      },
      {
        label: "Restrooms",
        value: dashboardData.restrooms.length,
        note: `${needsAttentionRestrooms} need attention`,
      },
      {
        label: "Complaints",
        value: issueTotal,
        note: `${openIssues} open or in progress`,
      },
      {
        label: "Categories",
        value: dashboardData.categories.length,
        note: `${activeCategories} active categories`,
      },
    ];
  }, [dashboardData]);

  const issueStatusSummary = useMemo(() => {
    const counts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    dashboardData.issues.forEach((issue) => {
      const key = String(issue.status || "").toUpperCase();
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [dashboardData.issues]);

  const restroomSummary = useMemo(() => {
    const counts = {
      GOOD: 0,
      OK: 0,
      BAD: 0,
      OUT_OF_ORDER: 0,
    };

    dashboardData.restrooms.forEach((restroom) => {
      const key = String(restroom.condition || "").toUpperCase();
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
    });

    return counts;
  }, [dashboardData.restrooms]);

  const recentIssues = useMemo(() => {
    return [...dashboardData.issues]
      .sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
      )
      .slice(0, 5);
  }, [dashboardData.issues]);

  const recentRestrooms = useMemo(() => {
    return [...dashboardData.restrooms]
      .sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
      )
      .slice(0, 5);
  }, [dashboardData.restrooms]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              System overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor key records, review complaint activity, and jump quickly to
              the main admin areas from one place.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Updated {formatDateTime(lastUpdated)}
            </span>
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-16 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
              </div>
            ))
          : stats.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value}
                note={item.note}
              />
            ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Quick Access
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Main admin areas
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <QuickLink
              to="/admin/users"
              title="User Management"
              note="Review registered user accounts."
            />
            <QuickLink
              to="/admin/staff"
              title="Staff Management"
              note="View staff members and their current status."
            />
            <QuickLink
              to="/admin/restrooms"
              title="Restroom Management"
              note="Maintain restroom records and conditions."
            />
            <QuickLink
              to="/admin/complaints"
              title="Complaint Management"
              note="Track open, in-progress, and resolved complaints."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Complaint Snapshot
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Current loaded status mix
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Open" value={issueStatusSummary.OPEN} />
            <MiniStat label="In Progress" value={issueStatusSummary.IN_PROGRESS} />
            <MiniStat label="Resolved" value={issueStatusSummary.RESOLVED} />
            <MiniStat label="Closed" value={issueStatusSummary.CLOSED} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Recent Complaints
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Latest reported items
              </h2>
            </div>
            <Link
              to="/admin/complaints"
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : recentIssues.length === 0 ? (
            <EmptyState message="No complaint records are available yet." />
          ) : (
            <div className="mt-5 space-y-3">
              {recentIssues.map((issue) => (
                <article
                  key={issue._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        #{issue.issueNumber || "N/A"} {issue.title || "Untitled complaint"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateTime(issue.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getIssueStatusTone(
                        String(issue.status || "").toUpperCase()
                      )}`}
                    >
                      {formatIssueStatus(issue.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Restroom Status
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Condition overview
              </h2>
            </div>
            <Link
              to="/admin/restrooms"
              className="text-sm font-semibold text-blue-700 transition hover:text-blue-900"
            >
              Manage
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ConditionCard
              label="Good"
              value={restroomSummary.GOOD}
              tone={getRestroomConditionTone("GOOD")}
            />
            <ConditionCard
              label="OK"
              value={restroomSummary.OK}
              tone={getRestroomConditionTone("OK")}
            />
            <ConditionCard
              label="Bad"
              value={restroomSummary.BAD}
              tone={getRestroomConditionTone("BAD")}
            />
            <ConditionCard
              label="Out of Order"
              value={restroomSummary.OUT_OF_ORDER}
              tone={getRestroomConditionTone("OUT_OF_ORDER")}
            />
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Recently added restrooms
            </h3>

            {loading ? (
              <ListSkeleton compact />
            ) : recentRestrooms.length === 0 ? (
              <EmptyState message="No restroom records are available yet." />
            ) : (
              <div className="mt-4 space-y-3">
                {recentRestrooms.map((restroom) => (
                  <article
                    key={restroom._id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {restroom.name || "Unnamed restroom"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {[restroom.city, restroom.district, restroom.province]
                          .filter(Boolean)
                          .join(", ") || "Location not available"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getRestroomConditionTone(
                        String(restroom.condition || "").toUpperCase()
                      )}`}
                    >
                      {formatIssueStatus(restroom.condition)}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ConditionCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function QuickLink({ to, title, note }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 shadow-sm transition hover:border-blue-200 hover:bg-white hover:shadow-md"
    >
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
      {message}
    </div>
  );
}

function ListSkeleton({ compact = false }) {
  return (
    <div className={`mt-5 space-y-3 ${compact ? "" : ""}`}>
      {Array.from({ length: compact ? 3 : 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
