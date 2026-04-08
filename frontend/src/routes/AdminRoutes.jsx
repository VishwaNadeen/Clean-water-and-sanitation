import { Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/Users";

const AdminRoutes = (
  <Route
    element={
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    }
  >
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
  </Route>
);

export default AdminRoutes;