export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] py-6 text-slate-800 sm:py-7">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5 lg:px-6">
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
