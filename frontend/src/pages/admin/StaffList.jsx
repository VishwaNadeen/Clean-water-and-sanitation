import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/staffManagement/DashboardLayout";
import staffApi from "../../services/staffManagementService";

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

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const res = await staffApi.get("/manager/staff");
      setStaff(res.data || []);
    } catch (error) {
      console.error("Failed to load staff", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const matchesSearch =
        item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = role === "all" ? true : item.role === role;

      return matchesSearch && matchesRole;
    });
  }, [staff, search, role]);

  const content = (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "6px" }}>Staff List</h2>
      <p style={{ color: "#64748b", marginBottom: "22px" }}>
        View staff members and their roles.
      </p>

      <div style={{ ...cardStyle, marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name, email, phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
            <option value="all">All Roles</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Technician">Technician</option>
            <option value="Supervisor">Supervisor</option>
          </select>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#e2e8f0" }}>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((item) => (
                <tr key={item._id}>
                  <td style={tdStyle}>{item.fullName}</td>
                  <td style={tdStyle}>{item.email || "N/A"}</td>
                  <td style={tdStyle}>{item.phone || "N/A"}</td>
                  <td style={tdStyle}>{item.role || "N/A"}</td>
                  <td style={tdStyle}>{item.status || "N/A"}</td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan="5">No staff found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout
        title="Staff List"
        subtitle="View staff members and their roles."
      >
        <div style={{ padding: "24px" }}>Loading staff list...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Staff List"
      subtitle="View staff members and their roles."
    >
      {content}
    </DashboardLayout>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  minWidth: "220px",
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
