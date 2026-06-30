// app.js - single-file "backend" using localStorage

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

  // default store
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
    messages: [], // {id, orderId, from, text, createdAt}
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

function createOrder({ email, productId, txId }) {
  const store = loadStore();
  const product = store.products.find(p => p.id === productId && p.active);
  if (!product) throw new Error("Invalid product");

  if (!email || !email.includes("@")) throw new Error("Valid email required");
  if (!txId || txId.length < 10) throw new Error("TxID required");

  const order = {
    id: uid("order"),
    email,
    productId,
    productSnapshot: { name: product.name, price: product.price, currency: product.currency },
    txId,
    status: "PENDING", // PENDING / PAID / REJECTED
    createdAt: nowISO(),
  };

  store.orders.unshift(order);
  saveStore(store);

  // First system message
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
    from, // USER / ADMIN / SYSTEM
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

// Admin product management
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

// Settings
function updateSettings(patch) {
  const store = loadStore();
  store.settings = { ...store.settings, ...patch };
  saveStore(store);
}

// Expose for pages
window.PanelShop = {
  loadStore,
  saveStore,
  resetStore,
  getActiveProducts,
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
