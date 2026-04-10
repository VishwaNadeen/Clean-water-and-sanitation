import React from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-blue-700 text-white hover:bg-blue-800";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
