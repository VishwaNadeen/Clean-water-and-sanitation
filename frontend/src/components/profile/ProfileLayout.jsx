import DashboardLayout from "../staffManagement/DashboardLayout";

export default function ProfileLayout({
  children,
}) {
  return (
    <DashboardLayout>
      <section>
        {children}
      </section>
    </DashboardLayout>
  );
}
