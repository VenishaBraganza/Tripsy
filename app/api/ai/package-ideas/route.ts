import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { generatePackageIdeas } from '@/lib/ai/recommendations'

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check if user is admin/operator
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const result = await generatePackageIdeas(body)
    
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Error generating package ideas:', error)
    return NextResponse.json(
      { error: 'Failed to generate package ideas', details: error.message },
      { status: 500 }
    )
  }
}
