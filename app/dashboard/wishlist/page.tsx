import { WishlistContent } from "@/components/dashboard/wishlist-content"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default function WishlistPage() {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <WishlistContent />
      </div>
    </div>
  )
}
