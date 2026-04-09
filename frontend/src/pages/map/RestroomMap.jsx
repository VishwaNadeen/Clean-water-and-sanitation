/**
 * RestroomMap.jsx
 *
 * Public map page — accessible with or without login.
 * Route: /rest-rooms
 *
 * What this page does:
 *   1. Shows an OpenStreetMap base layer (via Leaflet)
 *   2. Plots ALL of OUR restrooms (from our backend API) as teal dots
 *   3. Fetches existing public toilets from OpenStreetMap (Overpass API)
 *      and shows them as grey dots — so users see community-mapped locations too
 *   4. "Locate Me" button:
 *        - asks the browser for the user's GPS position
 *        - calls our /api/restrooms/nearby to find closest facilities
 *        - flies the map to the user's location
 *        - highlights nearby restrooms with a larger, brighter ring
 *   5. Clicking a OUR restroom marker → shows RestroomDetailPanel on the right
 *   6. Clicking an OSM toilet marker  → shows a simple Leaflet popup
 *
 * Map library: react-leaflet v4  (install: npm install leaflet react-leaflet)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,   // Root component — creates the Leaflet map instance
  TileLayer,      // Renders map tiles from a URL template (we use OSM)
  CircleMarker,   // A circle drawn on the map — avoids Leaflet icon image issues
  Circle,         // A circle whose radius is in METRES — used for accuracy ring
  Popup,          // Tooltip that appears when a marker is clicked
  useMap,         // Hook: access the Leaflet map instance inside MapContainer
  useMapEvents,   // Hook: attach Leaflet event listeners inside MapContainer
} from "react-leaflet";

// Leaflet's own CSS — REQUIRED, otherwise the map renders broken
import "leaflet/dist/leaflet.css";

import RestroomDetailPanel from "../../components/map/RestroomDetailPanel";
import {
  fetchAllRestrooms,
  fetchNearbyRestrooms,
  fetchOsmToilets,
} from "../../services/restroomService";

// ─── Default map centre & zoom ────────────────────────────────────────────────
// Sri Lanka geographic centre — adjust if needed
const SRI_LANKA_CENTER = [7.8731, 80.7718];
const DEFAULT_ZOOM     = 8;

// ─── Minimum zoom to fetch OSM toilets ───────────────────────────────────────
// Below this zoom there are too many results → Overpass API would be slow
const OSM_FETCH_MIN_ZOOM = 13;

// ─── Marker visual configs ────────────────────────────────────────────────────
const MARKER = {
  // Our restrooms — teal to match the app's water theme
  ours: {
    normal:  { radius: 10, fillColor: "#14b8a6", color: "#0f766e", fillOpacity: 0.9, weight: 2 },
    nearby:  { radius: 14, fillColor: "#2dd4bf", color: "#14b8a6", fillOpacity: 1,   weight: 3 },
  },
  // OSM public toilets — neutral grey
  osm: { radius: 6, fillColor: "#94a3b8", color: "#64748b", fillOpacity: 0.7, weight: 1.5 },
  // User's live location — blue dot
  user: { radius: 8, fillColor: "#3b82f6", color: "#ffffff", fillOpacity: 1, weight: 2 },
};

// ─── MapController ────────────────────────────────────────────────────────────
/**
 * This MUST be a child of <MapContainer> because react-leaflet hooks
 * (useMap, useMapEvents) only work inside the MapContainer context.
 *
 * Responsibilities:
 *   • Listens for "moveend" (pan/zoom finished) to re-fetch OSM toilets
 *   • Receives a `flyTo` target and executes the smooth fly animation
 */
