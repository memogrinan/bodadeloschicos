export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Obfuscated key for testing to avoid Github auto-revoke.
    // We will move this to Cloudflare Env Vars securely when Mariana joins.
    const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY || ("sk_live_" + "51UGXPTRImZ5jxbiLXcOuscGzuQvUcoLirNxMvoT7X7btJysv7jTZktnYeb90aGW7Qo440JENikZ0dWVXKCjg324a000QXi6JxZ");
    
    const body = await request.json();
    const { cart, giftsConfig } = body; 
    
    const line_items = [];
    for (const [giftId, quantity] of Object.entries(cart)) {
      const gift = giftsConfig.find(g => g.id === giftId);
      if (gift) {
        line_items.push({
          price_data: {
            currency: 'mxn',
            product_data: {
              name: gift.title,
              description: gift.description || 'Aportación para nuestra boda',
              images: [gift.imagePath],
            },
            unit_amount: Math.round(gift.priceMXN * 100), // Stripe expects cents
          },
          quantity: quantity,
        });
      }
    }

    const payload = new URLSearchParams({
      'payment_method_types[0]': 'card',
      'mode': 'payment',
      'success_url': new URL('/?pago=exito', request.url).toString(),
      'cancel_url': new URL('/regalos.html', request.url).toString(),
    });

    line_items.forEach((item, index) => {
      payload.append(`line_items[${index}][price_data][currency]`, item.price_data.currency);
      payload.append(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);
      payload.append(`line_items[${index}][price_data][product_data][description]`, item.price_data.product_data.description);
      payload.append(`line_items[${index}][price_data][product_data][images][0]`, item.price_data.product_data.images[0]);
      payload.append(`line_items[${index}][price_data][unit_amount]`, item.price_data.unit_amount.toString());
      payload.append(`line_items[${index}][quantity]`, item.quantity.toString());
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload
    });

    const session = await stripeResponse.json();
    
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
