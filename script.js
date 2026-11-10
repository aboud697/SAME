/* ===== COLLEZ VOS PHOTOS ICI (liens d'images) ===== */
const HERO_PHOTO = "";            // photo plein écran de l'accueil
const LOOKBOOK   = ["","",""];    // 3 photos du lookbook
const TEES = [
  {n:"Tee Box Logo",   p:35, a:"", b:""},
  {n:"Tee Oversize",   p:39, a:"", b:""},
  {n:"Tee Washed",     p:42, a:"", b:""},
  {n:"Tee Graphic 01", p:45, a:"", b:""}
];
const PULLS = [
  {n:"Hoodie Heavy",   p:85, a:"", b:""},
  {n:"Crewneck SAME",  p:75, a:"", b:""},
  {n:"Hoodie Zip",     p:95, a:"", b:""},
  {n:"Pull Maille",    p:89, a:"", b:""}
];
/* ================================================== */

const img=(s,t)=>s?`<img src="${s}" alt="${t||''}" loading="lazy">`:'';
const slot=(s,t,l)=>s?img(s,t):`<div class="empty">${l}</div>`;

if(HERO_PHOTO){document.getElementById('hero').insertAdjacentHTML('afterbegin',img(HERO_PHOTO,''))}
else document.getElementById('hero').insertAdjacentHTML('afterbegin','<div class="hint">Photo de l’accueil</div>');

document.getElementById('tk').textContent=('LIVRAISON OFFERTE DÈS 80 €  ✕  NOUVEAU DROP  ✕  PIÈCES UNISEXES  ✕  RETOURS 30 JOURS  ✕  ').repeat(6);

let n=0;const cart=document.getElementById('cart');
const knownProducts=new Map([...TEES,...PULLS].map(product=>[product.n,product]));
const validSizes=new Set(['XS','S','M','L','XL','XXL']);
let cartItems=[];
try{
  const saved=JSON.parse(localStorage.getItem('same-cart')||'[]');
  if(Array.isArray(saved)){
    cartItems=saved.map(item=>{
      const product=knownProducts.get(item.name);
      return product&&validSizes.has(item.size)?{name:product.n,price:product.p,size:item.size}:null;
    }).filter(Boolean).slice(0,50);
  }
}catch{}
const saveCart=()=>{try{localStorage.setItem('same-cart',JSON.stringify(cartItems))}catch{}};
const sizeDialog=document.getElementById('size-dialog');
const sizeForm=document.getElementById('size-form');
const sizeProduct=document.getElementById('size-product');
const sizeSelect=document.getElementById('size-select');
const cartDialog=document.getElementById('cart-dialog');
const cartLines=document.getElementById('cart-lines');
const cartEmpty=document.getElementById('cart-empty');
const cartSubtotal=document.getElementById('cart-subtotal');
const cartShipping=document.getElementById('cart-shipping');
const cartTotal=document.getElementById('cart-total');
const checkoutStatus=document.getElementById('checkout-status');
const paymentButtons=[document.getElementById('pay-card'),document.getElementById('pay-paypal')];
let pendingProduct;
const euros=value=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(value);
const setCheckoutStatus=message=>{checkoutStatus.textContent=message;checkoutStatus.hidden=!message};
function renderCart(){
  cartLines.replaceChildren();
  cartEmpty.hidden=cartItems.length>0;
  cartItems.forEach((item,index)=>{
    const line=document.createElement('article');line.className='cart-line';
    const details=document.createElement('div');details.className='cart-line-details';
    const name=document.createElement('strong');name.textContent=item.name;
    const size=document.createElement('span');size.textContent=`Taille : ${item.size}`;
    const price=document.createElement('span');price.textContent=euros(item.price);
    const remove=document.createElement('button');remove.className='cart-remove';remove.type='button';remove.textContent='Retirer';
    remove.setAttribute('aria-label',`Retirer ${item.name}, taille ${item.size}`);
    remove.addEventListener('click',()=>{
      cartItems.splice(index,1);
      n=cartItems.length;
      cart.textContent=`Panier (${n})`;
      saveCart();
      renderCart();
    });
    details.append(name,size);
    line.append(details,price,remove);
    cartLines.append(line);
  });
  const subtotal=cartItems.reduce((sum,item)=>sum+item.price,0);
  const shipping=subtotal===0||subtotal>=80?0:5;
  cartSubtotal.textContent=euros(subtotal);
  cartShipping.textContent=shipping===0&&subtotal>0?'Offerte':euros(shipping);
  cartTotal.textContent=euros(subtotal+shipping);
}
function fill(id,list,cnt){
  const g=document.getElementById(id);
  document.getElementById(cnt).textContent=list.length+' pièces';
  list.forEach(p=>{
    const c=document.createElement('article');c.className='card';
    c.innerHTML=`<div class="pic">${slot(p.a,p.n,'Photo 1')}<div class="b${p.b?'':' empty'}">${p.b?img(p.b,p.n):'Photo 2'}</div></div>
    <div class="row"><span>${p.n}</span><span>${p.p} €</span></div><button class="add">Ajouter</button>`;
    c.querySelector('.add').onclick=()=>{
      pendingProduct=p;
      sizeProduct.textContent=p.n;
      sizeSelect.value='';
      sizeDialog.showModal();
    };
    g.appendChild(c);
  });
}
fill('g1',TEES,'n1');fill('g2',PULLS,'n2');

