import { useEffect } from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/animations/loading.json";

export default function PageLoader() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white px-4 py-10">
      <div className="w-40 sm:w-52 md:w-64">
        <Lottie animationData={loadingAnimation} loop />
      </div>
    </div>
  );
}
