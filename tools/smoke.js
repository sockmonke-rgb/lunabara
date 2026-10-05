// Lunabara smoke test: runs the game script headlessly with the 3D library and page stubbed out,
// steps thousands of frames and presses every button, to catch crashes before a build reaches the phone.
// Run: node smoke.js lunabara-probe-X.html [frames]
// Pass: prints "frames run" and "clicks ok" with no error. It does not check visuals or real positions.
// It starts from a save under the old 'lunarium' key, so it also checks that saves from before the rename
// load and move to the new 'lunabara' key.
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2]||'lunabara.html','utf8');
const mainJs=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);   // the game script, found by content
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk();
let fakeT=0;
THREE.Clock=class{ getDelta(){ return 1/30; } };
THREE.OrbitControls=function(){ return mk(); };
// A real-length rover loop so the rover actually goes round (and pups can ride it)
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
const store={ lunarium: JSON.stringify({o2:95,reactor:100,samples:3,fruit:12,yuzu:3,peels:1,compost:90,md:99.5,he3:5,launched:0,boostT:0,pups:[{name:'KIWI',parent:'NILO'}]}) };
const rafQ=[];
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:(f)=>rafQ.push(f),
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=()=>{};
vm.createContext(ctx);
vm.runInContext(mainJs,ctx,{filename:'game'});
let frames=0;
const N=+process.argv[3]||16000;
let lastLog='', rides=0, births=0;
const seen={};
while(rafQ.length && frames<N){ const f=rafQ.shift(); fakeT+=1/30; f(); frames++;
  const L=ctx.document.__els.log, tx=L&&typeof L.textContent==='string'?L.textContent:'';
  if(tx && tx!==lastLog){ lastLog=tx; if(/hopped on ROVER-1/.test(tx)) rides++; if(/pup was born/.test(tx)) births++; } }
console.log('pup rides seen:',rides,' births seen:',births);
console.log('frames run:',frames);
const els=ctx.document.__els; let clicks=0;
const seq=['bTime','bTime','bTime','bTime','bStation','bView','bView','bView','bView','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bNext','bNext','bView','bTour','bPixel','bShadow','readout','bSpeed','bSpeed','bSpeed','bTour','bNext','hudToggle','hudToggle','bChat','bChat','bFeed','bFeed','bLander','bAssist','bSpeed','bSpeed'];
for(const id of seq){ if(!els[id] || typeof els[id].onclick!=='function'){ console.log('FAIL: no handler for',id); process.exitCode=1; continue; } els[id].onclick(); clicks++; for(let k=0;k<200 && rafQ.length;k++){ const f=rafQ.shift(); fakeT+=1/30; f(); } }
console.log('clicks ok:',clicks, 'station button label:', String(els.bStation.textContent), 'next label:', String(els.bNext.textContent));
els.readout.onclick();
const diag=String(els.diagText.value).split('\n');
console.log(diag.slice(0,3).join(' | '));
const el=diag.find(l=>l.startsWith('3d library')); console.log(el); if(el && !/errors: 0\b/.test(el)){ console.log('FAIL: the game hit errors'); console.log(diag.filter(l=>/^  #/.test(l)).join('\n')); process.exitCode=1; }
const sl=diag.find(l=>l.startsWith('save:')); console.log('SAVE LINE:',sl); if(sl && sl.includes('device blocked')) { console.log('FAIL: loading the saved colony threw'); process.exitCode=1; }
const moved=!!store.lunabara && !store.lunarium && JSON.parse(store.lunabara).colony.samples>=3;
console.log(moved?'PASS: old lunarium save loaded and moved to lunabara':'FAIL: old lunarium save was not carried over'); if(!moved) process.exitCode=1;
console.log(diag.filter(l=>/^(stream|lander|crew|waves)/.test(l)).join('\n'));
