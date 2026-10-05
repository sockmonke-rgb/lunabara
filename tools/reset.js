// Lunabara reset test: loads a saved colony from device and account, presses Reset colony twice,
// then fires the page-unload saves the browser sends during a reload. Pass: every copy stays erased,
// including one left under the old 'lunarium' key from before the rename.
// Run: node reset.js lunabara-probe-X.html
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const mainJs=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk(); let fakeT=0;
THREE.Clock=class{ getDelta(){ return 1/30; } }; THREE.OrbitControls=function(){ return mk(); };
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
const old={colony:{o2:95,reactor:100,samples:294,launched:181,pups:[{name:'KIWI',parent:'PIP'}],drops:3,crew:[{name:'SORA',div:'sci',fur:0x9b6a44}]},savedAt:Date.now()-60000};
const store={lunabara:JSON.stringify(old),lunarium:JSON.stringify(old)};
let account=JSON.parse(JSON.stringify(old)), writes=0, reloaded=false; const listeners={};
const ref={ get:async()=>({exists:!!account,data:()=>account}), set:async d=>{ account=JSON.parse(JSON.stringify(d)); writes++; }, delete:async()=>{ account=null; } };
const rafQ=[];
const doc=(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; d.addEventListener=(n,f)=>{ (listeners[n]=listeners[n]||[]).push(f); }; d.visibilityState='hidden'; return d; })();
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f,ms)=>{ if(ms>=10000) return; f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:f=>rafQ.push(f), localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}}, document:doc, matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  location:{reload:()=>{ reloaded=true; }}, Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=(n,f)=>{ (listeners[n]=listeners[n]||[]).push(f); };
ctx.claude={ use:async k=> k==='db'?{doc:()=>ref}:{id:async()=>'u_test'} };
vm.createContext(ctx); vm.runInContext(mainJs,ctx,{filename:'game'});
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  for(let i=0;i<5;i++) await tick();
  for(let k=0;k<900 && rafQ.length;k++){ const f=rafQ.shift(); fakeT+=1/30; f(); }
  const els=doc.__els; els.bReset.onclick(); await els.bReset.onclick();
  // what the browser does while reloading: unload events, a few last frames
  (listeners.visibilitychange||[]).forEach(f=>f()); (listeners.pagehide||[]).forEach(f=>f());
  for(let k=0;k<900 && rafQ.length;k++){ const f=rafQ.shift(); fakeT+=1/30; f(); }
  for(let i=0;i<5;i++) await tick();
  const ok=reloaded && !store.lunabara && !store.lunarium && !account;
  console.log('reloaded:',reloaded,' device copy left:',!!store.lunabara,' old-key copy left:',!!store.lunarium,' account copy left:',!!account);
  console.log(ok?'PASS: reset erased every copy':'FAIL: reset left a copy behind'); if(!ok) process.exitCode=1;
})();
