# Carta Digital — Chef Diego Portilla

Menú digital con carrito, pedido por WhatsApp (delivery o retiro, pago por transferencia)
y panel de administración para gestionar productos y stock.

Ver `CLAUDE.md` para el contexto completo y `docs/` para requisitos y decisiones.

```bash
npm install
cp .env.example .env   # completar la clave publishable de Supabase
npm run dev            # carta en :5173, panel en #/admin
npm test
npm run build
```

Publicación: `docs/publicacion.md`.
