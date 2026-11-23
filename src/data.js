// Datos fijos del negocio. Todo lo de este archivo es público: se ve en la web y en el repo.

export const NEGOCIO = {
  nombre: 'Chef Diego Portilla',
  whatsapp: '', // 569XXXXXXXX; vacío = el envío queda deshabilitado
  retiro: '', // dirección y horario de retiro, p. ej. 'Calle 123, Comuna. Lunes a viernes de 10:00 a 18:00'
}

// { banco, tipo, numero, rut, titular, correo }; null = se coordina por WhatsApp
export const TRANSFERENCIA = null

// Los id deben coincidir con el check de supabase/schema.sql
export const CATEGORIAS = [
  { id: 'panes', nombre: 'Panes' },
  { id: 'sopaipillas', nombre: 'Sopaipillas' },
  { id: 'dulces', nombre: 'Dulces' },
  { id: 'salados', nombre: 'Salados y masas' },
]
