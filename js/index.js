/* ============================================
   ECLIPSE JEWELRY - Home Page (product listing)
   ============================================ */

function renderProducts(list) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<p class="no-results">No products found.</p>`;
    return;
  }

  list.forEach((p) => {
    const fav = isFavorite(p.id);
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>Price: $${p.price}</p>
        <p>Category: ${p.category}</p>
        <div class="product-actions">
          <button class="fav-heart ${fav ? "active" : ""}" data-id="${p.id}">♥</button>
          <button class="btn btn-primary add-cart-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Wire up heart buttons
  grid.querySelectorAll(".fav-heart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!getCurrentUser()) {
        alert("Please login to add favorites.");
        return;
      }
      toggleFavorite(id);
      btn.classList.toggle("active");
    });
  });

  // Wire up add-to-cart buttons
  grid.querySelectorAll(".add-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!getCurrentUser()) {
        alert("Please login to add items to your cart.");
        window.location.href = "login.html";
        return;
      }
      addToCart(Number(btn.dataset.id));
    });
  });
}

function applySearch() {
  const type = document.getElementById("search-type").value;
  const query = document.getElementById("search-input").value.trim().toLowerCase();

  if (!query) {
    renderProducts(PRODUCTS);
    return;
  }

  const filtered = PRODUCTS.filter((p) => {
    const field = type === "category" ? p.category : p.name;
    return field.toLowerCase().includes(query);
  });
  renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(PRODUCTS);
  document.getElementById("search-btn").addEventListener("click", applySearch);
  document.getElementById("search-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") applySearch();
    if (e.target.value.trim() === "") renderProducts(PRODUCTS);
    else applySearch();
  });
});
