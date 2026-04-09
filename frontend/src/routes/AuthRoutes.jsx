import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import EmailVerification from "../pages/auth/EmailVerification";

const AuthRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/auth/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/verify-email" element={<EmailVerification />} />
    <Route path="/auth/verify-email" element={<EmailVerification />} />
  </Route>
);

export default AuthRoutes;
