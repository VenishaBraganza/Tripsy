import { ManagePackagesContent } from "@/components/admin/manage-packages-content"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function ManagePackagesPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <ManagePackagesContent />
      </div>
    </div>
  )
}
