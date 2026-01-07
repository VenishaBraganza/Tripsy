import { convertToModelMessages, streamText, tool, stepCountIs } from "ai"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const supabase = await getSupabaseServerClient()

  // Define tools for the AI
  const tools = {
    findDestinations: tool({
      description: "Find travel destinations based on preferences",
      inputSchema: z.object({
        preferences: z.array(z.string()).describe('List of preferences like "nature", "coastal", "mountains"'),
        budget: z.string().optional(),
        mood: z.string().optional(),
      }),
      execute: async ({ preferences }) => {
        // Search Supabase for matching destinations
        const { data } = await supabase
          .from("destinations")
          .select("id, name, description, country, city, slug, price_range:popularity_score")
          .contains("tags", preferences)
          .limit(3)

        return data || []
      },
    }),
    checkAvailability: tool({
      description: "Check availability for a specific package",
      inputSchema: z.object({
        packageSlug: z.string(),
        date: z.string(),
      }),
      execute: async ({ packageSlug, date }) => {
        // Mock availability check logic
        // In real app, would check bookings table
        const isAvailable = Math.random() > 0.2
        return { available: isAvailable, remainingSpots: isAvailable ? Math.floor(Math.random() * 10) + 1 : 0 }
      },
    }),
    getDestinationDetails: tool({
      description: "Get detailed information about a specific destination",
      inputSchema: z.object({
        slug: z.string(),
      }),
      execute: async ({ slug }) => {
        const { data } = await supabase.from("destinations").select("*").eq("slug", slug).single()
        return data
      },
    }),
  }

  const result = streamText({
    model: "openai/gpt-4o",
    system: `You are an intelligent travel assistant for Tripsy, an AI-powered personalized tourism app specializing in South Karnataka, India. 
    
    Your expertise covers:
    - Popular destinations: Coorg (Kodagu), Hampi, Gokarna, Chikmagalur, Mysuru, Mangaluru, Udupi, Badami, Belur, Halebidu
    - Natural attractions: Western Ghats, coffee plantations, waterfalls, beaches, wildlife sanctuaries
    - Cultural sites: Ancient temples, UNESCO World Heritage Sites, palaces, forts
    - Local experiences: Kannada culture, traditional cuisine, festivals, handicrafts
    
    Your tone should be warm, knowledgeable, and enthusiastic about South Karnataka's rich heritage.
    Use emojis sparingly (🏛️, 🌄, 🏖️, ☕, 🐘).
    Provide personalized recommendations based on user preferences.
    Share interesting facts about history, culture, and local traditions.`,
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
