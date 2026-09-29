const products = [
  {
    "id": "book1",
    "name": "Harry Potter",
    "description": "A fantasy adventure about wizards and magic.",
    "price": 25.0,
    "image": "Pictures/harry-potter.png",
    "category": "Books"
  },
  {
    "id": "book2",
    "name": "One Piece",
    "description": "A manga adventure about pirates searching for treasure.",
    "price": 7.0,
    "image": "Pictures/one-piece.png",
    "category": "Books"
  },
  {
    "id": "book3",
    "name": "Student Success Guide",
    "description": "Strategies for studying, planning, and succeeding in school.",
    "price": 14.99,
    "image": "Pictures/student-success.png",
    "category": "Books"
  },
  {
    "id": "book4",
    "name": "Vagabond",
    "description": "A historical fiction shonen manga about Miyamoto Musashi",
    "price": 12.99,
    "image": "Pictures/vagabond.png",
    "category": "Books"
  },
  {
    "id": "book5",
    "name": "The Monkey's Paw",
    "description": "A story about a wish granting talisman that has unforseen consequences.",
    "price": 18.99,
    "image": "Pictures/monkeys-paw.png",
    "category": "Books"
  },
  {
    "id": "supply1",
    "name": "Notebook",
    "description": "Durable notebook for class notes and assignments.",
    "price": 4.99,
    "image": "Pictures/notebook.png",
    "category": "School Supplies"
  },
  {
    "id": "supply2",
    "name": "Binder",
    "description": "Organization binder for coursework and handouts.",
    "price": 8.99,
    "image": "Pictures/binder.png",
    "category": "School Supplies"
  },
  {
    "id": "supply3",
    "name": "Pens & Pencils",
    "description": "Essential writing supplies for everyday schoolwork.",
    "price": 6.49,
    "image": "Pictures/pens.png",
    "category": "School Supplies"
  },
  {
    "id": "supply4",
    "name": "Folders",
    "description": "Keep papers and projects sorted by class.",
    "price": 3.99,
    "image": "Pictures/folders.png",
    "category": "School Supplies"
  },
  {
    "id": "supply5",
    "name": "Academic Planner",
    "description": "Plan assignments, exams, and study time.",
    "price": 9.99,
    "image": "Pictures/planner.png",
    "category": "School Supplies"
  }
];

function formatCurrency(value){return `$${Number(value).toFixed(2)}`;}

const books = products.filter(p => p.category === "Books");
const supplies = products.filter(p => p.category === "School Supplies");

function renderProducts(containerId, productList=products){
  const container=document.getElementById(containerId); if(!container)return;
  container.innerHTML="";
  productList.forEach(product=>{
    const card=document.createElement("article");
    card.className="product";
    card.innerHTML=`<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">
      <div class="product-info"><span class="category">${product.category}</span>
      <h3>${product.name}</h3><p>${product.description}</p><strong>${formatCurrency(product.price)}</strong>
      <button type="button" class="add-cart" data-id="${product.id}">Add to Cart</button></div>`;
    container.appendChild(card);
  });
  container.querySelectorAll(".add-cart").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.id)));
}

