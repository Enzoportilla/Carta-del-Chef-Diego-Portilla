// localStorage puede faltar o estar bloqueado: en ese caso todo vive solo en memoria.
export function leer(clave) {
  try { return JSON.parse(localStorage.getItem(clave)) } catch { return null }
}
export function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* sin almacenamiento */ }
}
