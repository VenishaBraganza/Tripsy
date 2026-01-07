"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, MapPin, Star, Palmtree } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border/40 transition-all duration-300">
        <div className="flex items-center gap-2 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform hover:scale-110">
            <Palmtree className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Tripsy</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground animate-fadeIn animate-delay-100">
          <Link href="/stories" className="hover:text-primary transition-colors hover:scale-105">
            Stories
          </Link>
          <Link href="/journal" className="hover:text-primary transition-colors hover:scale-105">
            Journal
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors hover:scale-105">
            About
          </Link>
        </div>
        <div className="flex items-center gap-4 animate-fadeIn animate-delay-200">
          {user ? (
            <Button
              className="rounded-full px-6 font-serif bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 transition-all"
              size="sm"
              asChild
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button variant="ghost" className="rounded-full px-4 font-serif hover:scale-105 transition-all" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
          )}
          <Button className="rounded-full px-6 font-serif hover:scale-105 transition-all" size="sm" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col justify-center items-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-bold tracking-wider mb-6 uppercase animate-fadeIn">
          AI-Powered Tourism
        </span>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-foreground leading-[0.9] mb-8 animate-fadeIn animate-delay-100">
          Discover <br />
          <span className="text-primary italic">South Karnataka</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 font-light animate-fadeIn animate-delay-200">
          Experience the rich cultural heritage, ancient temples, lush Western Ghats, pristine beaches, and vibrant traditions of South Karnataka. Your personalized journey begins here.
        </p>

        <div className="relative w-full max-w-5xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl mb-12 group animate-scaleIn animate-delay-300">
          <Image
            src="/ghibli-style-landscape-lush-green-clouds.jpg"
            alt="South Karnataka Landscape"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:p-12">
            <div className="text-left text-white">
              <p className="font-serif text-2xl md:text-3xl mb-2">Western Ghats Paradise</p>
              <p className="text-white/80">Explore the UNESCO World Heritage biodiversity hotspot.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Destinations Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-muted/30">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 animate-fadeIn">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">Featured Destinations</h2>
            <p className="text-muted-foreground max-w-md">
              Handpicked experiences showcasing the best of South Karnataka's natural beauty and cultural richness.
            </p>
          </div>
          <Button
            variant="outline"
            className="mt-6 md:mt-0 rounded-full gap-2 group border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary bg-transparent hover:scale-105 transition-all"
            asChild
          >
            <Link href="/login">
              Start exploring <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Coorg Coffee Estates",
              location: "Kodagu District",
              image: "/ancient-mossy-forest-ghibli.jpg",
              desc: "Misty hills, aromatic coffee plantations, and cascading waterfalls.",
              slug: "coorg-coffee-estates",
            },
            {
              title: "Hampi Heritage",
              location: "Vijayanagara",
              image: "/seaside-town-red-plane-ghibli.jpg",
              desc: "UNESCO World Heritage Site with ancient temples and boulder landscapes.",
              slug: "hampi-heritage",
            },
            {
              title: "Gokarna Beaches",
              location: "Uttara Kannada",
              image: "/japanese-countryside-totoro-house.jpg",
              desc: "Pristine beaches, sacred temples, and serene coastal vibes.",
              slug: "gokarna-beaches",
            },
          ].map((item, i) => (
            <div key={i} className="cursor-pointer" onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
            }}>
              <div className="group cursor-pointer flex flex-col gap-4 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1 transition-transform group-hover:scale-110">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2 relative animate-slideIn">
          <div className="absolute -top-12 -left-12 w-24 h-24 text-secondary/20">
            <Palmtree className="w-full h-full" />
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
            Personalized <br />
            <span className="italic text-secondary">AI-Powered</span> <br />
            Experiences.
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground font-light">
            <p>
              At Tripsy, we combine cutting-edge AI technology with deep local knowledge to create personalized travel experiences across South Karnataka. From ancient temple towns to pristine beaches, coffee plantations to wildlife sanctuaries.
            </p>
            <p>
              Our intelligent platform learns your preferences and crafts itineraries that match your interests, whether you're seeking spiritual enlightenment, adventure, cultural immersion, or peaceful relaxation.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="transition-transform hover:scale-105">
              <h4 className="font-serif text-3xl font-bold mb-2 text-foreground">100+</h4>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Destinations</p>
            </div>
            <div className="transition-transform hover:scale-105">
              <h4 className="font-serif text-3xl font-bold mb-2 text-foreground">5000+</h4>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Happy Travelers</p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 relative h-[600px] w-full rounded-t-full rounded-b-2xl overflow-hidden bg-muted animate-scaleIn animate-delay-200">
          <Image src="/ghibli-train-over-water.jpg" alt="South Karnataka" fill className="object-cover transition-transform duration-700 hover:scale-110" />
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-primary text-primary-foreground relative overflow-hidden rounded-3xl mx-4 md:mx-8 mb-8 animate-scaleIn">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/clouds-pattern-texture.jpg" alt="Pattern" fill className="object-cover mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">Ready to explore South Karnataka?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 font-light">
            Subscribe to receive personalized recommendations, travel tips, and exclusive offers.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all focus:scale-105"
            />
            <Button className="rounded-full px-8 py-6 bg-white text-primary hover:bg-secondary hover:text-secondary-foreground font-serif text-lg transition-all hover:scale-105">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-border flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Palmtree className="w-3 h-3" />
            </div>
            <span className="font-serif text-lg font-bold">Tripsy</span>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-Powered Personalized Tourism App for Exploring South Karnataka. Discover heritage, nature, and culture.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-wider text-xs text-foreground/50">Company</h4>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link>
            <Link href="/press" className="text-muted-foreground hover:text-primary transition-colors">Press</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-wider text-xs text-foreground/50">Support</h4>
            <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-wider text-xs text-foreground/50">Social</h4>
            <Link href="https://instagram.com" className="text-muted-foreground hover:text-primary transition-colors">
              Instagram
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </Link>
            <Link href="https://facebook.com" className="text-muted-foreground hover:text-primary transition-colors">
              Facebook
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
