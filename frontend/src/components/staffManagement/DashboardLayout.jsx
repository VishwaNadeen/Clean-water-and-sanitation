export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,249,255,1)_55%,rgba(224,242,254,1)_100%)] px-4 py-10 text-slate-800">
      <div className="w-full px-2 lg:px-4">
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
