import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

export default async function TripsPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch user's bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      package:tour_packages (
        title,
        featured_image,
        destination:destinations (
          city,
          country
        )
      )
    `)
    .order("start_date", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-[#2c4c3b]">My Trips</h1>
        <Button className="bg-[#2c4c3b] hover:bg-[#1a3326]">
          <Link href="/explore">Book New Trip</Link>
        </Button>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-dashed border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips booked yet</h3>
          <p className="text-gray-500 mb-6">Your adventure awaits! Start exploring magical destinations.</p>
          <Button variant="outline" asChild>
            <Link href="/explore">Explore Destinations</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking: any) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow border-none shadow-sm">
              <div className="relative h-48 w-full">
                <Image
                  src={booking.package.featured_image || "/placeholder.svg?height=400&width=600"}
                  alt={booking.package.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    className={
                      booking.booking_status === "confirmed"
                        ? "bg-green-500"
                        : booking.booking_status === "pending"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }
                  >
                    {booking.booking_status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-[#2c4c3b] line-clamp-1">
                  {booking.package.title}
                </CardTitle>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.package.destination.city}, {booking.package.destination.country}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-[#e87c57]" />
                    <span>
                      {format(new Date(booking.start_date), "MMM d")} -{" "}
                      {format(new Date(booking.end_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-[#e87c57]" />
                    <span>
                      {booking.traveler_count} Traveler{booking.traveler_count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-[#2c4c3b]">
                    Reference: {booking.booking_reference}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 p-4">
                <Button
                  variant="outline"
                  className="w-full border-[#2c4c3b] text-[#2c4c3b] hover:bg-[#2c4c3b] hover:text-white bg-transparent"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
