import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../components/staffManagement/DashboardLayout";
import {
  getAllSchedules,
  assignSchedule,
  approveSchedule,
  rejectSchedule,
  cancelSchedule,
} from "../../../services/staffManagementService";
import staffApi from "../../../services/staffManagementService";

const pageStyle = {
  padding: "24px",
  background: "#f8fafc",
  minHeight: "100vh",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "18px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

export default function Schedules() {
  const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    staffId: "",
    taskType: "Cleaning",
    restroomId: "",
    restroomLabel: "",
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    managerNote: "",
    issueId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scheduleRes, staffRes] = await Promise.all([
        getAllSchedules(),
        staffApi.get("/manager/staff"),
      ]);

      setSchedules(scheduleRes || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error("Failed to load schedules page", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        restroomId: form.restroomId || undefined,
        issueId: form.issueId || undefined,
      };

      await assignSchedule(payload);
      alert("Schedule assigned successfully");

      setForm({
        staffId: "",
        taskType: "Cleaning",
        restroomId: "",
        restroomLabel: "",
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        managerNote: "",
        issueId: "",
      });

      await loadData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to assign schedule");
    }
  };

  const handleApprove = async (id) => {
    const note = prompt("Manager review note (optional):") || "";
    try {
      await approveSchedule(id, note);
      await loadData();
      alert("Schedule approved");
    } catch (error) {
      alert(error?.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    const note = prompt("Reason for rejection:") || "";
    try {
      await rejectSchedule(id, note);
      await loadData();
      alert("Schedule rejected");
    } catch (error) {
      alert(error?.response?.data?.message || "Rejection failed");
    }
  };

  const handleCancel = async (id) => {
    const ok = window.confirm("Are you sure you want to cancel this schedule?");
    if (!ok) return;

    try {
      await cancelSchedule(id);
      await loadData();
      alert("Schedule cancelled");
    } catch (error) {
      alert(error?.response?.data?.message || "Cancel failed");
    }
  };

  const content = (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "6px" }}>Schedules</h2>
      <p style={{ color: "#64748b", marginBottom: "22px" }}>
        Assign work and manage schedule review.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Assign Schedule</h3>

          <form onSubmit={handleSubmit}>
            <FormGroup label="Staff">
              <select
                name="staffId"
                value={form.staffId}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Select staff</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName} - {staff.role}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Task Type">
              <select
                name="taskType"
                value={form.taskType}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
              </select>
            </FormGroup>

            <FormGroup label="Title">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </FormGroup>

            <FormGroup label="Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </FormGroup>

            <FormGroup label="Start Time">
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </FormGroup>

            <FormGroup label="End Time">
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </FormGroup>

            <FormGroup label="Restroom ID">
              <input
                type="text"
                name="restroomId"
                value={form.restroomId}
                onChange={handleChange}
                style={inputStyle}
              />
            </FormGroup>

            <FormGroup label="Restroom Label">
              <input
                type="text"
                name="restroomLabel"
                value={form.restroomLabel}
                onChange={handleChange}
                style={inputStyle}
              />
            </FormGroup>

            <FormGroup label="Issue ID">
              <input
                type="text"
                name="issueId"
                value={form.issueId}
                onChange={handleChange}
                style={inputStyle}
              />
            </FormGroup>

            <FormGroup label="Manager Note">
              <textarea
                name="managerNote"
                value={form.managerNote}
                onChange={handleChange}
                style={textareaStyle}
                rows="3"
              />
            </FormGroup>

            <button type="submit" style={buttonStyle}>
              Assign Schedule
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>All Schedules</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e2e8f0" }}>
                  <th style={thStyle}>Staff</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Task</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item._id}>
                    <td style={tdStyle}>{item.staffId?.fullName || item.staffName || "N/A"}</td>
                    <td style={tdStyle}>{item.title}</td>
                    <td style={tdStyle}>{item.taskType}</td>
                    <td style={tdStyle}>{new Date(item.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{item.startTime} - {item.endTime}</td>
                    <td style={tdStyle}>{item.status}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {item.status === "Completed" && (
                          <>
                            <button style={miniGreenBtn} onClick={() => handleApprove(item._id)}>
                              Approve
                            </button>
                            <button style={miniRedBtn} onClick={() => handleReject(item._id)}>
                              Reject
                            </button>
                          </>
                        )}

                        {!["Verified", "Cancelled"].includes(item.status) && (
                          <button style={miniGrayBtn} onClick={() => handleCancel(item._id)}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan="7">No schedules found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout
        title="Schedules"
        subtitle="Assign work and manage schedule review."
      >
        <div style={{ padding: "24px" }}>Loading schedules...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Schedules"
      subtitle="Assign work and manage schedule review."
    >
      {content}
    </DashboardLayout>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
};

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
};

const buttonStyle = {
  padding: "12px 18px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const miniGreenBtn = {
  padding: "6px 10px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const miniRedBtn = {
  padding: "6px 10px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const miniGrayBtn = {
  padding: "6px 10px",
  background: "#64748b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  border: "1px solid #cbd5e1",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #e2e8f0",
};
