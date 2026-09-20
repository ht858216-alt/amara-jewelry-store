/* ============================================
   AMARA — FINE JEWELRY - Shared App Logic
   Uses localStorage for: users, currentUser, cart, favorites
   ============================================ */

/* ---------- Safe Storage Wrapper ----------
   Some browsers block real localStorage when a page is opened directly
   as a file:// (double-click) instead of through a server. If that
   happens we fall back to an in-memory store so the site still works
   for the current tab, and we warn the user instead of failing silently. */
const memoryStore = {};
let storageIsBroken = false;

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    storageIsBroken = true;
    console.error("localStorage blocked, using memory fallback:", err);
    return memoryStore[key] ?? null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    storageIsBroken = true;
    console.error("localStorage blocked, using memory fallback:", err);
    memoryStore[key] = value;
  }
}
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    storageIsBroken = true;
    console.error("localStorage blocked, using memory fallback:", err);
    delete memoryStore[key];
  }
}

function showStorageWarning() {
  if (document.getElementById("storage-warning")) return;
  const bar = document.createElement("div");
  bar.id = "storage-warning";
  bar.style.cssText =
    "background:#fef3c7;color:#92400e;padding:10px 20px;text-align:center;font-size:14px;";
  bar.textContent =
    "⚠️ Storage is blocked by your browser on this page (file://). Login/Cart data won't be saved between pages — run the site through a local server (e.g. VS Code Live Server) to fix this.";
  document.body.prepend(bar);
}

/* ---------- Storage Helpers ----------
   NOTE: all keys are prefixed with "amara_" so this app never
   collides with localStorage data from any other local project you have
   open via file:// on the same machine/browser (a common source of bugs
   like "users.some is not a function" when two projects both use a
   plain "users" key). */
function getUsers() {
  const data = JSON.parse(safeGet("amara_users"));
  return Array.isArray(data) ? data : [];
}
function saveUsers(users) {
  safeSet("amara_users", JSON.stringify(users));
}
function getCurrentUser() {
  const data = JSON.parse(safeGet("amara_currentUser"));
  return data && typeof data === "object" ? data : null;
}
function setCurrentUser(user) {
  safeSet("amara_currentUser", JSON.stringify(user));
}
function logoutUser() {
  safeRemove("amara_currentUser");
  window.location.href = "index.html";
}

/* Cart & favorites are stored per user email so each account has its own */
function cartKey() {
  const user = getCurrentUser();
  return user ? `amara_cart_${user.email}` : "amara_cart_guest";
}
function favKey() {
  const user = getCurrentUser();
  return user ? `amara_favorites_${user.email}` : "amara_favorites_guest";
}

function getCart() {
  const data = JSON.parse(safeGet(cartKey()));
  return Array.isArray(data) ? data : [];
}
function saveCart(cart) {
  safeSet(cartKey(), JSON.stringify(cart));
}
function getFavorites() {
  const data = JSON.parse(safeGet(favKey()));
  return Array.isArray(data) ? data : [];
}
function saveFavorites(favs) {
  safeSet(favKey(), JSON.stringify(favs));
}

/* ---------- Cart Operations ---------- */
function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  renderHeader();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((i) => i.id !== productId);
  saveCart(cart);
  renderHeader();
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  renderHeader();
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  const cart = getCart();
  return cart.reduce((sum, i) => {
    const p = PRODUCTS.find((p) => p.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

/* ---------- Favorites Operations ---------- */
function toggleFavorite(productId) {
  let favs = getFavorites();
  if (favs.includes(productId)) {
    favs = favs.filter((id) => id !== productId);
  } else {
    favs.push(productId);
  }
  saveFavorites(favs);
}
function isFavorite(productId) {
  return getFavorites().includes(productId);
}

/* ---------- Header Rendering (shared across all pages) ---------- */
function renderHeader() {
  const headerRight = document.getElementById("header-right");
  if (!headerRight) return;

  const user = getCurrentUser();

  if (user) {
    headerRight.innerHTML = `
      <span class="hello-text">Hello, ${user.firstName}</span>
      <div class="cart-wrapper">
        <button id="cart-btn" class="cart-btn">🛒 <span id="cart-count">${cartCount()}</span></button>
        <div id="cart-dropdown" class="cart-dropdown hidden"></div>
      </div>
      <button id="logout-btn" class="btn btn-outline-danger">Logout</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", logoutUser);
    const cartBtn = document.getElementById("cart-btn");
    const dropdown = document.getElementById("cart-dropdown");
    cartBtn.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
      renderCartDropdown();
    });
    document.addEventListener("click", (e) => {
      if (!cartBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  } else {
    headerRight.innerHTML = `
      <a href="login.html" class="btn btn-outline-primary">Login</a>
      <a href="register.html" class="btn btn-outline-success">Register</a>
    `;
  }
}

function renderCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  if (!dropdown) return;
  const cart = getCart();

  if (cart.length === 0) {
    dropdown.innerHTML = `<p class="empty-text">Your cart is empty</p>`;
    return;
  }

  let html = "";
  cart.forEach((item) => {
    const p = PRODUCTS.find((p) => p.id === item.id);
    if (!p) return;
    html += `
      <div class="cart-drop-item">
        <div class="cart-drop-info">
          <strong>${p.name}</strong>
          <span>Price: $${p.price}</span>
        </div>
        <div class="qty-controls">
          <button onclick="changeQty(${p.id}, -1); renderCartDropdown();">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${p.id}, 1); renderCartDropdown();">+</button>
        </div>
      </div>
    `;
  });
  html += `<a href="cart.html" class="btn btn-dark view-all-btn">View All Products</a>`;
  dropdown.innerHTML = html;
}

/* Run on every page load */
document.addEventListener("DOMContentLoaded", () => {
  try {
    renderHeader();
  } catch (err) {
    console.error("renderHeader failed:", err);
  }
  if (storageIsBroken) showStorageWarning();
});
