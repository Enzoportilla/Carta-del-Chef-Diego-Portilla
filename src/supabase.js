import { createClient } from '@supabase/supabase-js'

// Clave anon (pública): lo que protege los datos es RLS (supabase/schema.sql).
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const urlFoto = (ruta) => supabase.storage.from('fotos').getPublicUrl(ruta).data.publicUrl
