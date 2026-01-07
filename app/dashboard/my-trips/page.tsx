import { AppSidebar } from "@/components/layout/app-sidebar"
import { MyTripsContent } from "@/components/dashboard/my-trips-content"

export default function MyTripsPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <MyTripsContent />
      </div>
    </div>
  )
}
