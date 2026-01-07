import { requireAuth } from "@/lib/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ExploreContent } from "@/components/explore/explore-content"

export const metadata = {
  title: "Explore | Tripsy - AI-Powered Discovery",
  description: "Discover hidden gems and plan your perfect trip with AI-powered recommendations.",
}

export default async function ExplorePage() {
  // Require authentication to access the actual explore service
  const user = await requireAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <ExploreContent user={user} />
      </div>
    </div>
  )
}
