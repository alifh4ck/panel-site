// app.js - single-file "backend" using localStorage + optional remote products

const STORE_KEY = "panel_shop_v1";

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function loadStore() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) return JSON.parse(raw);

  const store = {
    settings: {
      walletAddress: "0xa5de3c79c11ffbd55f08b3a5390b7c42fb6cea50",
      network: "BSC / BEP20",
      note: "Send exact amount then submit TxID.",
    },
    products: [
      {
        id: uid("prod"),
        name: "Panel 1",
        price: 10,
        currency: "USDT",
        description: "Example panel description",
        active: true,
        createdAt: nowISO(),
      },
    ],
    orders: [],
    messages: [],
  };
  saveStore(store);
  return store;
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function resetStore() {
  localStorage.removeItem(STORE_KEY);
}

function getActiveProducts(store) {
  return store.products.filter(p => p.active);
}

// ===== NEW: load products from GitHub RAW JSON =====
async function loadRemoteProducts(remoteUrl) {
  const res = await fetch(remoteUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load remote products.json");
  const products = await res.json();
  if (!Array.isArray(products)) throw new Error("Invalid products.json (must be array)");
  return products;
}

function createOrder({ email, productId, txId, name, telegram, productSnapshot }) {
  const store = loadStore();

  if (!name || name.trim().length < 2) throw new Error("Name required");
  if (!telegram || telegram.trim().length < 2) throw new Error("Telegram required");
  if (!email || !email.includes("@")) throw new Error("Valid email required");
  if (!txId || txId.length < 10) throw new Error("TxID required");

  // productSnapshot comes from UI (remote JSON), fallback to local lookup
  let snap = productSnapshot;
  if (!snap) {
    const product = store.products.find(p => p.id === productId && p.active);
    if (!product) throw new Error("Invalid product");
    snap = { name: product.name, price: product.price, currency: product.currency };
  }

  const order = {
    id: uid("order"),
    email,
    name: name || "",
    telegram: telegram || "",
    productId,
    productSnapshot: snap,
    txId,
    status: "PENDING",
    createdAt: nowISO(),
  };

  store.orders.unshift(order);
  saveStore(store);

  store.messages.push({
    id: uid("msg"),
    orderId: order.id,
    from: "SYSTEM",
    text: "Order created. Waiting for admin verification.",
    createdAt: nowISO(),
  });
  saveStore(store);

  return order;
}

function getOrders(store) {
  return store.orders;
}

function setOrderStatus(orderId, status) {
  const store = loadStore();
  const o = store.orders.find(x => x.id === orderId);
  if (!o) throw new Error("Order not found");
  o.status = status;
  saveStore(store);

  store.messages.push({
    id: uid("msg"),
    orderId,
    from: "SYSTEM",
    text: `Order status updated: ${status}`,
    createdAt: nowISO(),
  });
  saveStore(store);
}

function addMessage(orderId, from, text) {
  const store = loadStore();
  const o = store.orders.find(x => x.id === orderId);
  if (!o) throw new Error("Order not found");
  if (!text || text.trim().length < 1) throw new Error("Message required");

  store.messages.push({
    id: uid("msg"),
    orderId,
    from,
    text: text.trim(),
    createdAt: nowISO(),
  });
  saveStore(store);
}

function getMessages(orderId) {
  const store = loadStore();
  return store.messages
    .filter(m => m.orderId === orderId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// Admin product management (local only; remote uses products.json)
function addProduct({ name, price, currency, description, active }) {
  const store = loadStore();
  if (!name) throw new Error("Name required");
  if (typeof price !== "number" || isNaN(price)) throw new Error("Price required");

  store.products.unshift({
    id: uid("prod"),
    name,
    price,
    currency: currency || "USDT",
    description: description || "",
    active: active ?? true,
    createdAt: nowISO(),
  });
  saveStore(store);
}

function updateProduct(id, patch) {
  const store = loadStore();
  const p = store.products.find(x => x.id === id);
  if (!p) throw new Error("Product not found");
  Object.assign(p, patch);
  saveStore(store);
}

function deleteProduct(id) {
  const store = loadStore();
  store.products = store.products.filter(p => p.id !== id);
  saveStore(store);
}

function updateSettings(patch) {
  const store = loadStore();
  store.settings = { ...store.settings, ...patch };
  saveStore(store);
}

window.PanelShop = {
  loadStore,
  saveStore,
  resetStore,
  getActiveProducts,
  loadRemoteProducts, // NEW
  createOrder,
  getOrders,
  setOrderStatus,
  addMessage,
  getMessages,
  addProduct,
  updateProduct,
  deleteProduct,
  updateSettings,
};
