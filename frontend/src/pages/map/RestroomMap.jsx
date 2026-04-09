/**
 * RestroomMap.jsx
 *
 * Google Maps-style layout with on-map routing via OSRM (free, no API key).
 * Route: /rest-rooms (public — no login required)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Marker,
  Popup,
  Polyline,       // draws the route line on the map
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  fetchAllRestrooms,
  fetchNearbyRestrooms,
  fetchOsmToilets,
} from "../../services/restroomService";

// ─── Constants ────────────────────────────────────────────────────────────────
const SRI_LANKA_CENTER   = [7.8731, 80.7718];
const DEFAULT_ZOOM       = 8;
const OSM_FETCH_MIN_ZOOM = 13;

const CONDITION_STYLES = {
  GOOD:         { label: "Good",         bg: "bg-emerald-100", text: "text-emerald-700" },
  OK:           { label: "OK",           bg: "bg-yellow-100",  text: "text-yellow-700"  },
  BAD:          { label: "Bad",          bg: "bg-orange-100",  text: "text-orange-700"  },
  OUT_OF_ORDER: { label: "Out of Order", bg: "bg-red-100",     text: "text-red-700"     },
};

const MARKER = {
  osm:  { radius: 6, fillColor: "#94a3b8", color: "#64748b", fillOpacity: 0.7, weight: 1.5 },
  user: { radius: 8, fillColor: "#3b82f6", color: "#ffffff", fillOpacity: 1,   weight: 2   },
};

// ─── Route helpers ────────────────────────────────────────────────────────────
function formatDistance(metres) {
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

// ─── Dynamic toilet icon — scales with zoom ───────────────────────────────────
function makeToiletIcon(zoom, isNearby = false) {
  let size;
  if      (zoom <= 8)  size = isNearby ? 12 : 10;
  else if (zoom <= 10) size = isNearby ? 16 : 14;
  else if (zoom <= 12) size = isNearby ? 20 : 18;
  else if (zoom <= 14) size = isNearby ? 26 : 22;
  else                 size = isNearby ? 32 : 28;

  const box = size + 4;
  return L.divIcon({
    html: `<span style="font-size:${size}px;line-height:1;display:block;">🚻</span>`,
    className: "",
    iconSize:   [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor:[0, -(box / 2)],
  });
}

// ─── RouteFitter — fits map to show the full route after it loads ─────────────
// Must live inside <MapContainer> to use the useMap hook.
function RouteFitter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 1) {
      map.fitBounds(coords, { padding: [60, 80] });
    }
  }, [coords, map]);
  return null;
}

// ─── MapController ────────────────────────────────────────────────────────────
function MapController({ onBoundsChange, flyTo }) {
  const map = useMap();

  useEffect(() => {
    onBoundsChange(map.getBounds(), map.getZoom());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1.2 });
  }, [flyTo, map]);

  useMapEvents({
    moveend: () => onBoundsChange(map.getBounds(), map.getZoom()),
  });

  return null;
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function Stars({ rating = 0, count = 0 }) {
  if (rating <= 0) return <span className="text-xs text-slate-400">No ratings yet</span>;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm font-bold text-slate-700">{rating.toFixed(1)}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} style={{ fontSize: 13 }}
            className={s <= filled ? "text-yellow-400" : "text-slate-300"}>★</span>
        ))}
      </div>
      <span className="text-xs text-slate-400">({count})</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RestroomMap() {
  const navigate = useNavigate();

  const [ourRestrooms,     setOurRestrooms]     = useState([]);
  const [osmToilets,       setOsmToilets]       = useState([]);
  const [userLocation,     setUserLocation]     = useState(null);
  const [flyTo,            setFlyTo]            = useState(null);
  const [nearbyIds,        setNearbyIds]        = useState(new Set());
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [mapZoom,          setMapZoom]          = useState(DEFAULT_ZOOM);
  const [search,           setSearch]           = useState("");

  // ── Routing state ──
  const [route,        setRoute]        = useState(null);  // [[lat,lng], ...] for Polyline
  const [routeInfo,    setRouteInfo]    = useState(null);  // { distance, duration }
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError,   setRouteError]   = useState(null);

  const [loadingOurs,   setLoadingOurs]   = useState(true);
  const [loadingOsm,    setLoadingOsm]    = useState(false);
  const [locating,      setLocating]      = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [osmError,      setOsmError]      = useState(null);

  const osmDebounceTimer = useRef(null);

  const toiletIcon       = useMemo(() => makeToiletIcon(mapZoom, false), [mapZoom]);
  const toiletIconNearby = useMemo(() => makeToiletIcon(mapZoom, true),  [mapZoom]);

  // Load our restrooms once
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

  // Client-side search filter
  const filteredRestrooms = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return ourRestrooms;
    return ourRestrooms.filter((r) =>
      [r.name, r.city, r.district, r.province]
        .some((f) => String(f || "").toLowerCase().includes(kw))
    );
  }, [ourRestrooms, search]);

  // OSM fetch + zoom tracking
  const handleBoundsChange = useCallback((bounds, zoom) => {
    setMapZoom(zoom);
    if (osmDebounceTimer.current) clearTimeout(osmDebounceTimer.current);
    if (zoom < OSM_FETCH_MIN_ZOOM) { setOsmToilets([]); return; }

    osmDebounceTimer.current = setTimeout(async () => {
      setLoadingOsm(true);
      setOsmError(null);
      try {
        const toilets = await fetchOsmToilets({
          south: bounds.getSouth(), west: bounds.getWest(),
          north: bounds.getNorth(), east: bounds.getEast(),
        });
        setOsmToilets(toilets);
      } catch {
        setOsmError("Could not load community toilet data.");
      } finally {
        setLoadingOsm(false);
      }
    }, 800);
  }, []);

  // Locate Me
  async function handleLocateMe() {
    setLocationError(null);
    setLocating(true);

    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, timeout: 10000,
      })
    ).catch((err) => {
      setLocationError(
        err.code === 1 ? "Location permission denied." : "Could not get your location."
      );
      setLocating(false);
      return null;
    });

    if (!position) return;

    const lat      = position.coords.latitude;
    const lng      = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    setUserLocation({ lat, lng, accuracy });
    setFlyTo({ lat, lng, zoom: 15 });

    try {
      const nearby = await fetchNearbyRestrooms(lat, lng, 2000);
      setNearbyIds(new Set(nearby.map((r) => r._id)));
    } catch {
      // non-critical
    } finally {
      setLocating(false);
    }
  }

  // Select restroom — fly map + show detail
  function handleSelectRestroom(restroom) {
    setSelectedRestroom(restroom);
    clearRoute();
    const [rLng, rLat] = restroom.location.coordinates;
    setFlyTo({ lat: rLat, lng: rLng, zoom: 16 });
  }

  // Report Issue — check login first
  function handleReportIssue() {
    const url = `/report-issue?restroomId=${selectedRestroom._id}&restroomName=${encodeURIComponent(selectedRestroom.name)}`;
    if (!isLoggedIn()) {
      navigate("/login", {
        state: {
          message: "Please login before raising an issue.",
          redirect: url,
        },
      });
    } else {
      navigate(url);
    }
  }

  // Clear route
  function clearRoute() {
    setRoute(null);
    setRouteInfo(null);
    setRouteError(null);
  }

  // ── Get directions via OSRM (free, no API key) ────────────────────────────
  // OSRM is an open-source routing engine using OpenStreetMap road data.
  // The public demo server handles driving routes worldwide at no cost.
  async function handleGetDirections() {
    setRouteError(null);
    clearRoute();
    setLoadingRoute(true);

    // Step 1: get user location if not already available
    let fromLat, fromLng;

    if (userLocation) {
      fromLat = userLocation.lat;
      fromLng = userLocation.lng;
    } else {
      // Ask the browser for location
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 10000,
        })
      ).catch(() => null);

      if (!position) {
        setRouteError("Allow location access so we can route from your position.");
        setLoadingRoute(false);
        return;
      }

      fromLat = position.coords.latitude;
      fromLng = position.coords.longitude;
      setUserLocation({
        lat: fromLat,
        lng: fromLng,
        accuracy: position.coords.accuracy,
      });
    }

    // Step 2: destination is the selected restroom
    const [destLng, destLat] = selectedRestroom.location.coordinates;

    // Step 3: call OSRM routing API
    // coords are lng,lat (GeoJSON order) — OSRM expects {lon},{lat}
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${destLng},${destLat}` +
      `?overview=full&geometries=geojson`;

    try {
      const res  = await fetch(url);
      const data = await res.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No route found between these points.");
      }

      const osrmRoute = data.routes[0];

      // OSRM returns GeoJSON coordinates as [lng, lat]
      // Leaflet <Polyline> expects [lat, lng] — swap them
      const polylineCoords = osrmRoute.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      setRoute(polylineCoords);
      setRouteInfo({
        distance: osrmRoute.distance, // metres
        duration: osrmRoute.duration, // seconds
      });
    } catch (err) {
      setRouteError(
        err.message.includes("No route")
          ? "No drivable route found. Roads may not connect to this location."
          : "Routing service unavailable. Try again shortly."
      );
    } finally {
      setLoadingRoute(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex" style={{ height: "calc(100vh - 72px)" }}>

      {/* ════════════════════════════════════════════════════════════════════
          LEFT PANEL
      ════════════════════════════════════════════════════════════════════ */}
      <div className="w-96 flex-shrink-0 flex flex-col bg-white shadow-xl z-10 border-r border-slate-200">

        {/* Search + Locate bar */}
        <div className="p-3 border-b border-slate-200">
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restrooms, city, district…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            )}
          </div>

          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-sm font-semibold transition-colors"
          >
            {locating ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Locating…</>
            ) : <>📍 Near me</>}
          </button>
          {locationError && <p className="mt-1.5 text-xs text-red-500 text-center">{locationError}</p>}
        </div>

        {/* ── DETAIL VIEW ── */}
        {selectedRestroom ? (
          <div className="flex-1 overflow-y-auto">

            <button
              onClick={() => { setSelectedRestroom(null); clearRoute(); }}
              className="flex items-center gap-1 px-4 pt-3 pb-1 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to results
            </button>

            {/* Hero image */}
            {selectedRestroom.images?.length > 0 ? (
              <img src={selectedRestroom.images[0].url} alt={selectedRestroom.name}
                className="w-full h-44 object-cover"
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                <span className="text-6xl">🚻</span>
              </div>
            )}

            <div className="px-4 py-4 space-y-4">

              {/* Name */}
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  {selectedRestroom.name}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Public restroom · {selectedRestroom.city}, {selectedRestroom.district}
                </p>
              </div>

              {/* Rating + nearby */}
              <div className="flex items-center gap-3 flex-wrap">
                <Stars rating={selectedRestroom.avgRating} count={selectedRestroom.ratingCount} />
                {nearbyIds.has(selectedRestroom._id) && (
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
                    📍 Near you
                  </span>
                )}
              </div>

              {/* Condition */}
              {(() => {
                const c = CONDITION_STYLES[selectedRestroom.condition] ?? CONDITION_STYLES.GOOD;
                return (
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
                    {c.label}
                  </span>
                );
              })()}

              <hr className="border-slate-100" />

              {/* Address */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5 flex-shrink-0">📍</span>
                <div className="text-sm">
                  <p className="font-medium text-slate-700">{selectedRestroom.province}</p>
                  <p className="text-slate-500">{selectedRestroom.district} · {selectedRestroom.city}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* ── Action buttons ── */}
              <div className="grid grid-cols-2 gap-2">

                {/* Directions — uses our map, not Google Maps */}
                <button
                  onClick={handleGetDirections}
                  disabled={loadingRoute}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 disabled:opacity-60 transition-colors"
                >
                  {loadingRoute ? (
                    <span className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-2xl">🗺️</span>
                  )}
                  <span className="text-xs font-semibold text-blue-700">
                    {loadingRoute ? "Routing…" : "Directions"}
                  </span>
                </button>

                <button
                  onClick={handleReportIssue}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-2xl">⚠️</span>
                  <span className="text-xs font-semibold text-slate-600">Report Issue</span>
                </button>
              </div>

              {/* ── Route result card ── */}
              {routeInfo && (
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-800">🗺️ Route found</p>
                    <button
                      onClick={clearRoute}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Clear ✕
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚗</span>
                      <div>
                        <p className="text-base font-bold text-blue-900">
                          {formatDistance(routeInfo.distance)}
                        </p>
                        <p className="text-xs text-blue-600">
                          ~{formatDuration(routeInfo.duration)} by car
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-blue-500 mt-2">
                    Route shown on the map. Road data from OpenStreetMap.
                  </p>
                </div>
              )}

              {/* Route error */}
              {routeError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">⚠ {routeError}</p>
                </div>
              )}

              {/* Photos grid */}
              {selectedRestroom.images?.length > 0 && (
                <>
                  <hr className="border-slate-100" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Photos ({selectedRestroom.images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {selectedRestroom.images.map((img, i) => (
                        <a key={img.publicId || i} href={img.url} target="_blank" rel="noopener noreferrer"
                          className="block rounded-xl overflow-hidden">
                          <img src={img.url} alt={`photo ${i + 1}`}
                            className="w-full h-20 object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => { e.target.style.display = "none"; }} />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        ) : (
          /* ── LIST VIEW ── */
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {loadingOurs ? "Loading…" : `${filteredRestrooms.length} result${filteredRestrooms.length !== 1 ? "s" : ""}`}
                {nearbyIds.size > 0 && <span className="ml-2 text-blue-500 font-medium">· {nearbyIds.size} near you</span>}
              </p>
              {osmError && <span className="text-xs text-amber-500">⚠ OSM unavailable</span>}
            </div>

            {loadingOurs ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : filteredRestrooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <span className="text-4xl mb-2">🚻</span>
                <p className="text-sm">No restrooms found</p>
                {search && <button onClick={() => setSearch("")} className="mt-2 text-xs text-blue-500 underline">Clear search</button>}
              </div>
            ) : (
              filteredRestrooms.map((r, index) => {
                const isNearby = nearbyIds.has(r._id);
                const cond     = CONDITION_STYLES[r.condition] ?? CONDITION_STYLES.GOOD;

                return (
                  <button key={r._id} onClick={() => handleSelectRestroom(r)}
                    className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 active:bg-blue-50 transition-colors"
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                        isNearby ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {isNearby ? "📍" : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{r.name}</p>
                        {r.avgRating > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-sm font-bold text-slate-700">{r.avgRating.toFixed(1)}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((s) => (
                                <span key={s} style={{ fontSize: 11 }}
                                  className={s <= Math.round(r.avgRating) ? "text-yellow-400" : "text-slate-300"}>★</span>
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">({r.ratingCount})</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Public restroom · {r.city}, {r.district}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cond.bg} ${cond.text}`}>
                            {cond.label}
                          </span>
                          {r.images?.length > 0 && <span className="text-xs text-slate-400">📷 {r.images.length}</span>}
                          {isNearby && <span className="text-xs text-blue-500 font-semibold">Near you</span>}
                        </div>
                      </div>
                      <span className="text-slate-300 text-lg mt-1 flex-shrink-0">›</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Footer legend */}
        <div className="border-t border-slate-200 px-4 py-2 bg-slate-50 flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
          <span>🚻 Our restroom</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />OSM toilet
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-400" />You
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT — MAP
      ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative">
        {loadingOurs && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/60">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <MapContainer center={SRI_LANKA_CENTER} zoom={DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          <MapController onBoundsChange={handleBoundsChange} flyTo={flyTo} />

          {/* Fit map to route when route loads */}
          {route && <RouteFitter coords={route} />}

          {/* ── Route polyline ── */}
          {route && (
            <Polyline
              positions={route}
              pathOptions={{
                color:   "#2563eb",   // blue route line
                weight:  5,
                opacity: 0.85,
                lineJoin: "round",
                lineCap:  "round",
              }}
            />
          )}

          {/* Our restrooms */}
          {ourRestrooms.map((restroom) => {
            const [rLng, rLat] = restroom.location.coordinates;
            const isNearby     = nearbyIds.has(restroom._id);

            return (
              <Marker key={restroom._id} position={[rLat, rLng]}
                icon={isNearby ? toiletIconNearby : toiletIcon}
                eventHandlers={{ click: () => handleSelectRestroom(restroom) }}
              >
                <Popup>
                  <div style={{ minWidth: 130 }}>
                    <strong>{restroom.name}</strong><br />
                    <span style={{ fontSize: 12, color: "#64748b" }}>{restroom.city}, {restroom.district}</span><br />
                    <button onClick={() => handleSelectRestroom(restroom)}
                      style={{ marginTop: 6, fontSize: 12, color: "#2563eb",
                        background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      View details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* OSM toilets */}
          {osmToilets.map((toilet) => (
            <CircleMarker key={`osm-${toilet.id}`} center={[toilet.lat, toilet.lng]} {...MARKER.osm}>
              <Popup>
                <div style={{ minWidth: 120 }}>
                  <strong style={{ fontSize: 13 }}>🚽 {toilet.name}</strong><br />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Community-mapped</span>
                  {toilet.fee && <p style={{ fontSize: 11, color: "#f97316", margin: "3px 0 0" }}>⚠ Fee required</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* User location */}
          {userLocation && (
            <>
              <Circle center={[userLocation.lat, userLocation.lng]} radius={userLocation.accuracy}
                pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.10, weight: 1 }} />
              <CircleMarker center={[userLocation.lat, userLocation.lng]} {...MARKER.user}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <strong>📍 Your location</strong><br />
                    <span style={{ fontSize: 11, color: "#64748b" }}>±{Math.round(userLocation.accuracy)} metres</span>
                  </div>
                </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>

        {/* Low accuracy warning */}
        {userLocation && userLocation.accuracy > 500 && (
          <div className="absolute top-3 right-3 z-[999] bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 shadow-md max-w-[200px]">
            <p className="text-yellow-700 text-xs font-semibold">⚠ Low GPS accuracy</p>
            <p className="text-yellow-600 text-xs mt-0.5">±{Math.round(userLocation.accuracy)}m — estimated from WiFi/IP</p>
          </div>
        )}

        {/* OSM loading */}
        {loadingOsm && (
          <div className="absolute bottom-6 right-3 z-[999] bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow text-xs text-slate-500 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
            Loading community toilets…
          </div>
        )}
      </div>
    </div>
  );
}
