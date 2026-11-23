# Publicación

**Datos que necesito** (la app funciona sin ellos, pero no recibe pedidos): número de WhatsApp, datos de transferencia, dirección y horario de retiro. Van en `src/data.js` de un repo **público** y además se muestran en la web: entrégame solo los que aceptes publicar.

1. **Supabase → SQL Editor:** pegar y ejecutar `supabase/schema.sql`.
2. **Authentication → Users → Add user → Create new user:** correo y contraseña del chef, con *Auto Confirm User*.
3. **SQL Editor**, para darle el rol (no se sube al repo). Debe devolver una fila; si no, el correo no coincide:
   ```sql
   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"rol":"admin"}' where email = lower('CORREO_DEL_CHEF') returning email;
   ```
4. **Authentication → Sign In / Providers:** desactivar *Allow new users to sign up*.
5. **Project Settings → API Keys:** copiar la clave *publishable/anon* (no la `service_role`/`secret`). Local: `cp .env.example .env` y pegarla. URL: `https://tzvzkfdztzvvlbqnsheh.supabase.co`.
6. **GitHub → Settings → Secrets and variables → Actions:** crear `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
7. **GitHub → Settings → Pages → Source:** *GitHub Actions*.
8. **Push:** si el contenedor pide credenciales, ejecutar `! gh auth login`. Hacer los pasos 6 y 7 antes del push.
9. **Revisar:** https://enzoportilla.github.io/Carta-del-Chef-Diego-Portilla/ y `…/#/admin`. Ajustar stock real, subir fotos y poner precio a los 5 ocultos.

## Comprobar

- `curl` con la clave anon: lista 15 productos; `PATCH` anónimo no modifica nada; subir al bucket sin sesión es rechazado.
- Usuario sin rol: no puede actualizar `productos`. Usuario admin: sí.
- Desde un celular: agregar, recargar, enviar por delivery y por retiro; el mensaje llega completo al WhatsApp del chef.
- Stock en 0 desde el panel → aparece "Agotado" al recargar la carta.
- Subir y reemplazar una foto desde el celular.
