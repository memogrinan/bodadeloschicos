import re
import os

path = "regalos.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Floating Cart Button
cart_btn_pattern = r'<!-- BOTÓN FLOTANTE CARRITO -->\s*<button class="cart-float-btn"[^>]*>.*?<div class="cart-badge" id="cartBadge"'
new_cart_btn = """<!-- BOTÓN FLOTANTE CARRITO -->
    <button class="cart-float-btn" onclick="toggleCart()" aria-label="Ver carrito">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <div class="cart-badge" id="cartBadge" """
content = re.sub(cart_btn_pattern, new_cart_btn, content, flags=re.DOTALL)

# 2. Add CSS for card-qty-ctrl
css_insertion = """
        .card-qty-ctrl { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 15px; background: var(--crema-fondo); border-radius: 25px; padding: 5px; border: 1px solid rgba(82, 88, 47, 0.2); }
        .card-qty-ctrl .qty-btn { background: white; border: 1px solid #ddd; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--olivo-base); font-weight: bold; font-size: 1.1rem; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .card-qty-ctrl .qty-btn:hover { background: var(--olivo-base); color: white; border-color: var(--olivo-base); }
        .card-qty-ctrl .qty-num { font-size: 1.1rem; font-weight: 600; width: 30px; text-align: center; color: var(--olivo-base); }
"""
content = content.replace("/* FLOATING CART BUTTON */", css_insertion + "\n        /* FLOATING CART BUTTON */")

# 3. Update renderGiftCards inside JS
js_pattern = r'const fallbackImg = .*?container\.appendChild\(card\);\s*\}\);'
new_js = """const fallbackImg = `https://source.unsplash.com/800x600/?wedding,gift,${gift.id}`;
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
            });"""
content = re.sub(js_pattern, new_js, content, flags=re.DOTALL)

# 4. updateCartQty should call renderGiftCards to re-render buttons
update_cart_pattern = r'function updateCartQty\(giftId, delta\) \{.*?updateCartUI\(\);\s*\}'
new_update_cart = """function updateCartQty(giftId, delta) {
            if (!shoppingCart[giftId]) return;
            shoppingCart[giftId] += delta;
            
            if (shoppingCart[giftId] <= 0) {
                delete shoppingCart[giftId];
            }
            updateCartUI();
            renderGiftCards(); // Re-render card buttons
        }"""
content = re.sub(update_cart_pattern, new_update_cart, content, flags=re.DOTALL)

# 5. addToCart should also call renderGiftCards
add_to_cart_pattern = r'function addToCart\(giftId\) \{.*?updateCartUI\(\);'
new_add_to_cart = """function addToCart(giftId) {
            if (shoppingCart[giftId]) {
                shoppingCart[giftId]++;
            } else {
                shoppingCart[giftId] = 1;
            }
            updateCartUI();
            renderGiftCards();"""
content = re.sub(add_to_cart_pattern, new_add_to_cart, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("regalos.html UI modified!")
