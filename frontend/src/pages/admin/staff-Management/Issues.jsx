import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../components/staffManagement/DashboardLayout";
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

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [assignData, setAssignData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issueRes, staffRes] = await Promise.all([
        staffApi.get("/issues"),
        staffApi.get("/manager/staff"),
      ]);

      setIssues(issueRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error("Failed to load issues", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (issueId, field, value) => {
    setAssignData((prev) => ({
      ...prev,
      [issueId]: {
        ...prev[issueId],
        [field]: value,
      },
    }));
  };

  const handleAssign = async (issue) => {
    const data = assignData[issue._id] || {};

    try {
      await staffApi.post(`/manager/issue-assign/${issue._id}/assign`, {
        staffId: data.staffId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title,
        issueTaskType: data.issueTaskType,
        restroomId: data.restroomId || undefined,
        restroomLabel: data.restroomLabel || "",
        managerNote: data.managerNote || "",
      });

      alert("Issue assigned successfully");
      await loadData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to assign issue");
    }
  };

  const content = (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "6px" }}>Issues</h2>
      <p style={{ color: "#64748b", marginBottom: "22px" }}>
        Assign issues to staff according to task type.
      </p>

      <div style={{ display: "grid", gap: "18px" }}>
        {issues.length === 0 ? (
          <div style={cardStyle}>No issues found.</div>
        ) : (
          issues.map((issue) => {
            const form = assignData[issue._id] || {};

            return (
              <div key={issue._id} style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>{issue.title || "Issue"}</h3>
                <p>{issue.description || "No description"}</p>

                <div style={{ marginBottom: "12px" }}>
                  <strong>Status:</strong> {issue.status || "N/A"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Title"
                    value={form.title || ""}
                    onChange={(e) => handleChange(issue._id, "title", e.target.value)}
                    style={inputStyle}
                  />

                  <select
                    value={form.staffId || ""}
                    onChange={(e) => handleChange(issue._id, "staffId", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select staff</option>
                    {staffList.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.fullName} - {staff.role}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.issueTaskType || ""}
                    onChange={(e) =>
                      handleChange(issue._id, "issueTaskType", e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Select task type</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inspection">Inspection</option>
                  </select>

                  <input
                    type="date"
                    value={form.date || ""}
                    onChange={(e) => handleChange(issue._id, "date", e.target.value)}
                    style={inputStyle}
                  />

                  <input
                    type="time"
                    value={form.startTime || ""}
                    onChange={(e) =>
                      handleChange(issue._id, "startTime", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <input
                    type="time"
                    value={form.endTime || ""}
                    onChange={(e) =>
                      handleChange(issue._id, "endTime", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    placeholder="Restroom ID"
                    value={form.restroomId || ""}
                    onChange={(e) =>
                      handleChange(issue._id, "restroomId", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    placeholder="Restroom Label"
                    value={form.restroomLabel || ""}
                    onChange={(e) =>
                      handleChange(issue._id, "restroomLabel", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <textarea
                  placeholder="Manager note"
                  value={form.managerNote || ""}
                  onChange={(e) =>
                    handleChange(issue._id, "managerNote", e.target.value)
                  }
                  style={{ ...inputStyle, width: "100%", marginTop: "12px" }}
                  rows="3"
                />

                <button
                  style={{ ...buttonStyle, marginTop: "12px" }}
                  onClick={() => handleAssign(issue)}
                >
                  Assign Issue
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout
        title="Issues"
        subtitle="Assign issues to staff according to task type."
      >
        <div style={{ padding: "24px" }}>Loading issues...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Issues"
      subtitle="Assign issues to staff according to task type."
    >
      {content}
    </DashboardLayout>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
};

const buttonStyle = {
  padding: "10px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};
