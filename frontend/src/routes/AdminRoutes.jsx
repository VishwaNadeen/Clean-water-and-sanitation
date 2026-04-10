import { Navigate, Route } from "react-router-dom";
import AdminLayout    from "../layouts/AdminLayout";
import RequireAdmin   from "../components/auth/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers     from "../pages/admin/Users";
import StaffManagementHome from "../pages/admin/staff-Management/StaffManagementHome";
import StaffRegister from "../pages/admin/staff-Management/StaffRegister";
import ManageSchedules from "../pages/admin/staff-Management/ManageSchedules";
import AssignIssues from "../pages/admin/staff-Management/AssignIssues";
import RestroomList   from "../pages/admin/restrooms/RestroomList";
import CreateRestroom from "../pages/admin/restrooms/CreateRestroom";
import EditRestroom   from "../pages/admin/restrooms/EditRestroom";
import ComplaintList  from "../pages/admin/complaints/ComplaintList";
import CreateCategoryPage from "../pages/admin/categories/CreateCategoryPage";
import ViewCategoriesPage from "../pages/admin/categories/ViewCategoriesPage";

const AdminRoutes = (
  <Route
    element={
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    }
  >
    <Route path="/admin/dashboard"              element={<AdminDashboard />} />
    <Route path="/admin/users"                  element={<AdminUsers />} />
    <Route path="/admin/staff"                  element={<StaffManagementHome />} />
    <Route path="/admin/register-staff"         element={<StaffRegister />} />
    <Route path="/admin/staff/schedules"        element={<ManageSchedules />} />
    <Route path="/admin/staff/issues"           element={<AssignIssues />} />
    <Route path="/admin/restrooms"              element={<RestroomList />} />
    <Route path="/admin/restrooms/create"       element={<CreateRestroom />} />
    <Route path="/admin/restrooms/:id/edit"     element={<EditRestroom />} />
    <Route path="/admin/complaints"             element={<ComplaintList />} />
    <Route path="/admin/categories"             element={<Navigate to="/admin/categories/view" replace />} />
    <Route path="/admin/categories/create"      element={<CreateCategoryPage />} />
    <Route path="/admin/categories/view"        element={<ViewCategoriesPage />} />
  </Route>
);

export default AdminRoutes;
