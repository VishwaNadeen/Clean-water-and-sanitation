/**
 * ReportIssueDummy.jsx
 *
 * TEMPORARY dummy page to test the Report Issue auth flow.
 * Replace this with the real issue reporting form when ready.
 *
 * Reads ?restroomId=&restroomName= from the URL so the form
 * knows which restroom the issue is about.
 */

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ReportIssueDummy() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  // Pre-filled from the URL the map page set
  const restroomId   = searchParams.get("restroomId")   || "";
  const restroomName = searchParams.get("restroomName") || "Unknown restroom";

  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Issue Reported!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your issue for <strong>{restroomName}</strong> has been submitted.
            (This is a dummy page — no real data was saved.)
          </p>
          <button
            onClick={() => navigate("/rest-rooms")}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            ← Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Report an Issue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Help us improve sanitation facilities by reporting problems.
          </p>
        </div>

        {/* Dummy notice */}
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠ This is a <strong>dummy page</strong> for testing the auth redirect flow.
          The real issue reporting form will replace this.
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* Restroom (pre-filled, read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Restroom
            </label>
            <input
              type="text"
              value={restroomName}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 font-medium"
            />
            {restroomId && (
              <p className="mt-1 text-xs text-slate-400 font-mono">ID: {restroomId}</p>
            )}
          </div>

          {/* Issue type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Type
            </label>
            <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option>Broken facilities</option>
              <option>No water supply</option>
              <option>Poor cleanliness</option>
              <option>Safety concern</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the issue…"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Submit Issue
          </button>
        </div>
      </div>
    </div>
  );
}
