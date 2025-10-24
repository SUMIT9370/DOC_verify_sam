import AdminGuard from "@/components/admin-guard";
import DashboardLayout from "../dashboard/layout";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </AdminGuard>
    )
}