import { SupportContent } from "@/components/support/support-content"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function SupportPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <SupportContent />
      </div>
    </div>
  )
}
