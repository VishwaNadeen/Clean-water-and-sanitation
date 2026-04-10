import { Link } from "react-router-dom";

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

function DetailGroup({ title, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
          {title}
        </p>
      </div>
      <div className="divide-y divide-slate-200">
        {rows.map(([label, value]) => (
          <DetailRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
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

export default function ViewComplaint({
  issue,
  actionLoading,
  resolutionNote,
  setResolutionNote,
  onClose,
  onResolve,
  onDelete,
  onStatusChange,
  statusOptions,
}) {
  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 lg:left-[260px]">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3px] text-blue-600">
              Complaint Details
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {issue.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500">Issue #{issue.issueNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close details"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <DetailGroup
              title="Complaint Information"
              rows={[
                ["Category", issue.categoryId?.name],
                ["Subcategory", issue.subCategoryName],
                ["Priority", issue.priority],
                [
                  "Reporter",
                  [issue.reportedBy?.firstName, issue.reportedBy?.lastName]
                    .filter(Boolean)
                    .join(" "),
                ],
                ["Email", issue.reportedBy?.email],
                ["Reported", formatDate(issue.createdAt)],
              ]}
            />

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                Description
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {issue.description || "No description available."}
              </p>
            </div>

            <DetailGroup
              title="Location"
              rows={[
                ["Province", issue.provinceId?.name],
                ["District", issue.districtId?.name],
                ["City", issue.cityId?.name],
                ["Restroom", issue.restroomId?.name],
              ]}
            />

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                Uploaded Photos
              </p>
              {issue.images?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {issue.images.map((image, index) => (
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
                <p className="mt-4 text-sm text-slate-500">No uploaded photos.</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                Status
              </p>
              <div className="mt-4 space-y-3">
                <StatusBadge status={issue.status} />
                <p className="text-sm leading-7 text-slate-600">
                  Complaint progress should be updated through the staff
                  assignment workflow after a team member starts or finishes the
                  task.
                </p>
                {issue.status === "OPEN" ? (
                  <Link
                    to={`/admin/staff/issues?issueId=${issue._id}&issueNumber=${
                      issue.issueNumber || ""
                    }&restroomId=${issue.restroomId?._id || ""}&restroomLabel=${encodeURIComponent(
                      issue.restroomId?.name || ""
                    )}&title=${encodeURIComponent(issue.title || "")}`}
                    onClick={onClose}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Assign to Staff
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3px] text-slate-500">
                Resolution
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Resolved: {formatDate(issue.resolvedAt)}
              </p>
              {issue.resolutionNote ? (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {issue.resolutionNote}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Resolution details will appear here after the assigned work is
                  completed.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3px] text-red-500">
                Delete Complaint
              </p>
              <p className="mt-3 text-sm text-red-600">
                Remove this complaint permanently if it was submitted by mistake or should no longer appear in the system.
              </p>
              <button
                type="button"
                onClick={() => onDelete(issue._id)}
                disabled={Boolean(actionLoading[issue._id])}
                className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading[issue._id] ? "Processing..." : "Delete Complaint"}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
