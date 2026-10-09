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
        
        // CONFIGURACIÓN EXPANDIDA DE REGALOS
        const giftsConfigRaw = [
            {
                id: 'prueba-sistema', title: '🛠️ Regalo de Prueba',
                description: 'Tarjeta temporal para verificar que el sistema de cobros con Stripe funcione a la perfección.',
                imagePath: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
                priceMXN: 10, priceUSD: 1
            },
            
            {
                id: 'desayuno', title: 'Desayuno en la cama',
                description: 'Invítanos un rico desayuno para recuperar energía después de la boda.',
                imagePath: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop',
                priceMXN: 500, priceUSD: 30
            },
            {
                id: 'botella-vino', title: 'Botella de Vino',
                description: 'Para brindar en nuestra primera cena de recién casados.',
                imagePath: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
                priceMXN: 800, priceUSD: 45
            },
            {
                id: 'masaje', title: 'Masaje Relajante',
                description: 'Una sesión de spa en pareja durante nuestra luna de miel.',
                imagePath: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2000, priceUSD: 110
            },
            {
                id: 'cena-luna-miel', title: 'Cena Romántica',
                description: 'Nuestra primera cena elegante a la luz de las velas.',
                imagePath: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1500, priceUSD: 85
            },
            {
                id: 'vuelo-globo', title: 'Vuelo en Globo',
                description: 'Una aventura inolvidable por los aires durante nuestro viaje.',
                imagePath: 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5?q=80&w=800&auto=format&fit=crop',
                priceMXN: 4500, priceUSD: 250
            },
            {
                id: 'juego-maletas', title: 'Juego de Maletas',
                description: 'Para acompañarnos en todas nuestras futuras aventuras.',
                imagePath: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?q=80&w=800&auto=format&fit=crop',
                priceMXN: 3500, priceUSD: 200
            },
            {
                id: 'tour-ciudad', title: 'Tour Turístico',
                description: 'Ayúdanos a explorar y conocer la cultura de nuestro destino.',
                imagePath: 'https://images.unsplash.com/photo-1522851480922-0d12579ee5e4?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1200, priceUSD: 70
            },
            {
                id: 'clase-cocina', title: 'Clase de Cocina en Pareja',
                description: 'Para aprender a preparar un platillo tradicional del lugar que visitemos.',
                imagePath: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2500, priceUSD: 140
            },
            {
                id: 'noches-hotel', title: 'Noche de Hotel',
                description: 'Un upgrade a nuestra suite para tener la mejor vista.',
                imagePath: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
                priceMXN: 6000, priceUSD: 330
            },
            {
                id: 'robot-aspiradora', title: 'Robot Aspiradora',
                description: 'Para mantener la casa impecable sin esfuerzo y poder jugar más con Maddie.',
                imagePath: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
                priceMXN: 5000, priceUSD: 280
            },
            {
                id: 'cafetera-hogar', title: 'Cafetera Espresso',
                description: 'Para despertar siempre con un buen café en nuestro nuevo hogar.',
                imagePath: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
                priceMXN: 4000, priceUSD: 220
            },
            {
                id: 'juego-sartenes', title: 'Juego de Sartenes Pro',
                description: 'Para cocinar juntos nuestras recetas favoritas.',
                imagePath: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2800, priceUSD: 155
            },
            {
                id: 'juegos-mesa', title: 'Juego de Mesa',
                description: 'Para las noches de diversión con amigos y familia.',
                imagePath: 'https://images.unsplash.com/photo-1610890716175-349be88a9cce?q=80&w=800&auto=format&fit=crop',
                priceMXN: 600, priceUSD: 35
            },
            {
                id: 'juguete-maddie', title: 'Juguete para Maddie',
                description: 'Consiente a nuestra perrita con un juguete nuevo o unos premios deliciosos.',
                imagePath: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800&auto=format&fit=crop',
                priceMXN: 300, priceUSD: 15
            },
            {
                id: 'juego-copas', title: 'Juego de Copas',
                description: 'Un set de cristal elegante para nuestros brindis.',
                imagePath: 'https://images.unsplash.com/photo-1582239611204-7cd50393f9c6?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1000, priceUSD: 55
            },
            {
                id: 'suscripcion-flores', title: 'Suscripción de Flores',
                description: 'Un detalle romántico mensual para decorar nuestro hogar.',
                imagePath: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1800, priceUSD: 100
            },
            {
                id: 'clases-baile', title: 'Clases de Baile',
                description: 'Para prepararnos y no pisarnos durante el primer baile.',
                imagePath: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2200, priceUSD: 120
            },
            {
                id: 'aportacion-auto', title: 'Aportación para Automóvil',
                description: 'Apóyanos a dar el enganche de nuestro futuro coche familiar.',
                imagePath: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop',
                priceMXN: 8000, priceUSD: 440
            },
            {
                id: 'paseo-bote', title: 'Paseo Romántico en Bote',
                description: 'Una escapada relajante por el lago.',
                imagePath: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop',
                priceMXN: 3000, priceUSD: 165
            },
            {
                id: 'juego-blancos', title: 'Juego de Sábanas Finas',
                description: 'Sábanas de muchos hilos para descansar increíble.',
                imagePath: 'https://images.unsplash.com/photo-1616422285623-14ff7d6a5fcc?q=80&w=800&auto=format&fit=crop',
                priceMXN: 2600, priceUSD: 145
            },
            {
                id: 'kit-herramientas', title: 'Kit de Herramientas',
                description: 'Para poder armar los muebles sin que sobren tornillos.',
                imagePath: 'https://images.unsplash.com/photo-1540356501755-a010076a4cb9?q=80&w=800&auto=format&fit=crop',
                priceMXN: 1600, priceUSD: 90
            },
            {
                id: 'licuadora', title: 'Licuadora de Alta Potencia',
                description: 'Para los jugos verdes de la mañana y los frappés del fin de semana.',
                imagePath: 'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800&auto=format&fit=crop',
                priceMXN: 3200, priceUSD: 175
            },
            {
                id: 'velas-aromaticas', title: 'Set de Velas Aromáticas',
                description: 'Para darle un toque relajante a nuestro nuevo hogar.',
                imagePath: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
                priceMXN: 400, priceUSD: 22
            }
        ];
        
        // Sort items by price
        const giftsConfig = giftsConfigRaw.sort((a, b) => a.priceMXN - b.priceMXN);
        

        function renderGiftCards() {
            const container = document.getElementById('giftsGridContainer');
            if (!container) return;
            
            container.innerHTML = '';
            
            giftsConfig.forEach(gift => {
                const card = document.createElement('div');
                card.className = `gift-card`;
                
                const fallbackImg = `https://source.unsplash.com/800x600/?wedding,gift,${gift.id}`;
                const price = currentCurrency === 'MXN' ? `$${gift.priceMXN.toLocaleString('en-US')} MXN` : `$${gift.priceUSD.toLocaleString('en-US')} USD`;
                const priceHtml = `<div class="price-badge">${price}</div>`;
                
                const qtyInCart = shoppingCart[gift.id] || 0;
                let actionHtml = '';
                if (qtyInCart > 0) {
                    const minusIcon = qtyInCart === 1 ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>' : '-';
                    actionHtml = `
                        <div class="card-qty-ctrl">
                            <button class="qty-btn" onclick="updateCartQty('${gift.id}', -1)">${minusIcon}</button>
                            <span class="qty-num">${qtyInCart}</span>
                            <button class="qty-btn" onclick="updateCartQty('${gift.id}', 1)">+</button>
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
        }

        function setCurrency(currency) {
            // Si el carrito tiene elementos, advertir o limpiar
            if (Object.keys(shoppingCart).length > 0) {
                if(!confirm("Cambiar de moneda limpiará tu carrito actual. ¿Deseas continuar?")) {
                    // Revertir el toggle visualmente
                    document.getElementById('currencyToggle').checked = (currentCurrency === 'USD');
                    return; 
                }
                shoppingCart = {}; // Limpiar
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
            
            // Animación feedback visual
            const btn = document.querySelector('.cart-float-btn');
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = 'scale(1)', 200);
        }

        function updateCartQty(giftId, delta) {
            if (!shoppingCart[giftId]) return;
            shoppingCart[giftId] += delta;
            
            if (shoppingCart[giftId] <= 0) {
                delete shoppingCart[giftId];
            }
            updateCartUI();
            renderGiftCards(); // Re-render card buttons
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
                    
                    const el = document.createElement('div');
                    el.className = 'cart-item';
                    el.innerHTML = `
                        <img src="${gift.imagePath}" class="cart-item-img" alt="${gift.title}">
                        <div class="cart-item-info">
                            <h4 class="cart-item-title">${gift.title}</h4>
                            <p class="cart-item-price">$${price.toLocaleString()} ${currentCurrency} c/u</p>
                            <div class="cart-qty-ctrl">
                                <button class="qty-btn" onclick="updateCartQty('${id}', -1)">-</button>
                                <span class="qty-num">${qty}</span>
                                <button class="qty-btn" onclick="updateCartQty('${id}', 1)">+</button>
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
                        giftsConfig: giftsConfig 
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
