import { AppSidebar } from "@/components/layout/app-sidebar"
import { HistoryContent } from "@/components/dashboard/history-content"

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <HistoryContent />
      </div>
    </div>
  )
}
