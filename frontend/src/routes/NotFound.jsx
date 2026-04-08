import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <div className="text-5xl">404</div>
        <div className="mt-2 text-lg font-semibold">Page not found</div>
        <p className="mt-2 opacity-70">This route doesn’t exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-3 rounded-2xl bg-white text-slate-950 font-semibold hover:opacity-90 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}