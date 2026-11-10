import {randomUUID} from 'node:crypto';
import {calculateCart,json,siteOrigin} from './_shared/cart.mjs';
import {createState,paypalRequest,paypalSettings,paypalToken} from './_shared/paypal.mjs';

export default async request=>{
  if(request.method!=='POST')return json({error:'Méthode non autorisée.'},405);
  let cart;
  try{cart=calculateCart(await request.json())}catch(error){return json({error:error.message},400)}

  try{
    const settings=paypalSettings();
    const token=await paypalToken(settings);
    const state=createState(settings.clientSecret);
    const money=value=>value.toFixed(2);
    const order=await paypalRequest(settings.base,token,'/v2/checkout/orders',{
      method:'POST',
      headers:{'PayPal-Request-Id':randomUUID()},
      body:JSON.stringify({
        intent:'CAPTURE',
        purchase_units:[{
          custom_id:state,
          amount:{
            currency_code:'EUR',value:money(cart.total),
            breakdown:{
              item_total:{currency_code:'EUR',value:money(cart.subtotal)},
              shipping:{currency_code:'EUR',value:money(cart.shipping)}
            }
          },
          items:cart.items.map(item=>({
            name:item.name,description:`Taille ${item.size}`,quantity:'1',category:'PHYSICAL_GOODS',
            unit_amount:{currency_code:'EUR',value:money(item.price)}
          }))
        }],
        application_context:{
          brand_name:'SAME',user_action:'PAY_NOW',shipping_preference:'GET_FROM_FILE',
          return_url:`${siteOrigin()}/?payment=paypal&state=${encodeURIComponent(state)}`,
          cancel_url:`${siteOrigin()}/?payment=cancelled`
        }
      })
    });
    const approvalUrl=order.links?.find(link=>link.rel==='payer-action'||link.rel==='approve')?.href;
    if(!approvalUrl)return json({error:'PayPal n’a pas fourni de lien de paiement.'},502);
    return json({approvalUrl});
  }catch(error){
    const message=error.message==='PayPal n’est pas encore configuré.'?error.message:'Impossible de démarrer le paiement PayPal.';
    return json({error:message},502);
  }
};