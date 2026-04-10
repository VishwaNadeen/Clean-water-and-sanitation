import React from "react";
import DashboardLayout from "../../components/staffManagement/DashboardLayout";

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
  return (
    <DashboardLayout
      title="Issues"
      subtitle="View issue records for staff management and assignment workflows."
    >
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "8px" }}>Issue Management</h3>
          <p style={{ color: "#64748b", margin: 0 }}>
            This page is reserved for the staff-management issue workflow. The
            route has been restored so existing staff-management imports keep
            working without breaking the build.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
