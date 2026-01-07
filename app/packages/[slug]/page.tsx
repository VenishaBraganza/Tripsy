import { notFound } from "next/navigation"
import Image from "next/image"
import { Clock, Users, ShieldCheck, MapPin, Info } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import BookingForm from "@/components/booking/booking-form"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default async function PackagePage({ params }: { params: { slug: string } }) {
  const supabase = await getSupabaseServerClient()

  const { data: tourPackage } = await supabase
    .from("tour_packages")
    .select(`
      *,
      destination:destinations(name, country, city)
    `)
    .eq("slug", params.slug)
    .single()

  if (!tourPackage) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f7f9f5] pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={tourPackage.featured_image || tourPackage.images[0] || "/placeholder.svg?height=800&width=1200"}
          alt={tourPackage.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <Badge className="mb-4 bg-[#e87c57] hover:bg-[#d66a45] text-white border-none">
              {tourPackage.duration_days} Days / {tourPackage.duration_nights} Nights
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-white mb-4">{tourPackage.title}</h1>
            <div className="flex items-center text-gray-200 text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              {tourPackage.destination.city}, {tourPackage.destination.country}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-6 justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#eef2e6] p-2 rounded-full">
                  <Clock className="w-5 h-5 text-[#2c4c3b]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-semibold text-[#2c4c3b]">{tourPackage.duration_days} Days</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#eef2e6] p-2 rounded-full">
                  <Users className="w-5 h-5 text-[#2c4c3b]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Group Size</div>
                  <div className="font-semibold text-[#2c4c3b]">Max {tourPackage.max_group_size}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#eef2e6] p-2 rounded-full">
                  <ShieldCheck className="w-5 h-5 text-[#2c4c3b]" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                  <div className="font-semibold text-[#2c4c3b] capitalize">{tourPackage.difficulty_level}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#2c4c3b] mb-4">Experience Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{tourPackage.description}</p>
            </div>

            {/* Tabs for Itinerary & Inclusions */}
            <Tabs defaultValue="itinerary" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
                <TabsTrigger
                  value="itinerary"
                  className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#e87c57] data-[state=active]:text-[#e87c57] rounded-none bg-transparent shadow-none"
                >
                  Itinerary
                </TabsTrigger>
                <TabsTrigger
                  value="inclusions"
                  className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#e87c57] data-[state=active]:text-[#e87c57] rounded-none bg-transparent shadow-none"
                >
                  Inclusions
                </TabsTrigger>
                <TabsTrigger
                  value="policy"
                  className="px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#e87c57] data-[state=active]:text-[#e87c57] rounded-none bg-transparent shadow-none"
                >
                  Policies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="pt-6 space-y-6">
                {tourPackage.itinerary?.map((day: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#2c4c3b] text-white flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      {index !== tourPackage.itinerary.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2" />}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-bold text-lg text-[#2c4c3b] mb-2">{day.title}</h3>
                      <p className="text-gray-600">{day.description}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 italic">
                    Detailed itinerary available upon request.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inclusions" className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-[#2c4c3b] mb-4 flex items-center">
                      <Info className="w-4 h-4 mr-2" /> What's Included
                    </h3>
                    <ul className="space-y-2">
                      {tourPackage.inclusions?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <span className="text-green-500 mr-2">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2c4c3b] mb-4 flex items-center">
                      <Info className="w-4 h-4 mr-2" /> What's Excluded
                    </h3>
                    <ul className="space-y-2">
                      {tourPackage.exclusions?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <span className="text-red-400 mr-2">×</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="policy" className="pt-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-[#2c4c3b] mb-2">Cancellation Policy</h3>
                  <p className="text-gray-600 mb-4">{tourPackage.cancellation_policy}</p>
                  <Separator className="my-4" />
                  <p className="text-sm text-gray-500">
                    Please review our full terms and conditions before booking. Travel insurance is highly recommended
                    for all international trips.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm tourPackage={tourPackage} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
