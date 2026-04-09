/**
 * restroomService.js
 *
 * Handles all data-fetching for the Restroom feature:
 *   1. Our own backend  → /api/restrooms
 *   2. OpenStreetMap    → Overpass API (existing public toilets in the area)
 *
 * No auth token is needed — all read endpoints are public.
 */

import API_BASE_URL from "../config/api";

// ─────────────────────────────────────────────
// 1. OUR BACKEND
// ─────────────────────────────────────────────

/**
 * Fetch ALL restrooms we have in our database.
 * Optionally filter by city, district, or province.
 *
 * @param {{ city?: string, district?: string, province?: string }} filters
 * @returns {Promise<Array>} array of restroom objects
 */
export async function fetchAllRestrooms(filters = {}) {
  // Build query string from any provided filters
  const params = new URLSearchParams();
  if (filters.city)     params.set("city",     filters.city);
  if (filters.district) params.set("district", filters.district);
  if (filters.province) params.set("province", filters.province);

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${API_BASE_URL}/restrooms${query}`);
  if (!res.ok) throw new Error("Failed to load restrooms from server.");
  return res.json(); // returns plain array
}

/**
 * Fetch a single restroom by its MongoDB _id.
 *
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object>} restroom object
 */
export async function fetchRestroomById(id) {
  const res = await fetch(`${API_BASE_URL}/restrooms/${id}`);
  if (!res.ok) throw new Error("Restroom not found.");
  return res.json();
}

/**
 * Fetch restrooms near a geographic point.
 * Used after "Locate Me" to highlight closest restrooms.
 *
 * @param {number} lat      - user's latitude
 * @param {number} lng      - user's longitude
 * @param {number} radius   - search radius in metres (default 2000 = 2 km)
 * @returns {Promise<Array>} array of nearby restroom objects
 */
export async function fetchNearbyRestrooms(lat, lng, radius = 2000) {
  const res = await fetch(
    `${API_BASE_URL}/restrooms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Failed to fetch nearby restrooms.");
  return res.json(); // plain array
}

// ─────────────────────────────────────────────
// 2. OPENSTREETMAP — OVERPASS API
// ─────────────────────────────────────────────

/**
 * Fetch publicly mapped toilet locations from OpenStreetMap
 * for the current map viewport (bounding box).
 *
 * Only called when zoom ≥ 13 to avoid fetching millions of points.
 *
 * Overpass QL query explained:
 *   [out:json]          → response format
 *   [timeout:20]        → abort if it takes longer than 20 s
 *   node["amenity"="toilets"](south,west,north,east)
 *                       → find all OSM nodes tagged as toilets inside the box
 *   out center;         → return each node's coordinates
 *
 * @param {{ south: number, west: number, north: number, east: number }} bounds
 * @returns {Promise<Array<{ id, lat, lng, tags }>}
 */
export async function fetchOsmToilets(bounds) {
  const { south, west, north, east } = bounds;

  // Build the Overpass QL query string
  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="toilets"](${south},${west},${north},${east});
    );
    out center;
  `;

  const res = await fetch("https://overpass.kumi.systems/api/interpreter", {
    method: "POST",
    body: query,
  });

  if (!res.ok) throw new Error("Overpass API request failed.");

  const data = await res.json();

  // Normalise each OSM element into a simple { id, lat, lng, tags } shape
  return data.elements
    .filter((el) => el.lat !== undefined && el.lon !== undefined)
    .map((el) => ({
      id:   el.id,
      lat:  el.lat,
      lng:  el.lon,
      name: el.tags?.name || "Public Toilet",          // OSM name tag (often missing)
      fee:  el.tags?.fee === "yes",                     // whether it charges a fee
      access: el.tags?.access || "public",             // access level
      opening_hours: el.tags?.opening_hours || null,   // opening hours if tagged
    }));
}
