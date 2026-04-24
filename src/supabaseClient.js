// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cqbsuskfjqqqcqnpgnrx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYnN1c2tmanFxcWNxbnBnbnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MDI1OTQsImV4cCI6MjA5MjQ3ODU5NH0.EOGA0sYpgOrrOR9YvadDlHYYG2m1lklENzegvA-IXUw";
// Ambil dari Supabase Dashboard → Settings → API → anon/public (bukan service_role!)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
