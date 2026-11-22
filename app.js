const API_URL = "https://fakestoreapi.com/products";
let products = [];
let activeCategory = "all";
let searchTerm = "";
let sortMode = "featured";
let cart = JSON.parse(localStorage.getItem("zenvora-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("zenvora-wishlist") || "[]");
let toastTimer;

const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + Number(n || 0).toFixed(2);
const safe = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categoryName = (c) => ({electronics:"Electronics",jewelery:"Jewelry","men's clothing":"Men's Clothing","women's clothing":"Women's Clothing"}[c] || c);

function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}
function saveState() {
  localStorage.setItem("zenvora-cart", JSON.stringify(cart));
  localStorage.setItem("zenvora-wishlist", JSON.stringify(wishlist));
  updateCounters();
}
function updateCounters() {
  $("cart-count").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  $("wishlist-count").textContent = wishlist.length;
  $("drawer-count").textContent = `(${cart.reduce((sum, item) => sum + item.qty, 0)})`;
}
function filteredProducts() {
  let list = [...products];
  if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
  if (searchTerm) list = list.filter(p => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm));
  if (sortMode === "low") list.sort((a,b) => a.price-b.price);
  if (sortMode === "high") list.sort((a,b) => b.price-a.price);
  if (sortMode === "rating") list.sort((a,b) => b.rating.rate-a.rating.rate);
  if (sortMode === "az") list.sort((a,b) => a.title.localeCompare(b.title));
  return list;
}
function renderProducts() {
  const list = filteredProducts();
  $("result-count").textContent = `${list.length} product${list.length===1?"":"s"} found`;
  if (!list.length) { $("product-grid").innerHTML = `<div class="loading"><p>No products found. Try another search or filter.</p></div>`; return; }
  $("product-grid").innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${safe(p.image)}" alt="${safe(p.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.insertAdjacentHTML('beforeend','<span class=&quot;image-fallback&quot;>Image unavailable</span>')">
        <span class="product-tag">${safe(categoryName(p.category))}</span>
        <button class="wish-toggle ${wishlist.includes(p.id)?"saved":""}" data-action="wish" data-id="${p.id}" aria-label="Add to wishlist">${wishlist.includes(p.id)?"♥":"♡"}</button>
      </div>
      <div class="product-info">
        <div class="product-category">${safe(categoryName(p.category))}</div>
        <div class="product-title">${safe(p.title)}</div>
        <div class="rating">★ ${Number(p.rating.rate).toFixed(1)} <span>(${p.rating.count} reviews)</span></div>
        <div class="product-bottom"><strong class="product-price">${money(p.price)}</strong><button class="add-btn" data-action="add" data-id="${p.id}">Add to cart +</button></div>
      </div>
      <button class="quick-btn" data-action="quick" data-id="${p.id}">Quick view ↗</button>
    </article>`).join("");
}
async function loadProducts() {
  $("api-error").hidden = true;
  $("product-grid").innerHTML = `<div class="loading"><div class="spinner"></div><p>Finding lovely things for you...</p></div>`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API request failed");
    products = await response.json();
    renderProducts();
  } catch (err) {
    $("product-grid").innerHTML = "";
    $("api-error").hidden = false;
    $("result-count").textContent = "Products unavailable";
  }
}
function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === category));
  renderProducts();
  location.hash = "#/shop";
  $("shop").scrollIntoView({behavior:"smooth"});
}
function addToCart(id) {
  const product = products.find(p => p.id === Number(id));
  if (!product) return;
  const found = cart.find(item => item.id === product.id);
  if (found) found.qty += 1; else cart.push({id:product.id,qty:1});
  saveState(); renderCart(); toast("Added to your cart");
}
function changeQty(id, delta) {
  const item = cart.find(x => x.id === Number(id));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== Number(id));
  saveState(); renderCart();
}
function removeCartItem(id) { cart = cart.filter(x => x.id !== Number(id)); saveState(); renderCart(); toast("Item removed"); }
function renderCart() {
  updateCounters();
  const host = $("cart-items");
  if (!cart.length) {
    host.innerHTML = `<div class="empty"><strong>Your cart is waiting.</strong>Looks like you haven't added anything yet.<br><a href="#/shop" class="btn btn-outline" style="margin-top:15px" data-action="close">Continue shopping</a></div>`;
    $("cart-footer").style.display = "none"; return;
  }
  $("cart-footer").style.display = "block";
  host.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return "";
    return `<div class="cart-row"><img src="${safe(p.image)}" alt=""><div><h4>${safe(p.title)}</h4><small>${money(p.price)} each</small><div class="qty"><button data-action="qty" data-id="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-action="qty" data-id="${p.id}" data-delta="1">+</button></div></div><div><b>${money(p.price*item.qty)}</b><br><button class="remove" data-action="remove" data-id="${p.id}">Remove</button></div></div>`;
  }).join("");
  const subtotal = cart.reduce((sum,item) => { const p=products.find(x=>x.id===item.id); return sum+(p?p.price*item.qty:0); },0);
  const tax = subtotal * .05, shipping = subtotal === 0 ? 0 : (subtotal >= 100 ? 0 : 8);
  $("subtotal").textContent=money(subtotal); $("tax").textContent=money(tax); $("shipping").textContent=shipping===0?"FREE":money(shipping); $("total").textContent=money(subtotal+tax+shipping);
}
function renderWishlist() {
  const host = $("wishlist-items");
  const saved = wishlist.map(id => products.find(p => p.id===id)).filter(Boolean);
  if (!saved.length) { host.innerHTML=`<div class="empty"><strong>Your wishlist is empty.</strong>Save the things you love and find them here.</div>`; return; }
  host.innerHTML=saved.map(p=>`<div class="cart-row"><img src="${safe(p.image)}" alt=""><div><h4>${safe(p.title)}</h4><small>${money(p.price)}</small><div class="qty"><button class="add-btn" data-action="add" data-id="${p.id}">Add to cart</button></div></div><button class="remove" data-action="wish" data-id="${p.id}">Remove</button></div>`).join("");
}
function toggleWish(id) {
  id=Number(id);
  if (wishlist.includes(id)) { wishlist=wishlist.filter(x=>x!==id); toast("Removed from wishlist"); }
  else { wishlist.push(id); toast("Saved to wishlist"); }
  saveState(); renderProducts(); renderWishlist();
}
function openDrawer(which) {
  closePanels();
  $("backdrop").classList.add("show");
  const drawer = $(which === "cart" ? "cart-drawer" : "wishlist-drawer");
  drawer.classList.add("open"); drawer.setAttribute("aria-hidden","false");
  if (which==="cart") renderCart(); else renderWishlist();
}
function closePanels() {
  document.querySelectorAll(".drawer").forEach(d=>{d.classList.remove("open");d.setAttribute("aria-hidden","true");});
  document.querySelectorAll(".modal-wrap").forEach(m=>m.classList.remove("open"));
  $("backdrop").classList.remove("show");
}
function openQuick(id) {
  const p=products.find(x=>x.id===Number(id)); if(!p)return;
  $("quick-content").innerHTML=`<div class="quick-layout"><img src="${safe(p.image)}" alt="${safe(p.title)}"><div><div class="eyebrow">${safe(categoryName(p.category))}</div><h2>${safe(p.title)}</h2><div class="rating">★ ${p.rating.rate} <span>(${p.rating.count} reviews)</span></div><p>${safe(p.description)}</p><div class="quick-price">${money(p.price)}</div><button class="btn btn-primary" data-action="add" data-id="${p.id}" style="margin-top:18px">Add to cart ↗</button><button class="btn btn-outline" data-action="wish" data-id="${p.id}" style="margin:18px 0 0 7px">♡ Wishlist</button></div></div>`;
  $("quick-modal").classList.add("open");
}
function openCheckout() {
  if (!cart.length) { toast("Your cart is empty"); return; }
  closePanels();
  $("checkout-content").innerHTML=`<div class="checkout-content"><div class="eyebrow">ALMOST YOURS</div><h2>Complete your order</h2><p>This is a demo checkout. No payment will be collected.</p><form id="checkout-form" class="checkout-form">
    <label>Full name<input name="name" required placeholder="Your name"></label>
    <label>Email address<input name="email" type="email" required placeholder="you@example.com"></label>
    <label>Phone number<input name="phone" required pattern="[0-9+() -]{8,}" placeholder="Phone number"></label>
    <label>Pincode<input name="pin" required pattern="[0-9]{6}" placeholder="6-digit pincode"></label>
    <label class="wide">Delivery address<textarea name="address" required placeholder="House number, street, area"></textarea></label>
    <label>City<input name="city" required placeholder="City"></label>
    <label>State<input name="state" required placeholder="State"></label>
    <button class="btn btn-primary full wide" type="submit">Place demo order ↗</button>
  </form></div>`;
  $("checkout-modal").classList.add("open");
}
function showSuccess(name) {
  const order = "ZNV" + Math.random().toString(36).slice(2,8).toUpperCase();
  $("checkout-content").innerHTML=`<div class="success"><div class="success-icon">✓</div><h2>Order placed successfully!</h2><p>Thank you, ${safe(name)}. Your demo order has been created.</p><p>Demo order ID: <b>${order}</b></p><p class="muted">This is a frontend demonstration only. No real order or payment was made.</p><button class="btn btn-primary" data-action="finish">Continue shopping</button></div>`;
  cart=[]; saveState(); renderCart();
}
function syncSearch(value) {
  searchTerm=value.trim().toLowerCase();
  $("inline-search").value=value;
  $("search-input").value=value;
  renderProducts();
}
function route() {
  const route=(location.hash.replace(/^#\/?/,"").split("?")[0]||"");
  document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===route || (route.startsWith("shop")&&a.dataset.route==="shop")));
  if(route==="shop/new") sortMode="featured";
  if(route==="shop/best") sortMode="rating";
  if(route==="shop"||route.startsWith("shop/")) $("shop").scrollIntoView({behavior:"smooth"});
  else if(route==="categories") $("categories").scrollIntoView({behavior:"smooth"});
  else if(route==="about") $("about").scrollIntoView({behavior:"smooth"});
  else if(route==="") window.scrollTo({top:0,behavior:"smooth"});
  renderProducts();
}
document.addEventListener("click", e => {
  const action=e.target.closest("[data-action]");
  const category=e.target.closest("[data-category]");
  const filter=e.target.closest("[data-filter]");
  if (category) { setCategory(category.dataset.category); return; }
  if (filter) { setCategory(filter.dataset.filter); return; }
  if (!action) return;
  const {action:act,id}=action.dataset;
  if(act==="cart") openDrawer("cart");
  if(act==="wishlist") openDrawer("wishlist");
  if(act==="close"||act==="finish") { closePanels(); if(act==="finish") location.hash="#/shop"; }
  if(act==="add") addToCart(id);
  if(act==="wish") toggleWish(id);
  if(act==="quick") openQuick(id);
  if(act==="qty") changeQty(id,Number(action.dataset.delta));
  if(act==="remove") removeCartItem(id);
  if(act==="search") { $("search-panel").classList.toggle("show"); $("search-input").focus(); }
  if(act==="clear-search") { $("search-input").value=""; syncSearch(""); }
  if(act==="menu") $("nav").classList.toggle("open");
});
$("backdrop").addEventListener("click",closePanels);
$("checkout").addEventListener("click",openCheckout);
$("checkout-content").addEventListener("submit",e=>{if(e.target.id==="checkout-form"){e.preventDefault();const name=new FormData(e.target).get("name");showSuccess(name);}});
$("filters").addEventListener("click",()=>{});
$("inline-search").addEventListener("input",e=>syncSearch(e.target.value));
$("search-input").addEventListener("input",e=>syncSearch(e.target.value));
$("sort").addEventListener("change",e=>{sortMode=e.target.value;renderProducts();});
$("reset-filters").addEventListener("click",()=>{activeCategory="all";sortMode="featured";searchTerm="";$("sort").value="featured";$("inline-search").value="";$("search-input").value="";document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all"));renderProducts();});
$("retry").addEventListener("click",loadProducts);
window.addEventListener("hashchange",route);
window.addEventListener("mousemove",e=>{
  const hero=$("hero-visual"), cube=$("hero-object");
  if(!hero||!cube||window.innerWidth<700)return;
  const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom) cube.style.transform=`rotateX(${-y*18}deg) rotateY(${x*22}deg)`;
});
$("year").textContent=new Date().getFullYear();
updateCounters();
loadProducts();
setTimeout(()=>$("loader").classList.add("done"),850);
route();
