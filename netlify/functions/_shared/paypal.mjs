import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';

export function paypalSettings(){
  const clientId=process.env.PAYPAL_CLIENT_ID;
  const clientSecret=process.env.PAYPAL_CLIENT_SECRET;
  if(!clientId||!clientSecret)throw new Error('PayPal n’est pas encore configuré.');
  const base=process.env.PAYPAL_ENV==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
  return {clientId,clientSecret,base};
}

export async function paypalToken({clientId,clientSecret,base}){
  const response=await fetch(`${base}/v1/oauth2/token`,{
    method:'POST',
    headers:{Authorization:`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},
    body:'grant_type=client_credentials'
  });
  const result=await response.json();
  if(!response.ok||!result.access_token)throw new Error('Connexion PayPal impossible.');
  return result.access_token;
}

export async function paypalRequest(base,token,path,options={}){
  const response=await fetch(`${base}${path}`,{
    ...options,
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...options.headers}
  });
  const result=await response.json();
  if(!response.ok)throw new Error('PayPal a refusé la demande.');
  return result;
}

export function createState(secret){
  const payload=`${Date.now()}.${randomUUID()}`;
  const signature=createHmac('sha256',secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function verifyState(state,secret){
  if(typeof state!=='string')return false;
  const separator=state.lastIndexOf('.');
  if(separator<1)return false;
  const payload=state.slice(0,separator);
  const supplied=Buffer.from(state.slice(separator+1));
  const expected=Buffer.from(createHmac('sha256',secret).update(payload).digest('hex'));
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return false;
  const created=Number(payload.slice(0,payload.indexOf('.')));
  return Number.isFinite(created)&&Date.now()-created>=0&&Date.now()-created<6*60*60*1000;
}