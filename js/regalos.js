
// GLOBAL URL PARAMETER PRESERVER
// Asegura que el parámetro '?p=' (Party ID) viaje a todas las páginas internas.
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('p') || localStorage.getItem('bodachicos_party_id');
    
    if (partyId) {
        // Guardamos o actualizamos en cache
        localStorage.setItem('bodachicos_party_id', partyId);
        
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            // Solo inyectar en links que apunten a htmls internos o al root
            if (href && (href.includes('.html') || href === '/') && !href.startsWith('http') && !href.startsWith('tel') && !href.startsWith('javascript')) {
                try {
                    const urlObj = new URL(link.href, window.location.origin);
                    urlObj.searchParams.set('p', partyId);
                    link.href = urlObj.toString();
                } catch(e) {}
            }
        });
    }
});

        // FIREBASE SETUP
        const firebaseConfig = {
            authDomain: "boda-los-chicos.firebaseapp.com",
            databaseURL: "https://boda-los-chicos-default-rtdb.firebaseio.com",
            storageBucket: "boda-los-chicos.firebasestorage.app",
        };
        if (typeof firebase !== "undefined" && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = (typeof firebase !== "undefined") ? firebase.database() : null;

        let currentCurrency = 'MXN';
        let shoppingCart = {}; // { giftId: quantity }
        
        // CONFIGURACIÓN EXPANDIDA DE REGALOS (LUNA DE MIEL JAPÓN)
        const giftsConfigRaw = [
            {
                id: 'prueba-sistema',
                title: 'Regalo de Prueba',
                description: 'Un detallito para verificar que el sistema de cobro en línea funciona a la perfección.',
                imagePath: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
                priceMXN: 10,
                priceUSD: 1
            },
            {
                id: 'juguete-maddie',
                title: 'Juguete para Maddie',
                description: 'Consiente a Maddie con un juguete nuevo (o unos premios deliciosos).',
                imagePath: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800&auto=format&fit=crop',
                priceMXN: 300,
                priceUSD: 15
            },
            {
                id: 'cafe-kyoto',
                title: 'Café de Especialidad en Kyoto',
                description: 'Para que Chico compare contra sus granos de Oaxaca y Chiapas.',
                imagePath: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
                priceMXN: 400,
                priceUSD: 20
            },
            {
                id: 'ramen-tokyo',
                title: 'Ramen de medianoche en Tokyo',
                description: 'Porque sabemos que vamos a terminar cenando fideos en un callejón iluminado por neón a las 2 AM.',
                imagePath: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop',
                priceMXN: 500,
                priceUSD: 25
            },
            {
                id: 'juego-mesa',
                title: 'Juego de Mesa',
                description: 'Para una gran adición a la colección de juegos.',
                imagePath: 'https://images.unsplash.com/photo-1610890716175-349be88a9cce?q=80&w=800&auto=format&fit=crop',
                priceMXN: 600,
                priceUSD: 30
            },
            {
                id: 'spa-maddie',
                title: 'Paquete Spa de Relajación para Maddie',
                description: 'Para que Maddie nos perdone por dejarla mientras nosotros estamos del otro lado del mundo.',
                imagePath: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
                priceMXN: 700,
                priceUSD: 35
            },
            {
                id: 'matcha-uji',
                title: 'Matcha Ceremonial en Uji',
                description: 'Ayúdanos a probar el matcha más auténtico y puro del mundo directo desde Uji, la capital histórica del té en Japón.',
                imagePath: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
                priceMXN: 800,
                priceUSD: 40
            },
            {
                id: 'vinilo-coleccion',
                title: 'Un Vinilo de Colección',
                description: 'Prometemos escucharlo con un vino en mano.',
                imagePath: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop',
                priceMXN: 800,
                priceUSD: 40
            },
            {
                id: 'ciervos-nara',
                title: 'Galletas para los ciervos de Nara',
                description: 'Ayúdanos a pagar el tren a Nara y comprar suficientes galletas para que los ciervos nos hagan reverencias.',
                imagePath: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1000,
                priceUSD: 50
            },
            {
                id: 'comida-dotonbori',
                title: 'Tour de comida callejera en Dotonbori, Osaka',
                description: 'Dicen que Osaka es la cocina de Japón. Este es el fondo oficial para atascarnos de takoyaki (bolitas de pulpo) y okonomiyaki.',
                imagePath: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1000,
                priceUSD: 50
            },
            {
                id: 'sake-premium',
                title: 'Botella de Sake Premium',
                description: 'Para brindar por nosotros (y por ustedes) con un buen sake en nuestra primera cena japonesa de recién casados.',
                imagePath: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1000,
                priceUSD: 50
            },
            {
                id: 'clases-baile',
                title: 'Clases de Baile',
                description: 'Para prepararnos y no pisarnos durante el primer baile.',
                imagePath: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1200,
                priceUSD: 60
            },
            {
                id: 'sushi-toyosu',
                title: 'Desayuno de Sushi en el Mercado de Toyosu',
                description: 'Para madrugar con gusto y desayunar el sushi y sashimi más fresco del planeta justo al lado de donde hacen las subastas de atún.',
                imagePath: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1500,
                priceUSD: 75
            },
            {
                id: 'super-nintendo-world',
                title: 'Entradas para Super Nintendo World',
                description: 'Para por fin conocer en vivo a Mario y Peach.',
                imagePath: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1800,
                priceUSD: 90
            },
            {
                id: 'vuelo-japon',
                title: 'Aportación para Vuelo a Japón',
                description: 'El empujón maestro para nuestros boletos de avión a la luna de miel de nuestros sueños del otro lado del charco.',
                imagePath: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2000,
                priceUSD: 100
            },
            {
                id: 'shinkansen',
                title: 'Tickets para el Shinkansen (Tren Bala)',
                description: 'Ayúdanos a viajar a 300 km/h viendo el Monte Fuji por la ventana sin perder el estilo.',
                imagePath: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2000,
                priceUSD: 100
            },
            {
                id: 'clases-barre',
                title: 'Clases de Barre para Chica',
                description: 'Para que Chica se prepare, llena de energía y lista para recorrer Japón a pie.',
                imagePath: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2200,
                priceUSD: 110
            },
            {
                id: 'kobe-wagyu',
                title: 'Cena de auténtico Kobe Wagyu en Japón',
                description: 'Porque no todo en la luna de miel puede ser comida de las tiendas de conveniencia japonesas. Una noche de lujo culinario.',
                imagePath: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2500,
                priceUSD: 125
            },
            {
                id: 'hotel-japon',
                title: 'Noche de Hotel en Japón',
                description: 'Un descanso reparador para los chicos después de caminar 20 kilómetros diarios por la ciudad.',
                imagePath: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
                priceMXN: 3000,
                priceUSD: 150
            },
            {
                id: 'tokyo-disneyland',
                title: 'Entradas a Tokyo Disneyland',
                description: 'El clásico de los castillos y la magia, versión otaku. Para subirnos a las montañas rusas, comer mochis de alien y regresar con orejas de Mickey para Maddie.',
                imagePath: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
                priceMXN: 4000,
                priceUSD: 200
            },
            {
                id: 'tokyo-disneysea',
                title: 'Entradas a Tokyo DisneySea',
                description: 'Considerado el mejor parque temático del mundo. Cubre las entradas, pases rápidos para saltar filas, y comida temática mientras exploramos el parque náutico.',
                imagePath: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop',
                priceMXN: 5000,
                priceUSD: 250
            },
            {
                id: 'fotos-kyoto',
                title: 'Sesión de Fotos Profesional en Kyoto',
                description: 'Un recuerdo para toda la vida. Ayúdanos a contratar un fotógrafo local para una sesión espectacular con kimonos por las calles antiguas y templos.',
                imagePath: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
                priceMXN: 6000,
                priceUSD: 300
            }
        ];
        
        // Ordenar por precio
        let giftsConfig = giftsConfigRaw.sort((a, b) => a.priceMXN - b.priceMXN);
        

        function renderGiftCards() {
            const container = document.getElementById('giftsGridContainer');
            if (!container) return;
            
            // Preservar valores del input si el usuario estaba escribiendo
            const savedConcept = document.getElementById('customConceptInput')?.value || '';
            const savedAmount = document.getElementById('customAmountInput')?.value || '';
            
            container.innerHTML = '';
            
            // 1. Renderizar regalos estándar ordenados
            const standardGifts = giftsConfig.filter(g => !g.isCustom);
            standardGifts.forEach(gift => {
                const card = document.createElement('div');
                card.className = `gift-card`;
                
                const fallbackImg = `https://source.unsplash.com/800x600/?japan,travel,${gift.id}`;
                const price = currentCurrency === 'MXN' ? `$${gift.priceMXN.toLocaleString('en-US')} MXN` : `$${gift.priceUSD.toLocaleString('en-US')} USD`;
                const priceHtml = `<div class="price-badge">${price}</div>`;
                
                const qtyInCart = shoppingCart[gift.id] || 0;
                let actionHtml = '';
                if (qtyInCart > 0) {
                    const minusIcon = qtyInCart === 1 ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>' : '-';
                    actionHtml = `
                        <div class="card-qty-ctrl">
                            <button class="qty-btn" onclick="updateCartQty('${gift.id}', -1)" aria-label="Disminuir">${minusIcon}</button>
                            <span class="qty-num">${qtyInCart}</span>
                            <button class="qty-btn" onclick="updateCartQty('${gift.id}', 1)" aria-label="Aumentar">+</button>
                        </div>
                    `;
                } else {
                    actionHtml = `<button class="btn-gift" onclick="addToCart('${gift.id}')">Agregar</button>`;
                }

                card.innerHTML = `
                    <div class="gift-img-wrapper">
                        ${priceHtml}
                        <img src="${gift.imagePath}" onerror="this.src='${fallbackImg}'" alt="${gift.title}" loading="lazy">
                    </div>
                    <div class="gift-content">
                        <div>
                            <h3 class="gift-title">${gift.title}</h3>
                            <p class="gift-desc">${gift.description}</p>
                        </div>
                        ${actionHtml}
                    </div>
                `;
                container.appendChild(card);
            });

            // 2. Renderizar tarjeta especial de REGALO PERSONALIZADO
            const customCard = document.createElement('div');
            customCard.className = 'gift-card custom-gift-card';
            const stepAmount = currentCurrency === 'MXN' ? '100' : '10';
            const minPlaceholder = currentCurrency === 'MXN' ? 'Mín. $100' : 'Min. $5';
            customCard.innerHTML = `
                <div class="gift-img-wrapper">
                    <div class="price-badge">Monto Libre</div>
                    <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop" alt="Regalo Personalizado" loading="lazy">
                </div>
                <div class="gift-content">
                    <div>
                        <h3 class="gift-title">Regalo Personalizado</h3>
                        <p class="gift-desc">¿Deseas consentirnos con algo especial o un monto libre? Escribe tu idea y el importe con el que deseas aportar a nuestra luna de miel.</p>
                        <div class="custom-input-group">
                            <label class="custom-input-label" for="customConceptInput">¿Qué te gustaría regalarnos?</label>
                            <input type="text" id="customConceptInput" class="custom-input" placeholder="Ej. Un helado en Tokio, un recuerdo..." maxlength="60">
                            
                            <label class="custom-input-label" for="customAmountInput">Monto a regalar (${currentCurrency})</label>
                            <div class="custom-amount-wrapper">
                                <span class="custom-amount-prefix">$</span>
                                <input type="number" id="customAmountInput" class="custom-input custom-amount-input" placeholder="${minPlaceholder}" min="5" step="${stepAmount}">
                                <span class="custom-amount-currency">${currentCurrency}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-custom-gift" onclick="addCustomGiftToCart()">Agregar al Carrito 🎁</button>
                </div>
            `;
            container.appendChild(customCard);

            // Restaurar textos si los había
            if (savedConcept) {
                const cInput = document.getElementById('customConceptInput');
                if (cInput) cInput.value = savedConcept;
            }
            if (savedAmount) {
                const aInput = document.getElementById('customAmountInput');
                if (aInput) aInput.value = savedAmount;
            }
        }

        function addCustomGiftToCart() {
            const conceptInput = document.getElementById('customConceptInput');
            const amountInput = document.getElementById('customAmountInput');
            if (!amountInput) return;
            
            const rawAmount = parseFloat(amountInput.value);
            const minAmount = currentCurrency === 'MXN' ? 50 : 5;
            
            if (isNaN(rawAmount) || rawAmount < minAmount) {
                alert(`Por favor ingresa un monto válido (mínimo $${minAmount} ${currentCurrency}).`);
                amountInput.focus();
                return;
            }
            
            const concept = (conceptInput && conceptInput.value.trim()) 
                ? conceptInput.value.trim() 
                : 'Regalo Personalizado';
                
            const customId = 'custom-' + Date.now();
            const newGift = {
                id: customId,
                title: concept,
                description: 'Aportación libre personalizada de un invitado con mucho cariño.',
                imagePath: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
                priceMXN: currentCurrency === 'MXN' ? rawAmount : Math.round(rawAmount * 18),
                priceUSD: currentCurrency === 'USD' ? rawAmount : Math.max(1, Math.round(rawAmount / 18)),
                isCustom: true
            };
            
            giftsConfig.push(newGift);
            shoppingCart[customId] = 1;
            
            if (conceptInput) conceptInput.value = '';
            amountInput.value = '';
            
            updateCartUI();
            renderGiftCards();
            
            const btn = document.querySelector('.cart-float-btn');
            if (btn) {
                btn.style.transform = 'scale(1.25)';
                setTimeout(() => btn.style.transform = 'scale(1)', 250);
            }
            
            const drawer = document.getElementById('cartDrawer');
            if (drawer && !drawer.classList.contains('active')) {
                toggleCart();
            }
        }

        function setCurrency(currency) {
            if (Object.keys(shoppingCart).length > 0) {
                if(!confirm("Cambiar de moneda limpiará tu carrito actual. ¿Deseas continuar?")) {
                    document.getElementById('currencyToggle').checked = (currentCurrency === 'USD');
                    return; 
                }
                shoppingCart = {};
                giftsConfig = giftsConfig.filter(g => !g.isCustom);
                updateCartUI();
            }

            const toggle = document.getElementById('currencyToggle');
            toggle.checked = (currency === 'USD');
            toggleCurrency(toggle);
        }

        function toggleCurrency(checkbox) {
            if (Object.keys(shoppingCart).length > 0 && currentCurrency !== (checkbox.checked ? 'USD' : 'MXN')) {
                if(!confirm("Cambiar de moneda limpiará tu carrito actual. ¿Deseas continuar?")) {
                    checkbox.checked = !checkbox.checked;
                    return; 
                }
                shoppingCart = {};
                giftsConfig = giftsConfig.filter(g => !g.isCustom);
                updateCartUI();
            }

            currentCurrency = checkbox.checked ? 'USD' : 'MXN';
            
            document.getElementById('labelMXN').className = currentCurrency === 'MXN' ? 'currency-label active' : 'currency-label inactive';
            document.getElementById('labelUSD').className = currentCurrency === 'USD' ? 'currency-label active' : 'currency-label inactive';
            
            renderGiftCards();
            updateCartUI();
        }

        // ==========================
        // LÓGICA DEL CARRITO
        // ==========================

        function addToCart(giftId) {
            if (shoppingCart[giftId]) {
                shoppingCart[giftId]++;
            } else {
                shoppingCart[giftId] = 1;
            }
            updateCartUI();
            renderGiftCards();
            
            const btn = document.querySelector('.cart-float-btn');
            if (btn) {
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);
            }
        }

        function updateCartQty(giftId, delta) {
            if (!shoppingCart[giftId]) return;
            shoppingCart[giftId] += delta;
            
            if (shoppingCart[giftId] <= 0) {
                delete shoppingCart[giftId];
                if (giftId.startsWith('custom-')) {
                    const idx = giftsConfig.findIndex(g => g.id === giftId);
                    if (idx !== -1) giftsConfig.splice(idx, 1);
                }
            }
            updateCartUI();
            renderGiftCards();
        }

        function updateCartUI() {
            const body = document.getElementById('cartBody');
            const totalText = document.getElementById('cartTotalText');
            const checkoutBtn = document.getElementById('checkoutBtn');
            const badge = document.getElementById('cartBadge');
            
            let totalItems = 0;
            let totalPrice = 0;
            
            body.innerHTML = '';
            
            const keys = Object.keys(shoppingCart);
            
            if (keys.length === 0) {
                body.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío. ¡Anímate a regalarnos una experiencia!</div>';
                checkoutBtn.disabled = true;
                badge.style.display = 'none';
            } else {
                checkoutBtn.disabled = false;
                
                keys.forEach(id => {
                    const qty = shoppingCart[id];
                    const gift = giftsConfig.find(g => g.id === id);
                    if (!gift) return;
                    
                    const price = currentCurrency === 'MXN' ? gift.priceMXN : gift.priceUSD;
                    const itemTotal = price * qty;
                    
                    totalItems += qty;
                    totalPrice += itemTotal;
                    
                    const minusIcon = qty === 1 
                        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>' 
                        : '-';

                    const el = document.createElement('div');
                    el.className = 'cart-item';
                    el.innerHTML = `
                        <img src="${gift.imagePath}" class="cart-item-img" alt="${gift.title}">
                        <div class="cart-item-info">
                            <h4 class="cart-item-title">${gift.title}</h4>
                            <p class="cart-item-price">$${price.toLocaleString()} ${currentCurrency} c/u</p>
                            <div class="cart-qty-ctrl">
                                <button class="qty-btn" onclick="updateCartQty('${id}', -1)" aria-label="Eliminar o disminuir">${minusIcon}</button>
                                <span class="qty-num">${qty}</span>
                                <button class="qty-btn" onclick="updateCartQty('${id}', 1)" aria-label="Aumentar">+</button>
                            </div>
                        </div>
                    `;
                    body.appendChild(el);
                });
                
                badge.innerText = totalItems;
                badge.style.display = 'flex';
            }
            
            totalText.innerText = `$${totalPrice.toLocaleString('en-US')} ${currentCurrency}`;
        }

        function toggleCart() {
            const overlay = document.getElementById('cartOverlay');
            const drawer = document.getElementById('cartDrawer');
            
            overlay.classList.toggle('active');
            drawer.classList.toggle('active');
        }

        async function processCheckout() {
            if (Object.keys(shoppingCart).length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            const btn = document.querySelector('.btn-checkout');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Conectando con el banco...';
            btn.disabled = true;

            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        cart: shoppingCart,
                        giftsConfig: giftsConfig,
                        currency: currentCurrency
                    })
                });
                
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url; // Redirigir a la pasarela segura de Stripe
                } else {
                    alert('Hubo un error al conectar con Stripe: ' + (data.error || 'Error desconocido'));
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Error de conexión. Intenta nuevamente.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderGiftCards();
            updateCartUI();
        });
