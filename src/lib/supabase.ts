import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bduvbthlqywpqhtaiznj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdXZidGhscXl3cHFodGFpem5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzY3NDYsImV4cCI6MjA3MTQ1Mjc0Nn0.1RfS0ILToYixyoqhgAYXIe1g_jd7Py25EOuhVfrEHOM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
