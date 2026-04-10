// Admin restroom list — photo grid with search, edit, and delete

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminFetchAllRestrooms,
  adminDeleteRestroom,
} from "../../../services/restroomAdminService";

const CONDITION_BADGE = {
  GOOD:         "bg-green-50 text-green-700 border-green-200",
  OK:           "bg-yellow-50 text-yellow-700 border-yellow-200",
  BAD:          "bg-orange-50 text-orange-700 border-orange-200",
  OUT_OF_ORDER: "bg-red-50 text-red-700 border-red-200",
};

export default function RestroomList() {
  const navigate = useNavigate();

  const [restrooms,     setRestrooms]     = useState([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [deletingId,    setDeletingId]    = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadRestrooms(); }, []);

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

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return restrooms;
    return restrooms.filter((r) =>
      [r.name, r.city, r.district, r.province]
        .some((field) => String(field || "").toLowerCase().includes(kw))
    );
  }, [restrooms, search]);

  async function handleDelete(id) {
    try {
      setDeleteLoading(true);
      await adminDeleteRestroom(id);
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

        {/* header */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Restroom Management</h1>
              <p className="mt-1 text-sm text-slate-500">
                Create, edit and delete public restroom locations.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search by name, city, district…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-72"
              />
              <button
                onClick={() => navigate("/admin/restrooms/create")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 whitespace-nowrap"
              >
                + Add Restroom
              </button>
            </div>
          </div>
        </div>

        {/* summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total",            value: restrooms.length,                                                                    colour: "text-slate-800" },
            { label: "Good",             value: restrooms.filter((r) => r.condition === "GOOD").length,                              colour: "text-green-600" },
            { label: "Needs Attention",  value: restrooms.filter((r) => ["BAD", "OUT_OF_ORDER"].includes(r.condition)).length,       colour: "text-red-600"   },
            { label: "Search Results",   value: filtered.length,                                                                     colour: "text-blue-600"  },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h2 className={`mt-2 text-3xl font-bold ${card.colour}`}>{card.value}</h2>
            </div>
          ))}
        </div>

        {/* restroom grid */}
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-slate-500">Loading restrooms…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">No restrooms found</p>
              <p className="mt-1 text-sm text-slate-400">
                {search ? "Try a different search term." : "Click '+ Add Restroom' to get started."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((r) => {
              const photo = r.images?.[0]?.url || null;
              const badge = CONDITION_BADGE[r.condition] || CONDITION_BADGE.GOOD;
              const isDeleting = deletingId === r._id;

              return (
                <div key={r._id} className={`flex flex-col rounded-2xl shadow-sm overflow-hidden transition hover:shadow-md ring-1 ${
                  r.condition === "OUT_OF_ORDER"
                    ? "bg-red-50 ring-red-300"
                    : r.condition === "BAD"
                    ? "bg-orange-50 ring-orange-300"
                    : "bg-white ring-slate-200"
                }`}>

                  {/* cover photo */}
                  {photo ? (
                    <img
                      src={photo}
                      alt={r.name}
                      className="h-44 w-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-44 w-full bg-slate-100 flex items-center justify-center">
                      <span className="text-5xl">🚻</span>
                    </div>
                  )}

                  {/* card info */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800 leading-tight line-clamp-2">{r.name}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${badge}`}>
                        {r.condition?.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p>{r.city}</p>
                      <p className="text-slate-400">{r.district}, {r.province}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {r.avgRating > 0 ? `★ ${r.avgRating.toFixed(1)} (${r.ratingCount})` : "No ratings"}
                      </span>
                      <span>
                        {r.images?.length || 0} photo{r.images?.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* extra photos strip */}
                    {r.images?.length > 1 && (
                      <div className="flex gap-1 overflow-x-auto">
                        {r.images.slice(1).map((img, i) => (
                          <img
                            key={img.publicId || i}
                            src={img.url}
                            alt={`photo ${i + 2}`}
                            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ))}
                      </div>
                    )}

                    {/* edit / delete actions */}
                    <div className="mt-auto pt-1">
                      {isDeleting ? (
                        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2">
                          <span className="flex-1 text-xs text-red-700 font-medium">Delete?</span>
                          <button
                            onClick={() => handleDelete(r._id)}
                            disabled={deleteLoading}
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                          >
                            {deleteLoading ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/restrooms/${r._id}/edit`)}
                            className="flex-1 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingId(r._id)}
                            className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
