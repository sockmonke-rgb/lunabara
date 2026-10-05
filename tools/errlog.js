// Checks the error log (0.35, 0.39): runs the early collector and the game, fires a page error with a file and stack,
// a cross-origin "Script error." and a failed load, then prints the Diag error lines.
// Run: node errlog.js lunabara-probe-X.html
// Pass: the page error shows its file, line and stack; the "Script error." lines are counted apart, as from outside the game.
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8'), blocks=html.split('<script>').map(s=>s.split('</script>')[0]);
const early=blocks.find(s=>s.indexOf('window.__errs=')>=0), mainJs=blocks.find(s=>s.indexOf("const BUILD=")>=0);
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
const THREE=mk(); let fakeT=0; THREE.Clock=class{ getDelta(){ return 1/30; } }; THREE.OrbitControls=function(){ return mk(); };
THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
const L={}, rafQ=[], store={};
const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
  requestAnimationFrame:(f)=>rafQ.push(f), localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
  Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=(n,f)=>{ (L[n]=L[n]||[]).push(f); }; ctx.__lib='cors';
vm.createContext(ctx); vm.runInContext(early,ctx); vm.runInContext(mainJs,ctx);
for(let k=0;k<400&&rafQ.length;k++){ fakeT+=1/30; rafQ.shift()(); }
const e=new Error("undefined is not an object (evaluating 'n.geometry')"); e.stack="onPointerMove@https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js:612:30\nhandle@x\nmore@y";
L.error.forEach(f=>f({target:ctx,message:e.message,filename:'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',lineno:612,colno:30,error:e}));
L.error.forEach(f=>f({target:ctx,message:'Script error.',filename:'',lineno:0,colno:0,error:null}));
L.error.forEach(f=>f({target:{src:'https://fonts.gstatic.com/x.woff2'}}));
L.unhandledrejection.forEach(f=>f({reason:new Error('db timeout')}));
for(let i=0;i<3;i++) L.error.forEach(f=>f({target:ctx,message:'Script error.',filename:'',lineno:0,colno:0,error:null}));
ctx.document.__els.readout.onclick();
const out=String(ctx.document.__els.diagText.value).split('\n').filter(l=>/3d library|^  #/.test(l));
console.log(out.join('\n'));
const ok=/errors: 3\b/.test(out[0]) && /plus 4 hidden/.test(out[0]) && out.some(l=>/OrbitControls\.js:612:30/.test(l));
console.log(ok?'PASS: error log keeps file, line and stack; outside "Script error." counted apart':'FAIL: error log lines not as expected'); if(!ok) process.exitCode=1;
