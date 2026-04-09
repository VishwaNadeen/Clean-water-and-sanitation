/**
 * EditRestroom.jsx
 *
 * Admin form to edit an existing restroom.
 * Route: /admin/restrooms/:id/edit
 *
 * Features:
 *  - Pre-fills all fields from the existing restroom document
 *  - Shows existing images as thumbnails — each has an X to mark for deletion
 *  - Allows uploading additional images
 *  - Clicking map updates lat/lng
 *  - Submits PUT /api/restrooms/:id with FormData
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { fetchProvinces, fetchDistricts, fetchCities } from "../../../services/locationService";
import {
  adminUpdateRestroom,
} from "../../../services/restroomAdminService";

import API_BASE_URL from "../../../config/api";


// FlyTo and MapClickHandler — same as CreateRestroom
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom || 13, { duration: 1.2 });
  }, [target, map]);
  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function EditRestroom() {
  const { id } = useParams(); // restroom MongoDB _id from URL
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [lat,       setLat]       = useState("");
  const [lng,       setLng]       = useState("");

  // ── Location state ─────────────────────────────────────────────────────────
  const [provinces,       setProvinces]       = useState([]);
  const [districts,       setDistricts]       = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [cityInput,        setCityInput]        = useState("");
  const [cityOpen,         setCityOpen]         = useState(false);

  // ── Image state ────────────────────────────────────────────────────────────
  const [existingImages, setExistingImages] = useState([]); // from DB
  const [markedForDelete, setMarkedForDelete] = useState([]); // publicIds to delete
  const [newImages,       setNewImages]       = useState([]); // new File objects

  // ── Map state ──────────────────────────────────────────────────────────────
  const [flyTo,     setFlyTo]     = useState(null);
  const [markerPos, setMarkerPos] = useState(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // ── Load existing restroom data on mount ───────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Fetch the restroom directly (public endpoint)
        const res = await fetch(`${API_BASE_URL}/restrooms/${id}`);
        if (!res.ok) throw new Error("Restroom not found");
        const r = await res.json();

        // Pre-fill text fields
        setName(r.name || "");
        setCondition(r.condition || "GOOD");
        setCityInput(r.city || "");

        // Pre-fill coordinates from GeoJSON [lng, lat]
        const [rLng, rLat] = r.location?.coordinates ?? [0, 0];
        setLat(String(rLat));
        setLng(String(rLng));
        setMarkerPos({ lat: rLat, lng: rLng });
        setFlyTo({ lat: rLat, lng: rLng, zoom: 14 });

        // Pre-fill existing images
        setExistingImages(r.images || []);

        // Load provinces then match existing province/district
        const allProvinces = await fetchProvinces();
        setProvinces(allProvinces);

        // Find matching province by name
        const matchedProvince = allProvinces.find(
          (p) => p.name.toLowerCase() === (r.province || "").toLowerCase()
        );
        if (matchedProvince) {
          setSelectedProvince(matchedProvince);

          // Load districts for that province
          const allDistricts = await fetchDistricts(matchedProvince._id);
          setDistricts(allDistricts);

          // Find matching district
          const matchedDistrict = allDistricts.find(
            (d) => d.name.toLowerCase() === (r.district || "").toLowerCase()
          );
          if (matchedDistrict) setSelectedDistrict(matchedDistrict);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Province change ────────────────────────────────────────────────────────
  async function handleProvinceChange(e) {
    const provinceId = e.target.value;
    const province = provinces.find((p) => p._id === provinceId);
    setSelectedProvince(province || null);
    setSelectedDistrict(null);
    setCityInput("");
    if (!province) return;
    try {
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
    } catch {
      setError("Could not load districts");
    }
  }

  // ── District change ────────────────────────────────────────────────────────
  function handleDistrictChange(e) {
    const district = districts.find((d) => d._id === e.target.value);
    setSelectedDistrict(district || null);
    setCityInput("");
    setCitySuggestions([]);
  }

  // ── City typeahead ─────────────────────────────────────────────────────────
  const handleCityInput = useCallback(async (value) => {
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
  }, [selectedDistrict]);

  // ── Map click ──────────────────────────────────────────────────────────────
  function handleMapPick(pickedLat, pickedLng) {
    setLat(pickedLat.toFixed(6));
    setLng(pickedLng.toFixed(6));
    setMarkerPos({ lat: pickedLat, lng: pickedLng });
  }

  // ── Image deletion toggle ──────────────────────────────────────────────────
  // Marks/unmarks an existing image's publicId for deletion on submit
  function toggleDeleteImage(publicId) {
    setMarkedForDelete((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId]
    );
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!lat || !lng) return setError("Please set the location by clicking on the map");

    setSubmitting(true);
    try {
      await adminUpdateRestroom(
        id,
        {
          name:     name.trim(),
          city:     cityInput.trim(),
          district: selectedDistrict?.name,
          province: selectedProvince?.name,
          lat,
          lng,
          condition,
        },
        newImages,
        markedForDelete
      );
      navigate("/admin/restrooms");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Loading restroom…</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-800">Edit Restroom</h1>
            <p className="text-sm text-slate-500">Update details, manage images, or reposition on the map</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">

          {/* ── Left column ────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Basic info */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Basic Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Restroom Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
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

            {/* Location */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Location</h2>
              <div className="space-y-4">
                {/* Province */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Province</label>
                  <select
                    value={selectedProvince?._id || ""}
                    onChange={handleProvinceChange}
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
                  <select
                    value={selectedDistrict?._id || ""}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvince}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="" disabled>Select district…</option>
                    {districts.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* City typeahead */}
                <div className="relative">
                  <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onBlur={() => setTimeout(() => setCityOpen(false), 150)}
                    onFocus={() => citySuggestions.length > 0 && setCityOpen(true)}
                    placeholder="Type city name…"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  {cityOpen && (
                    <ul className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                      {citySuggestions.map((c) => (
                        <li
                          key={c._id}
                          onMouseDown={() => { setCityInput(c.name); setCityOpen(false); }}
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

            {/* Coordinates */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Coordinates</h2>
              <p className="mb-3 text-xs text-slate-400">Click the map to reposition</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Latitude</label>
                  <input type="text" value={lat} readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-700" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Longitude</label>
                  <input type="text" value={lng} readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-700" />
                </div>
              </div>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Current Photos</h2>
                <p className="mb-3 text-xs text-slate-400">Click ✕ to mark an image for deletion on save</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img) => {
                    const isMarked = markedForDelete.includes(img.publicId);
                    return (
                      <div key={img.publicId} className="relative rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={img.url}
                          alt="restroom"
                          className={`h-20 w-full object-cover transition ${isMarked ? "opacity-30" : ""}`}
                        />
                        {/* X button to toggle deletion */}
                        <button
                          type="button"
                          onClick={() => toggleDeleteImage(img.publicId)}
                          className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition ${
                            isMarked
                              ? "bg-green-500 text-white"  // click again to restore
                              : "bg-red-500 text-white"
                          }`}
                          title={isMarked ? "Undo — keep this image" : "Mark for deletion"}
                        >
                          {isMarked ? "↩" : "✕"}
                        </button>
                        {isMarked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded bg-red-600/80 px-1.5 py-0.5 text-xs font-semibold text-white">Delete</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {markedForDelete.length > 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    {markedForDelete.length} image{markedForDelete.length > 1 ? "s" : ""} will be deleted on save
                  </p>
                )}
              </div>
            )}

            {/* Add new images */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">Add More Photos</h2>
              <p className="mb-3 text-xs text-slate-400">
                Max {5 - (existingImages.length - markedForDelete.length)} more (5 total limit)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewImages(Array.from(e.target.files).slice(0, 5))}
                className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {newImages.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">{newImages.length} new file{newImages.length > 1 ? "s" : ""} selected</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* ── Right column — map ─────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200" style={{ height: 580 }}>
            <div className="bg-white px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-700">📍 Click map to reposition</p>
              <p className="text-xs text-slate-400 mt-0.5">Current pin shows existing location</p>
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
              <FlyTo target={flyTo} />
              <MapClickHandler onPick={handleMapPick} />
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
