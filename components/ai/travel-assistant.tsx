"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Send, Sparkles, MapPin, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TravelAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Greetings, traveler! 🌿 I'm your spirit guide to magical destinations. Tell me what kind of adventure your heart desires today.",
      },
    ],
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const toggleChat = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100",
          "bg-[#2c4c3b] hover:bg-[#1a3326] text-white",
        )}
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300 z-50 overflow-hidden flex flex-col",
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto h-[600px]"
            : "translate-y-10 opacity-0 pointer-events-none h-0",
        )}
      >
        {/* Header */}
        <div className="bg-[#2c4c3b] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
                <Sparkles className="w-5 h-5 text-[#e87c57]" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#2c4c3b]"></div>
            </div>
            <div>
              <h3 className="font-serif font-bold">Spirit Guide</h3>
              <p className="text-xs text-gray-300 flex items-center">
                <span className="w-1 h-1 rounded-full bg-green-400 mr-1 animate-pulse"></span>
                Online & Magical
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-[#f7f9f5]" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-3 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                {m.role === "assistant" && (
                  <Avatar className="w-8 h-8 border border-gray-200">
                    <AvatarImage src="/spirit-guide-avatar.png" />
                    <AvatarFallback className="bg-[#eef2e6] text-[#2c4c3b]">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="space-y-2">
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-[#2c4c3b] text-white rounded-tr-none"
                        : "bg-white text-gray-700 border border-gray-100 rounded-tl-none",
                    )}
                  >
                    {m.content}
                  </div>

                  {/* Render Tool Results */}
                  {m.toolInvocations?.map((toolInvocation) => {
                    if (toolInvocation.toolName === "findDestinations" && "result" in toolInvocation) {
                      return (
                        <div key={toolInvocation.toolCallId} className="space-y-2 mt-2">
                          <p className="text-xs text-gray-500 font-medium ml-1">Recommended Destinations:</p>
                          <div className="flex flex-col gap-2">
                            {(toolInvocation.result as any[]).map((dest: any) => (
                              <Link href={`/destinations/${dest.slug}`} key={dest.id}>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-[#e87c57] transition-colors cursor-pointer flex items-start gap-3 group">
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[#2c4c3b] group-hover:text-[#e87c57] transition-colors text-sm">
                                      {dest.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {dest.city}, {dest.country}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <Avatar className="w-8 h-8 border border-gray-200">
                  <AvatarFallback className="bg-[#eef2e6] text-[#2c4c3b]">
                    <Sparkles className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#e87c57]" />
                  <span className="text-xs text-gray-500">Consulting the spirits...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center p-2">
                <Badge variant="destructive" className="text-xs">
                  Connection interrupted. Please try again.
                </Badge>
              </div>
            )}

            {/* Spacer for scrolling */}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about destinations..."
              className="flex-1 bg-[#f7f9f5] border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e87c57]/20 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full w-10 h-10 bg-[#e87c57] hover:bg-[#d66a45] text-white shrink-0"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