function getCart(){return JSON.parse(localStorage.getItem("amarrensCart")||"[]");}
function saveCart(cart){localStorage.setItem("amarrensCart",JSON.stringify(cart));}
function addToCart(id){
  const product=products.find(p=>p.id===id); if(!product)return;
  const cart=getCart(); const existing=cart.find(p=>p.id===id);
  if(existing)existing.quantity+=1; else cart.push({...product,quantity:1});
  saveCart(cart); alert(`${product.name} was added to your cart.`); renderCart();
}
function removeFromCart(id){saveCart(getCart().filter(p=>p.id!==id));renderCart();}
function renderCart(){
  const box=document.getElementById("cart-items");
  if(!box)return;
  const cart=getCart(); box.innerHTML="";
  if(!cart.length){box.innerHTML="<p>Your cart is currently empty. Add products from the catalog.</p>";return;}
  let total=0;
  cart.forEach(item=>{
    const line=item.price*item.quantity; total+=line;
    const row=document.createElement("div"); row.className="cart-row";
    row.innerHTML=`<span>${item.name} × ${item.quantity}</span><span>${formatCurrency(line)}
    <button type="button" class="remove-cart" data-id="${item.id}">Remove</button></span>`;
    box.appendChild(row);
  });
  box.querySelectorAll(".remove-cart").forEach(b=>b.addEventListener("click",()=>removeFromCart(b.dataset.id)));
}
function validateRequiredFields(form){
  let valid=true;
  form.querySelectorAll("[required]").forEach(field=>{
    const err=field.parentElement.querySelector(".field-error"); field.classList.remove("invalid");
    if(!field.value.trim()){valid=false;field.classList.add("invalid");if(err)err.textContent="This field is required.";}
    else if(err)err.textContent="";
  }); return valid;
}
function validateEmail(field){
  if(!field.value.trim())return true; const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
  const err=field.parentElement.querySelector(".field-error"); field.classList.toggle("invalid",!ok);
  if(err)err.textContent=ok?"":"Enter a valid email address."; return ok;
}
function validateCardNumber(field){
  if(!field.value.trim())return true; const digits=field.value.replace(/\D/g,""); const ok=digits.length>=13&&digits.length<=19;
  const err=field.parentElement.querySelector(".field-error"); field.classList.toggle("invalid",!ok);
  if(err)err.textContent=ok?"":"Card number must contain 13–19 digits."; return ok;
}
function validateExpiration(field){
  if(!field.value)return true; const [y,m]=field.value.split("-").map(Number), chosen=new Date(y,m-1,1), now=new Date(), current=new Date(now.getFullYear(),now.getMonth(),1);
  const ok=chosen>=current,err=field.parentElement.querySelector(".field-error");field.classList.toggle("invalid",!ok);
  if(err)err.textContent=ok?"":"Expiration date must be in the future.";return ok;
}
function validateSecurityCode(field){
  if(!field.value)return true;const ok=/^\d{3,4}$/.test(field.value),err=field.parentElement.querySelector(".field-error");
  field.classList.toggle("invalid",!ok);if(err)err.textContent=ok?"":"Security code must be 3–4 digits.";return ok;
}
function validateZip(field){
  if(!field.value.trim())return true;
  const ok=/^\d{5}(-\d{4})?$/.test(field.value.trim()),err=field.parentElement.querySelector(".field-error");
  field.classList.toggle("invalid",!ok);if(err)err.textContent=ok?"":"Enter a valid 5-digit ZIP code (or ZIP+4).";return ok;
}
function validatePhone(field){
  if(!field.value)return true;const ok=field.value.replace(/\D/g,"").length>=10,err=field.parentElement.querySelector(".field-error");
  field.classList.toggle("invalid",!ok);if(err)err.textContent=ok?"":"Enter a valid phone number.";return ok;
}
const coupons={STUDY10:0.10,BOOKS15:0.15};
function calculateSubtotal(){return getCart().reduce((s,i)=>s+i.price*i.quantity,0);}
function applyCouponCode(){
  const input=document.getElementById("coupon-code"),msg=document.getElementById("coupon-message");if(!input||!msg)return;
  const code=input.value.trim().toUpperCase(),rate=coupons[code],subtotal=calculateSubtotal();
  document.getElementById("checkout-subtotal").textContent=formatCurrency(subtotal);
  if(rate===undefined){
    document.getElementById("discount-amount").textContent="$0.00";document.getElementById("checkout-total").textContent=formatCurrency(subtotal);
    msg.textContent=code?"Coupon code not found.":"Enter a coupon code.";msg.className="form-message error-message";return;
  }
  const discount=subtotal*rate;document.getElementById("discount-amount").textContent=`-${formatCurrency(discount)}`;
  document.getElementById("checkout-total").textContent=formatCurrency(subtotal-discount);
  msg.textContent=`${code} applied: ${Math.round(rate*100)}% off.`;msg.className="form-message success-message";
}
document.addEventListener("DOMContentLoaded",()=>{
  renderProducts("book-products",books);renderProducts("supply-products",supplies);renderProducts("all-products",products);renderCart();
  const couponButton=document.getElementById("apply-coupon");if(couponButton)couponButton.addEventListener("click",applyCouponCode);
  const contact=document.getElementById("contact-form");
  if(contact)contact.addEventListener("submit",e=>{
    e.preventDefault();const ok=validateRequiredFields(contact)&&validateEmail(document.getElementById("email")),msg=document.getElementById("contact-message");
    msg.textContent=ok?"Thanks! Your message is ready to be sent.":"Please correct the highlighted fields.";msg.className=`form-message ${ok?"success-message":"error-message"}`;if(ok)contact.reset();
  });
  const checkout=document.getElementById("checkout-form");
  if(checkout){
    const card=document.getElementById("card-number"),exp=document.getElementById("expiration"),cvv=document.getElementById("security-code"),phone=document.getElementById("phone"),zip=document.getElementById("zip-code");
    card.addEventListener("input",()=>validateCardNumber(card));exp.addEventListener("change",()=>validateExpiration(exp));cvv.addEventListener("input",()=>validateSecurityCode(cvv));phone.addEventListener("input",()=>validatePhone(phone));zip.addEventListener("input",()=>validateZip(zip));
    checkout.addEventListener("submit",e=>{
      e.preventDefault();const ok=validateRequiredFields(checkout)&&validateCardNumber(card)&&validateExpiration(exp)&&validateSecurityCode(cvv)&&validatePhone(phone)&&validateZip(zip),msg=document.getElementById("checkout-message");
      msg.textContent=ok?"All required checkout fields are valid. This demo does not process real payments.":"Please correct the highlighted fields before submitting.";
      msg.className=`form-message ${ok?"success-message":"error-message"}`;
    });
  }
});
