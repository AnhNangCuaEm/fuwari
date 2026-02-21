import { requireAdmin } from "@/lib/auth-utils"
import AdminSettingsClient from "@/components/admin/AdminSettingsClient"

export const metadata = {
    title: "System Settings – Admin",
}

export default async function AdminSettings() {
    await requireAdmin()
    return <AdminSettingsClient />
}


