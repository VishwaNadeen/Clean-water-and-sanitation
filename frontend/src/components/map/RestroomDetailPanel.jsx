/**
 * RestroomDetailPanel.jsx
 *
 * A slide-in panel rendered on top of the map (absolutely positioned)
 * when the user clicks one of OUR restroom markers.
 *
 * Props:
 *   restroom  {Object|null} – the selected restroom document from our API
 *   onClose   {Function}    – called when the user dismisses the panel
 *   isNearby  {boolean}     – true if this restroom is in the "nearby" result set
 */

// ─── Condition badge colours ──────────────────────────────────────────────────
// Maps the condition enum value to Tailwind classes for the badge.
const CONDITION_STYLES = {
  GOOD:         { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Good" },
  OK:           { bg: "bg-yellow-500/20",  text: "text-yellow-400",  border: "border-yellow-500/30",  label: "OK"   },
  BAD:          { bg: "bg-orange-500/20",  text: "text-orange-400",  border: "border-orange-500/30",  label: "Bad"  },
  OUT_OF_ORDER: { bg: "bg-red-500/20",     text: "text-red-400",     border: "border-red-500/30",     label: "Out of Order" },
};

// ─── Star rating helper ───────────────────────────────────────────────────────
/**
 * Renders up to 5 star icons filled according to `rating`.
 * Uses Unicode characters so no extra icon library is needed.
 */
function StarRating({ rating = 0, count = 0 }) {
  const filled = Math.round(rating); // round to nearest whole star
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= filled ? "text-yellow-400" : "text-slate-600"}
            style={{ fontSize: 16 }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-slate-400">
        {rating > 0 ? `${rating.toFixed(1)} (${count})` : "No ratings yet"}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RestroomDetailPanel({ restroom, onClose, isNearby }) {
  // Nothing to render if no restroom is selected
  if (!restroom) return null;

  const condition = CONDITION_STYLES[restroom.condition] ?? CONDITION_STYLES.GOOD;

  // Build a Google Maps directions URL using the restroom's coordinates
  // Coordinates are stored as [lng, lat] in GeoJSON format
  const [lng, lat] = restroom.location?.coordinates ?? [0, 0];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    /*
     * Outer wrapper:
     *   - `absolute` so it overlays the map
     *   - `right-0 top-0 bottom-0` → right edge, full height
     *   - `z-[1000]` → above Leaflet UI (Leaflet default z-indexes are < 1000)
     *   - `w-80` = 320 px panel width (shrinks on small screens with sm:w-80)
     */
    <div className="absolute right-0 top-0 bottom-0 z-[1000] w-full sm:w-80 flex flex-col bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-700">
        <div className="flex-1 min-w-0">
          {/* Restroom name */}
          <h2 className="text-white font-semibold text-base leading-tight truncate">
            {restroom.name}
          </h2>

          {/* Province / District / City breadcrumb */}
          <p className="mt-1 text-xs text-slate-400 truncate">
            {restroom.province} › {restroom.district} › {restroom.city}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 space-y-4">

        {/* Nearby badge — shown only when this restroom is in the nearby result */}
        {isNearby && (
          <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-2">
            <span className="text-sky-400 text-sm">📍</span>
            <span className="text-sky-400 text-xs font-medium">Near your location</span>
          </div>
        )}

        {/* Condition badge */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condition</p>
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${condition.bg} ${condition.text} ${condition.border}`}
          >
            {/* Small colour dot to reinforce the badge */}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                restroom.condition === "GOOD" ? "bg-emerald-400" :
                restroom.condition === "OK"   ? "bg-yellow-400"  :
                restroom.condition === "BAD"  ? "bg-orange-400"  : "bg-red-400"
              }`}
            />
            {condition.label}
          </span>
        </div>

        {/* Rating */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rating</p>
          <StarRating rating={restroom.avgRating} count={restroom.ratingCount} />
        </div>

        {/* GPS coordinates (useful for verification / debugging) */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Coordinates</p>
          <p className="text-xs text-slate-300 font-mono">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>

        {/* Source indicator */}
                {/* Images — shown only if admin has uploaded photos of this restroom */}
        {restroom.images && restroom.images.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Photos</p>
            <div className="grid grid-cols-2 gap-2">
              {restroom.images.map((img, index) => (
                <a
                  key={img.publicId || index}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Opens full image in new tab when clicked
                  className="block rounded-lg overflow-hidden border border-slate-700 hover:border-teal-500 transition-colors"
                >
                  <img
                    src={img.url}
                    alt={`${restroom.name} photo ${index + 1}`}
                    className="w-full h-24 object-cover"
                    // Cloudinary supports transformations via URL params
                    // This shows a 300px wide thumbnail to keep load fast
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Source indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-2">
          <span className="text-teal-400 text-sm">🚻</span>
          <span className="text-teal-300 text-xs">Verified facility in our database</span>
        </div>

      </div>

      {/* ── Footer actions ──────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-700 space-y-2">

        {/*
         * "Get Directions" opens Google Maps in a new tab.
         * The link is built from the restroom's stored coordinates.
         */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors"
        >
          <span>🗺️</span>
          Get Directions
        </a>

        {/*
         * "Report Complaint" navigates to the complaint-reporting flow.
         * The restroom ID is passed as a query param so the form can pre-fill it.
         * (The issue-reporting page is built by another team member — just linking to it.)
         */}
        <a
          href={`/complaints/report?restroomId=${restroom._id}&restroomName=${encodeURIComponent(restroom.name)}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors"
        >
          <span>⚠️</span>
          Report a Complaint
        </a>
      </div>
    </div>
  );
}
