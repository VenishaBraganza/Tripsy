import { DashboardContentPrototype } from "@/components/dashboard/dashboard-content-prototype"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default async function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <DashboardContentPrototype />
      </div>
    </div>
  )
}
