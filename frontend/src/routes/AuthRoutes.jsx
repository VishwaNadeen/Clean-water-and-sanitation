import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

const AuthRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
);

export default AuthRoutes;