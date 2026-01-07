import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Destination } from "@/lib/types/database"

interface DestinationGridProps {
  destinations: Destination[]
}

export default function DestinationGrid({ destinations }: DestinationGridProps) {
  if (destinations.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-serif text-gray-600 mb-2">No destinations found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {destinations.map((destination) => (
        <Link href={`/destinations/${destination.slug}`} key={destination.id}>
          <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden border-none bg-white">
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src={destination.featured_image || destination.images[0] || "/placeholder.svg?height=400&width=600"}
                alt={destination.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {destination.is_featured && (
                <Badge className="absolute top-4 left-4 bg-[#e87c57] hover:bg-[#d66a45] border-none">Featured</Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center text-white text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {destination.city}, {destination.country}
                </div>
              </div>
            </div>

            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold font-serif text-[#2c4c3b] line-clamp-1">{destination.name}</h3>
                <div className="flex items-center text-amber-500 text-sm font-medium">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  4.8
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{destination.description}</p>

              <div className="flex flex-wrap gap-2">
                {destination.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-[#eef2e6] text-[#5c7c6b] hover:bg-[#e0e8d5]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
