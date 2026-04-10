import { Outlet, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function MainLayout({ children }) {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />
      <main className="flex-1 pt-[72px]">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
