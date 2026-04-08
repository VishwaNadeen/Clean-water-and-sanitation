import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AdminRoutes = (
  <Route
    element={
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    }
  >
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Route>
);

export default AdminRoutes;