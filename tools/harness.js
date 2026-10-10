// Loads a build headlessly (three.js stubbed) with a hook exposing internals. Usage: const L=require('./harness')(file, extraHook)
const vm=require('vm'), fs=require('fs');
module.exports=function(file,hookExpr,store){
  const html=fs.readFileSync(file,'utf8');
  let js=html.split('<script>').map(s=>s.split('</script>')[0]).find(s=>s.indexOf("const BUILD=")>=0);
  const anchor="  mapStep();\n})();\n})();"; if(js.indexOf(anchor)<0) throw new Error('anchor');
  js=js.replace(anchor,"  window.__lb={"+hookExpr+"};\n"+anchor);
  const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
    apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
  function mk(){ return new Proxy(function(){},handler); }
  const THREE=mk(); let fakeT=0;
  THREE.Clock=class{ getDelta(){ return 1/30; } }; THREE.OrbitControls=function(){ return mk(); };
  THREE.CatmullRomCurve3=class{ getLength(){ return 40; } getPointAt(){ return {x:0.6,y:0,z:1.2}; } getTangentAt(){ return {x:0,y:0,z:1}; } };
  store=store||{ 'lunabara-look':JSON.stringify({chat:0}) };
  const rafQ=[];
  const ctx={ THREE, console, Math, JSON, Date, performance:{now:()=>fakeT*1000}, setTimeout:(f)=>{ f(); }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    requestAnimationFrame:(f)=>rafQ.push(f), localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{ delete store[k]; }},
    navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
    document:(()=>{ const els={}; const d=mk(); d.getElementById=id=>els[id]||(els[id]=mk()); d.__els=els; return d; })(), matchMedia:()=>({matches:false}), devicePixelRatio:3, innerWidth:402, innerHeight:812,
    Float32Array, Array, Object, Number, String, Symbol, Promise, Error, isNaN, parseFloat };
  ctx.window=ctx; ctx.visualViewport=mk(); ctx.addEventListener=()=>{};
  vm.createContext(ctx); vm.runInContext(js,ctx,{filename:'game'});
  const L=ctx.__lb; L.step=n=>{ for(let i=0;i<n && rafQ.length;i++){ rafQ.shift()(); fakeT+=1/30; } }; L.ctx=ctx; return L;
};
