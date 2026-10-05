// Lunabara restore test: starts from a colony restored out of the account save, which hands back read-only
// objects, with the reactor online and the pup countdown nearly done. Pass: pups are born and nothing throws.
// 0.41: the restored colony also has 5 capsules sent and one crewmate who arrived by lander, so it checks that
// arrivals come back and that the next lander still lands.
// Run: node restore.js lunabara-probe-X.html
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2]||'lunabara.html','utf8');
const mainJs=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk();
let fakeT=0;
THREE.Clock=class{ getDelta(){ return 1/30; } };
THREE.OrbitControls=function(){ return mk(); };
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
// No device copy under a real key: the colony must come from the account save.
const saved={colony:{birthT:113.4,boostT:0,compost:32.5,dustT:0,fruit:18,he3:12,launched:5,md:100,o2:99.1,peels:0,pups:[],reactor:100,samples:33,yuzu:4,
  drops:1,crew:[{name:'SORA',div:'sci',fur:0x9b6a44}]},savedAt:Date.now()};
// Chat off: with chat on, log notes go into the chat instead of the log line this test reads.
const store={ x_lunabara: JSON.stringify(saved), 'lunabara-look': JSON.stringify({chat:0}) };
const rafQ=[];
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:(f)=>rafQ.push(f),
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx;
function deepFreeze(o){ Object.values(o).forEach(v=>{ if(v&&typeof v==='object') deepFreeze(v); }); return Object.freeze(o); }
const acct=deepFreeze(JSON.parse(JSON.stringify(saved)));
const ref={get:async()=>({exists:true,data:()=>acct}),set:async()=>{},delete:async()=>{}};
ctx.claude={use:async k=>k==='db'?{doc:()=>ref}:{id:async()=>'u_test'}}; ctx.visualViewport=mk(); ctx.addEventListener=()=>{};
vm.createContext(ctx);
vm.runInContext(mainJs,ctx,{filename:'game'});
(async()=>{ for(let i=0;i<5;i++) await new Promise(r=>setImmediate(r));
let frames=0;
const N=+process.argv[3]||20000;
let lastLog='', rides=0, births=0, landed=0, night=0, goodnight=0, stepped=0;
while(rafQ.length && frames<N){ const f=rafQ.shift(); fakeT+=1/30; f(); frames++;
  const L=ctx.document.__els.log, tx=L&&typeof L.textContent==='string'?L.textContent:'';
  if(tx && tx!==lastLog){ lastLog=tx; if(/hopped on ROVER-1/.test(tx)) rides++; if(/pup was born/.test(tx)) births++; if(/touched down/.test(tx)) landed++; if(/Lunar night/.test(tx)) night++; if(/said goodnight/.test(tx)) goodnight++; if(/stepped off the lander/.test(tx)) stepped++; } }
console.log('pup rides seen:',rides,' births seen:',births,' landers seen:',landed,' crewmates stepped off:',stepped,' nights:',night,' goodnights:',goodnight);
if(night && !goodnight){ console.log('FAIL: a night fell but nobody said goodnight'); process.exitCode=1; }
if(!births){ console.log('FAIL: no pup born from a restored colony'); process.exitCode=1; } else console.log('PASS: pups born from a restored colony');
console.log('frames run:',frames);
const els=ctx.document.__els; let clicks=0;
const seq=['bTime','bTime','bTime','bTime','bStation','bView','bView','bView','bView','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bStation','bNext','bNext','bView','bTour','bPixel','bShadow','readout','bSpeed','bSpeed','bSpeed','bTour','bNext'];
for(const id of seq){ els[id].onclick(); clicks++; for(let k=0;k<200 && rafQ.length;k++){ const f=rafQ.shift(); fakeT+=1/30; f(); } }
console.log('clicks ok:',clicks);
els.readout.onclick(); const diag=String(els.diagText.value).split('\n');
console.log(diag.slice(0,1).join(''));
const sl=diag.find(l=>l.startsWith('save:')); console.log('SAVE LINE:',sl); if(sl && sl.includes('device blocked')) { console.log('FAIL: loading the saved colony threw'); process.exitCode=1; }
const el=diag.find(l=>l.startsWith('3d library')); console.log(el); if(el && !/errors: 0\b/.test(el)){ console.log(diag.filter(l=>/^  #/.test(l)).join('\n')); console.log('FAIL: the game hit errors'); process.exitCode=1; }
const cl=diag.find(l=>l.startsWith('crew:')); console.log(cl); console.log(diag.find(l=>l.startsWith('lander:')));
const runs=+((diag.find(l=>l.startsWith('lander:'))||'').match(/rover cargo runs (\d+)/)||[0,0])[1]; if(runs<1){ console.log('FAIL: ROVER-1 never fetched cargo from a lander'); process.exitCode=1; } else console.log('PASS: ROVER-1 made '+runs+' cargo run(s)');
if(!cl || cl.indexOf('SORA')<0){ console.log('FAIL: the crewmate from the lander did not come back'); process.exitCode=1; } else console.log('PASS: arrivals restored');
const s=JSON.parse(store.lunabara||'{}'); console.log('saved drops/launched:',s.colony&&s.colony.drops,'/',s.colony&&s.colony.launched);
})();
