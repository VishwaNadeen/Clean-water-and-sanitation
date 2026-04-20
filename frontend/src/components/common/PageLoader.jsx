import Lottie from "lottie-react";
import loadingAnimation from "../../assets/animations/loading.json";

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-transparent px-4 py-10">
      <div className="w-40 sm:w-52 md:w-64">
        <Lottie animationData={loadingAnimation} loop />
      </div>
    </div>
  );
}