sizeForm.addEventListener('submit',e=>{
  e.preventDefault();
  cartItems.push({name:pendingProduct.n,price:pendingProduct.p,size:sizeSelect.value});
  n=cartItems.length;
  cart.textContent=`Panier (${n})`;
  saveCart();
  renderCart();
  sizeDialog.close();
});
sizeForm.querySelector('.size-cancel').addEventListener('click',()=>sizeDialog.close());
cart.addEventListener('click',()=>{renderCart();cartDialog.showModal()});
cartDialog.querySelector('.cart-close').addEventListener('click',()=>cartDialog.close());

async function startPayment(provider){
  if(!cartItems.length)return;
  setCheckoutStatus('Redirection vers le paiement sécurisé…');
  paymentButtons.forEach(button=>button.disabled=true);
  try{
    const endpoint=provider==='stripe'?'stripe-checkout':'paypal-create-order';
    const response=await fetch(`/.netlify/functions/${endpoint}`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({items:cartItems.map(({name,size})=>({name,size}))})
    });
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'Le paiement est temporairement indisponible.');
    const redirect=provider==='stripe'?result.url:result.approvalUrl;
    if(!redirect)throw new Error('Le prestataire de paiement n’a pas fourni de lien.');
    window.location.assign(redirect);
  }catch(error){
    setCheckoutStatus(error.message||'Impossible de démarrer le paiement. Réessaie plus tard.');
    paymentButtons.forEach(button=>button.disabled=false);
  }
}
document.getElementById('pay-card').addEventListener('click',()=>startPayment('stripe'));
document.getElementById('pay-paypal').addEventListener('click',()=>startPayment('paypal'));

function finishOrder(message){
  cartItems.length=0;
  n=0;
  cart.textContent='Panier (0)';
  saveCart();
  renderCart();
  setCheckoutStatus(message);
}
function cleanPaymentQuery(){history.replaceState(null,'',location.pathname+location.hash)}
async function handlePaymentReturn(){
  const params=new URLSearchParams(location.search);
  const payment=params.get('payment');
  if(payment==='cancelled'){
    setCheckoutStatus('Paiement annulé. Ton panier est conservé.');
    cleanPaymentQuery();
    return;
  }
  try{
    if(payment==='stripe'){
      const sessionId=params.get('session_id');
      if(!sessionId)throw new Error('Session de paiement introuvable.');
      const response=await fetch(`/.netlify/functions/stripe-status?session_id=${encodeURIComponent(sessionId)}`);
      const result=await response.json();
      if(!response.ok||!result.paid)throw new Error('Le paiement Stripe n’a pas pu être confirmé.');
      finishOrder('Paiement confirmé. Merci pour ta commande !');
    }else if(payment==='paypal'){
      const orderId=params.get('token');
      const state=params.get('state');
      if(!orderId||!state)throw new Error('Commande PayPal introuvable.');
      const response=await fetch('/.netlify/functions/paypal-capture-order',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId,state})
      });
      const result=await response.json();
      if(!response.ok||!result.paid)throw new Error(result.error||'Le paiement PayPal n’a pas pu être confirmé.');
      finishOrder('Paiement confirmé. Merci pour ta commande !');
    }else return;
  }catch(error){
    setCheckoutStatus(error.message||'Le paiement n’a pas pu être confirmé.');
  }finally{
    cleanPaymentQuery();
  }
}
cart.textContent=`Panier (${n})`;
renderCart();
handlePaymentReturn();

const look=document.getElementById('look');
LOOKBOOK.forEach((s,i)=>{const d=document.createElement('div');d.className='pic';d.innerHTML=slot(s,'',`Photo lookbook ${i+1}`);look.appendChild(d)});