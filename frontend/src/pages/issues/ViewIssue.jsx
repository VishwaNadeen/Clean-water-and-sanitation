import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { getToken } from "../../utils/auth";

export default function ViewIssue() {
  const { id } = useParams();
  const location = useLocation();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );
  const [actionLoading, setActionLoading] = useState(false);

  const canUserEdit = issue?.status === "OPEN";

  useEffect(() => {
    async function loadIssue() {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        if (!token) {
          throw new Error("Please log in first to view this issue.");
        }

        const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load issue.");
        }

        setIssue(data?.data || null);
      } catch (loadError) {
        setError(loadError.message || "Failed to load issue.");
      } finally {
        setLoading(false);
      }
    }

    loadIssue();
  }, [id]);

  async function handleCancelIssue() {
    const confirmed = window.confirm(
      "Do you want to cancel this issue? Only OPEN issues can be cancelled."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const token = getToken();
      if (!token) {
        throw new Error("Please log in first to cancel an issue.");
      }

      const response = await fetch(`${API_BASE_URL}/issues/${id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to cancel issue.");
      }

      setIssue((prev) =>
        prev
          ? {
              ...prev,
              status: "CLOSED",
              adminNotes: prev.adminNotes || "Issue cancelled by reporter.",
            }
          : prev
      );
      setSuccessMessage(data?.message || "Complaint cancelled successfully.");
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (cancelError) {
      setError(cancelError.message || "Failed to cancel issue.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-sky-200 bg-white/95 p-6 shadow-[0_16px_50px_rgba(56,189,248,0.12)] md:p-8">
        <div className="flex flex-col gap-3 border-b border-sky-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3px] text-sky-600">
            Complaint Reporting
          </p>
          <h1 className="text-3xl font-bold text-slate-900">View Complaint</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">
            Review the full complaint details, selected location, restroom, images,
            and current resolution progress.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <div className="flex items-center justify-between gap-4">
                <span>{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="text-xs font-semibold uppercase tracking-[0.3px] text-green-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-5 py-10 text-sm text-slate-500">
              Loading complaint details...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : !issue ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-10 text-sm text-slate-600">
              Complaint details are not available.
            </div>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3px] text-sky-600">
                        Complaint #{issue.issueNumber || "Pending"}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        {issue.title}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <Badge color="blue">{issue.status}</Badge>
                      <Badge color="amber">{issue.priority}</Badge>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <InfoCard
                      label="Category"
                      value={issue.categoryId?.name || "Not available"}
                    />
                    <InfoCard
                      label="Subcategory"
                      value={issue.subCategoryName || "Not available"}
                    />
                    <InfoCard
                      label="Province"
                      value={issue.provinceId?.name || "Not available"}
                    />
                    <InfoCard
                      label="District"
                      value={issue.districtId?.name || "Not available"}
                    />
                    <InfoCard
                      label="City"
                      value={issue.cityId?.name || "Not available"}
                    />
                    <InfoCard
                      label="Restroom"
                      value={issue.restroomId?.name || "Not available"}
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Description
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {issue.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Reporter
                    </p>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      {[
                        issue.reportedBy?.firstName,
                        issue.reportedBy?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Not available"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {issue.reportedBy?.email || "No email available"}
                    </p>

                    <div className="mt-5 space-y-3">
                      <MetaRow
                        label="Created"
                        value={formatDate(issue.createdAt)}
                      />
                      <MetaRow
                        label="Updated"
                        value={formatDate(issue.updatedAt)}
                      />
                      <MetaRow
                        label="Resolved"
                        value={formatDate(issue.resolvedAt)}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Resolution Notes
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {issue.resolutionNote || "No resolution note added yet."}
                    </p>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                      Admin Notes
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {issue.adminNotes || "No admin notes added yet."}
                    </p>

                    {!canUserEdit && (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        This issue can no longer be edited because only open
                        issues are editable.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                  Uploaded Images
                </p>
                {issue.images?.length ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {issue.images.map((image, index) => (
                      <a
                        key={image.publicId || image.url || index}
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-2xl border border-sky-100 bg-slate-50"
                      >
                        <img
                          src={image.url}
                          alt={`Complaint upload ${index + 1}`}
                          className="h-52 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">
                    No complaint images were uploaded.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/my-complaints"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Back to Complaints
                </Link>
                {canUserEdit ? (
                  <>
                    <Link
                      to={`/my-complaints/${issue._id}/edit`}
                      className="rounded-xl border border-sky-300 bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_28px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(56,189,248,0.3)]"
                    >
                      Edit Complaint
                    </Link>
                    <button
                      type="button"
                      onClick={handleCancelIssue}
                      disabled={actionLoading}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? "Cancelling..." : "Cancel Complaint"}
                    </button>
                  </>
                ) : null}
              </div>
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

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
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
