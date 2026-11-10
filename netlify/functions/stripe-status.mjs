import {json} from './_shared/cart.mjs';

export default async request=>{
  if(request.method!=='GET')return json({error:'Méthode non autorisée.'},405);
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!secret)return json({error:'Stripe n’est pas encore configuré.'},503);
  const sessionId=new URL(request.url).searchParams.get('session_id');
  if(!sessionId||!/^cs_(test|live)_[A-Za-z0-9_-]+$/.test(sessionId))return json({error:'Session invalide.'},400);
  try{
    const response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{
      headers:{Authorization:`Bearer ${secret}`}
    });
    const session=await response.json();
    if(!response.ok)return json({error:'Vérification Stripe impossible.'},502);
    return json({paid:session.payment_status==='paid'});
  }catch{return json({error:'Stripe est temporairement indisponible.'},502)}
};