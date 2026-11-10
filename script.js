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
function fill(id,list,cnt){
  const g=document.getElementById(id);
  document.getElementById(cnt).textContent=list.length+' pièces';
  list.forEach(p=>{
    const c=document.createElement('article');c.className='card';
    c.innerHTML=`<div class="pic">${slot(p.a,p.n,'Photo 1')}<div class="b${p.b?'':' empty'}">${p.b?img(p.b,p.n):'Photo 2'}</div></div>
    <div class="row"><span>${p.n}</span><span>${p.p} €</span></div><button class="add">Ajouter</button>`;
    c.querySelector('.add').onclick=e=>{n++;cart.textContent=`Panier (${n})`;e.target.textContent='Ajouté';setTimeout(()=>e.target.textContent='Ajouter',1200)};
    g.appendChild(c);
  });
}
fill('g1',TEES,'n1');fill('g2',PULLS,'n2');

const look=document.getElementById('look');
LOOKBOOK.forEach((s,i)=>{const d=document.createElement('div');d.className='pic';d.innerHTML=slot(s,'',`Photo lookbook ${i+1}`);look.appendChild(d)});