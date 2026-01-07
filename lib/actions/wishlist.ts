'use server'

import { revalidatePath } from 'next/cache'
import { addToWishlist, removeFromWishlist, getUserWishlist } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function addPackageToWishlist(
  packageId: string,
  collection: string = 'all',
  notes?: string
) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    await addToWishlist(user.id, {
      package_id: packageId,
      collection_name: collection,
      notes,
      price_alert_enabled: true,
    })
    
    revalidatePath('/dashboard/wishlist')
    return { success: true, message: 'Added to wishlist' }
  } catch (error: any) {
    console.error('Error adding to wishlist:', error)
    return { success: false, error: error.message }
  }
}

export async function removePackageFromWishlist(wishlistId: string) {
  try {
    await removeFromWishlist(wishlistId)
    revalidatePath('/dashboard/wishlist')
    return { success: true, message: 'Removed from wishlist' }
  } catch (error: any) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: error.message }
  }
}

export async function getWishlistItems(collection?: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const wishlist = await getUserWishlist(user.id, collection)
    return { success: true, data: wishlist }
  } catch (error: any) {
    console.error('Error fetching wishlist:', error)
    return { success: false, error: error.message }
  }
}
