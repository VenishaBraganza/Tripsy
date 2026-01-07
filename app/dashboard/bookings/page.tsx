import { AppSidebar } from "@/components/layout/app-sidebar"
import { BookingsContent } from "@/components/dashboard/bookings-content"

export default function BookingsPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <BookingsContent />
      </div>
    </div>
  )
}
