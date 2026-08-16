/* 
  Static storefront logic.
  IMPORTANT: this file deliberately contains NO BuySeloma API calls or secrets.
  BuySeloma's public site confirms API access is available on its Pro plan,
  but I could not verify public API/checkout documentation or an official
  browser-safe endpoint. A real integration must be added only from their
  official documentation/credentials.
*/
const STORE = {
  name: "YOUR BRAND",
  currency: "INR",
  // Set this only to an official checkout URL supplied by BuySeloma.
  officialCheckoutUrl: "",
  products: [{
    id: "featured-001",
    name: "Featured Product",
    price: 999,
    compareAt: 1499,
    description: "Replace this with your real product description.",
    features: ["Useful everyday design", "Compact and easy to use", "Pan-India availability"],
    specs: [["Material", "Add actual material"], ["Package", "Add actual package contents"], ["Warranty", "Add actual warranty"]],
    imageClass: "mock"
  }]
};

const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:STORE.currency,maximumFractionDigits:0}).format(n);
const state = { cart: JSON.parse(localStorage.getItem("storeCart") || "[]") };

const $ = s => document.querySelector(s);
const product = STORE.products[0];

function save(){ localStorage.setItem("storeCart", JSON.stringify(state.cart)); renderCart(); }
function addToCart(id, qty=1){
  const item = state.cart.find(x=>x.id===id);
  if(item) item.qty += qty; else state.cart.push({id,qty});
  save(); toast("Added to cart");
}
function changeQty(id, delta){
  const item = state.cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) state.cart = state.cart.filter(x=>x.id!==id);
  save();
}
function removeItem(id){ state.cart = state.cart.filter(x=>x.id!==id); save(); }

function renderProduct(){
  $("#productGrid").innerHTML = STORE.products.map(p=>`
    <article class="product-card">
      <div class="product-image"><span class="badge">${p.compareAt ? Math.round((1-p.price/p.compareAt)*100)+"% OFF" : "FEATURED"}</span><div class="${p.imageClass}"></div></div>
      <div class="product-info">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="price"><strong>${money(p.price)}</strong>${p.compareAt?`<del>${money(p.compareAt)}</del>`:""}</div>
        <div class="product-actions">
          <button class="btn btn-secondary" data-view="${p.id}">View details</button>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`).join("");
  $("#heroProductName").textContent = product.name;
  $("#heroProductPrice").textContent = money(product.price);
}
function renderCart(){
  const totalQty = state.cart.reduce((a,x)=>a+x.qty,0);
  $("#cartCount").textContent = totalQty;
  if(!state.cart.length){
    $("#cartItems").innerHTML = `<div style="padding:45px 10px;text-align:center;color:#8d94a0">Your cart is empty.<br><br><a class="btn btn-primary" href="#shop" onclick="closeCart()">Start shopping</a></div>`;
  } else {
    $("#cartItems").innerHTML = state.cart.map(i=>{
      const p=STORE.products.find(x=>x.id===i.id);
      return `<div class="cart-row">
        <div class="cart-thumb"></div>
        <div><h4>${escapeHtml(p.name)}</h4><small>${money(p.price)} each</small>
          <div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><b>${i.qty}</b><button data-qty="${p.id}" data-delta="1">+</button></div>
        </div>
        <div><b>${money(p.price*i.qty)}</b><br><button class="remove" data-remove="${p.id}">Remove</button></div>
      </div>`;
    }).join("");
  }
  const subtotal = state.cart.reduce((a,i)=>a+(STORE.products.find(p=>p.id===i.id).price*i.qty),0);
  $("#cartSubtotal").textContent = money(subtotal);
}
function openCart(){ $("#cartDrawer").classList.add("open"); $("#backdrop").classList.add("show"); $("#cartDrawer").setAttribute("aria-hidden","false"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#backdrop").classList.remove("show"); $("#cartDrawer").setAttribute("aria-hidden","true"); }
function openProduct(id){
  const p=STORE.products.find(x=>x.id===id);
  $("#productDetails").innerHTML = `<div class="dialog-inner">
    <div class="dialog-image"><div class="${p.imageClass}"></div></div>
    <div class="dialog-copy">
      <p class="eyebrow">PRODUCT DETAILS</p><h2>${escapeHtml(p.name)}</h2>
      <p>${escapeHtml(p.description)}</p>
      <div class="price"><strong>${money(p.price)}</strong>${p.compareAt?`<del>${money(p.compareAt)}</del>`:""}</div>
      <h3>Features</h3><ul>${p.features.map(f=>`<li>${escapeHtml(f)}</li>`).join("")}</ul>
      <div class="specs">${p.specs.map(s=>`<div><span>${escapeHtml(s[0])}</span><b>${escapeHtml(s[1])}</b></div>`).join("")}</div>
      <button class="btn btn-primary full" data-add="${p.id}">Add to cart</button>
    </div></div>`;
  $("#productDialog").showModal();
}
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1800); }
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

document.addEventListener("click", e=>{
  const add=e.target.closest("[data-add]"); if(add){addToCart(add.dataset.add); return;}
  const view=e.target.closest("[data-view]"); if(view){openProduct(view.dataset.view); return;}
  const q=e.target.closest("[data-qty]"); if(q){changeQty(q.dataset.qty,Number(q.dataset.delta)); return;}
  const rem=e.target.closest("[data-remove]"); if(rem){removeItem(rem.dataset.remove); return;}
});
$("#cartButton").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#backdrop").onclick=closeCart;
$("#closeProduct").onclick=()=>$("#productDialog").close();

$("#checkoutButton").onclick=()=>{
  if(!state.cart.length){toast("Your cart is empty");return;}
  if(!STORE.officialCheckoutUrl){
    alert("Secure BuySeloma checkout is not connected yet. Do not enter customer payment details on this static site until the official BuySeloma checkout/API integration has been supplied.");
    return;
  }
  window.location.href=STORE.officialCheckoutUrl;
};

renderProduct(); renderCart(); $("#year").textContent=new Date().getFullYear();
