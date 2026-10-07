const products = [
  {id:1,name:"Mini Portable Blender",category:"Kitchen",price:18500,desc:"USB rechargeable personal blender for smoothies and drinks.",icon:"🥤",tag:"Popular"},
  {id:2,name:"Rechargeable LED Lamp",category:"Home",price:12500,desc:"Compact rechargeable lamp with adjustable brightness.",icon:"💡",tag:"Trending"},
  {id:3,name:"Smart Watch",category:"Electronics",price:29500,desc:"Modern fitness smartwatch with activity tracking.",icon:"⌚",tag:"Popular"},
  {id:4,name:"Aesthetic Storage Box",category:"Home",price:8500,desc:"Stackable organizer for home, office and beauty items.",icon:"📦",tag:"New"},
  {id:5,name:"Wireless Earbuds",category:"Electronics",price:22000,desc:"Compact Bluetooth earbuds with charging case.",icon:"🎧",tag:"Popular"},
  {id:6,name:"Travel Backpack",category:"Fashion",price:27500,desc:"Durable everyday backpack with multiple compartments.",icon:"🎒",tag:"New"},
  {id:7,name:"Beauty Organizer",category:"Beauty",price:14500,desc:"Clear multi-compartment organizer for cosmetics.",icon:"💄",tag:"Trending"},
  {id:8,name:"Electric Kitchen Scale",category:"Kitchen",price:10500,desc:"Digital precision scale for cooking and small businesses.",icon:"⚖️",tag:"New"}
];

let cart = JSON.parse(localStorage.getItem("chinaShopCart") || "[]");
let activeCategory = "All";

const money = n => "₦" + Number(n).toLocaleString("en-NG");
const $ = s => document.querySelector(s);

function saveCart(){localStorage.setItem("chinaShopCart",JSON.stringify(cart));renderCart();updateCount()}
function updateCount(){$("#cartCount").textContent=cart.reduce((a,i)=>a+i.qty,0)}

function renderCategories(){
  const cats=["All",...new Set(products.map(p=>p.category))];
  $("#categories").innerHTML=cats.map(c=>`<button class="category ${c===activeCategory?"active":""}" data-cat="${c}">${c}</button>`).join("");
  document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCategories();renderProducts()});
}
function renderProducts(){
  let list=products.filter(p=>activeCategory==="All"||p.category===activeCategory);
  const sort=$("#sort").value;
  if(sort==="low")list.sort((a,b)=>a.price-b.price);
  if(sort==="high")list.sort((a,b)=>b.price-a.price);
  $("#productGrid").innerHTML=list.map(p=>`
    <article class="product-card">
      <div class="product-img"><span>${p.tag}</span>${p.icon}</div>
      <div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p>
        <div class="product-bottom"><strong class="price">${money(p.price)}</strong><button class="add-btn" data-add="${p.id}">+ Add</button></div>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add)));
}
function addToCart(id){
  const item=cart.find(i=>i.id===id);
  if(item)item.qty++; else cart.push({id,qty:1});
  saveCart();toast("Added to your cart");
}
function renderCart(){
  const area=$("#cartItems");
  if(!cart.length){area.innerHTML='<div style="text-align:center;padding:70px 10px;color:#68736f;font-size:12px">Your cart is empty.<br><br>Explore our products and add something you like.</div>';$("#cartTotal").textContent=money(0);return}
  area.innerHTML=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `
    <div class="cart-row"><div class="mini-img">${p.icon}</div><div><h4>${p.name}</h4><p>${money(p.price)}</p><div class="qty"><button data-dec="${p.id}">−</button><span>${i.qty}</span><button data-inc="${p.id}">+</button></div></div><button class="remove" data-remove="${p.id}">Remove</button></div>`}).join("");
  const total=cart.reduce((a,i)=>a+(products.find(p=>p.id===i.id).price*i.qty),0);
  $("#cartTotal").textContent=money(total);
  document.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.inc,1));
  document.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.dec,-1));
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{cart=cart.filter(i=>i.id!==+b.dataset.remove);saveCart()});
}
function changeQty(id,delta){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=delta;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);saveCart()}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}

$("#sort").onchange=renderProducts;
$("#cartBtn").onclick=()=>{renderCart();$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("open")};
function closeCart(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("open")}
$("#closeCart").onclick=closeCart;$("#backdrop").onclick=closeCart;
$("#menuBtn").onclick=()=>$("#mobileNav").classList.toggle("open");
document.querySelectorAll(".mobile-nav a").forEach(a=>a.onclick=()=>$("#mobileNav").classList.remove("open"));

$("#searchBtn").onclick=()=>{$("#searchOverlay").classList.add("open");$("#searchInput").focus()};
$("#closeSearch").onclick=()=>$("#searchOverlay").classList.remove("open");
$("#searchInput").oninput=e=>{
  const q=e.target.value.toLowerCase().trim();
  const found=products.filter(p=>(p.name+" "+p.category+" "+p.desc).toLowerCase().includes(q));
  $("#searchResults").innerHTML=q?found.map(p=>`<div class="search-result"><span>${p.icon} ${p.name}</span><strong>${money(p.price)}</strong></div>`).join("")||'<p style="color:#68736f;font-size:12px">No matching products.</p>':"";
};

function modal(id,open=true){$("#"+id).classList.toggle("open",open)}
$("#checkoutBtn").onclick=()=>{if(!cart.length){toast("Your cart is empty");return}modal("checkoutModal")};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>modal(b.dataset.close,false));

$("#sourcingForm").onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));localStorage.setItem("lastSourcingRequest",JSON.stringify(data));e.target.reset();toast("Sourcing request received. We’ll contact you shortly.")};
$("#bookingForm").onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));localStorage.setItem("lastBookingRequest",JSON.stringify(data));e.target.reset();toast("Booking request submitted. We’ll confirm availability.")};
$("#checkoutForm").onsubmit=e=>{e.preventDefault();const order=Object.fromEntries(new FormData(e.target));order.items=cart;order.createdAt=new Date().toISOString();localStorage.setItem("lastOrder",JSON.stringify(order));cart=[];saveCart();modal("checkoutModal",false);closeCart();toast("Order request submitted successfully")};

$("#year").textContent=new Date().getFullYear();
renderCategories();renderProducts();renderCart();updateCount();
