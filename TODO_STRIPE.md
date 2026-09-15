# Plan de Integración Stripe - Mesa de Regalos

Este documento contiene el plan para cuando Memo y Mariana tengan sus cuentas de Stripe activas, para implementar el carrito dinámico con balanceo de pagos.

## Estado Actual
- El frontend (`regalos.html`) ya tiene un carrito de compras 100% funcional en UI (suma productos, modifica cantidades, calcula totales).
- El botón "Proceder al Pago" arroja un aviso de "En Construcción".

## Lo que falta (Backend)

1. **Obtener API Keys:**
   - Public Key y Secret Key de la cuenta de Memo (`pk_live_...` y `sk_live_...`).
   - Public Key y Secret Key de la cuenta de Mariana.

2. **Crear un Cloudflare Worker:**
   - Recibirá un POST desde el frontend con los items del carrito.
   - Consultará en Firebase (o mediante webhooks y un contador de Cloudflare KV) el total cobrado históricamente por cada cuenta.
   - Decidirá qué Secret Key usar (eligiendo la de quien tenga menos ingresos acumulados).
   - Generará una sesión de pago de Stripe usando la API `stripe.checkout.sessions.create` con `price_data` dinámico basado en el carrito.
   - Retornará la URL de la sesión de Stripe al frontend para redirigir al invitado al cobro real.

3. **Actualizar `regalos.html`:**
   - Cambiar la función `processCheckout()` para que haga un `fetch()` al nuevo Cloudflare Worker y navegue a la URL segura devuelta por Stripe.
