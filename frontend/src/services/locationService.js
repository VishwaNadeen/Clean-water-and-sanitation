/**
 * locationService.js
 *
 * Fetches Province, District, City data from our backend.
 * Used by the admin restroom form cascading dropdowns + city type-ahead.
 */

import API_BASE_URL from "../config/api";

// Fetch all provinces — called once when the form mounts
export async function fetchProvinces() {
  const res = await fetch(`${API_BASE_URL}/locations/provinces`);
  if (!res.ok) throw new Error("Failed to load provinces");
  return res.json(); // [{ _id, name, code }]
}

// Fetch districts under a selected province
export async function fetchDistricts(provinceId) {
  const res = await fetch(`${API_BASE_URL}/locations/districts?provinceId=${provinceId}`);
  if (!res.ok) throw new Error("Failed to load districts");
  return res.json(); // [{ _id, name, code, provinceId }]
}

// Fetch cities under a selected district, with optional search query
// q is the text the admin has typed — backend does partial match
export async function fetchCities(districtId, q = "") {
  const params = new URLSearchParams({ districtId });
  if (q) params.set("q", q);
  const res = await fetch(`${API_BASE_URL}/locations/cities?${params}`);
  if (!res.ok) throw new Error("Failed to load cities");
  return res.json(); // [{ _id, name, districtId, provinceId }]
}
