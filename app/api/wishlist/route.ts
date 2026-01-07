import { NextRequest, NextResponse } from 'next/server'
import { getUserWishlist, addToWishlist, removeFromWishlist } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { validateRequestBody, validateUUID, rateLimit } from '@/lib/validation/middleware'
import { wishlistAddSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimitResult = rateLimit(user.id, 100, 15 * 60 * 1000) // 100 requests per 15 minutes
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }
  
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection') || undefined
  
  try {
    const wishlist = await getUserWishlist(user.id, collection)
    return NextResponse.json({ wishlist, count: wishlist.length })
  } catch (error: any) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimitResult = rateLimit(user.id, 50, 15 * 60 * 1000) // 50 requests per 15 minutes
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }

  // Validate request body
  const validation = await validateRequestBody(request, wishlistAddSchema)
  if (!validation.success) {
    return validation.response
  }
  
  try {
    const item = await addToWishlist(user.id, validation.data)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimitResult = rateLimit(user.id, 50, 15 * 60 * 1000) // 50 requests per 15 minutes
  if (!rateLimitResult.success) {
    return rateLimitResult.response!
  }
  
  const { searchParams } = new URL(request.url)
  const wishlistId = searchParams.get('id')
  
  if (!wishlistId) {
    return NextResponse.json({ 
      error: 'Wishlist ID required',
      message: 'Please provide a valid wishlist item ID'
    }, { status: 400 })
  }

  // Validate UUID format
  const uuidValidation = validateUUID(wishlistId, 'wishlist_id')
  if (!uuidValidation.success) {
    return uuidValidation.response!
  }
  
  try {
    await removeFromWishlist(wishlistId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist', details: error.message },
      { status: 500 }
    )
  }
}
