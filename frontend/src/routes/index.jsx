import { Routes, Route } from "react-router-dom";
import homeRoutes from "./HomeRoutes.jsx";
import authRoutes from "./AuthRoutes.jsx";
import profileRoutes from "./ProfileRoutes.jsx";
import NotFound from "../pages/NotFound.jsx";
import staffManagementRoutes from "./StaffManagementRoutes.jsx";

const allRoutes = [...homeRoutes, ...authRoutes, ...profileRoutes, ...staffManagementRoutes ];


export default function AppRoutes() {
  return (
    <Routes>
      {allRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}