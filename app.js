'use strict';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const ls={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const CATS=["electronics","jewelery","men's clothing","women's clothing"],ICON=['💻','💎','👔','👗'];
const FB='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#0b1230"/><text x="150" y="160" fill="#3b82f6" font-size="22" text-anchor="middle">ZENVORA</text></svg>');
let H={},P=[],err=false,pg='home',stop3D=null,cart=ls.get('zv_cart',{}),wish=ls.get('zv_wish',[]),recent=ls.get('zv_recent',[]),hist=ls.get('zv_hist',[]);
const F0={q:'',cat:'all',min:'',max:'',rate:0,new:false,best:false,offers:false,sort:'pop'};let F={...F0};
const money=n=>'$'+n.toFixed(2),byId=id=>P.find(p=>p.id==id),lab=c=>c=='jewelery'?'Jewelry':c;
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const stars=r=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
const img=p=>`<img src="${p.image}" alt="${esc(p.title)}" loading="lazy" onerror="this.onerror=null;this.src=FB">`;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t.t);t.t=setTimeout(()=>t.classList.remove('on'),1800)};
/* ---------- cart ---------- */
function addToCart(id,q=1){q=Math.max(1,Math.min(10,Math.floor(+q)||1));cart[id]=Math.min(10,(cart[id]||0)+q);upd();toast('Added to cart')}
function removeFromCart(id){delete cart[id];upd()}
function updateQuantity(id,q){q=Math.floor(+q);if(!(q>=1))return removeFromCart(id);cart[id]=Math.min(10,q);upd()}
function calculateTotal(){let s=0;for(const id in cart){const p=byId(id);if(p)s+=p.price*cart[id]}const t=s*.08,sh=s&&s<100?9.99:0;return{s,t,sh,total:s+t+sh}}
function clearCart(){cart={};upd()}
const count=()=>Object.keys(cart).filter(byId).reduce((a,k)=>a+cart[k],0);
function toggleWish(id){id=+id;wish=wish.includes(id)?wish.filter(x=>x!=id):[...wish,id];upd();if(pg=='wishlist')route(true)}
function upd(){ls.set('zv_cart',cart);ls.set('zv_wish',wish);ls.set('zv_recent',recent);$('#cc').textContent=count();$('#wc').textContent=wish.length;$('#drb').innerHTML=drawer();
$$('[data-a=wish]').forEach(b=>b.classList.toggle('on',wish.includes(+b.dataset.id)));const s=$('#sum');if(s)s.innerHTML=rows(calculateTotal())}
const rows=t=>`<div class="tr"><span>Subtotal</span><span>${money(t.s)}</span></div><div class="tr"><span>Tax (8%)</span><span>${money(t.t)}</span></div><div class="tr"><span>Shipping</span><span>${t.sh?money(t.sh):'Free'}</span></div><div class="tr f"><span>Total</span><span>${money(t.total)}</span></div>`;
function drawer(){const ids=Object.keys(cart).filter(byId);if(!ids.length)return`<div class="empty"><div class="bx">📦</div><h3>Your cart is empty</h3><p class="mut">Add something you love to get started.</p><button class="btn pri" data-a="close">Continue Shopping</button></div>`;
return ids.map(id=>{const p=byId(id),q=cart[id];return`<div class="ci">${img(p)}<div><h4>${p.title}</h4><small>${money(p.price)}</small><div class="qt"><button data-a="dec" data-id="${id}">−</button><span>${q}</span><button data-a="inc" data-id="${id}">+</button><button data-a="rm" data-id="${id}">Remove</button></div></div><b>${money(p.price*q)}</b></div>`}).join('')+`<div class="tot">${(t=>`<div class="fs"><small>${t.s>=100?"Free shipping unlocked":"Add "+money(100-t.s)+" for free shipping"}</small><div class="fb"><i style="width:${Math.min(100,t.s)}%"></i></div></div>`)(calculateTotal())}${rows(calculateTotal())}<a class="btn pri" href="#/checkout" data-a="close">Checkout</a><button class="btn" data-a="close">Continue Shopping</button><button class="btn" data-a="clear">Clear Cart</button></div>`}
/* ---------- components ---------- */
const card=p=>`<article class="card" data-tilt><button class="wb ${wish.includes(p.id)?'on':''}" data-a="wish" data-id="${p.id}" aria-label="Wishlist">♥</button><a class="im" href="#/product/${p.id}">${img(p)}</a><div class="cb"><small>${lab(p.category)}</small><a href="#/product/${p.id}"><h3>${p.title}</h3></a><div class="rt">${stars(p.rating.rate)}<span>${p.rating.rate} (${p.rating.count})</span></div><div class="pr">${money(p.price)}</div><div class="ac"><button data-a="qv" data-id="${p.id}">Quick View</button><button class="pri" data-a="add" data-id="${p.id}">Add to Cart</button></div></div></article>`;
const G=l=>l.length?`<div class="grid">${l.map(card).join('')}</div>`:`<div class="empty"><div class="bx">🔍</div><h3>Nothing here yet</h3></div>`;
const sec=(t,s,h)=>`<section class="wrap rv sec"><h2>${t}</h2><p class="mut">${s}</p>${h}</section>`;
const tiles=()=>`<div class="tiles">${CATS.map((c,i)=>`<a class="tile" href="#/shop/c${i}"><span>${ICON[i]}</span><h3>${lab(c)}</h3><p class="mut">Browse ${P.filter(p=>p.category==c).length} products</p></a>`).join('')}</div>`;
const qty=()=>`<div class="qt"><button data-a="qm">−</button><input class="qin" type="number" min="1" max="10" value="1" aria-label="Quantity"><button data-a="qp">+</button></div>`;
const empty=(t,s)=>`<div class="empty pg"><div class="bx">🛰️</div><h2>${t}</h2><p class="mut">${s||''}</p><a class="btn pri" href="#/shop">Shop Now</a></div>`;
function detail(p){return`<div class="pd qc"><div class="stg"><div class="zm" data-zoom>${img(p)}</div><div class="ped"><i></i><i></i></div></div><div><small>${lab(p.category)}</small><h1>${p.title}</h1><div class="rt">${stars(p.rating.rate)}<span>${p.rating.rate} · ${p.rating.count} reviews</span></div><div class="price">${money(p.price)}</div><p class="mut">${p.description}</p>${qty()}<div class="row"><button class="pri" data-a="add" data-q="1" data-id="${p.id}">Add to Cart</button><button data-a="buy" data-id="${p.id}">Buy Now</button><button data-a="wish" data-id="${p.id}" class="${wish.includes(p.id)?'on':''}">♥ Wishlist</button></div></div></div>`}
/* ---------- pages ---------- */
function home(){const top=(f,n=4)=>G([...P].sort(f).slice(0,n)),rv=recent.map(byId).filter(Boolean).slice(0,4);
return`<section class="hero"><canvas id="cv"></canvas><div class="hs"><i></i><span>Live product catalogue</span></div><div class="hs"><i></i><span>Secure demo checkout</span></div><div class="hs"><i></i><span>Free shipping over $100</span></div><div class="tb"><button data-a="hrot" class="on">⟳ Rotate</button><button data-a="hzoom">⌕ Zoom</button><button data-a="hexp">✦ Explode</button></div><div class="wrap hc"><h1 class="h1">Discover a World Beyond Shopping.</h1><p>Explore exceptional products, discover new trends, and experience shopping in a completely new way.</p><div><a class="btn pri" href="#/categories">Explore Collection</a><a class="btn" href="#/shop">Shop Now</a></div></div></section>`
+sec('Featured Collections','Four worlds, one storefront.',tiles())
+sec('Trending Products','What shoppers are viewing most.',top((a,b)=>b.rating.count-a.rating.count))
+sec('New Arrivals','Just landed this season.',G(P.filter(p=>p.id>14).slice(0,4)))
+sec('Best Sellers','Rated highest by customers.',top((a,b)=>b.rating.rate-a.rating.rate))
+sec('Exclusive Deals','Premium picks under $30.',G(P.filter(p=>p.price<30).slice(0,4)))
+sec('Recommended Products','Picked for you.',top((a,b)=>(a.id*7%20)-(b.id*7%20)))
+(rv.length?sec('Recently Viewed','Pick up where you left off.',G(rv)):'')
+sec('Popular Categories','Jump straight in.',`<div class="chips">${CATS.map((c,i)=>`<a class="chip" href="#/shop/c${i}">${ICON[i]} ${lab(c)}</a>`).join('')}</div>`)
+sec('Customer Testimonials','Words from our community.',`<div class="quote">${[['Aarav M.','Fast, smooth and beautiful to browse. Felt like a flagship store.'],['Priya S.','The quick view and wishlist made picking gifts effortless.'],['Daniel K.','Clear prices, no surprises at checkout. Loved the design.']].map(([n,t])=>`<div class="glass"><div class="rt">★★★★★</div><p>${t}</p><small>${n}</small></div>`).join('')}</div>`)
+sec('Newsletter Subscription','New drops and offers, once a week.',`<div class="glass fm" style="max-width:520px"><input id="ne" type="email" placeholder="you@example.com" aria-label="Email"><span class="er" id="ner"></span><button class="btn pri" data-a="news">Subscribe</button></div>`)
+sec('Frequently Asked Questions','Quick answers.',[['Is this a real store?','No. ZENVORA is a demonstration storefront; no payments are processed and no orders are shipped.'],['Where do products come from?','They load live from FakeStoreAPI.'],['Is my cart saved?','Yes. Your cart and wishlist are saved in this browser.'],['How is shipping calculated?','Free over $100, otherwise a flat $9.99. Tax is 8%.']].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join(''))
+sec('Contact Us','We read every message.',`<div class="glass fm" style="max-width:520px"><input id="cn" placeholder="Your name"><input id="ce" type="email" placeholder="Email"><textarea id="cm" rows="4" placeholder="Message"></textarea><span class="er" id="cer"></span><button class="btn pri" data-a="contact">Send Message</button></div>`)}
function shop(){return`<section class="wrap shop"><aside class="glass fl"><h3>Filters</h3>${['all',...CATS].map(c=>`<label><input type="radio" name="cat" value="${c}" ${F.cat==c?'checked':''}>${c=='all'?'All Products':lab(c)}</label>`).join('')}
<label>Minimum price<input id="fmin" type="number" min="0" value="${F.min}"></label><label>Maximum price<input id="fmax" type="number" min="0" value="${F.max}"></label>
<label>Customer rating<select id="frate">${[0,3,4,4.5].map(r=>`<option value="${r}" ${F.rate==r?'selected':''}>${r?r+' & up':'Any'}</option>`).join('')}</select></label>
<label><input type="checkbox" id="fnew" ${F.new?'checked':''}>New arrivals</label><label><input type="checkbox" id="fbest" ${F.best?'checked':''}>Best sellers</label>
<button class="btn pri" id="fapply">Apply Filters</button><button class="btn" id="fclear">Clear All Filters</button></aside>
<div><div class="bar"><div class="chips" id="chips"></div><select id="fsort" aria-label="Sort">${[['pop','Most Popular'],['pl','Price: Low to High'],['ph','Price: High to Low'],['rate','Highest Rated'],['az','Alphabetical Order']].map(([v,t])=>`<option value="${v}" ${F.sort==v?'selected':''}>${t}</option>`).join('')}</select></div><div id="gr"></div></div></section>`}
function filtered(){const q=F.q.toLowerCase();return P.filter(p=>(!q||(p.title+' '+p.category).toLowerCase().includes(q))&&(F.cat=='all'||p.category==F.cat)&&(F.min===''||p.price>=+F.min)&&(F.max===''||p.price<=+F.max)&&p.rating.rate>=F.rate&&(!F.new||p.id>14)&&(!F.best||p.rating.count>=200)&&(!F.offers||p.price<30))
.sort({pop:(a,b)=>b.rating.count-a.rating.count,pl:(a,b)=>a.price-b.price,ph:(a,b)=>b.price-a.price,rate:(a,b)=>b.rating.rate-a.rating.rate,az:(a,b)=>a.title.localeCompare(b.title)}[F.sort])}
function drawGrid(){const act=[['q',F.q&&`Search: ${esc(F.q)}`],['cat',F.cat!='all'&&lab(F.cat)],['min',F.min!==''&&`Min $${F.min}`],['max',F.max!==''&&`Max $${F.max}`],['rate',F.rate>0&&`${F.rate}★ & up`],['new',F.new&&'New arrivals'],['best',F.best&&'Best sellers'],['offers',F.offers&&'Offers']].filter(x=>x[1]);
$('#chips').innerHTML=act.map(([k,t])=>`<span class="chip" data-a="x" data-k="${k}">${t} ✕</span>`).join('');const l=filtered();
$('#gr').innerHTML=l.length?G(l):`<div class="empty"><div class="bx">🔍</div><h3>No results found</h3><p class="mut">Try a different search or clear your filters.</p><button class="btn pri" data-a="reset">Clear All Filters</button></div>`}
function bindShop(){const rd=()=>{F.min=$('#fmin').value;F.max=$('#fmax').value;F.rate=+$('#frate').value;F.new=$('#fnew').checked;F.best=$('#fbest').checked;drawGrid()};
$('#fapply').onclick=rd;$('#fsort').onchange=e=>{F.sort=e.target.value;drawGrid()};$$('[name=cat]').forEach(r=>r.onchange=()=>{F.cat=r.value;drawGrid()});drawGrid()}
function product(id){const p=byId(id);if(!p)return empty('Product not found','It may have been removed.');recent=[p.id,...recent.filter(x=>x!=p.id)].slice(0,8);ls.set('zv_recent',recent);
const rv=recent.filter(x=>x!=p.id).map(byId).filter(Boolean).slice(0,4);
return`<section class="wrap">${detail(p)}</section>`+sec('Related Products','More from this category.',G(P.filter(x=>x.category==p.category&&x.id!=p.id).slice(0,4)))+(rv.length?sec('Recently Viewed','',G(rv)):'')}
function wishlist(){const l=wish.map(byId).filter(Boolean);return`<section class="wrap pg"><h1>Your Wishlist</h1>`+(l.length?`<div class="grid">${l.map(p=>`<div>${card(p)}<button class="btn pri" style="width:100%;margin-top:8px" data-a="mv" data-id="${p.id}">Move to Cart</button></div>`).join('')}</div>`:`<div class="empty"><div class="bx">💙</div><h3>No saved products</h3><p class="mut">Tap the heart on any product to save it.</p><a class="btn pri" href="#/shop">Shop Now</a></div>`)+`</section>`}
function checkout(){const ids=Object.keys(cart).filter(byId);if(!ids.length)return empty('Your cart is empty','Add products before checking out.');
const f=(i,l,t='text')=>`<label>${l}<input id="${i}" type="${t}"><span class="er" id="e-${i}"></span></label>`;
return`<section class="wrap pg"><h1>Checkout</h1><div class="two"><div class="glass fm"><h3>Customer information</h3>${f('n','Full Name')}${f('e','Email','email')}${f('ph','Phone Number','tel')}${f('ad','Delivery Address')}${f('ct','City')}${f('st','State')}${f('pc','Pincode')}</div>
<div class="glass fm"><h3>Order summary</h3>${ids.map(i=>{const p=byId(i);return`<div class="tr"><span>${p.title.slice(0,34)}… × ${cart[i]}</span><span>${money(p.price*cart[i])}</span></div>`}).join('')}<div id="sum" class="fm">${rows(calculateTotal())}</div><button class="btn pri" data-a="place">Place Order</button><p class="mut">Demo checkout only. No payment is taken and no real order is placed.</p></div></div></section>`}
function place(){const v=i=>$('#'+i).value.trim(),R={n:[/^.{2,}$/,'Enter your full name'],e:[/^[^@\s]+@[^@\s]+\.\w{2,}$/,'Enter a valid email'],ph:[/^\d{10}$/,'Enter a 10-digit phone number'],ad:[/^.{5,}$/,'Enter your delivery address'],ct:[/^.{2,}$/,'Enter your city'],st:[/^.{2,}$/,'Enter your state'],pc:[/^\d{6}$/,'Enter a 6-digit pincode']};let ok=true;
for(const k in R){const bad=!R[k][0].test(v(k));$('#e-'+k).textContent=bad?R[k][1]:'';ok=ok&&!bad}if(!ok)return toast('Please fix the highlighted fields');
const id='ZV-'+Date.now().toString(36).toUpperCase().slice(-6)+Math.floor(Math.random()*90+10),t=calculateTotal().total;ls.set('zv_orders',[{id,total:t,date:new Date().toLocaleDateString()},...ls.get('zv_orders',[])]);clearCart();
$('#app').innerHTML=`<section class="wrap pg empty"><div class="ok">✓</div><h1>Your Order Has Been Placed Successfully!</h1><p>Demo order ID: <b>${id}</b></p><p class="mut">This was a demonstration. No payment was processed and nothing will ship.</p><a class="btn pri" href="#/shop">Continue Shopping</a></section>`;scrollTo(0,0)}
const about=()=>`<section class="wrap pg"><h1>About ZENVORA</h1><p class="mut" style="max-width:640px">ZENVORA is a futuristic storefront concept built to make browsing feel effortless and premium. Products are loaded live from FakeStoreAPI, and checkout is a simulation for demonstration.</p></section>`;
const account=()=>{const o=ls.get('zv_orders',[]);return`<section class="wrap pg"><h1>My Account</h1><div class="glass"><h3>Guest shopper</h3><p class="mut">${wish.length} saved items · ${count()} in cart</p></div><h3 style="margin:24px 0 10px">Demo orders</h3>${o.length?o.map(x=>`<div class="glass tr" style="margin-bottom:8px"><span>${x.id} · ${x.date}</span><b>${money(x.total)}</b></div>`).join(''):'<p class="mut">No orders yet.</p>'}</section>`};
/* ---------- router ---------- */
function route(keep){let[a,b]=(location.hash.slice(2)||'home').split('/');pg=a;if(stop3D){stop3D();stop3D=null}close();const y=scrollY;let h;
if(err)h=`<div class="empty pg"><div class="bx">⚠️</div><h2>Couldn't load products</h2><p class="mut">Check your connection and try again.</p><button class="btn pri" data-a="retry">Retry</button></div>`;
else if(a=='home')h=home();else if(a=='shop'){F.new=F.best=F.offers=false;if(b=='new'||b=='best'||b=='offers')F[b]=true;if(/^c\d$/.test(b||''))F.cat=CATS[b[1]];h=shop()}
else if(a=='categories')h=`<section class="wrap pg"><h1>Categories</h1>${tiles()}</section>`;else if(a=='product')h=product(b);else if(a=='wishlist')h=wishlist();else if(a=='checkout')h=checkout();else if(a=='about')h=about();else if(a=='account')h=account();else h=empty('Page not found');
$('#app').innerHTML=h;scrollTo(0,keep?y:0);$$('nav a').forEach(l=>l.classList.toggle('on',l.dataset.r==(a=='shop'&&b&&/^(new|best|offers)$/.test(b)?'shop/'+b:a)));
if(a=='shop'&&!err)bindShop();if(a=='home'&&!err){init3D($('#cv'));if(window.gsap)gsap.from('.hc h1,.hc p,.hc .btn',{y:40,opacity:0,stagger:.14,duration:.9,ease:'power3.out'})}
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&(e.target.classList.add('in'),io.unobserve(e.target))),{threshold:.1});$$('.rv').forEach(e=>io.observe(e))}
/* ---------- 3D hero ---------- */
function init3D(cv){if(!window.THREE||!cv)return;H={auto:true,zoom:false,ex:false};let R;try{R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true})}catch{return}
R.setPixelRatio(Math.min(devicePixelRatio,2));const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(45,1,.1,100);C.position.set(0,1.2,10);
S.add(new THREE.AmbientLight(0x6688ff,.8));[[0x22d3ee,5,5,6],[0x8b5cf6,-6,-3,4]].forEach(([c,x,y,z])=>{const l=new THREE.PointLight(c,2.4,60);l.position.set(x,y,z);S.add(l)});
const g=new THREE.Group();S.add(g);const M=(c,e=0)=>new THREE.MeshStandardMaterial({color:c,metalness:.65,roughness:.25,emissive:c,emissiveIntensity:e});
const pd=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,.3,48),M(0x0b1230));pd.position.y=-2;g.add(pd);
const ring=(r,c,y,t)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,80),new THREE.MeshBasicMaterial({color:c}));m.rotation.x=Math.PI/2;m.position.y=y;g.add(m)};ring(2.3,0x22d3ee,-1.84,.04);ring(2.9,0x8b5cf6,-1.95,.025);
const orb=new THREE.Group(),o=new THREE.Mesh(new THREE.TorusGeometry(3.4,.015,8,100),new THREE.MeshBasicMaterial({color:0x38bdf8})),dot=new THREE.Mesh(new THREE.SphereGeometry(.12,16,16),new THREE.MeshBasicMaterial({color:0xffffff}));o.rotation.x=1.2;o.add(dot);orb.add(o);g.add(orb);
const prod=new THREE.Group();g.add(prod);
const base=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.3,2.2),M(0x1e3a8a,.15)),lid=new THREE.Mesh(new THREE.BoxGeometry(2.36,.5,2.36),M(0x8b5cf6,.2)),band=new THREE.Mesh(new THREE.BoxGeometry(.4,1.34,2.24),M(0x22d3ee,.5)),core=new THREE.Mesh(new THREE.IcosahedronGeometry(.55),M(0x22d3ee,1.2));
[base,lid].forEach(m=>m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0x7dd3fc}))));base.position.y=band.position.y=-.35;lid.position.y=.55;core.position.y=-.1;prod.add(base,lid,band,core);
const fl=[[new THREE.TorusGeometry(.4,.15,16,40),0x22d3ee,-3.2,1.4],[new THREE.OctahedronGeometry(.5),0x8b5cf6,3.3,1.8],[new THREE.IcosahedronGeometry(.35),0x3b82f6,-2.9,-.8]].map(([ge,c,x,y])=>{const m=new THREE.Mesh(ge,M(c,.2));m.position.set(x,y,0);g.add(m);return m});
const pa=new Float32Array(900);for(let i=0;i<900;i++)pa[i]=(Math.random()-.5)*22;const pb=new THREE.BufferGeometry();pb.setAttribute('position',new THREE.BufferAttribute(pa,3));const pts=new THREE.Points(pb,new THREE.PointsMaterial({color:0x22d3ee,size:.04}));S.add(pts);
const rs=()=>{const w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix();g.position.x=w>900?3:0;g.scale.setScalar(w>900?1:.65)};rs();
const HP=[[2.4,1.2,0],[-2.5,-.2,0],[2.2,-1.5,0]],V=new THREE.Vector3(),hs=$$('.hs'),L=(a,b)=>a+(b-a)*.08;
let mx=0,my=0,id,t=0;const mm=e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5};addEventListener('mousemove',mm);addEventListener('resize',rs);
(function loop(){id=requestAnimationFrame(loop);t+=.01;if(H.auto)prod.rotation.y+=.008;prod.position.y=Math.sin(t*2)*.12;
lid.position.y=L(lid.position.y,H.ex?2.5:.55);core.position.y=L(core.position.y,H.ex?1:-.1);base.position.y=band.position.y=L(base.position.y,H.ex?-.9:-.35);core.rotation.y+=.03;
C.position.z=L(C.position.z,H.zoom?6.5:10);C.lookAt(0,-.2,0);orb.rotation.y+=.01;dot.position.set(Math.cos(t*2)*3.4,Math.sin(t*2)*3.4,0);
g.rotation.y+=(mx*.7-g.rotation.y)*.05;g.rotation.x+=(my*.4-g.rotation.x)*.05;fl.forEach((m,i)=>{m.rotation.x+=.01*(i+1);m.rotation.y+=.012;m.position.y+=Math.sin(t*2+i)*.004});pts.rotation.y+=.0008;
g.updateMatrixWorld();C.updateMatrixWorld();hs.forEach((h,i)=>{V.set(...HP[i]);g.localToWorld(V).project(C);h.style.left=(V.x+1)/2*cv.clientWidth+'px';h.style.top=(1-V.y)/2*cv.clientHeight+'px'});R.render(S,C)})();
stop3D=()=>{cancelAnimationFrame(id);removeEventListener('mousemove',mm);removeEventListener('resize',rs);R.dispose()}}
/* ---------- search ---------- */
function sugg(){const v=$('#si').value.trim().toLowerCase();let h;
if(!v)h=hist.length?'<small>Recent searches</small>'+hist.map(x=>`<a data-a="hist" data-v="${esc(x)}">⟲ ${esc(x)}</a>`).join(''):'<small>Start typing to search products or categories</small>';
else{const m=P.filter(p=>(p.title+' '+p.category).toLowerCase().includes(v)).slice(0,6);h=m.length?m.map(p=>`<a href="#/product/${p.id}" data-a="close">${img(p)}<span>${p.title}</span></a>`).join('')+`<a data-a="sall">See all results for "${esc(v)}"</a>`:'<p class="mut">No results found. Try another name or category.</p>'}$('#ss').innerHTML=h}
function doSearch(v){v=v.trim();if(!v)return;F={...F0,q:v};hist=[v,...hist.filter(x=>x!=v)].slice(0,5);ls.set('zv_hist',hist);close();if(location.hash=='#/shop')route();else location.hash='#/shop'}
function close(){document.body.classList.remove('co','qo','sp-open','menu')}
/* ---------- events ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,id=t.dataset.id,qc=t.closest('.qc'),qv=()=>+(qc&&$('.qin',qc)?.value)||1;
({wish:()=>toggleWish(id),add:()=>addToCart(id,t.dataset.q?qv():1),buy:()=>{addToCart(id,qv());location.hash='#/checkout'},
qv:()=>{const p=byId(id);$('#qv').innerHTML=`<button data-a="close" style="float:right" aria-label="Close">✕</button>`+detail(p);close();document.body.classList.add('qo')},
cart:()=>{close();document.body.classList.add('co')},close,inc:()=>updateQuantity(id,cart[id]+1),dec:()=>updateQuantity(id,cart[id]-1),rm:()=>removeFromCart(id),clear:clearCart,
mv:()=>{addToCart(id);toggleWish(id)},qp:()=>{const i=$('.qin',qc);i.value=Math.min(10,(+i.value||1)+1)},qm:()=>{const i=$('.qin',qc);i.value=Math.max(1,(+i.value||1)-1)},
menu:()=>document.body.classList.toggle('menu'),hrot:()=>{H.auto=!H.auto;t.classList.toggle('on',H.auto)},hzoom:()=>{H.zoom=!H.zoom;t.classList.toggle('on',H.zoom)},hexp:()=>{H.ex=!H.ex;t.classList.toggle('on',H.ex);t.textContent=H.ex?'✦ Assemble':'✦ Explode'},search:()=>{const o=!document.body.classList.contains('sp-open');close();if(o){document.body.classList.add('sp-open');$('#si').focus();sugg()}},
sclear:()=>{$('#si').value='';F.q='';sugg();$('#si').focus();if(pg=='shop')drawGrid()},hist:()=>doSearch(t.dataset.v),sall:()=>doSearch($('#si').value),
x:()=>{const k=t.dataset.k;F[k]=F0[k];if(k=='q'||k=='cat'||k=='min'||k=='max'||k=='rate'||k=='offers')route(true);else{$('#f'+k).checked=false;drawGrid()}},
reset:()=>{F={...F0};route(true)},retry:()=>boot(),place,
news:()=>{const ok=/^[^@\s]+@[^@\s]+\.\w{2,}$/.test($('#ne').value.trim());$('#ner').textContent=ok?'':'Enter a valid email address';if(ok){$('#ne').value='';toast('Subscribed (demo)')}},
contact:()=>{const ok=$('#cn').value.trim()&&/^[^@\s]+@[^@\s]+\.\w{2,}$/.test($('#ce').value.trim())&&$('#cm').value.trim().length>4;$('#cer').textContent=ok?'':'Add your name, a valid email and a message';if(ok){['#cn','#ce','#cm'].forEach(s=>$(s).value='');toast('Message sent (demo)')}}}[a]||(()=>{}))()});
document.addEventListener('click',e=>{if(e.target.closest('#nav a'))close()});
document.addEventListener('keydown',e=>{if(e.key=='Escape')close();if(e.key=='Enter'&&e.target.id=='si')doSearch(e.target.value)});
document.addEventListener('input',e=>{if(e.target.id=='si')sugg();if(e.target.classList.contains('qin')){let v=Math.floor(+e.target.value);if(e.target.value!=='')e.target.value=Math.max(1,Math.min(10,v||1))}});
document.addEventListener('change',e=>{if(e.target.classList.contains('qin')&&!e.target.value)e.target.value=1});
document.addEventListener('mousemove',e=>{const c=e.target.closest('[data-tilt]');$$('.tl').forEach(x=>{if(x!==c){x.style.transform='';x.classList.remove('tl')}});
const z=e.target.closest('[data-zoom]');$$('.stg').forEach(x=>{if(!z||x!==z.parentElement)x.style.transform=''});if(z){const r=z.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;z.firstElementChild.style.transformOrigin=`${px*100}% ${py*100}%`;z.parentElement.style.transform=`rotateY(${(px-.5)*14}deg) rotateX(${(.5-py)*10}deg)`}
if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.classList.add('tl');c.style.transform=`perspective(800px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`});
/* ---------- boot ---------- */
async function boot(){err=false;try{const r=await fetch('https://fakestoreapi.com/products');if(!r.ok)throw 0;P=await r.json();ls.set('zv_p',P)}catch{P=ls.get('zv_p',[]);err=!P.length}
cart=Object.fromEntries(Object.entries(cart).filter(([k,v])=>v>=1&&(err||byId(k))));upd();route();setTimeout(()=>$('#loader').classList.add('off'),400)}
addEventListener('hashchange',()=>route());boot();
