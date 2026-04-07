import { Route } from "react-router-dom";
import Home from "../../pages/home/Home.jsx";
import Login from "../../pages/auth/Login.jsx";

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </>
  );
}