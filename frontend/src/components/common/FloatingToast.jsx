import React from "react";

export default function FloatingToast({ toast, onClose }) {
  if (!toast?.text) {
    return null;
  }

  return (
    <div className="fixed right-6 top-6 z-50 max-w-sm animate-[fade-in_0.2s_ease-out]">
      <div
        className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${
          toast.type === "success"
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
            : "border-rose-200 bg-rose-50/95 text-rose-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">{toast.text}</div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold uppercase tracking-wide opacity-70 transition hover:opacity-100"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
