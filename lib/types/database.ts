export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
      destinations: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          region: string
          image_url: string
          price_per_day: number
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          region: string
          image_url: string
          price_per_day: number
          rating?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          region?: string
          image_url?: string
          price_per_day?: number
          rating?: number
          created_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          destination_id: string
          name: string
          description: string
          duration_days: number
          price: number
          difficulty: "Easy" | "Moderate" | "Hard"
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          package_id: string
          start_date: string
          travelers: number
          total_price: number
          status: "pending" | "confirmed" | "cancelled"
          created_at: string
        }
      }
    }
  }
}
