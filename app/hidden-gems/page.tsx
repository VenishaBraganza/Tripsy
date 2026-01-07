import { Suspense } from "react"
import { HiddenGemsContent } from "@/components/hidden-gems/hidden-gems-content"
import { requireAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"

export const metadata = {
  title: "Hidden Gems | Tripsy - Discover Underrated Places in South Karnataka",
  description: "Explore hidden gems and underrated destinations in South Karnataka with authentic reviews and photos from travelers.",
}

export default async function HiddenGemsPage() {
  // Require authentication to access the actual hidden gems service
  const user = await requireAuth()

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <HiddenGemsContent user={user} />
        </Suspense>
      </div>
    </div>
  )
}
