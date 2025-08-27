// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'


// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// Create and export the supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase