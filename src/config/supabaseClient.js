// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://ydcdxnsvjjstmvlneuqe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkY2R4bnN2ampzdG12bG5ldXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MDY4NDksImV4cCI6MjA2OTk4Mjg0OX0.TyrZR3EFg6WbPu5PGcvHHaXaAQjKvrIlUjnZqhrRIjA'

// Create and export the supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase