import API_BASE_URL from "../config/api";
import { getToken } from "../utils/auth";

function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function getIssueCategoriesDropdown() {
  const response = await fetch(`${API_BASE_URL}/categories/dropdown`);
  const data = await parseResponse(
    response,
    "Failed to fetch issue categories."
  );

  return data?.data || [];
}

export async function getSubCategoriesByCategory(categoryId) {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/subcategories`
  );
  const data = await parseResponse(
    response,
    "Failed to fetch subcategories."
  );

  return data?.data || [];
}

export async function getRestroomsByLocation({ province, district, city } = {}) {
  const params = new URLSearchParams();

  if (province) params.set("province", province);
  if (district) params.set("district", district);
  if (city) params.set("city", city);

  const query = params.toString();
  const url = query
    ? `${API_BASE_URL}/restrooms?${query}`
    : `${API_BASE_URL}/restrooms`;

  const response = await fetch(url);

  return parseResponse(response, "Failed to fetch restrooms.");
}

export async function createIssue(payload) {
  const isFormData = payload instanceof FormData;

  const response = await fetch(`${API_BASE_URL}/issues`, {
    method: "POST",
    headers: isFormData
      ? getAuthHeaders()
      : getAuthHeaders({ "Content-Type": "application/json" }),
    body: isFormData ? payload : JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create issue.");
}

export async function getMyIssues(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  const url = query
    ? `${API_BASE_URL}/issues/user?${query}`
    : `${API_BASE_URL}/issues/user`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Failed to fetch your issues.");
}

export async function getAllIssues(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  const url = query
    ? `${API_BASE_URL}/issues/admin?${query}`
    : `${API_BASE_URL}/issues/admin`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response, "Failed to fetch all issues.");
}

export async function getIssueById(issueId) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}`);

  return parseResponse(response, "Failed to fetch issue details.");
}

export async function updateIssue(issueId, payload) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to update issue.");
}
