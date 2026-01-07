import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ExploreHeader() {
  return (
    <div className="relative bg-[#2c4c3b] text-white py-20 overflow-hidden">
      {/* Background pattern/image overlay */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url(/clouds-pattern-texture.jpg)" }}
      />

      <div className="container relative mx-auto px-4 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Find Your Next Adventure</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          From floating islands to mossy forests, discover destinations that spark your imagination.
        </p>

        <div className="max-w-xl mx-auto relative">
          <Input
            type="search"
            placeholder="Search for destinations, themes, or regions..."
            className="w-full pl-12 py-6 text-black rounded-full shadow-lg border-none text-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
