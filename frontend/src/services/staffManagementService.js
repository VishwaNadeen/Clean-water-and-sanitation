import axios from "axios";
import API_BASE_URL from "../config/api";

const staffApi = axios.create({
  baseURL: API_BASE_URL,
});

staffApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// manager
// =========================
export const getManagerStaff = async () => {
  const res = await staffApi.get("/staff");
  return Array.isArray(res.data?.staff) ? res.data.staff : [];
};

export const getStaffProfile = async (id) => {
  const res = await staffApi.get(`/staff/${id}`);
  return res.data?.staff || null;
};

export const getRestrooms = async (params = {}) => {
  const res = await staffApi.get("/restrooms", { params });
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllSchedules = async (params = {}) => {
  const res = await staffApi.get("/manager/work-schedules", { params });
  return res.data;
};

export const getSingleSchedule = async (id) => {
  const res = await staffApi.get(`/manager/work-schedules/${id}`);
  return res.data;
};

export const assignSchedule = async (payload) => {
  const res = await staffApi.post("/manager/work-schedules", payload);
  return res.data;
};

export const editSchedule = async (id, payload) => {
  const res = await staffApi.put(`/manager/work-schedules/${id}`, payload);
  return res.data;
};

export const cancelSchedule = async (id) => {
  const res = await staffApi.patch(`/manager/work-schedules/${id}/cancel`);
  return res.data;
};

export const approveSchedule = async (id, managerReviewNote = "") => {
  const res = await staffApi.patch(`/manager/work-schedules/${id}/approve`, {
    managerReviewNote,
  });
  return res.data;
};

export const rejectSchedule = async (id, managerReviewNote = "") => {
  const res = await staffApi.patch(`/manager/work-schedules/${id}/reject`, {
    managerReviewNote,
  });
  return res.data;
};
export const assignIssueToStaff = async (issueId, payload) => {
  const res = await staffApi.post(`/manager/issue-assign/${issueId}/assign`, payload);
  return res.data;
};
// =========================
// staff
// =========================
export const getMySchedules = async () => {
  const res = await staffApi.get("/staff/work-schedules/me");
  return res.data;
};

export const startWork = async (id) => {
  const res = await staffApi.patch(`/staff/work-schedules/${id}/start`);
  return res.data;
};

export const revertStartWork = async (id) => {
  const res = await staffApi.patch(`/staff/work-schedules/${id}/revert-start`);
  return res.data;
};

export const uploadProof = async (id, file) => {
  const formData = new FormData();
  formData.append("proof", file);

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/staff/work-schedules/${id}/proof`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to upload proof");
  }

  return data;
};

export const completeWork = async (id, payload) => {
  const res = await staffApi.patch(`/staff/work-schedules/${id}/complete`, payload);
  return res.data;
};

export default staffApi;
