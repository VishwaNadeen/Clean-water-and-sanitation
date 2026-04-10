import React from "react";
import API_BASE_URL from "../../../config/api";

const statusStyles = {
  Assigned: "bg-amber-100 text-amber-700 border border-amber-200",
  InProgress: "bg-sky-100 text-sky-700 border border-sky-200",
  Completed: "bg-violet-100 text-violet-700 border border-violet-200",
  Verified: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
  Cancelled: "bg-slate-100 text-slate-700 border border-slate-200",
};

const getStatusLabel = (status) => {
  if (status === "Rejected") {
    return "Rework Required";
  }

  return status;
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

const ScheduleCard = ({
  schedule,
  formState,
  proofFile,
  proofMessage,
  taskMessage,
  busyAction,
  embedded = false,
  onStart,
  onRevertStart,
  onFileChange,
  onUploadProof,
  onRemoveProof,
  onFormChange,
  onComplete,
  onRedoTask,
}) => {
  const {
    _id,
    title,
    taskType,
    restroomLabel,
    date,
    startTime,
    endTime,
    status,
    managerNote,
    managerReviewNote,
    proofImages = [],
    staffNote,
    materialsUsed,
    issuesFound,
  } = schedule;

  const currentForm = formState[_id] || {
    staffNote: staffNote || "",
    materialsUsed: materialsUsed || "",
    issuesFound: issuesFound || "",
  };

  const formattedDate = new Date(date).toLocaleDateString();
  const isWorking = busyAction === _id;
  const fileInputId = `proof-image-${_id}`;

  return (
    <div
      className={
        embedded
          ? "overflow-hidden rounded-[28px] bg-white"
          : "overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm"
      }
    >
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-blue-100">
              {taskType} {restroomLabel ? `• ${restroomLabel}` : ""}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-bold ${
              statusStyles[status] || "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      <div className="p-5">
        {taskMessage?.text ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
              taskMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {taskMessage.text}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Date</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{formattedDate}</p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Time</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {startTime} - {endTime}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Manager Note
            </p>
            <p className="mt-2 text-sm text-slate-700">{managerNote || "No note provided"}</p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Proof Images
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{proofImages.length}</p>
          </div>
        </div>

        {proofImages.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Uploaded proof</h4>
            <div className="flex flex-wrap gap-3">
              {proofImages.map((image, index) => (
                <div key={`${image.publicId || index}`} className="group relative">
                  <a
                    href={getProofImageSrc(image.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={getProofImageSrc(image.url)}
                      alt={`proof-${index}`}
                      className="h-24 w-24 rounded-2xl border border-blue-100 object-cover"
                    />
                  </a>
                  {status === "InProgress" ? (
                    <button
                      type="button"
                      onClick={() => onRemoveProof(_id, image.publicId)}
                      disabled={isWorking}
                      className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Remove proof image"
                      aria-label="Remove proof image"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <path d="M5 5L15 15" />
                        <path d="M15 5L5 15" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "Assigned" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onStart(_id)}
              disabled={isWorking}
              className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWorking ? "Starting..." : "Start Work"}
            </button>
          </div>
        )}

        {status === "InProgress" && (
          <div className="mt-6 rounded-3xl border border-blue-100 bg-slate-50 p-5">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-slate-800">Complete this task</h4>
              <p className="mt-1 text-sm text-slate-500">
                Upload proof and fill the completion details before submitting.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => onRevertStart(_id)}
                  disabled={isWorking}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isWorking ? "Updating..." : "Change Back To Assigned"}
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Upload Proof Image
                </label>
                {proofMessage?.text ? (
                  <div
                    className={`mb-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                      proofMessage.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {proofMessage.text}
                  </div>
                ) : null}
                <div className="flex flex-col gap-3">
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(_id, e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor={fileInputId}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed px-4 py-4 text-sm transition ${
                      isWorking
                        ? "cursor-not-allowed border-blue-200 bg-slate-50 opacity-70"
                        : "border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {isWorking
                          ? "Uploading proof image..."
                          : proofFile
                            ? "Proof image selected"
                            : "Click here to choose a proof image"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isWorking
                          ? "Please wait while your image is being uploaded."
                          : proofFile
                          ? proofFile.name
                          : "Upload a clear photo of the completed work area."}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                      {isWorking ? "Uploading..." : "Choose File"}
                    </span>
                  </label>
                </div>
                {proofFile && (
                  <p className="mt-2 text-xs text-slate-500">Selected file: {proofFile.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Staff Note
                </label>
                <textarea
                  rows="4"
                  value={currentForm.staffNote}
                  onChange={(e) => onFormChange(_id, "staffNote", e.target.value)}
                  placeholder="Describe the work you completed..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Materials Used
                  </label>
                  <input
                    type="text"
                    value={currentForm.materialsUsed}
                    onChange={(e) => onFormChange(_id, "materialsUsed", e.target.value)}
                    placeholder="Example: detergent, gloves, mop"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Issues Found
                  </label>
                  <input
                    type="text"
                    value={currentForm.issuesFound}
                    onChange={(e) => onFormChange(_id, "issuesFound", e.target.value)}
                    placeholder="Example: leaking tap, broken light"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onComplete(_id)}
                  disabled={isWorking}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isWorking ? "Submitting..." : "Complete Work"}
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "Completed" && (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-700">
              Work submitted successfully. Waiting for manager review.
            </p>
          </div>
        )}

        {status === "Verified" && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">
              This task has been verified by the manager.
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              {managerReviewNote || "Approved by manager."}
            </p>
          </div>
        )}

        {status === "Rejected" && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">
              This task was rejected and needs rework.
            </p>
            <p className="mt-1 text-sm text-rose-600">
              {managerReviewNote || "No manager review note provided."}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onRedoTask?.(_id)}
                disabled={isWorking || typeof onRedoTask !== "function"}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isWorking ? "Preparing..." : "Redo Task"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
