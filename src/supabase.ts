import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vknzyavsjhzcvrmizmpo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbnp5YXZzamh6Y3ZybWl6bXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjIwMzcsImV4cCI6MjA4ODU5ODAzN30.5DjcOzJf8k9JNHE9DKsBC_aYecdxbs3Drfa1oQeinSc';

export const supabase = createClient(supabaseUrl, supabaseKey);
