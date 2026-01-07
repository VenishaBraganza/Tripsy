import { z } from 'zod'

// =====================================================
// USER & AUTHENTICATION SCHEMAS
// =====================================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
})

// =====================================================
// TRIP & BOOKING SCHEMAS
// =====================================================

export const tripCreateSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  start_date: z.string().refine((date) => {
    const startDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return startDate >= today
  }, 'Start date must be today or in the future'),
  end_date: z.string(),
  travelers_count: z.number().min(1, 'At least 1 traveler is required').max(20, 'Maximum 20 travelers allowed'),
  budget_range: z.enum(['budget', 'mid-range', 'luxury']).optional(),
  trip_type: z.enum(['solo', 'couple', 'family', 'friends', 'business']).optional(),
  special_requirements: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate > startDate
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

export const bookingCreateSchema = z.object({
  trip_id: z.string().uuid('Invalid trip ID'),
  booking_type: z.enum(['flight', 'hotel', 'activity', 'transport']),
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  booking_date: z.string(),
  travel_date: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('INR'),
  booking_reference: z.string().optional(),
  vendor_name: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
})

// =====================================================
// WISHLIST & PACKAGE SCHEMAS
// =====================================================

export const wishlistAddSchema = z.object({
  package_id: z.string().uuid('Invalid package ID'),
  collection_name: z.string().min(1, 'Collection name is required').default('all'),
  notes: z.string().optional(),
  price_alert_enabled: z.boolean().default(false),
})

export const packageCreateSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  destination_id: z.string().uuid('Invalid destination ID'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Duration cannot exceed 365 days'),
  duration_text: z.string().min(1, 'Duration text is required'),
  base_price: z.number().min(0, 'Price must be positive'),
  discounted_price: z.number().min(0, 'Discounted price must be positive').optional(),
  max_travelers: z.number().min(1, 'Max travelers must be at least 1').max(50, 'Max travelers cannot exceed 50'),
  category: z.string().min(1, 'Category is required'),
  difficulty_level: z.enum(['easy', 'moderate', 'challenging']).optional(),
  tags: z.array(z.string()).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    activities: z.array(z.string()).default([]),
  })).optional(),
  status: z.enum(['draft', 'live', 'archived']).default('draft'),
})

// =====================================================
// SUPPORT & COMMUNICATION SCHEMAS
// =====================================================

export const supportTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  category: z.enum(['booking', 'payment', 'technical', 'general', 'complaint']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  trip_id: z.string().uuid().optional(),
})

export const supportMessageSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
})

// =====================================================
// REVIEW & RATING SCHEMAS
// =====================================================

export const reviewCreateSchema = z.object({
  package_id: z.string().uuid().optional(),
  destination_id: z.string().uuid().optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review cannot exceed 1000 characters'),
  photos: z.array(z.string().url()).max(5, 'Maximum 5 photos allowed').optional(),
  visit_date: z.string().optional(),
}).refine((data) => data.package_id || data.destination_id, {
  message: 'Either package_id or destination_id is required',
  path: ['package_id'],
})

// =====================================================
// SEARCH & FILTER SCHEMAS
// =====================================================

export const packageSearchSchema = z.object({
  query: z.string().optional(),
  destination_id: z.string().uuid().optional(),
  category: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  duration_min: z.number().min(1).optional(),
  duration_max: z.number().max(365).optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging']).optional(),
  tags: z.array(z.string()).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'duration_asc', 'duration_desc', 'popularity', 'rating']).default('popularity'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export const destinationSearchSchema = z.object({
  query: z.string().optional(),
  region: z.string().optional(),
  state: z.string().optional(),
  hidden_gem_score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// =====================================================
// NOTIFICATION SCHEMAS
// =====================================================

export const notificationCreateSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message cannot exceed 500 characters'),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  action_url: z.string().url().optional(),
})

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['Validation failed'] } }
  }
}

export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    errors[path] = err.message
  })
  return errors
}

// Type exports for use in components
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type TripCreateInput = z.infer<typeof tripCreateSchema>
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
export type WishlistAddInput = z.infer<typeof wishlistAddSchema>
export type PackageCreateInput = z.infer<typeof packageCreateSchema>
export type SupportTicketInput = z.infer<typeof supportTicketSchema>
export type SupportMessageInput = z.infer<typeof supportMessageSchema>
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type PackageSearchInput = z.infer<typeof packageSearchSchema>
export type DestinationSearchInput = z.infer<typeof destinationSearchSchema>
export type NotificationCreateInput = z.infer<typeof notificationCreateSchema>