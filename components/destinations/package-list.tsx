import Link from "next/link"
import { ArrowRight, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TourPackage } from "@/lib/types/database"

export default function PackageList({ packages }: { packages: TourPackage[] }) {
  if (packages.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 mb-4">No packages currently available for this destination.</p>
        <Button variant="outline" className="w-full bg-transparent">
          Contact for Custom Tour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="text-xs font-normal mb-2 border-[#2c4c3b] text-[#2c4c3b]">
                {pkg.duration_days} Days / {pkg.duration_nights} Nights
              </Badge>
              <span className="font-bold text-[#e87c57] text-lg">${pkg.price_per_person}</span>
            </div>

            <h4 className="font-bold text-[#2c4c3b] mb-2 text-lg leading-tight">{pkg.title}</h4>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Max {pkg.max_group_size}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {pkg.availability_status}
              </div>
            </div>

            <Button asChild className="w-full bg-[#2c4c3b] hover:bg-[#1a3326]">
              <Link href={`/packages/${pkg.slug}`}>
                View Details <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
