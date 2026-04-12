import { Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import EmailVerification from "../pages/auth/EmailVerification";
import ForgotPassword from "../pages/auth/ForgotPassword";

const AuthRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/auth/login" element={<Login />} />

    <Route path="/register" element={<Register />} />
    <Route path="/auth/register" element={<Register />} />

    <Route path="/verify-email" element={<EmailVerification />} />
    <Route path="/auth/verify-email" element={<EmailVerification />} />

    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
  </>
);

export default AuthRoutes;