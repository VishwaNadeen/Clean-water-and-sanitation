/**
 * RestroomList.jsx
 *
 * Admin page — lists all restrooms in a table.
 * Route: /admin/restrooms
 *
 * Features:
 *  - Search by name, city, district, province
 *  - Condition badge per row
 *  - Edit button → navigates to /admin/restrooms/:id/edit
 *  - Delete button → confirm dialog then calls DELETE API
 *  - "Add New" button → navigates to /admin/restrooms/create
 */

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminFetchAllRestrooms,
  adminDeleteRestroom,
} from "../../../services/restroomAdminService";

// Condition badge colour map
const CONDITION_BADGE = {
  GOOD:         "bg-green-50 text-green-700 border-green-200",
  OK:           "bg-yellow-50 text-yellow-700 border-yellow-200",
  BAD:          "bg-orange-50 text-orange-700 border-orange-200",
  OUT_OF_ORDER: "bg-red-50 text-red-700 border-red-200",
};

export default function RestroomList() {
  const navigate = useNavigate();

  const [restrooms, setRestrooms] = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  // Track which restroom is pending delete confirmation
  const [deletingId,   setDeletingId]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load all restrooms on mount
  useEffect(() => {
    loadRestrooms();
  }, []);

  async function loadRestrooms() {
    try {
      setLoading(true);
      setError("");
      const data = await adminFetchAllRestrooms();
      setRestrooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Client-side search across name, city, district, province
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return restrooms;
    return restrooms.filter((r) =>
      [r.name, r.city, r.district, r.province]
        .some((field) => String(field || "").toLowerCase().includes(kw))
    );
  }, [restrooms, search]);

  // Execute delete after admin confirms
  async function handleDelete(id) {
    try {
      setDeleteLoading(true);
      await adminDeleteRestroom(id);
      // Remove from local state so UI updates instantly without a re-fetch
      setRestrooms((prev) => prev.filter((r) => r._id !== id));
      setDeletingId(null);
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Restroom Management</h1>
              <p className="mt-1 text-sm text-slate-500">
                Create, edit and delete public restroom locations.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <input
                type="text"
                placeholder="Search by name, city, district…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-72"
              />

              {/* Add new button */}
              <button
                onClick={() => navigate("/admin/restrooms/create")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 whitespace-nowrap"
              >
                + Add Restroom
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total",        value: restrooms.length,                                          colour: "text-slate-800" },
            { label: "Good",         value: restrooms.filter((r) => r.condition === "GOOD").length,        colour: "text-green-600" },
            { label: "Needs Attention", value: restrooms.filter((r) => ["BAD","OUT_OF_ORDER"].includes(r.condition)).length, colour: "text-red-600" },
            { label: "Search Results", value: filtered.length,                                         colour: "text-blue-600" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h2 className={`mt-2 text-3xl font-bold ${card.colour}`}>{card.value}</h2>
            </div>
          ))}
        </div>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">Loading restrooms…</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                {error}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">No restrooms found</p>
                <p className="mt-1 text-sm text-slate-400">
                  {search ? "Try a different search term." : "Click '+ Add Restroom' to get started."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      {["Name", "Location", "Condition", "Rating", "Images", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 text-sm font-semibold text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r._id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        {/* Name */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{r.name}</p>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <p>{r.city}</p>
                          <p className="text-xs text-slate-400">{r.district}, {r.province}</p>
                        </td>

                        {/* Condition */}
                        <td className="px-6 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${CONDITION_BADGE[r.condition] || CONDITION_BADGE.GOOD}`}>
                            {r.condition?.replace("_", " ")}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {r.avgRating > 0 ? `★ ${r.avgRating.toFixed(1)} (${r.ratingCount})` : "—"}
                        </td>

                        {/* Images count */}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {r.images?.length || 0} photo{r.images?.length !== 1 ? "s" : ""}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          {deletingId === r._id ? (
                            // Inline confirm/cancel
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600">Delete?</span>
                              <button
                                onClick={() => handleDelete(r._id)}
                                disabled={deleteLoading}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {deleteLoading ? "…" : "Yes"}
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/restrooms/${r._id}/edit`)}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingId(r._id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-4 p-4 lg:hidden">
                {filtered.map((r) => (
                  <div key={r._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">{r.name}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{r.city}, {r.district}</p>
                        <p className="text-xs text-slate-400">{r.province}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${CONDITION_BADGE[r.condition] || CONDITION_BADGE.GOOD}`}>
                        {r.condition?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/restrooms/${r._id}/edit`)}
                        className="flex-1 rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(r._id)}
                        className="flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    {/* Mobile inline confirm */}
                    {deletingId === r._id && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-2">
                        <span className="flex-1 text-xs text-red-700">Confirm delete?</span>
                        <button onClick={() => handleDelete(r._id)} disabled={deleteLoading}
                          className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                          {deleteLoading ? "…" : "Yes"}
                        </button>
                        <button onClick={() => setDeletingId(null)}
                          className="rounded bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
