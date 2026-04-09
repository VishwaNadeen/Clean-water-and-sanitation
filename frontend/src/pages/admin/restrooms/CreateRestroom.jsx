/**
 * CreateRestroom.jsx
 *
 * Admin form to create a new restroom.
 * Route: /admin/restrooms/create
 *
 * Flow:
 *  1. Select Province (dropdown) → map flies to that province
 *  2. Select District (dropdown filtered by selected province)
 *  3. Type city name (typeahead filtered by selected district)
 *  4. Enter restroom name + condition
 *  5. Click on the map → lat/lng auto-filled
 *  6. Optionally upload images (max 5)
 *  7. Submit → POST /api/restrooms
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { fetchProvinces, fetchDistricts, fetchCities } from "../../../services/locationService";
import { adminCreateRestroom } from "../../../services/restroomAdminService";

// ─── Approximate province centres for Sri Lanka ───────────────────────────────
// Used to fly the map when admin selects a province.
// Keys are matched case-insensitively against the province name from the DB.
const PROVINCE_CENTERS = {
  western:      { lat: 6.9271,  lng: 79.8612, zoom: 11 },
  central:      { lat: 7.2906,  lng: 80.6337, zoom: 11 },
  southern:     { lat: 6.0535,  lng: 80.2210, zoom: 11 },
  northern:     { lat: 9.6615,  lng: 80.0255, zoom: 11 },
  eastern:      { lat: 7.8731,  lng: 81.6729, zoom: 11 },
  "north western": { lat: 7.4675, lng: 80.3590, zoom: 11 },
  "north central": { lat: 8.3114, lng: 80.4037, zoom: 11 },
  uva:          { lat: 6.9934,  lng: 81.0550, zoom: 11 },
  sabaragamuwa: { lat: 6.6828,  lng: 80.3992, zoom: 11 },
};

// Match province name to centre coordinates (partial, case-insensitive)
function getProvinceCenter(provinceName) {
  const lower = provinceName.toLowerCase();
  for (const [key, center] of Object.entries(PROVINCE_CENTERS)) {
    if (lower.includes(key)) return center;
  }
  // Default — Sri Lanka centre
  return { lat: 7.8731, lng: 80.7718, zoom: 8 };
}

// ─── Map sub-components ───────────────────────────────────────────────────────

// FlyTo: flies the map when the `target` prop changes
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom || 13, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

// MapClickHandler: fires onPick(lat, lng) when admin clicks on the map
function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CreateRestroom() {
  const navigate = useNavigate();

  // ── Form fields ────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [lat,       setLat]       = useState("");
  const [lng,       setLng]       = useState("");
  const [images,    setImages]    = useState([]); // File objects

  // ── Location state (cascading) ─────────────────────────────────────────────
  const [provinces,        setProvinces]        = useState([]);
  const [districts,        setDistricts]        = useState([]);
  const [citySuggestions,  setCitySuggestions]  = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null); // { _id, name }
  const [selectedDistrict, setSelectedDistrict] = useState(null); // { _id, name }
  const [cityInput,        setCityInput]        = useState("");    // typed city name
  const [cityOpen,         setCityOpen]         = useState(false); // dropdown open

  // ── Map state ──────────────────────────────────────────────────────────────
  const [flyTo,      setFlyTo]      = useState(null); // { lat, lng, zoom }
  const [markerPos,  setMarkerPos]  = useState(null); // { lat, lng } — clicked pin

  // ── UI state ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // ── Load provinces once on mount ───────────────────────────────────────────
  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => setError("Could not load provinces"));
  }, []);

  // ── When province changes → load its districts, reset district/city ────────
  async function handleProvinceChange(e) {
    const provinceId = e.target.value;
    if (!provinceId) {
      setSelectedProvince(null);
      setDistricts([]);
      setSelectedDistrict(null);
      setCityInput("");
      return;
    }

    const province = provinces.find((p) => p._id === provinceId);
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setCityInput("");

    // Fly the map to this province's approximate centre
    setFlyTo(getProvinceCenter(province.name));

    try {
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
    } catch {
      setError("Could not load districts");
    }
  }

  // ── When district changes → reset city ────────────────────────────────────
  function handleDistrictChange(e) {
    const districtId = e.target.value;
    if (!districtId) {
      setSelectedDistrict(null);
      setCityInput("");
      return;
    }
    const district = districts.find((d) => d._id === districtId);
    setSelectedDistrict(district);
    setCityInput("");
    setCitySuggestions([]);
  }

  // ── City typeahead — fetch suggestions as admin types ─────────────────────
  const handleCityInput = useCallback(
    async (value) => {
      setCityInput(value);
      if (!selectedDistrict || value.trim().length < 1) {
        setCitySuggestions([]);
        setCityOpen(false);
        return;
      }
      try {
        const results = await fetchCities(selectedDistrict._id, value);
        setCitySuggestions(results);
        setCityOpen(results.length > 0);
      } catch {
        setCitySuggestions([]);
      }
    },
    [selectedDistrict]
  );

  // ── Map click → set lat/lng and place marker ───────────────────────────────
  function handleMapPick(pickedLat, pickedLng) {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
    setMarkerPos({ lat: pickedLat, lng: pickedLng });
  }

  // ── Image file picker (max 5) ─────────────────────────────────────────────
  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!selectedProvince) return setError("Please select a province");
    if (!selectedDistrict) return setError("Please select a district");
    if (!cityInput.trim())  return setError("Please enter a city name");
    if (!lat || !lng)       return setError("Please click on the map to set the location");

    setSubmitting(true);
    try {
      await adminCreateRestroom(
        {
          name:     name.trim(),
          city:     cityInput.trim(),
          district: selectedDistrict.name,
          province: selectedProvince.name,
          lat,
          lng,
          condition,
        },
        images
      );
      navigate("/admin/restrooms");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/restrooms")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add New Restroom</h1>
            <p className="text-sm text-slate-500">Fill in the details and click on the map to set the location</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">

          {/* ── Left column — form fields ──────────────────────────────── */}
          <div className="space-y-5">

            {/* Restroom name */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Basic Info
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Restroom Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Galle Face Green Public Restroom"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="GOOD">Good</option>
                    <option value="OK">OK</option>
                    <option value="BAD">Bad</option>
                    <option value="OUT_OF_ORDER">Out of Order</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location dropdowns */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Location
              </h2>

              <div className="space-y-4">
                {/* Province */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleProvinceChange}
                    defaultValue=""
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="" disabled>Select province…</option>
                    {provinces.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleDistrictChange}
                    value={selectedDistrict?._id || ""}
                    disabled={!selectedProvince}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="" disabled>
                      {selectedProvince ? "Select district…" : "Select province first"}
                    </option>
                    {districts.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* City — typeahead */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                    onFocus={() => citySuggestions.length > 0 && setCityOpen(true)}
                    placeholder={selectedDistrict ? "Type city name…" : "Select district first"}
                    disabled={!selectedDistrict}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  {/* Suggestions dropdown */}
                  {cityOpen && (
                    <ul className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                      {citySuggestions.map((c) => (
                        <li
                          key={c._id}
                          onMouseDown={() => {
                            setCityInput(c.name);
                            setCityOpen(false);
                          }}
                          className="cursor-pointer px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Coordinates — auto-filled from map click */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Coordinates
              </h2>
              <p className="mb-4 text-xs text-slate-400">Click anywhere on the map to set the exact position</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    readOnly
                    placeholder="Click map…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    readOnly
                    placeholder="Click map…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Photos (optional)
              </h2>
              <p className="mb-3 text-xs text-slate-400">Up to 5 images, max 5 MB each</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {images.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">{images.length} file{images.length > 1 ? "s" : ""} selected</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Restroom"}
            </button>
          </div>

          {/* ── Right column — map ─────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200" style={{ height: 580 }}>
            <div className="bg-white px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-700">📍 Click on the map to set restroom location</p>
              <p className="text-xs text-slate-400 mt-0.5">Select province first to zoom in automatically</p>
            </div>
            <MapContainer
              center={[7.8731, 80.7718]}
              zoom={8}
              style={{ width: "100%", height: "calc(100% - 56px)" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Flies to province centre when province is selected */}
              <FlyTo target={flyTo} />

              {/* Listens for map clicks to pick lat/lng */}
              <MapClickHandler onPick={handleMapPick} />

              {/* Red marker at the picked position */}
              {markerPos && (
                <CircleMarker
                  center={[markerPos.lat, markerPos.lng]}
                  radius={10}
                  fillColor="#ef4444"
                  color="#ffffff"
                  fillOpacity={1}
                  weight={2}
                />
              )}
            </MapContainer>
          </div>
        </form>
      </div>
    </div>
  );
}