function MapController({ onBoundsChange, flyTo }) {
  const map = useMap();

  // Fire once when the map first loads so OSM toilets appear immediately
  // without the user needing to pan or zoom first
  useEffect(() => {
    const bounds = map.getBounds();
    const zoom   = map.getZoom();
    onBoundsChange(bounds, zoom);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When `flyTo` prop changes...
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 1.5 });
    }
  }, [flyTo, map]);


  // Fired every time the user finishes panning or zooming
  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom   = map.getZoom();
      onBoundsChange(bounds, zoom);
    },
  });

  return null; // This component has no visible output
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function RestroomMap() {
  // ── State ────────────────────────────────────────────────────────────────
  const [ourRestrooms,     setOurRestrooms]     = useState([]);        // from our API
  const [osmToilets,       setOsmToilets]       = useState([]);        // from Overpass
  const [userLocation,     setUserLocation]     = useState(null);      // { lat, lng, accuracy }
  const [flyTo,            setFlyTo]            = useState(null);      // triggers map flyTo
  const [nearbyIds,        setNearbyIds]        = useState(new Set()); // Set of _id strings
  const [selectedRestroom, setSelectedRestroom] = useState(null);      // for detail panel

  const [loadingOurs,   setLoadingOurs]   = useState(true);
  const [loadingOsm,    setLoadingOsm]    = useState(false);
  const [locating,      setLocating]      = useState(false);  // "Locate Me" spinner
  const [locationError, setLocationError] = useState(null);
  const [osmError,      setOsmError]      = useState(null);

  // Ref to debounce the OSM fetch on map movement
  const osmDebounceTimer = useRef(null);

  // ── Load OUR restrooms once on mount ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllRestrooms();
        setOurRestrooms(data);
      } catch (err) {
        console.error("Could not load restrooms:", err);
      } finally {
        setLoadingOurs(false);
      }
    })();
  }, []);

  // ── OSM toilet fetch (called when map bounds change) ─────────────────────
  /**
   * Called by MapController's moveend listener.
   * We debounce by 800 ms so we don't spam Overpass on every small pan.
   * We also skip if zoom is too low (too many results).
   */
  const handleBoundsChange = useCallback((bounds, zoom) => {
    // Clear any pending debounce
    if (osmDebounceTimer.current) clearTimeout(osmDebounceTimer.current);

    if (zoom < OSM_FETCH_MIN_ZOOM) {
      // Zoom out → clear OSM markers to avoid clutter
      setOsmToilets([]);
      return;
    }

    osmDebounceTimer.current = setTimeout(async () => {
      setLoadingOsm(true);
      setOsmError(null);
      try {
        const toilets = await fetchOsmToilets({
          south: bounds.getSouth(),
          west:  bounds.getWest(),
          north: bounds.getNorth(),
          east:  bounds.getEast(),
        });
        setOsmToilets(toilets);
      } catch (err) {
        // Non-critical — OSM is supplementary; don't break the UI
        setOsmError("Could not load community toilet data.");
        console.warn("Overpass API error:", err);
      } finally {
        setLoadingOsm(false);
      }
    }, 800); // 800 ms debounce
  }, []);

  // ── "Locate Me" handler ───────────────────────────────────────────────────
  /**
   * 1. Ask the browser for the user's GPS coordinates
   * 2. Store as userLocation (with accuracy) so markers appear on the map
   * 3. Call our backend nearby endpoint
   * 4. Collect the returned restroom IDs into nearbyIds (for highlight styling)
   * 5. Set flyTo to animate the map camera to the user's position
   */
  async function handleLocateMe() {
    setLocationError(null);
    setLocating(true);

    // The Geolocation API is asynchronous — wrap in a promise for async/await
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    ).catch((err) => {
      setLocationError(
        err.code === 1
          ? "Location permission denied. Please allow location access."
          : "Could not get your location. Try again."
      );
      setLocating(false);
      return null;
    });

    if (!position) return;

    const lat      = position.coords.latitude;
    const lng      = position.coords.longitude;
    const accuracy = position.coords.accuracy; // accuracy radius in metres

    // Store lat, lng AND accuracy so the accuracy circle can be drawn on the map
    setUserLocation({ lat, lng, accuracy });
    setFlyTo({ lat, lng }); // tells MapController to fly the map

    try {
      // 2 km search radius — matches our backend default
      const nearby = await fetchNearbyRestrooms(lat, lng, 2000);
      // Store just the IDs so marker rendering can quickly check membership
      setNearbyIds(new Set(nearby.map((r) => r._id)));
    } catch (err) {
      console.warn("Nearby fetch failed:", err);
    } finally {
      setLocating(false);
    }
  }

  // ── Legend visibility toggle ──────────────────────────────────────────────
  const [legendOpen, setLegendOpen] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    /*
     * Outer wrapper fills the space between Navbar and Footer.
     * `relative` is required so that the detail panel (absolute positioned)
     * is clipped to this container.
     */
    <div className="relative" style={{ height: "calc(100vh - 72px)" }}>

      {/* ── Loading overlay ──────────────────────────────────────────────── */}
      {loadingOurs && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-950/80">
          <div className="flex flex-col items-center gap-3">
            {/* Simple CSS spinner */}
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 text-sm">Loading restrooms…</p>
          </div>
        </div>
      )}

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
      >
        {/* ── OpenStreetMap tile layer ──────────────────────────────────── */}
        {/*
         * {z}/{x}/{y} are Leaflet placeholders filled automatically.
         * attribution is required by OSM's usage policy.
         */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* ── MapController — handles events + flyTo ────────────────────── */}
        <MapController
          onBoundsChange={handleBoundsChange}
          flyTo={flyTo}
        />

        {/* ── OUR restroom markers (teal) ───────────────────────────────── */}
        {ourRestrooms.map((restroom) => {
          const [rLng, rLat] = restroom.location.coordinates; // GeoJSON = [lng, lat]
          const isNearby = nearbyIds.has(restroom._id);
          const style    = isNearby ? MARKER.ours.nearby : MARKER.ours.normal;

          return (
            <CircleMarker
              key={restroom._id}
              center={[rLat, rLng]}
              {...style}
              pathOptions={{ cursor: "pointer" }}
              eventHandlers={{
                click: () => setSelectedRestroom(restroom),
              }}
            >
              <Popup>
                <div style={{ minWidth: 140 }}>
                  <strong>{restroom.name}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {restroom.city}, {restroom.district}
                  </span>
                  <br />
                  <button
                    onClick={() => setSelectedRestroom(restroom)}
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#14b8a6",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ── OSM toilet markers (grey) ─────────────────────────────────── */}
        {/*
         * These are NOT from our database — community-mapped toilets from
         * OpenStreetMap. No admin-managed data (condition, rating, etc.).
         */}
        {osmToilets.map((toilet) => (
          <CircleMarker
            key={`osm-${toilet.id}`}
            center={[toilet.lat, toilet.lng]}
            {...MARKER.osm}
          >
            <Popup>
              <div style={{ minWidth: 130 }}>
                <strong style={{ fontSize: 13 }}>🚻 {toilet.name}</strong>
                <br />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  Community-mapped toilet
                </span>
                {toilet.fee && (
                  <p style={{ fontSize: 11, color: "#f97316", margin: "4px 0 0" }}>
                    ⚠ Fee required
                  </p>
                )}
                {toilet.opening_hours && (
                  <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>
                    🕐 {toilet.opening_hours}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ── User location markers ─────────────────────────────────────── */}
        {userLocation && (
          <>
            {/*
             * Circle radius is in METRES (unlike CircleMarker which is pixels).
             * This draws the real accuracy uncertainty area from the browser.
             * Large circle = poor accuracy (laptop/WiFi); small = good (mobile GPS).
             */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.10,
                weight: 1,
              }}
            />

            {/* Solid blue dot — the reported position centre */}
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              {...MARKER.user}
            >
              <Popup>
                <div style={{ fontSize: 13 }}>
                  <strong>📍 Your location</strong><br />
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Accuracy: ±{Math.round(userLocation.accuracy)} metres
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* ── Floating UI controls ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-[999] flex flex-col gap-2">

        {/* Page title chip */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-2 shadow-lg">
          <p className="text-white font-semibold text-sm">🚻 Restroom Map</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {ourRestrooms.length} verified facilit{ourRestrooms.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {/* "Locate Me" button */}
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg transition-colors"
        >
          {locating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Locating…
            </>
          ) : (
            <>📍 Locate Me</>
          )}
        </button>

        {/* Location / permission error */}
        {locationError && (
          <div className="bg-red-900/80 border border-red-700 rounded-xl px-3 py-2 max-w-[220px]">
            <p className="text-red-300 text-xs">{locationError}</p>
          </div>
        )}

        {/*
         * Accuracy warning — shown when the browser reports poor accuracy.
         * Common on desktops/laptops that have no GPS chip and fall back
         * to WiFi triangulation or IP address geolocation.
         */}
        {userLocation && userLocation.accuracy > 500 && (
          <div className="bg-yellow-900/80 border border-yellow-700 rounded-xl px-3 py-2 max-w-[220px]">
            <p className="text-yellow-300 text-xs font-medium">⚠ Low accuracy</p>
            <p className="text-yellow-400 text-xs mt-0.5">
              ±{Math.round(userLocation.accuracy)}m — your device has no GPS.
              Location estimated from WiFi or IP address.
            </p>
          </div>
        )}

        {/* OSM fetch status */}
        {loadingOsm && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2">
            <p className="text-slate-400 text-xs">Loading community toilets…</p>
          </div>
        )}
        {osmError && !loadingOsm && (
          <div className="bg-yellow-900/60 border border-yellow-700/50 rounded-xl px-3 py-2">
            <p className="text-yellow-400 text-xs">{osmError}</p>
          </div>
        )}
      </div>

      {/* ── Map legend ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-4 z-[999]">
        <button
          onClick={() => setLegendOpen((o) => !o)}
          className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-lg mb-1"
        >
          {legendOpen ? "▼" : "▲"} Legend
        </button>

        {legendOpen && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{ background: "#14b8a6", borderColor: "#0f766e" }}
              />
              <span className="text-xs text-slate-300">Our verified restroom</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-5 h-5 rounded-full border-2 flex-shrink-0"
                style={{ background: "#2dd4bf", borderColor: "#14b8a6" }}
              />
              <span className="text-xs text-slate-300">Near you (within 2 km)</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: "#94a3b8" }}
              />
              <span className="text-xs text-slate-300">Community-mapped toilet (OSM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full border-2 border-white flex-shrink-0"
                style={{ background: "#3b82f6" }}
              />
              <span className="text-xs text-slate-300">Your location</span>
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-700">
              Zoom in to level 13+ to see<br />community toilet data.
            </p>
          </div>
        )}
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────────── */}
      {selectedRestroom && (
        <RestroomDetailPanel
          restroom={selectedRestroom}
          onClose={() => setSelectedRestroom(null)}
          isNearby={nearbyIds.has(selectedRestroom._id)}
        />
      )}
    </div>
  );
}
