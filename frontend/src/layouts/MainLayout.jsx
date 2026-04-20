import { Outlet, useLocation } from "react-router-dom";
import { Suspense, useLayoutEffect } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageLoader from "../components/common/PageLoader";
import PageTransition from "../components/common/PageTransition";

export default function MainLayout() {
  const location = useLocation();

  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const isProfileRoute =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/profile/");

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="relative flex-1 overflow-x-hidden bg-sky-50">
        <Suspense fallback={<PageLoader />}>
          {isProfileRoute ? (
            <div className="h-full w-full bg-sky-50">
              <Outlet />
            </div>
          ) : (
            <PageTransition
              routeKey={`${location.pathname}${location.search}`}
              className="h-full w-full bg-sky-50"
            >
              <Outlet />
            </PageTransition>
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
