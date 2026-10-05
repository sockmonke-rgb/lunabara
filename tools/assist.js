// Lunabara lend-a-hand and pause test (0.45): opens the Reactor station in the game view (shoulder before 0.50), taps the button as the ring
// meets its edge, and checks that the reactor moves faster than the capybaras alone. Then pauses and checks the colony stops.
// Run: node assist.js lunabara-probe-X.html
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const mainJs=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk(); let fakeT=0;
THREE.Clock=class{ getDelta(){ return 1/30; } }; THREE.OrbitControls=function(){ return mk(); };
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
const store={ lunabara: JSON.stringify({colony:{o2:99,reactor:20,samples:3,fruit:12,yuzu:3,peels:0,compost:30,md:0,he3:0,launched:0,pups:[]},savedAt:Date.now()}), 'lunabara-look':JSON.stringify({chat:0}) };
const rafQ=[];
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:(f)=>rafQ.push(f), localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=()=>{};
vm.createContext(ctx); vm.runInContext(mainJs,ctx,{filename:'game'});
const els=ctx.document.__els, step=n=>{ for(let k=0;k<n && rafQ.length;k++){ fakeT+=1/30; rafQ.shift()(); } };
const diag=()=>{ els.readout.onclick(); return String(els.diagText.value).split('\n'); };
const num=(re)=>{ const l=diag().find(l=>re.test(l)); return l; };
step(300);
// go to the Reactor station, game view (0.50: the games live in their own view)
let guard=0; els.bStation.onclick(); while(String(els.bStation.textContent)!=='Reactor' && guard++<20) els.bStation.onclick();
while(!/game/.test(String(els.bView.textContent)) && guard++<40) els.bView.onclick();
step(20);
const r0=+(num(/^colony:/).match(/reactor ([\d.]+)/)[1]);
step(30*20); const r1=+(num(/^colony:/).match(/reactor ([\d.]+)/)[1]);   // 20 s without help
// 20 s of well-timed taps: the ring meets the edge 1.2 s after each reset
for(let i=0;i<16;i++){ step(36); els.bAssist.onclick(); step(1); }
step(30*20-16*37); const r2=+(num(/^colony:/).match(/reactor ([\d.]+)/)[1]);
const ln=num(/^lend a hand/); console.log(ln);
console.log('reactor: 20 s alone +'+(r1-r0).toFixed(2)+'  20 s with taps +'+(r2-r1).toFixed(2));
let ok=/(\d+) hits/.test(ln) && +ln.match(/(\d+) hits/)[1]>=12 && (r2-r1)>(r1-r0)+3;
console.log(ok?'PASS: lending a hand speeds the reactor':'FAIL: taps did not help'); if(!ok) process.exitCode=1;
// pause: ×1 → ×2 → ×4 → ×8 → Paused
for(let i=0;i<4;i++) els.bSpeed.onclick();
const lab=String(els.bSpeed.textContent), m0=num(/^stream:/).match(/MET ([\d:]+)/)[1]; step(300); const m1=num(/^stream:/).match(/MET ([\d:]+)/)[1];
const paused=lab==='Paused' && m0===m1; console.log('speed button:',lab,' MET before/after 10 s:',m0,m1);
els.bSpeed.onclick(); const back=String(els.bSpeed.textContent);
console.log(paused && back==='Speed ×1' ? 'PASS: pause stops the colony and ×1 comes back' : 'FAIL: pause'); if(!(paused && back==='Speed ×1')) process.exitCode=1;
// 0.46: the tap-fast game at the Compost bin, and the sweep game at the Lab
const goTo=lbl=>{ let g=0; els.bStation.onclick(); while(String(els.bStation.textContent)!==lbl && g++<30) els.bStation.onclick(); step(10); };
const hitsNow=()=>+num(/^lend a hand/).match(/(\d+) hits/)[1];
goTo('Compost'); 
// 0.47: mashing (a tap every 0.1 s) must lose to a steady rhythm (a tap every 0.33 s) over the same 15 s
let h0=hitsNow(); for(let i=0;i<150;i++){ els.bAssist.onclick(); step(3); } const hMash=hitsNow()-h0;
// a player who watches the bar: tap whenever it has sunk to the bottom of the zone, at most every 0.2 s, for 15 s
step(40); h0=hitsNow(); let taps=0, since=9;
for(let f=0;f<450;f++){ const m=num(/^lend a hand/).match(/bar ([\d.]+) zone ([\d.]+)/); since++;
  if(m && +m[1] < +m[2]-0.06 && since>=6){ els.bAssist.onclick(); taps++; since=0; } step(1); }
const hSteady=hitsNow()-h0;
console.log('compost: 150 mashed taps scored', hMash, '· watching the bar,', taps, 'taps scored', hSteady);
if(!(hSteady>=10 && hMash<hSteady)){ console.log('FAIL: steady-rhythm game'); process.exitCode=1; } else console.log('PASS: at the Compost bin a steady rhythm beats mashing');
goTo('Lab'); h0=hitsNow(); for(let i=0;i<120;i++){ els.bAssist.onclick(); step(4); } const h2=hitsNow();
console.log('lab: sweep scored', h2-h0, 'hits from 120 untimed taps'); if(h2-h0<5 || h2-h0>100){ console.log('FAIL: sweep game'); process.exitCode=1; } else console.log('PASS: sweep game at the Lab (untimed taps land sometimes, not always)');
const e=diag().find(l=>l.startsWith('3d library')); console.log(e); if(!/errors: 0\b/.test(e)){ console.log('FAIL: errors'); process.exitCode=1; }
