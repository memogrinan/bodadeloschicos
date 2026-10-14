export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Claves secretas de Stripe (leídas de forma segura desde las Variables de Entorno de Cloudflare Pages)
    const KEY_MEMO = env.STRIPE_KEY_MEMO || env.STRIPE_SECRET_KEY;
    const KEY_MARIANA = env.STRIPE_KEY_MARIANA;

    if (!KEY_MEMO && !KEY_MARIANA) {
      return new Response(JSON.stringify({ error: 'Configuración de Stripe no encontrada en el servidor' }), { status: 500 });
    }

    // LÓGICA DE BALANCEO INTELIGENTE 50/50
    let selectedKey = KEY_MEMO || KEY_MARIANA;
    let fallbackKey = KEY_MARIANA || KEY_MEMO;

    if (KEY_MEMO && KEY_MARIANA) {
      try {
        const [resMemo, resMariana] = await Promise.all([
          fetch('https://api.stripe.com/v1/balance', { headers: { 'Authorization': `Bearer ${KEY_MEMO}` } }),
          fetch('https://api.stripe.com/v1/balance', { headers: { 'Authorization': `Bearer ${KEY_MARIANA}` } })
        ]);

        if (resMemo.ok && resMariana.ok) {
          const dataMemo = await resMemo.json();
          const dataMariana = await resMariana.json();

          const getBalance = (data) => {
            let total = 0;
            if (data.available) data.available.forEach(a => total += (a.amount || 0));
            if (data.pending) data.pending.forEach(p => total += (p.amount || 0));
            return total;
          };

          const totalMemo = getBalance(dataMemo);
          const totalMariana = getBalance(dataMariana);

          // Si Mariana tiene menor saldo acumulado, se le asigna el cobro a Mariana
          if (totalMariana <= totalMemo) {
            selectedKey = KEY_MARIANA;
            fallbackKey = KEY_MEMO;
          } else {
            selectedKey = KEY_MEMO;
            fallbackKey = KEY_MARIANA;
          }
        } else {
          // Fallback round-robin 50/50 aleatorio si la API de balance no responde
          if (Math.random() < 0.5) {
            selectedKey = KEY_MARIANA;
            fallbackKey = KEY_MEMO;
          }
        }
      } catch (e) {
        // Si falla la verificación de saldo, balanceo 50/50
        if (Math.random() < 0.5) {
          selectedKey = KEY_MARIANA;
          fallbackKey = KEY_MEMO;
        }
      }
    }

    const body = await request.json();
    const { cart, giftsConfig } = body; 
    const currency = (body.currency || 'MXN').toLowerCase();
    
    const line_items = [];
    for (const [giftId, quantity] of Object.entries(cart)) {
      const gift = giftsConfig.find(g => g.id === giftId);
      if (gift) {
        const price = currency === 'usd' ? (gift.priceUSD || gift.priceMXN) : gift.priceMXN;
        line_items.push({
          price_data: {
            currency: currency,
            product_data: {
              name: gift.title,
              description: gift.description || 'Aportación para nuestra boda',
              images: [gift.imagePath],
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: quantity,
        });
      }
    }

    if (line_items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), { status: 400 });
    }

    const buildPayload = () => {
      const payload = new URLSearchParams({
        'mode': 'payment',
        'success_url': new URL('/?pago=exito', request.url).toString(),
        'cancel_url': new URL('/regalos.html', request.url).toString(),
        
        // Campo obligatorio: Nombre de quién lo regala
        'custom_fields[0][key]': 'nombre_invitado',
        'custom_fields[0][label][type]': 'custom',
        'custom_fields[0][label][custom]': '¿De parte de quién es este regalo?',
        'custom_fields[0][type]': 'text',
        'custom_fields[0][optional]': 'false',
        
        // Campo obligatorio: Mensaje/Dedicatoria
        'custom_fields[1][key]': 'mensaje_novios',
        'custom_fields[1][label][type]': 'custom',
        'custom_fields[1][label][custom]': 'Mensaje o dedicatoria',
        'custom_fields[1][type]': 'text',
        'custom_fields[1][optional]': 'false'
      });

      line_items.forEach((item, index) => {
        payload.append(`line_items[${index}][price_data][currency]`, item.price_data.currency);
        payload.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
        payload.append(`line_items[${index}][price_data][product_data][description]`, item.price_data.product_data.description);
        payload.append(`line_items[${index}][price_data][product_data][images][0]`, item.price_data.product_data.images[0]);
        payload.append(`line_items[${index}][price_data][unit_amount]`, item.price_data.unit_amount.toString());
        payload.append(`line_items[${index}][quantity]`, item.quantity.toString());
      });

      return payload;
    };

    // Intentar crear sesión en la cuenta seleccionada
    let stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${selectedKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildPayload()
    });

    let session = await stripeResponse.json();
    
    // Si la cuenta seleccionada tuvo error, hacer fallback inmediato a la otra cuenta
    if (session.error && fallbackKey) {
      stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fallbackKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: buildPayload()
      });
      session = await stripeResponse.json();
    }

    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
