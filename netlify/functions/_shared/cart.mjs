const PRODUCTS=new Map([
  ['Tee Box Logo',35],
  ['Tee Oversize',39],
  ['Tee Washed',42],
  ['Tee Graphic 01',45],
  ['Hoodie Heavy',85],
  ['Crewneck SAME',75],
  ['Hoodie Zip',95],
  ['Pull Maille',89]
]);
const SIZES=new Set(['XS','S','M','L','XL','XXL']);

export const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
});

export function calculateCart(body){
  if(!Array.isArray(body?.items)||body.items.length===0||body.items.length>50){
    throw new Error('Panier invalide.');
  }
  const items=body.items.map(item=>{
    const price=PRODUCTS.get(item?.name);
    if(price===undefined||!SIZES.has(item?.size))throw new Error('Produit ou taille invalide.');
    return {name:item.name,price,size:item.size};
  });
  const subtotal=items.reduce((sum,item)=>sum+item.price,0);
  const shipping=subtotal>=80?0:5;
  return {items,subtotal,shipping,total:subtotal+shipping};
}

export function siteOrigin(){
  const value=process.env.SITE_URL||process.env.URL||process.env.DEPLOY_PRIME_URL||'http://localhost:8888';
  return new URL(value).origin;
}