import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function StoriesPage() {
  const stories = [
    {
      id: 1,
      title: "The Whispering Spirits of Yakushima",
      excerpt:
        "My encounter with the Kodama in the ancient mossy forests of Japan. A journey that changed my perspective on nature.",
      author: "Chihiro Ogino",
      date: "March 10, 2024",
      location: "Yakushima, Japan",
      image: "/ancient-mossy-forest-ghibli.jpg",
      category: "Experience",
    },
    {
      id: 2,
      title: "Flying Over the Adriatic",
      excerpt: "The wind in my hair and the red wings of the seaplane soaring above the azure waters. A pilot's diary.",
      author: "Porco Rosso",
      date: "March 08, 2024",
      location: "Adriatic Sea",
      image: "/seaside-town-red-plane-ghibli.jpg",
      category: "Adventure",
    },
    {
      id: 3,
      title: "Summer Days in the Countryside",
      excerpt: "Discovering the magic hidden in plain sight while living in a traditional house in Sayama Hills.",
      author: "Satsuki Kusakabe",
      date: "March 05, 2024",
      location: "Sayama Hills",
      image: "/japanese-countryside-totoro-house.jpg",
      category: "Lifestyle",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f9f5]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#2c4c3b]/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2c4c3b] flex items-center justify-center text-white">
            <span className="font-serif font-bold">S</span>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#2c4c3b]">Tripsy</span>
        </Link>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-[#e87c57] hover:bg-[#d66a45]" asChild>
            <Link href="/login">Join to Share Stories</Link>
          </Button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#2c4c3b] mb-6">Traveler Stories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from spirits and travelers who have ventured into the unknown. Discover their journeys and
            find inspiration for your next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <article
              key={story.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#2c4c3b]/5 flex flex-col h-full"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-[#2c4c3b] hover:bg-white backdrop-blur-sm border-none">
                    {story.category}
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>{story.date}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <MapPin className="w-3 h-3" />
                  <span>{story.location}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2c4c3b] mb-3 group-hover:text-[#e87c57] transition-colors">
                  {story.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">{story.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#eef2e6] flex items-center justify-center text-[#2c4c3b]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#2c4c3b]">{story.author}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#e87c57] hover:text-[#d66a45] hover:bg-[#e87c57]/10 p-0 h-auto font-medium"
                  >
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#2c4c3b]">Upcoming Regional Events</h2>
            <Button variant="outline" className="border-[#2c4c3b]/20 text-[#2c4c3b] bg-transparent">
              View Calendar
            </Button>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-[#2c4c3b]/5 shadow-sm">
            <div className="space-y-8">
              {[
                {
                  date: "Apr 15",
                  title: "The Great Bathhouse Cleanup",
                  location: "Spirit Realm",
                  desc: "Join the spirits for the annual spring cleaning festival. Complimentary herbal soak for all volunteers.",
                },
                {
                  date: "May 01",
                  title: "Airship Regatta",
                  location: "Adriatic Coast",
                  desc: "Watch hundreds of vintage airships compete in the skies above the azure sea.",
                },
                {
                  date: "Jun 21",
                  title: "Forest Spirit Parade",
                  location: "Yakushima",
                  desc: "A silent, glowing procession of the forest inhabitants celebrating the summer solstice.",
                },
              ].map((event, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 md:items-center group">
                  <div className="flex-shrink-0 w-20 h-20 bg-[#f7f9f5] rounded-xl flex flex-col items-center justify-center text-[#2c4c3b] border border-[#2c4c3b]/10">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {event.date.split(" ")[0]}
                    </span>
                    <span className="text-2xl font-serif font-bold">{event.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-[#2c4c3b] mb-1 group-hover:text-[#e87c57] transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                    <p className="text-muted-foreground text-sm">{event.desc}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-[#eef2e6] text-[#2c4c3b] hover:bg-[#2c4c3b] hover:text-white transition-colors md:w-auto w-full"
                  >
                    Interested
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
