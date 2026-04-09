import Lottie from "lottie-react";
import loadingAnimation from "../../assets/lottie/page-loading.json";

export default function PageLoader({
  text = "Loading...",
  fullScreen = true,
}) {
  return (
    <div
      className={
        fullScreen
          ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          : "flex min-h-[300px] flex-col items-center justify-center bg-white"
      }
    >
      <div className="w-40 sm:w-48 md:w-56">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>

      <p className="mt-3 text-sm font-medium tracking-wide text-slate-600">
        {text}
      </p>
    </div>
  );
}