// Browser-safe client — contains only the public anon key.
// Import THIS file in client components ('use client'), never lib/supabase.ts directly.
import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
