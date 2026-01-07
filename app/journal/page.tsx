import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Newspaper, ArrowRight, Clock, Tag } from "lucide-react"

export default function JournalPage() {
  const news = [
    {
      id: 1,
      title: "New Train Route to the Spirit Realm Opened",
      excerpt:
        "The sea train has extended its service to the sixth station. Travelers can now access the deeper parts of the realm with ease.",
      date: "Today, 9:00 AM",
      category: "Transport",
      readTime: "3 min read",
    },
    {
      id: 2,
      title: "Weather Alert: High Winds in the Valley",
      excerpt:
        "Travelers planning to visit the Valley of the Wind should prepare for strong gusts. Gliders are grounded until further notice.",
      date: "Yesterday",
      category: "Alert",
      readTime: "1 min read",
    },
    {
      id: 3,
      title: "Culinary Spotlight: Herring and Pumpkin Pie",
      excerpt:
        "A local bakery's signature dish is making waves across the coast. We interviewed the young witch behind the delivery service.",
      date: "2 days ago",
      category: "Food & Culture",
      readTime: "5 min read",
    },
    {
      id: 4,
      title: "Catbus Sightings Increase in Rural Areas",
      excerpt: "Locals report seeing the mysterious 12-legged bus more frequently. Is it a sign of changing seasons?",
      date: "3 days ago",
      category: "Local News",
      readTime: "2 min read",
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
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[#2c4c3b]/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#e87c57] font-bold uppercase tracking-wider text-xs mb-3">
              <Newspaper className="w-4 h-4" />
              <span>Daily Updates</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#2c4c3b]">Travel Journal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full bg-transparent">
              Latest
            </Button>
            <Button variant="ghost" className="rounded-full">
              Trending
            </Button>
            <Button variant="ghost" className="rounded-full">
              Archive
            </Button>
          </div>
        </div>

        <div className="space-y-12">
          {/* Featured Article */}
          <article className="bg-white rounded-3xl p-8 md:p-12 border border-[#2c4c3b]/5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e87c57]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#e87c57] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Breaking
                </span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {news[0].readTime}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2c4c3b] mb-6 leading-tight group-hover:text-[#e87c57] transition-colors cursor-pointer">
                {news[0].title}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">{news[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-[#2c4c3b]">
                  <span className="w-2 h-2 rounded-full bg-[#e87c57]" />
                  {news[0].date}
                </div>
                <Button className="rounded-full px-6 bg-[#2c4c3b] hover:bg-[#1a2e24]">Read Full Story</Button>
              </div>
            </div>
          </article>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.slice(1).map((item) => (
              <article
                key={item.id}
                className="bg-white p-8 rounded-2xl border border-[#2c4c3b]/5 hover:border-[#e87c57]/30 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#e87c57] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.category}
                  </span>
                  <span className="text-muted-foreground text-xs">{item.date}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2c4c3b] mb-3 group-hover:text-[#e87c57] transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">{item.excerpt}</p>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.readTime}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#2c4c3b] group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Component (Reused Style) */}
        <div className="mt-24 bg-[#2c4c3b] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-serif font-bold mb-4">Subscribe to the Daily Owl</h3>
            <p className="text-white/80 mb-8">
              Get the latest updates from the spirit realm delivered directly to your inbox every morning.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none"
              />
              <Button className="rounded-full bg-[#e87c57] hover:bg-[#d66a45] text-white">Subscribe</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
