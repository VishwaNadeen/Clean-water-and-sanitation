import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import StaffList from "../pages/admin/StaffList.jsx";
import Schedules from "../pages/admin/Schedule.jsx";
import Issues from "../pages/admin/Issues.jsx";
import StaffDashboard from "../pages/staff/Dashboard.jsx";
import MySchedules from "../pages/staff/MySchedules.jsx";

const staffManagementRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff-list",
    element: (
      <ProtectedRoute>
        <StaffList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/schedules",
    element: (
      <ProtectedRoute>
        <Schedules />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/issues",
    element: (
      <ProtectedRoute>
        <Issues />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/dashboard",
    element: (
      <ProtectedRoute>
        <StaffDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff/my-schedules",
    element: (
      <ProtectedRoute>
        <MySchedules />
      </ProtectedRoute>
    ),
  },
];

export default staffManagementRoutes;
