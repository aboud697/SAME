const APPAREL_SIZES=['XS','S','M','L','XL','XXL'];
const PRODUCTS=new Map([
  ['Tee Box Logo',{price:35,sizes:APPAREL_SIZES}],
  ['Tee Oversize',{price:39,sizes:APPAREL_SIZES}],
  ['Tee Washed',{price:42,sizes:APPAREL_SIZES}],
  ['Tee Graphic 01',{price:45,sizes:APPAREL_SIZES}],
  ['Hoodie Heavy',{price:85,sizes:APPAREL_SIZES}],
  ['Crewneck SAME',{price:75,sizes:APPAREL_SIZES}],
  ['Hoodie Zip',{price:95,sizes:APPAREL_SIZES}],
  ['Pull Maille',{price:89,sizes:APPAREL_SIZES}],
  ['Pantalon SAME',{price:70,sizes:APPAREL_SIZES}],
  ['Short SAME',{price:40,sizes:APPAREL_SIZES}]
]);

export const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,
  headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
});

export function calculateCart(body){
  if(!Array.isArray(body?.items)||body.items.length===0||body.items.length>50){
    throw new Error('Panier invalide.');
  }
  const items=body.items.map(item=>{
    const product=PRODUCTS.get(item?.name);
    if(!product||!product.sizes.includes(item?.size))throw new Error('Produit ou taille invalide.');
    return {name:item.name,price:product.price,size:item.size};
  });
  const subtotal=items.reduce((sum,item)=>sum+item.price,0);
  const shipping=subtotal>=80?0:5;
  return {items,subtotal,shipping,total:subtotal+shipping};
}

export function siteOrigin(){
  const value=process.env.SITE_URL||process.env.URL||process.env.DEPLOY_PRIME_URL||'http://localhost:8888';
  return new URL(value).origin;
}