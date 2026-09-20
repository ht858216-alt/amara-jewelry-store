/* ============================================
   ECLIPSE JEWELRY - Cart Page Logic
   ============================================ */

function renderCartPage() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const cart = getCart();

  if (!getCurrentUser()) {
    container.innerHTML = `<p class="empty-state">Please <a href="login.html">login</a> to view your cart.</p>`;
    totalEl.textContent = "";
    return;
  }

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-state">Your cart is empty.</p>`;
    totalEl.textContent = "";
    return;
  }

  container.innerHTML = "";
  cart.forEach((item) => {
    const p = PRODUCTS.find((p) => p.id === item.id);
    if (!p) return;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="cart-item-info">
        <h3>${p.name}</h3>
        <p>Category: ${p.category}</p>
        <p>Price: $${p.price * item.qty}</p>
      </div>
      <div class="qty-controls">
        <button data-action="dec" data-id="${p.id}">-</button>
        <span>${item.qty}</span>
        <button data-action="inc" data-id="${p.id}">+</button>
      </div>
      <button class="btn btn-danger" data-action="remove" data-id="${p.id}">Remove from Cart</button>
    `;
    container.appendChild(row);
  });

  totalEl.textContent = `Total Price: $${cartTotal().toFixed(2)}`;

  container.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeFromCart(id);
      renderCartPage();
    });
  });
}

function renderFavoritesSection() {
  const grid = document.getElementById("favorites-grid");
  const favs = getFavorites();

  if (favs.length === 0) {
    grid.innerHTML = `<p class="empty-state">No favorite items yet.</p>`;
    return;
  }

  grid.innerHTML = "";
  favs.forEach((id) => {
    const p = PRODUCTS.find((p) => p.id === id);
    if (!p) return;
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>Category: ${p.category}</p>
        <div class="product-actions">
          <button class="fav-heart active" data-id="${p.id}">♥</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".fav-heart").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleFavorite(Number(btn.dataset.id));
      renderFavoritesSection();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  renderFavoritesSection();
});
