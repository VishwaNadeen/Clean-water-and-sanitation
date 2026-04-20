import Lottie from "lottie-react";
import loadingAnimation from "../../assets/animations/loading.json";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="w-40 sm:w-52 md:w-64">
        <Lottie animationData={loadingAnimation} loop />
      </div>
    </div>
  );
}
