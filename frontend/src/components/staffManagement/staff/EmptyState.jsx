import React from "react";

const EmptyState = ({
  title = "No schedules found",
  description = "There is nothing to show right now.",
  buttonText = "Refresh",
  onReload,
}) => {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.8">
          <path d="M8 7V5a4 4 0 1 1 8 0v2" />
          <path d="M5 9h14l-1 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9Z" />
        </svg>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>

      {onReload && (
        <button
          onClick={onReload}
          className="mt-5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;