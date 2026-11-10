import {json} from './_shared/cart.mjs';
import {paypalRequest,paypalSettings,paypalToken,verifyState} from './_shared/paypal.mjs';

export default async request=>{
  if(request.method!=='POST')return json({error:'Méthode non autorisée.'},405);
  let body;
  try{body=await request.json()}catch{return json({error:'Requête invalide.'},400)}
  if(typeof body.orderId!=='string'||typeof body.state!=='string')return json({error:'Commande PayPal invalide.'},400);

  try{
    const settings=paypalSettings();
    if(!verifyState(body.state,settings.clientSecret))return json({error:'Session PayPal expirée.'},400);
    const token=await paypalToken(settings);
    const order=await paypalRequest(settings.base,token,`/v2/checkout/orders/${encodeURIComponent(body.orderId)}`);
    if(order.purchase_units?.[0]?.custom_id!==body.state)return json({error:'Cette commande ne correspond pas à la session.'},403);
    if(order.status==='COMPLETED')return json({paid:true});
    if(order.status!=='APPROVED')return json({error:'La commande PayPal n’est pas approuvée.'},409);
    const result=await paypalRequest(settings.base,token,`/v2/checkout/orders/${encodeURIComponent(body.orderId)}/capture`,{method:'POST',body:'{}'});
    const status=result.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    return status==='COMPLETED'?json({paid:true}):json({error:'PayPal n’a pas confirmé le paiement.'},502);
  }catch(error){
    const message=error.message==='PayPal n’est pas encore configuré.'?error.message:'Impossible de confirmer le paiement PayPal.';
    return json({error:message},502);
  }
};