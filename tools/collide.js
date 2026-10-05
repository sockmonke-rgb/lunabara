// Lunabara collision test (0.49): runs the colony headlessly for 20 simulated minutes and measures how often two
// capybaras (or a capybara and a pup) stand inside each other, whether anyone walks through the side of the wallow,
// and whether anyone gets stuck on a trip. Greeting partners and the pair on the comms seats are allowed close.
// Run: node collide.js lunabara-probe-X.html
// Pass: overlaps under 0.25% of pair-frames (0.48 had 0.77%), wallow side crossings 0, nobody walking the same trip for over 60 s,
// and (0.50) fewer than 1 sharp turn (over 135° within 0.6 s) per walking minute (0.49 had 3.2).
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2]||'lunabara.html','utf8');
let js=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);
js=js.replace("  mapStep();\n})();\n})();","  window.__lb={capys,pups,colony,POOL,makePup};\n  mapStep();\n})();\n})();");
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk(); let fakeT=0;
THREE.Clock=class{ getDelta(){ return 1/30; } }; THREE.OrbitControls=function(){ return mk(); };
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
const store={ lunabara: JSON.stringify({colony:{o2:95,reactor:100,samples:3,fruit:12,yuzu:4,peels:0,compost:60,md:40,he3:0,launched:0,pups:[{name:'KIWI',parent:'PIP'},{name:'MIKAN',parent:'LUNA'}]},savedAt:Date.now()}), 'lunabara-look':JSON.stringify({chat:0}) };
const rafQ=[];
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:(f)=>rafQ.push(f), localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=()=>{};
vm.createContext(ctx); vm.runInContext(js,ctx,{filename:'game'});
const L=ctx.__lb; if(!L){ console.log('FAIL: hook not found'); process.exit(1); }
const yawH=new Map(); let flips=0, walkFrames=0;
let domeX=0; const prevB=new Map();
let frames=0, bodyFrames=0, overlaps=0, worst=0, wall=0, longest=0; const prevD=new Map(), tripT=new Map();
const R=c=>c.isPup?0.3:0.5, POOL_R=2.3;
while(rafQ.length && frames<36000){ rafQ.shift()(); fakeT+=1/30; frames++;
  if(frames<300) continue;
  const all=L.capys.filter(c=>c.root.visible && !(c.state==='act' && (c.place==='wheel'||c.place==='sleep'))).concat(L.pups.filter(p=>p.root.visible && !p.riding));
  for(let i=0;i<all.length;i++) for(let j=i+1;j<all.length;j++){ const a=all[i], b=all[j];
    if((a.state==='greet'&&a.partner===b) || (a.place==='comms'&&b.place==='comms'&&a.state==='act'&&b.state==='act')) continue;
    bodyFrames++; const d=Math.hypot(a.x-b.x,a.z-b.z), min=(a.parent===b||b.parent===a)?0.62:R(a)+R(b);
    if(d<min*0.6){ overlaps++; worst=Math.max(worst,min-d); } }
  // 0.50: sharp turns while walking: the facing swinging more than 135° within 0.6 s
  for(const c of all){ const walking=c.isPup?c.walking:c.state==='walk'; let h=yawH.get(c); if(!h){ h=[]; yawH.set(c,h); }
    if(!walking){ h.length=0; continue; } walkFrames++; h.push(c.yaw); if(h.length>18) h.shift();
    let mx=0; for(const y of h){ let d=Math.abs(((c.yaw-y)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI); if(d>mx) mx=d; }
    if(mx>2.36){ flips++; h.length=0; } }
  for(const c of all){ const d=Math.hypot(c.x-L.POOL.x,c.z-L.POOL.z), p=prevD.get(c);
    if(p!==undefined && (p-POOL_R)*(d-POOL_R)<0){ const onR=[Math.PI,0.25].some(a=>{ const ux=Math.cos(a), uz=Math.sin(a), dx=c.x-L.POOL.x, dz=c.z-L.POOL.z; return Math.abs(-dx*uz+dz*ux)<0.57 && (dx*ux+dz*uz)>1; }); if(!onR) wall++; }
    prevD.set(c,d);
    // 0.51: through the bathhouse glass (anywhere but the airlock)
    { const b=Math.hypot(c.x-L.POOL.x,c.z-L.POOL.z), pb=prevB.get(c); if(pb!==undefined && (pb-4.4)*(b-4.4)<0 && !(Math.abs(c.z-L.POOL.z)<0.7 && c.x<L.POOL.x-3.1)) domeX++; prevB.set(c,b); }
    if(!c.isPup){ const k=c.state==='walk'?c.place:''; const e=tripT.get(c)||{k:'',t:0}; if(k && k===e.k) e.t+=1/30; else { e.k=k; e.t=0; } tripT.set(c,e); longest=Math.max(longest,e.t); } } }
const pct=100*overlaps/Math.max(1,bodyFrames);
console.log('frames',frames,'pair-frames',bodyFrames,'overlapping',overlaps,'('+pct.toFixed(2)+'%)','worst overlap m',worst.toFixed(2),'wallow side crossings',wall,'bathhouse wall crossings',domeX,'longest walk s',longest.toFixed(1),'sharp turns per walking minute',(flips/Math.max(1,walkFrames/1800)).toFixed(2));
let ok=true;
if(pct>=0.25){ console.log('FAIL: capybaras stand inside each other too often'); ok=false; }
if(domeX>0){ console.log('FAIL: walked through the bathhouse glass'); ok=false; }
if(wall>0){ console.log('FAIL: walked through the side of the wallow'); ok=false; }
if(flips/Math.max(1,walkFrames/1800)>=1){ console.log('FAIL: walkers swing round sharply too often'); ok=false; }
if(longest>60){ console.log('FAIL: someone was stuck on a trip for over a minute'); ok=false; }
if(ok) console.log('PASS: bodies keep apart, the wallow is entered by its ramps, nobody stuck, no sudden spins'); else process.exitCode=1;
