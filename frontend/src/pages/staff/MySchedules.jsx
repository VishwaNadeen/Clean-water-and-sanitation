import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/staffManagement/DashboardLayout";
import {
  completeWork,
  getMySchedules,
  startWork,
  uploadProof,
} from "../../services/staffManagementService";

const statusToneMap = {
  Assigned: "bg-sky-100 text-sky-700",
  InProgress: "bg-amber-100 text-amber-700",
  Completed: "bg-indigo-100 text-indigo-700",
  Verified: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Cancelled: "bg-slate-100 text-slate-700",
};

export default function MySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [formNotes, setFormNotes] = useState({});

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await getMySchedules();
      setSchedules(data || []);
    } catch (error) {
      console.error("Failed to load schedules", error);
      alert("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (id) => {
    try {
      await startWork(id);
      await loadSchedules();
      alert("Work started successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to start work");
    }
  };

  const handleFileChange = (id, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [id]: file,
    }));
  };

  const handleUploadProof = async (id) => {
    const file = selectedFiles[id];
    if (!file) {
      alert("Please choose an image first");
      return;
    }

    try {
      await uploadProof(id, file);
      await loadSchedules();
      alert("Proof uploaded successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to upload proof");
    }
  };

  const handleInputChange = (id, field, value) => {
    setFormNotes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleCompleteWork = async (id) => {
    try {
      const payload = {
        staffNote: formNotes[id]?.staffNote || "",
        materialsUsed: formNotes[id]?.materialsUsed || "",
        issuesFound: formNotes[id]?.issuesFound || "",
      };

      await completeWork(id, payload);
      await loadSchedules();
      alert("Work completed successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to complete work");
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="My Schedules"
        subtitle="Start work, upload proof, and complete assigned tasks."
      >
        <div className="rounded-3xl border border-sky-100 bg-sky-50/70 px-6 py-8 text-sm font-medium text-slate-600">
          Loading schedules...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Schedules"
      subtitle="Start work, upload proof, and complete assigned tasks."
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(135deg,_rgba(14,165,233,0.08),_rgba(255,255,255,0.96)_45%,_rgba(186,230,253,0.35))] p-6 shadow-[0_18px_40px_rgba(56,189,248,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            Task Center
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Manage your assigned work
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Start active jobs, upload proof images, and complete your schedule
            updates from one workspace.
          </p>
        </section>

        {schedules.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-sky-200 bg-sky-50/70 px-6 py-12 text-center text-sm font-medium text-slate-500">
            No schedules assigned yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {schedules.map((item) => {
              const hasProof = item.proofImages && item.proofImages.length > 0;

              return (
                <article
                  key={item._id}
                  className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.taskType || "General task"} in{" "}
                            {item.restroomLabel || "Unassigned restroom"}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <DataTile
                          label="Date"
                          value={new Date(item.date).toLocaleDateString()}
                        />
                        <DataTile
                          label="Time"
                          value={`${item.startTime} - ${item.endTime}`}
                        />
                        <DataTile
                          label="Manager Note"
                          value={item.managerNote || "No note"}
                        />
                        <DataTile
                          label="Review Note"
                          value={item.managerReviewNote || "No review yet"}
                        />
                        <DataTile
                          label="Task Type"
                          value={item.taskType || "Not specified"}
                        />
                        <DataTile
                          label="Location"
                          value={item.restroomLabel || "N/A"}
                        />
                      </div>

                      {item.proofImages?.length > 0 ? (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Uploaded Proof
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {item.proofImages.map((img, index) => (
                              <img
                                key={index}
                                src={img.url}
                                alt="proof"
                                className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[24px] border border-sky-100 bg-sky-50/70 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Actions
                      </p>

                      {item.status === "Assigned" ? (
                        <button
                          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(59,130,246,0.24)] transition hover:-translate-y-0.5"
                          onClick={() => handleStartWork(item._id)}
                        >
                          Start Work
                        </button>
                      ) : null}

                      {item.status === "InProgress" ? (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Upload Proof Image
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(item._id, e.target.files[0])
                              }
                              className="block w-full rounded-2xl border border-sky-200 bg-white px-3 py-3 text-sm text-slate-700"
                            />
                            <button
                              className="mt-3 w-full rounded-2xl border border-sky-300 bg-white px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                              onClick={() => handleUploadProof(item._id)}
                            >
                              Upload Proof
                            </button>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Staff Note
                            </label>
                            <textarea
                              rows="3"
                              value={formNotes[item._id]?.staffNote || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item._id,
                                  "staffNote",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-400"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Materials Used
                            </label>
                            <textarea
                              rows="3"
                              value={formNotes[item._id]?.materialsUsed || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item._id,
                                  "materialsUsed",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-400"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Issues Found
                            </label>
                            <textarea
                              rows="3"
                              value={formNotes[item._id]?.issuesFound || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item._id,
                                  "issuesFound",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-400"
                            />
                          </div>

                          <button
                            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${
                              hasProof
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_10px_24px_rgba(16,185,129,0.24)] hover:-translate-y-0.5"
                                : "cursor-not-allowed bg-slate-300"
                            }`}
                            onClick={() => handleCompleteWork(item._id)}
                            disabled={!hasProof}
                          >
                            Complete Work
                          </button>

                          {!hasProof ? (
                            <p className="text-sm text-rose-500">
                              Upload a proof image before completing this task.
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {item.status === "Completed" ? (
                        <ActionNotice
                          tone="amber"
                          message="Waiting for manager review."
                        />
                      ) : null}

                      {item.status === "Verified" ? (
                        <ActionNotice
                          tone="emerald"
                          message="Approved and verified."
                        />
                      ) : null}

                      {item.status === "Rejected" ? (
                        <ActionNotice
                          tone="rose"
                          message="Rejected by manager."
                        />
                      ) : null}

                      {item.status === "Cancelled" ? (
                        <ActionNotice tone="slate" message="This task was cancelled." />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusToneMap[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function DataTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ActionNotice({ tone, message }) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${toneClass}`}>
      {message}
    </div>
  );
}
