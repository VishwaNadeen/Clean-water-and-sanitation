// restroom service — fetches from our backend and OpenStreetMap Overpass API

import API_BASE_URL from "../config/api";

// fetch all restrooms with optional city/district/province filters
export async function fetchAllRestrooms(filters = {}) {
  const params = new URLSearchParams();
  if (filters.city)     params.set("city",     filters.city);
  if (filters.district) params.set("district", filters.district);
  if (filters.province) params.set("province", filters.province);

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${API_BASE_URL}/restrooms${query}`);
  if (!res.ok) throw new Error("Failed to load restrooms from server.");
  return res.json(); // returns plain array
}

// fetch a single restroom by id
export async function fetchRestroomById(id) {
  const res = await fetch(`${API_BASE_URL}/restrooms/${id}`);
  if (!res.ok) throw new Error("Restroom not found.");
  return res.json();
}

// fetch restrooms within radius metres of a point (default 2 km)
export async function fetchNearbyRestrooms(lat, lng, radius = 2000) {
  const res = await fetch(
    `${API_BASE_URL}/restrooms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Failed to fetch nearby restrooms.");
  return res.json(); // plain array
}

// fetch community-mapped toilets from OpenStreetMap for the current map bounds
export async function fetchOsmToilets(bounds) {
  const { south, west, north, east } = bounds;

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

  // normalise OSM elements
  return data.elements
    .filter((el) => el.lat !== undefined && el.lon !== undefined)
    .map((el) => ({
      id:   el.id,
      lat:  el.lat,
      lng:  el.lon,
      name: el.tags?.name || "Public Toilet",
      fee:  el.tags?.fee === "yes",
      access: el.tags?.access || "public",
      opening_hours: el.tags?.opening_hours || null,
    }));
}

// submit a star rating for a restroom
export async function submitRestroomRating(restroomId, rating) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/restrooms/${restroomId}/rate`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit rating.");
  return data;
}

// get current user's rating for a restroom (null if not rated)
export async function fetchMyRestroomRating(restroomId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/restrooms/${restroomId}/my-rating`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) return { rating: null };
  return res.json();
}

