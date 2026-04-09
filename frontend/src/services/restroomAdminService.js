/**
 * restroomAdminService.js
 *
 * Admin-only API calls for restroom CRUD.
 * All functions require a JWT token (admin role).
 *
 * Uses FormData (not JSON) because requests include file uploads.
 */

import API_BASE_URL from "../config/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

/**
 * Create a new restroom.
 * @param {Object} fields  - { name, city, district, province, lat, lng, condition }
 * @param {File[]} images  - array of File objects (max 5)
 */
export async function adminCreateRestroom(fields, images = []) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val);
  });
  images.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_BASE_URL}/restrooms`, {
    method: "POST",
    headers: {
      // Do NOT set Content-Type — browser sets it automatically with
      // the correct multipart boundary when body is FormData
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create restroom");
  return data;
}

/**
 * Update an existing restroom.
 * @param {string} id           - restroom MongoDB _id
 * @param {Object} fields       - partial fields to update
 * @param {File[]} newImages    - new File objects to upload
 * @param {string[]} deleteIds  - Cloudinary publicIds to delete
 */
export async function adminUpdateRestroom(id, fields, newImages = [], deleteIds = []) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined && val !== null) formData.append(key, val);
  });
  newImages.forEach((file) => formData.append("images", file));
  if (deleteIds.length > 0) formData.append("deleteImageIds", deleteIds.join(","));

  const res = await fetch(`${API_BASE_URL}/restrooms/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update restroom");
  return data;
}

/**
 * Delete a restroom and its Cloudinary images.
 * @param {string} id - restroom MongoDB _id
 */
export async function adminDeleteRestroom(id) {
  const res = await fetch(`${API_BASE_URL}/restrooms/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete restroom");
  return data;
}

/**
 * Fetch all restrooms — public endpoint, no token needed.
 */
export async function adminFetchAllRestrooms() {
  const res = await fetch(`${API_BASE_URL}/restrooms`);
  if (!res.ok) throw new Error("Failed to load restrooms");
  return res.json();
}
