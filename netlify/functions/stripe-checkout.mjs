import {calculateCart,json,siteOrigin} from './_shared/cart.mjs';

export default async request=>{
  if(request.method!=='POST')return json({error:'Méthode non autorisée.'},405);
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!secret)return json({error:'Stripe n’est pas encore configuré.'},503);
  let cart;
  try{cart=calculateCart(await request.json())}catch(error){return json({error:error.message},400)}

  const form=new URLSearchParams();
  form.set('mode','payment');
  form.set('customer_creation','always');
  form.set('billing_address_collection','required');
  form.set('shipping_address_collection[allowed_countries][0]','FR');
  form.set('success_url',`${siteOrigin()}/?payment=stripe&session_id={CHECKOUT_SESSION_ID}`);
  form.set('cancel_url',`${siteOrigin()}/?payment=cancelled`);
  cart.items.forEach((item,index)=>{
    const prefix=`line_items[${index}]`;
    form.set(`${prefix}[quantity]`,'1');
    form.set(`${prefix}[price_data][currency]`,'eur');
    form.set(`${prefix}[price_data][unit_amount]`,String(item.price*100));
    form.set(`${prefix}[price_data][product_data][name]`,item.name);
    form.set(`${prefix}[price_data][product_data][description]`,`Taille ${item.size}`);
  });
  if(cart.shipping){
    const index=cart.items.length;
    form.set(`line_items[${index}][quantity]`,'1');
    form.set(`line_items[${index}][price_data][currency]`,'eur');
    form.set(`line_items[${index}][price_data][unit_amount]`,String(cart.shipping*100));
    form.set(`line_items[${index}][price_data][product_data][name]`,'Livraison');
  }

  try{
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{
      method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:form
    });
    const result=await response.json();
    if(!response.ok||!result.url)return json({error:'Impossible de démarrer le paiement Stripe.'},502);
    return json({url:result.url});
  }catch{return json({error:'Stripe est temporairement indisponible.'},502)}
};