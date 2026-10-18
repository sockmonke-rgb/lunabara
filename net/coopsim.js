// Lunabara Net Probe co-op test: runs several copies of the page script headlessly (3D stubbed) on one fake clock,
// joined by a fake artifact room with latency, jitter, drops, clock skew, a disconnect and a viewer who can't send events,
// plus a fake shared database (slower than the room) for building. 0.2 adds building, snapping, collisions and the nuzzle.
// Run: node coopsim.js lunabara-net-probe.html
// Pass: every check prints PASS and the exit code is 0. It checks the netcode and page wiring, not visuals or real-network timing.
const vm=require('vm'), fs=require('fs');
const html=fs.readFileSync(process.argv[2]||'lunabara-net-probe.html','utf8');
const scripts=html.split(/<script>/).slice(1).map(s=>s.split('</script>')[0]);
const errJs=scripts.find(s=>s.includes('window.__errs={')), mainJs=scripts.find(s=>s.includes("const BUILD="));
if(!errJs||!mainJs) throw new Error('scripts not found');

// ---- fake clock and timers (shared by every device and the room)
let NOW=1760731200000;            // ms
const timers=[]; let tSeq=0;
function at(ms,fn){ timers.push({ms,fn,seq:tSeq++}); }
function runDue(){ for(;;){ let bi=-1; for(let i=0;i<timers.length;i++){ const x=timers[i]; if(x.ms<=NOW && (bi<0 || x.ms<timers[bi].ms || (x.ms===timers[bi].ms && x.seq<timers[bi].seq))) bi=i; }
  if(bi<0) return; const x=timers.splice(bi,1)[0]; x.fn(); } }
let seed=12345; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };

// ---- fake room
const bus={members:[], up:30, down:30, jit:10, emitDrop:0, topicsInteract:['echo','ping','pong','act','nuzzle','build','term'], dbExtra:150};
function oneWay(a,b){ return a.up+rnd()*bus.jit + b.down+rnd()*bus.jit; }
function deliverFifo(from,to,fn){ const key=from.peer+'>'+to.peer; let t=NOW+oneWay(from,to); const last=bus.fifo[key]||0; if(t<=last) t=last+0.1; bus.fifo[key]=t; at(t,fn); }
bus.fifo={};
function makeMember(o){
  const M={peer:o.peer, by:o.by, guest:!!o.guest, canEmit:o.canEmit!==false, up:bus.up, down:bus.down, conn:false, gone:false,
    pres:Object.freeze({}), view:new Map(), lis:{}, peersFns:[], connFns:[], notifyAt:null, flushAt:0, flushPending:false, emits:0};
  const entry=(X,presence)=>({peer:X.peer, by:X.by, guest:X.guest, presence:presence||X.pres});
  M.view.set(M.peer,entry(M));
  function notify(){ if(M.notifyAt!=null) return; M.notifyAt=NOW; at(NOW,()=>{ M.notifyAt=null; if(M.gone) return;
      const peers=Object.freeze([...M.view.values()].map(e=>Object.freeze({peer:e.peer, by:e.by, isMe:e.by===M.by, sameTab:e.peer===M.peer, kind:'viewer', guest:e.guest, presence:e.presence, updatedAt:NOW})));
      for(const f of M.peersFns) f({peers, joined:[], left:[], updated:[]}); }); }
  M.notify=notify;
  const room={
    emit(topic,data){ if(M.gone) return Promise.reject({code:'revoked'});
      if(!M.canEmit && bus.topicsInteract.includes(topic)) return Promise.reject({code:'not_permitted',message:'not permitted'});
      if(!M.conn) return Promise.resolve();
      const txt=JSON.stringify(data===undefined?null:data); if(txt.length>4096) return Promise.reject({code:'invalid_argument'});
      M.emits++;
      for(const X of bus.members){ if(X.gone) continue; if(X!==M && rnd()<bus.emitDrop) continue;
        deliverFifo(M,X,()=>{ if(X.gone || !X.conn) return; for(const f of (X.lis[topic]||[])) f(Object.freeze({topic,data:JSON.parse(txt),peer:M.peer,by:M.by,isMe:X.by===M.by,sameTab:X===M,kind:'viewer',guest:M.guest})); }); }
      return Promise.resolve(); },
    on(topic,fn){ (M.lis[topic]=M.lis[topic]||[]).push(fn); return ()=>{}; },
    presence(patch){ const merged=Object.assign({},M.pres); for(const k in patch){ if(patch[k]===null) delete merged[k]; else merged[k]=patch[k]; }
      if(JSON.stringify(merged).length>4096) return Promise.reject({code:'invalid_argument'});
      M.pres=Object.freeze(merged); M.view.set(M.peer,entry(M)); notify();
      if(!M.flushPending){ M.flushPending=true; const when=Math.max(NOW,M.flushAt+33); at(when,()=>{ M.flushPending=false; M.flushAt=NOW; if(!M.conn) return; send(); }); }
      return Promise.resolve(); },
    peers(){ return []; },
    onPeers(fn){ M.peersFns.push(fn); notify(); return ()=>{}; },
    onConnection(fn){ M.connFns.push(fn); at(NOW,()=>fn(M.conn)); return ()=>{}; },
    connected(){ return M.conn; },
  };
  function send(){ const p=M.pres; for(const X of bus.members){ if(X===M || X.gone) continue; deliverFifo(M,X,()=>{ if(X.gone||!X.conn) return; if(X.view.has(M.peer)){ X.view.set(M.peer,entry(M,p)); X.notify(); } }); } }
  M.room=room; M.send=send;
  M.join=()=>{ bus.members.push(M);
    at(NOW+250,()=>{ M.conn=true; M.connFns.forEach(f=>f(true));
      for(const X of bus.members){ if(X===M||X.gone) continue;
        deliverFifo(X,M,()=>{ M.view.set(X.peer,entry(X)); M.notify(); });
        deliverFifo(M,X,()=>{ X.view.set(M.peer,entry(M)); X.notify(); }); } }); };
  M.leave=()=>{ M.gone=true; for(const X of bus.members){ if(X===M) continue; deliverFifo(M,X,()=>{ X.view.delete(M.peer); X.notify(); }); } };
  M.drop=(ms)=>{ M.conn=false; M.connFns.forEach(f=>f(false)); at(NOW+ms,()=>{ M.conn=true; M.connFns.forEach(f=>f(true)); M.send(); }); };
  return M;
}

// ---- fake shared database: one store; writes reach the store after the writer's uplink plus dbExtra, then each
// listening device gets a fresh snapshot after its downlink. The writer sees its own write at once (pending).
const store=new Map(); let idSeq=0;
const dbDevs=[];
function dbPoke(){ for(const X of dbDevs) if(X.listeners.length) at(NOW+X.down,()=>X.deliver()); }
function makeDb(dev){
  const D={dev,listeners:[],pending:new Map(),up:bus.up,down:bus.down};
  dbDevs.push(D);
  function deliver(){ if(dev.gone) return; const all=new Map(store); for(const [id,d] of D.pending) all.set(id,d);
    const ids=[...all.keys()].sort(); const docs=ids.map(id=>({id,exists:true,data:()=>all.get(id),metadata:{fromCache:false,hasPendingWrites:D.pending.has(id)}}));
    const snap={docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:D.pending.size>0}};
    for(const f of D.listeners) f(snap); }
  function broadcast(){ for(const X of dbDevs) if(X.listeners.length) at(NOW+X.down,()=>X.deliver()); }
  D.deliver=deliver;
  const docRef=(id)=>({id,path:'pieces/'+id,
    set(data){ if(dev.o.canWrite===false) return new Promise((_,rej)=>at(NOW+D.up+D.down,()=>rej({code:'invalid_argument',message:'no write access'})));
      const body=Object.freeze(JSON.parse(JSON.stringify(data))); D.pending.set(id,body); at(NOW,deliver);
      return new Promise(res=>at(NOW+D.up+bus.dbExtra,()=>{ store.set(id,body); D.pending.delete(id); broadcast(); at(NOW+D.down,res); })); },
    update(data){ if(dev.o.canWrite===false) return new Promise((_,rej)=>at(NOW+D.up+D.down,()=>rej({code:'invalid_argument',message:'no write access'})));
      return new Promise((res,rej)=>at(NOW+D.up+bus.dbExtra,()=>{ if(!store.has(id)){ at(NOW+D.down,()=>rej({code:'invalid_argument',message:'no such document'})); return; }
        store.set(id,Object.freeze(Object.assign({},store.get(id),JSON.parse(JSON.stringify(data))))); broadcast(); at(NOW+D.down,res); })); },
    delete(){ if(dev.o.canWrite===false) return new Promise((_,rej)=>at(NOW+D.up+D.down,()=>rej({code:'invalid_argument',message:'no write access'})));
      // 0.4: a per-viewer write budget: more than 3 deletes in flight, or bad luck (bus.delFlaky), is resource_exhausted
      D.inflight=(D.inflight||0)+1; D.maxInflight=Math.max(D.maxInflight||0,D.inflight);
      if(D.inflight>3 || rnd()<(bus.delFlaky||0)) return new Promise((_,rej)=>at(NOW+D.up+D.down,()=>{ D.inflight--; D.exhausted=(D.exhausted||0)+1; rej({code:'resource_exhausted',message:'slow down'}); }));
      return new Promise(res=>at(NOW+D.up+bus.dbExtra,()=>{ store.delete(id); broadcast(); at(NOW+D.down,()=>{ D.inflight--; res(); }); })); }});
  dev.o.dbD=D;
  return { collection(path){ if(path!=='pieces') throw new TypeError('unexpected path '+path);
    return { path, doc:(id)=>docRef(id||('d'+(++idSeq).toString(36)+'x'+Math.floor(rnd()*1e6).toString(36))),
      onSnapshot(fn){ D.listeners.push(fn); at(NOW+D.down+bus.dbExtra,deliver); return ()=>{}; } }; } };
}

// ---- 3D stub (as smoke.js) and a small DOM
const handler={get(t,p){ if(p===Symbol.toPrimitive) return ()=>0; if(p===Symbol.iterator) return function*(){}; if(p==='then') return undefined; if(p in t) return t[p]; return mk(); },
  apply(){ return mk(); }, construct(){ return mk(); }, set(t,p,v){ t[p]=v; return true; }};
function mk(){ return new Proxy(function(){},handler); }
class El{ constructor(id){ this.id=id; this.style={}; this.hidden=false; this.textContent=''; this.value=''; this.className=''; this.scrollTop=0; this.ev={}; this._cls=new Set(); this.kids=[]; this.dataset={}; this.attrs={}; this.disabled=false;
    const self=this; this.classList={add:c=>self._cls.add(c),remove:c=>self._cls.delete(c),toggle:(c,on)=>{ (on===undefined?!self._cls.has(c):on)?self._cls.add(c):self._cls.delete(c); },contains:c=>self._cls.has(c)}; }
  addEventListener(t,f){ (this.ev[t]=this.ev[t]||[]).push(f); } set innerHTML(v){ this._html=v; this.kids=[new El(),new El()]; } get innerHTML(){ return this._html||''; }
  get firstChild(){ return this.kids[0]; } get lastChild(){ return this.kids[this.kids.length-1]; }
  appendChild(c){ this.kids.push(c); c.parent=this; return c; } remove(){ if(this.parent){ this.parent.kids=this.parent.kids.filter(k=>k!==this); } this.removed=true; }
  getContext(){ return mk(); } focus(){} select(){} setPointerCapture(){} fire(t,e){ (this.ev[t]||[]).forEach(f=>f(e)); }
  setAttribute(k,v){ this.attrs[k]=String(v); } querySelector(){ return this._q||(this._q=new El()); } }

function makeDevice(o){
  const HIDDEN=['diag','diagShade','stick','err','buildInfo','cross','buildPad','pieces','bUse','term'];   // elements the page's HTML starts hidden
  const pieceBtns=[0,1,2,3,4,5,6].map(k=>Object.assign(new El(),{dataset:{k:String(k)}}));
  const dl={};
  const els={}; const doc={ getElementById:id=>els[id]||(els[id]=Object.assign(new El(id),id==='stage'?{clientWidth:390,clientHeight:844}:{},HIDDEN.includes(id)?{hidden:true}:{})),
    createElement:()=>new El(), querySelectorAll:()=>pieceBtns, addEventListener:(t,f)=>{ (dl[t]=dl[t]||[]).push(f); }, activeElement:null, hidden:false, visibilityState:'visible', hasFocus:()=>true, write(){} };
  const raf=[]; const wl={};
  const skew=o.skew||0, pt0=NOW;
  const ctx={ THREE:mk(), console, Math, JSON, Promise, Object, Array, Map, Set, WeakMap, Number, String, Symbol, Error, Float32Array, isFinite, isNaN, parseFloat, Infinity,
    Date:{now:()=>Math.floor(NOW+skew)}, performance:{now:()=>NOW-pt0},
    setTimeout:(f,ms)=>{ at(NOW+(ms||0),f); return 0; }, clearTimeout(){}, requestAnimationFrame:f=>raf.push(f),
    document:doc, navigator:{userAgent:'coopsim',maxTouchPoints:5,clipboard:{writeText:()=>Promise.resolve()}},
    matchMedia:()=>({matches:false}), getComputedStyle:()=>({getPropertyValue:()=>''}), devicePixelRatio:3, innerWidth:390, innerHeight:844, ontouchstart:null,
    addEventListener:(t,f)=>{ (wl[t]=wl[t]||[]).push(f); } };
  ctx.window=ctx; ctx.visualViewport={width:390,height:844};
  let M=null;
  if(o.runtime!==false){
    M=makeMember(o);
    const user={ me:()=>Promise.resolve({id:o.by,name:o.name,isOwner:!!o.owner,canEdit:!!o.owner,avatarUrl:'',color:'',email:null}),
      profiles:(ids)=>Promise.resolve(Object.fromEntries([].concat(ids).map(id=>[id,{id,name:(bus.names[id]||'')}]))),
      can:(n)=>Promise.resolve(n==='data.write'?(o.canWriteKnown===false?null:o.canWrite!==false):null) };
    const dev={o,get gone(){ return M.gone; }}; const db=makeDb(dev);
    ctx.claude={ use:(name)=>new Promise(res=>at(NOW+180,()=>res(name==='room'?(o.noRoom?null:M.room):name==='user'?user:name==='db'?db:null))) };
  }
  vm.createContext(ctx);
  vm.runInContext(errJs,ctx,{filename:'errlog'}); vm.runInContext(mainJs,ctx,{filename:'page'});
  if(M) M.join();
  return {o,ctx,els,raf,wl,M,paused:false,doc,
    hide(on){ doc.hidden=on; doc.visibilityState=on?'hidden':'visible'; (dl.visibilitychange||[]).forEach(f=>f({})); this.paused=on; },
    key(k,down,ext){ (wl[down?'keydown':'keyup']||[]).forEach(f=>f(Object.assign({key:k,preventDefault(){}},ext||{}))); },
    click(id){ const e=els[id]; if(e.onclick) e.onclick(); else e.fire('pointerdown',{preventDefault(){}}); },
    get np(){ return ctx.__np; } };
}
bus.names={u_A:'Mark',u_B:'Ana',u_C:'Rui'};

// ---- run loop
const devs=[];
async function step(ms){ const end=NOW+ms;
  while(NOW<end){ NOW+=1000/60; runDue();
    for(const d of devs){ if(d.paused||d.gone) continue; const q=d.raf.splice(0); for(const f of q) f(); }
    await new Promise(r=>setImmediate(r)); runDue(); } }
let fails=0; const check=(ok,msg,extra)=>{ console.log((ok?'PASS ':'FAIL ')+msg+(extra!==undefined?'  ['+extra+']':'')); if(!ok) fails++; };
const remoteOf=(d,peer)=>d.np.N.peers.get(peer);

(async()=>{
  const A=makeDevice({peer:'aaa111',by:'u_A',name:'Mark',owner:true}); devs.push(A);
  const B=makeDevice({peer:'bbb222',by:'u_B',name:'Ana',owner:false,skew:734567}); devs.push(B);   // B's clock is 12 minutes ahead
  await step(2500);
  check(A.np.N.state==='open' && A.np.N.connected,'A joined the room', A.np.N.state);
  check(A.np.N.peers.size===1 && B.np.N.peers.size===1,'each sees the other');
  check(A.np.me.suit===0 && B.np.me.suit===1,'owner wears Engineering, guest Science', A.np.me.suit+','+B.np.me.suit);
  check(remoteOf(B,'aaa111').sk===0,'B draws A in Engineering');
  await step(1500);
  const putAt=(d,x,z,yaw)=>{ const m=d.np.me; m.x=x; m.z=z; m.vx=m.vz=0; m.vy=0; m.gr=true; m.y=m.ys=d.np.supportAt(x,z,99); if(yaw!=null){ m.yaw=yaw; d.np.camYaw=yaw; } };
  // A walks forward 3 s; record A's true path and B's drawn pose each frame (B stands well off A's path)
  putAt(A,-60,0,0); putAt(B,-50,0,0); await step(500);
  A.np.camYaw=0; const trueA=[], drawn=[];
  A.key('w',true);
  for(let i=0;i<180;i++){ await step(1000/60); trueA.push({t:NOW,x:A.np.me.x,z:A.np.me.z}); const R=remoteOf(B,'aaa111'); drawn.push({t:NOW,x:R.pose.x,z:R.pose.z,mode:R.mode}); }
  A.key('w',false);
  const at_=(t)=>{ let b=trueA[0]; for(const p of trueA){ if(p.t<=t) b=p; } return b; };
  let best=null; for(let L=0;L<=400;L+=1000/60){ let err=0,n=0; for(const d of drawn.slice(60)){ if(d.t-L<trueA[0].t) continue; const a=at_(d.t-L); err=Math.max(err,Math.hypot(a.x-d.x,a.z-d.z)); n++; } if(n>50 && (!best||err<best.err)) best={L,err}; }
  check(best && best.err<0.06,'B draws A on A\'s own path (max error at best lag)', best&&best.err.toFixed(3)+' m at '+Math.round(best.L)+' ms behind');
  check(best && best.L>=100 && best.L<=260,'drawn lag is the 120 ms buffer plus network spread', best&&Math.round(best.L));
  const steps=[]; for(let i=61;i<drawn.length-20;i++) steps.push(Math.hypot(drawn[i].x-drawn[i-1].x,drawn[i].z-drawn[i-1].z));
  const mean=steps.reduce((a,b)=>a+b,0)/steps.length, dev=Math.max(...steps.map(s=>Math.abs(s-mean)));
  check(dev<0.006,'A moves smoothly on B\'s screen at full speed (per-frame step spread)', 'mean '+mean.toFixed(4)+' m, worst deviation '+dev.toFixed(4)+' m');
  const interpShare=drawn.slice(30).filter(d=>d.mode==='interp').length/drawn.slice(30).length;
  check(interpShare>0.97,'B interpolates nearly every frame while A walks', Math.round(interpShare*100)+'%');
  await step(4000);
  const RB=remoteOf(B,'aaa111'), RA=remoteOf(A,'bbb222');
  const med=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
  // one relay pass = sender up + receiver down = 60-80 ms here, plus up to a frame of timer granularity per pass
  check(med(A.np.N.echo.rtt)>=60 && med(A.np.N.echo.rtt)<=100,'echo = one pass through the relay (60-100 ms here)', med(A.np.N.echo.rtt)+' ms');
  check(med(RB.rtt)>=120 && med(RB.rtt)<=195,'ping = two passes, A to B and back (120-195 ms here)', med(RB.rtt)+' ms');
  const upd=RB.recvs.filter(x=>x>B.ctx.Date.now()-2000).length/2;
  check(Math.abs(upd-20)<=1,'B receives A at the 20/s default send rate', upd);
  // wave and jump
  A.key('g',true); A.key(' ',true); await step(300);
  check(B.np.N.acts.heard===1 && RB.pose.a===1,'B sees A wave', 'heard '+B.np.N.acts.heard+', drawn action '+RB.pose.a);
  await step(600);
  check(RB.pose.h>0.3,'B sees A in the air', RB.pose.h.toFixed(2)+' m');
  await step(2500);
  check(A.np.me.gr && A.np.me.y===0 && RB.pose.h<0.05,'A lands on both screens');
  // A's page is hidden for 1.5 s: B extrapolates briefly, then holds, then resumes
  A.np.camYaw=0; A.key('w',true); await step(1000);
  A.paused=true; const modes=new Set(); for(let i=0;i<90;i++){ await step(1000/60); modes.add(RB.mode); }
  check(modes.has('extrap') && modes.has('hold'),'A paused: B extrapolates, then holds', [...modes].join(','));
  check(isFinite(RB.pose.x) && isFinite(RB.pose.z),'no NaN while A is paused');
  A.paused=false; A.key('w',false); await step(1500);
  check(RB.mode==='interp' || RB.mode==='extrap' || RB.mode==='early','B picks A back up', RB.mode);
  // send rate 20/s from A's Diag
  A.click('bRate'); await step(3000);
  const upd20=RB.recvs.filter(x=>x>B.ctx.Date.now()-2000).length/2;
  check(A.np.N.sendHz===30 && Math.abs(upd20-30)<=2,'Send 30/s arrives at 30/s', upd20);
  // smoothing off on B
  B.click('bSmooth'); B.click('bSmooth'); B.click('bSmooth'); await step(500);
  check(B.np.N.smooth===0 && RB.mode==='raw','Smooth off draws the newest update', RB.mode);
  B.click('bSmooth'); B.click('bSmooth'); await step(200);
  check(B.np.N.smooth==='auto','smoothing cycles back to auto');
  // 20% event loss for 10 s
  bus.emitDrop=0.2; await step(10000); bus.emitDrop=0; await step(6000);
  check(RB.pingLost>0 && RB.pingLost<RB.pingSent*0.6,'pings lost under 20% event loss are counted', RB.pingLost+'/'+RB.pingSent);
  // a viewer-level third player (can set presence, can't send events)
  const C=makeDevice({peer:'ccc333',by:'u_C',name:'Rui',owner:false,canEmit:false}); devs.push(C);
  await step(4000);
  check(A.np.N.peers.size===2 && C.np.N.peers.size===2,'three players see each other');
  check(C.np.me.suit===2,'third player gets a free suit (Operations)', C.np.me.suit);
  check(C.np.N.emitBlocked.echo && C.np.N.emitErr.not_permitted>=1,'viewer: events blocked and counted', JSON.stringify(C.np.N.emitErr));
  const errsBefore=C.np.N.emitErr.not_permitted; await step(3000);
  check(C.np.N.emitErr.not_permitted===errsBefore,'viewer: no retry storm after not_permitted');
  check(remoteOf(A,'ccc333').n>20,'viewer still moves for others (presence works)', remoteOf(A,'ccc333').n);
  await step(1000);
  check(A.np.N.peers.get('ccc333').name==='RUI','names come from the user capability', A.np.N.peers.get('ccc333').name);
  C.M.leave(); C.gone=true; await step(1000);
  check(A.np.N.peers.size===1 && !remoteOf(A,'ccc333'),'a player who leaves is removed');
  check(A.els.tags.kids.length===1,'their name tag is removed', A.els.tags.kids.length);
  // B drops off for 3 s
  B.M.drop(3000); await step(1500);
  check(!/Reconnecting/.test(B.els.status.textContent),'B stays quiet for a blip under 2 s', B.els.status.textContent);
  await step(1000);
  check(/Reconnecting/.test(B.els.status.textContent),'B says it is reconnecting after 2 s', B.els.status.textContent);
  await step(3000);
  check(B.np.N.drops===1 && B.np.N.connected,'B reconnects and counts one drop', 'drops '+B.np.N.drops);
  check(RA.n>0 && A.ctx.Date.now()-RA.lastRecv<500,'A hears B again after the drop');

  // ---------------- building (0.2 and 0.3)
  const aim=async(d,x,z)=>{ d.np.aimRay={o:{x,y:12,z},d:{x:0,y:-1,z:0}}; await step(50); };
  const G=d=>d.np.B.ghost;
  putAt(A,10,11,0); A.np.setBuilding(true); A.np.selectPiece(0);
  await aim(A,10,14);
  check(A.np.building && G(A).valid && Math.abs(G(A).x-10)<0.02 && Math.abs(G(A).z-14)<0.02 && G(A).y===0,'a floor ghost sits on the ground where A aims', JSON.stringify({x:G(A).x,z:G(A).z,y:G(A).y,why:G(A).reason}));
  A.np.placePiece(); await step(17);
  check(A.np.B.list.length===1,'A places a floor and sees it at once');
  await step(150);
  check(B.np.B.list.length===1,'B sees it within 170 ms, by room event', B.np.B.list.length);
  await step(1000);
  check(B.np.B.dbDocs.size===1 && B.np.B.evFirst===1,'then it arrives from the database too', 'database '+B.np.B.dbAfterEv.join(',')+' ms behind the event');
  check(A.np.B.writeOk===1,'A\'s save is confirmed', 'save took '+A.np.B.ack.map(Math.round).join(',')+' ms');
  await aim(A,8.35,14.2);
  check(G(A).snapped && Math.abs(G(A).x-8)<0.01 && Math.abs(G(A).z-14)<0.01 && G(A).r===0,'aiming at bare ground beside it, a floor snaps edge to edge', JSON.stringify({x:G(A).x,z:G(A).z,r:G(A).r}));
  A.np.rotate(2); await step(50);
  check(!G(A).snapped,'turned 30° it stays free', 'r='+G(A).r);
  A.np.rotate(-1); await step(50);
  check(G(A).snapped && G(A).r===0,'turned 15° it snaps and squares up');
  A.np.placePiece(); await step(400);
  await aim(A,10.3,14.2);
  check(G(A).valid && G(A).how==='beside a floor' && Math.abs(G(A).x-12)<0.01 && Math.abs(G(A).z-14)<0.01,'aiming at a floor with Floor: the new one goes beside it', JSON.stringify({x:G(A).x,z:G(A).z,how:G(A).how}));
  await aim(A,8.3,14.2);
  check(!G(A).valid && /Blocked/.test(G(A).reason),'beside a floor where one already is: blocked', G(A).reason);
  putAt(A,5,3); await aim(A,1,1); putAt(A,10,11,0);
  check(!G(A).valid && /pad/.test(G(A).reason),'nothing goes on the landing pad', G(A).reason);
  A.np.selectPiece(1); await aim(A,10.1,14.85);
  check(G(A).snapped && G(A).valid && Math.abs(G(A).z-14.92)<0.01 && Math.abs(G(A).x-10)<0.01 && Math.abs(G(A).y-0.1)<1e-6,'a wall snaps to the floor\'s edge, standing on it', JSON.stringify({x:G(A).x,z:G(A).z,r:G(A).r,y:G(A).y}));
  A.np.placePiece(); await step(400);
  check(/^wall at 0° \(you had 15°; snapped set it\)/.test(A.np.B.lastPlaced),'the Diag says when snapping changed your angle', A.np.B.lastPlaced);
  A.np.rotate(5); await aim(A,10.85,14.1);
  check(G(A).snapped && G(A).valid && G(A).r===6 && Math.abs(G(A).x-10.92)<0.01,'a second wall meets the first at the corner', JSON.stringify({x:G(A).x,z:G(A).z,r:G(A).r,why:G(A).reason}));
  A.np.placePiece(); await step(400);
  A.np.rotate(-6); await aim(A,10,13.15); A.np.placePiece(); await step(400);
  A.np.rotate(6); await aim(A,9.15,14); A.np.placePiece(); await step(400);
  const walls=A.np.B.list.filter(p=>p.k===1);
  check(walls.length===4 && walls.every(w=>Math.abs(w.y-0.1)<1e-6),'four walls make a room on the floor', walls.map(w=>w.x+','+w.z).join(' '));
  // 0.3: stacking
  await aim(A,10,14.92);
  check(G(A).valid && G(A).how==='on the wall' && Math.abs(G(A).y-1.7)<1e-6,'aiming at a wall with Wall: it goes on top', JSON.stringify({y:G(A).y,how:G(A).how,why:G(A).reason}));
  A.np.placePiece(); await step(400);
  A.np.selectPiece(0); A.np.camYaw=0; await aim(A,10,13.08);
  check(G(A).valid && G(A).how==='roof' && Math.abs(G(A).x-10)<0.01 && Math.abs(G(A).z-14)<0.01 && Math.abs(G(A).y-1.7)<1e-6,'aiming at a wall with Floor: a roof over the room, not outside it', JSON.stringify({x:G(A).x,z:G(A).z,y:G(A).y,why:G(A).reason}));
  A.np.placePiece(); await step(400);
  await aim(A,10.4,14.1);
  check(G(A).valid && G(A).how==='beside a floor' && Math.abs(G(A).y-1.7)<1e-6 && Math.abs(G(A).x-12)<0.01,'aiming at the roof with Floor: a second roof floor beside it, at the same height', JSON.stringify({x:G(A).x,z:G(A).z,y:G(A).y}));
  A.np.selectPiece(4); await aim(A,10.4,14.4);
  check(G(A).valid && Math.abs(G(A).y-1.8)<1e-6,'a crate goes on the roof', 'y='+G(A).y);
  A.np.placePiece(); await step(400);
  await aim(A,10.4,14.4);
  check(G(A).valid && Math.abs(G(A).y-2.6)<1e-6,'and a crate on that crate', 'y='+G(A).y);
  A.np.placePiece(); await step(400);
  A.np.selectPiece(0); await aim(A,30,30); A.np.placePiece(); await step(50); A.np.setBuilding(false); A.np.aimRay=null;
  await step(1500);
  check(B.np.B.list.length===A.np.B.list.length && B.np.B.list.filter(p=>p.y>1).length===4,'B has the same pieces, four of them raised (wall, roof, two crates)', B.np.B.list.length+' pieces');
  // 0.3: standing, jumping, ceilings
  putAt(A,10.4,14.4); A.np.me.y=4; A.np.me.gr=false; await step(1500);
  check(A.np.me.gr && Math.abs(A.np.me.y-3.4)<0.01,'falling onto the stacked crates, A lands on top', 'feet '+A.np.me.y.toFixed(2));
  putAt(A,10.6,13.6); await step(1000);
  check(Math.abs(remoteOf(B,'aaa111').pose.h-1.8)<0.05,'B draws A standing on the roof', remoteOf(B,'aaa111').pose.h.toFixed(2));
  putAt(A,9.6,14.2); A.np.me.y=0.1; A.np.me.ys=0.1; await step(200);
  check(Math.abs(A.np.me.y-0.1)<0.01,'inside the room A stands on the floor, under the roof');
  const bonk0=A.np.me.bonks; A.key(' ',true); await step(2000);
  check(A.np.me.bonks>bonk0 && Math.abs(A.np.me.y-0.1)<0.01,'a jump inside hits the roof and lands back on the floor', 'ceiling bumps '+(A.np.me.bonks-bonk0));
  putAt(A,20,7,0); A.np.setBuilding(true); A.np.selectPiece(1); A.np.rotate(-A.np.B.rot); await aim(A,20,10); A.np.placePiece(); await step(400); A.np.setBuilding(false); A.np.aimRay=null;
  putAt(A,20,8,0); A.key('w',true); await step(1500); A.key('w',false); await step(300);
  check(A.np.me.z<9.7,'walking into a single wall stops you', 'z='+A.np.me.z.toFixed(2));
  putAt(A,20,7.6,0); A.key('w',true); A.key(' ',true); await step(2600); A.key('w',false); await step(800);
  check(A.np.me.z>10.6 && A.np.me.gr,'a jump clears a single wall', 'landed at z='+A.np.me.z.toFixed(2));
  putAt(A,10,16.2,Math.PI); A.key('w',true); A.key(' ',true); await step(2600); A.key('w',false); await step(800);
  check(A.np.me.z>15.2,'two walls stacked (3.3 m) can’t be jumped', 'stopped at z='+A.np.me.z.toFixed(2));
  // 0.4: a roof floor beside the first, at (12,14), overhangs open ground east of the room (x 11-13).
  putAt(A,12,11,0); A.np.setBuilding(true); A.np.selectPiece(0); await aim(A,10.6,13.5);
  check(G(A).valid && G(A).how==='beside a floor' && Math.abs(G(A).x-12)<0.01 && Math.abs(G(A).y-1.7)<1e-6,'(an overhanging roof floor for the next checks)', JSON.stringify({x:G(A).x,z:G(A).z,y:G(A).y,why:G(A).reason}));
  A.np.placePiece(); await step(400); A.np.setBuilding(false); A.np.aimRay=null;
  // Stand just outside it, facing in.
  const jumpTop=async(d)=>{ let top=0; d.key(' ',true); for(let i=0;i<170;i++){ await step(1000/60); top=Math.max(top,d.np.me.y); } return top; };
  putAt(A,13.3,14,-Math.PI/2); await step(300);
  const bonkH=A.np.me.bonks, topH=await jumpTop(A);
  check(A.np.me.bonks>bonkH && topH<0.36 && A.np.me.gr,'middle outside a roof, head under it: the jump stops at the roof', 'feet rose to '+topH.toFixed(2)+' m (0.3 went to 1.9)');
  putAt(A,14.8,14,-Math.PI/2); await step(300);
  const topC=await jumpTop(A);
  check(topC>1.8,'a step further out, facing it: a full jump', topC.toFixed(2)+' m');
  putAt(A,13.3,14,Math.PI/2); await step(300);
  const topT=await jumpTop(A);
  check(topT>0.55 && topT<0.65,'facing away, tail under the roof: stops when the back reaches it', topT.toFixed(2)+' m');
  putAt(A,15.2,14,-Math.PI/2); let inRoof=0; A.key('w',true); A.key(' ',true);
  for(let i=0;i<150;i++){ await step(1000/60); const m=A.np.me; if(m.x<13+0.3 && m.y+1.08>1.72 && m.y<1.78) inRoof++; }
  A.key('w',false); await step(1500);
  check(inRoof===0 && A.np.me.gr,'jumping toward the roof edge from outside, the body never enters the roof', 'frames inside '+inRoof+', ended at x='+A.np.me.x.toFixed(2));
  putAt(A,-60,-60,0); await step(100);
  const y0=A.np.camYaw; A.key('q',true); await step(500); A.key('q',false); await step(50);
  check(Math.abs(A.np.camYaw-y0-0.95)<0.07,'holding Q turns the camera left', (A.np.camYaw-y0).toFixed(2)+' rad in 0.5 s');
  A.np.setBuilding(true); const y1=A.np.camYaw, rb=A.np.B.rot; A.key('e',true); await step(500); A.key('e',false); await step(50);
  check(Math.abs(y1-A.np.camYaw-0.95)<0.07 && A.np.B.rot===rb,'E turns it right, also while building, and leaves the piece alone', (y1-A.np.camYaw).toFixed(2)+' rad');
  A.key('r',true); A.key('r',true,{shiftKey:true}); A.key('r',true,{shiftKey:true});
  check(A.np.B.rot===(rb+1)%24,'R turns the piece clockwise, Shift+R back', rb+' -> '+A.np.B.rot);
  A.key(' ',true); await step(300);
  check(!A.np.me.gr && A.np.me.buildJumps===1,'Space jumps while building');
  await step(2500); A.click('bJump2'); await step(300);
  check(!A.np.me.gr && A.np.me.buildJumps===2,'and so does the Jump button in the build pad');
  await step(2500); A.np.setBuilding(false);
  // legacy pieces from 0.2 (no height) load at their old height
  store.set('legacyF',Object.freeze({v:1,k:0,x:30,z:34,r:0,by:null,t:1})); store.set('legacyW',Object.freeze({v:1,k:1,x:30,z:34.92,r:0,by:null,t:1})); dbPoke(); await step(500);
  const lw=B.np.B.list.find(p=>p.id==='legacyW');
  check(lw && Math.abs(lw.y-0.1)<1e-6 && B.np.B.legacy===2,'0.2 pieces with no height load where they were', lw&&lw.y);
  // removal by aiming at a piece
  A.np.setBuilding(true); A.np.selectPiece(A.np.KINDS.length); putAt(A,12,11); await aim(A,10.4,14.4);
  check(G(A).target && G(A).target.k===4 && G(A).target.y>2,'Remove aims at the top crate', G(A).target&&G(A).target.y);
  const before=B.np.B.list.length; A.np.placePiece(); await step(170);
  check(B.np.B.list.length===before-1,'B sees the removal within 170 ms', before+' -> '+B.np.B.list.length);
  await step(1500);
  check(store.size===A.np.B.list.length && B.np.B.list.length===store.size,'the database and both screens agree', 'store '+store.size+', A '+A.np.B.list.length+', B '+B.np.B.list.length);
  // the mouse wheel turns the piece while building
  A.np.selectPiece(0); const r0=A.np.B.rot; A.els.stage.fire('wheel',{deltaY:100,deltaMode:0,preventDefault(){}}); A.els.stage.fire('wheel',{deltaY:100,deltaMode:0,preventDefault(){}});
  check(A.np.B.rot===(r0+22)%24,'two wheel notches turn the piece 30°', r0+' -> '+A.np.B.rot);
  const r1=A.np.B.rot; for(let i=0;i<3;i++){ A.els.stage.fire('wheel',{deltaY:120,deltaMode:0,preventDefault(){}}); await step(40); }
  check(A.np.B.rot===(r1+21)%24,'three notches of 120 turn it exactly 45° (0.3 made it 60°)', r1+' -> '+A.np.B.rot);
  const r2=A.np.B.rot; for(let i=0;i<6;i++) A.els.stage.fire('wheel',{deltaY:-16,deltaMode:0,preventDefault(){}});
  check(A.np.B.rot===(r2+1)%24,'a trackpad’s small steps add up to one turn', r2+' -> '+A.np.B.rot);
  const r3=A.np.B.rot; A.els.stage.fire('wheel',{deltaY:3,deltaMode:1,preventDefault(){}});
  check(A.np.B.rot===(r3+23)%24,'a notch counted in lines turns once', r3+' -> '+A.np.B.rot);
  A.np.setBuilding(false); A.np.aimRay=null;
  const late=makeDevice({peer:'ddd444',by:'u_D',name:'Dee'}); devs.push(late); await step(2500);
  check(late.np.B.list.length===store.size,'a late joiner loads every piece from the database', late.np.B.list.length);
  late.M.leave(); late.gone=true;
  const V=makeDevice({peer:'fff666',by:'u_F',name:'Fay',canWrite:false,canWriteKnown:false}); devs.push(V); await step(2500);
  putAt(V,-10,-10,0); V.np.setBuilding(true); await aim(V,-10,-7);
  const nA=A.np.B.list.length; V.np.placePiece(); await step(34);
  check(V.np.B.list.length===store.size+1,'write access unknown: the piece shows at once');
  await step(900);
  check(V.np.B.list.length===store.size && V.np.B.writeErr.invalid_argument===1 && V.np.B.readOnly,'its save is refused: piece taken back, building switched off', JSON.stringify(V.np.B.writeErr));
  check(A.np.B.list.length===nA,'others see it come and go', A.np.B.list.length);
  const W=makeDevice({peer:'ggg777',by:'u_G',name:'Gil',canWrite:false}); devs.push(W); await step(2500);
  W.np.setBuilding(true); await step(300);
  check(!W.np.building && W.els.bBuild.disabled,'view-only player: Build is turned off');
  V.M.leave(); V.gone=true; W.M.leave(); W.gone=true; await step(1000);
  // ---------------- 0.3: suits don't flicker when someone joins
  const sA=A.np.suitChanges(), sB=B.np.suitChanges();
  const J=makeDevice({peer:'aab999',by:'u_J',name:'Jo'}); devs.push(J); await step(5000);
  check(A.np.suitChanges()===sA && A.np.me.suit===0,'the owner keeps Engineering while someone joins', 'changes '+(A.np.suitChanges()-sA));
  check(B.np.suitChanges()===sB && J.np.suitChanges()===0 && J.np.me.suit!==B.np.me.suit && J.np.me.suit!==0,'B keeps its suit; the joiner picks a free one first time', 'joiner '+J.np.me.suit+' ('+J.np.suitChanges()+' changes), B '+B.np.me.suit+' ('+(B.np.suitChanges()-sB)+' changes)');
  J.M.leave(); J.gone=true; await step(6000);
  // ---------------- 0.3: away, and an old page replaced by a new one
  putAt(A,-30,-30,0); putAt(B,-30,-27,Math.PI); await step(1500);
  B.hide(true); await step(400);
  const RA3=remoteOf(A,'bbb222');
  check(RA3.away && !RA3.hidden && /away/.test(RA3.tag.lastChild.textContent),'B\'s page goes to the background: A shows B as away at once', RA3.tag.lastChild.textContent);
  check(A.np.diag().includes('away (page in background)'),'and the Diag says so');
  await step(4000);
  const B2=makeDevice({peer:'bbz222',by:'u_B',name:'Ana',skew:734567}); devs.push(B2); await step(2500);
  check(remoteOf(A,'bbb222').superseded && remoteOf(A,'bbb222').hidden && remoteOf(A,'bbz222').live,'B comes back as a new page: the old one is hidden at once, the new one is live');
  check(A.els.nplay.textContent==='2','the player count ignores the old page', A.els.nplay.textContent);
  B2.M.leave(); B2.gone=true; B.hide(false); await step(2500);
  check(remoteOf(A,'bbb222').live,'B back in front: live again');
  const wl0=B.np.diag().split('\n').find(l=>l.startsWith('worst frame')), hl0=B.np.diag().split('\n').find(l=>l.startsWith('standalone'));
  check(+wl0.split(': ')[1]<100 && /not counted as frames: 1, longest 6\.\d s/.test(hl0),'B’s 6.9 s in the background isn’t its worst frame', wl0+' | '+hl0.split('  ')[1]);
  // ---------------- 0.3: players ease apart
  putAt(A,-40,-40,0); putAt(B,-40,-38.5,Math.PI); await step(1500);
  A.key('w',true); await step(2500); A.key('w',false); await step(500);
  const sepAB=Math.hypot(A.np.me.x-B.np.me.x,A.np.me.z-B.np.me.z);
  check(sepAB>0.7 && A.np.me.pushes>0,'walking into another player, you stop short instead of passing through', sepAB.toFixed(2)+' m apart');
  // ---------------- 0.3: adaptive smoothing
  const RB3=remoteOf(B,'aaa111');
  check(RB3.D>45 && RB3.D<130,'auto smoothing settles on gap + jitter', 'buffer '+Math.round(RB3.D)+' ms (aiming '+Math.round(RB3.Dt)+')');
  // ---------------- 0.3: science terminal
  putAt(A,50,48,0); A.np.setBuilding(true); A.np.selectPiece(5); A.np.rotate(-A.np.B.rot); await aim(A,50,50); A.np.placePiece(); await step(800); A.np.setBuilding(false); A.np.aimRay=null;
  const T1=A.np.B.list.find(p=>p.k===5);
  check(T1 && T1.r===0,'a terminal is placed facing its builder');
  putAt(A,50,49.1,0); await step(300);
  check(A.np.nearTerminal()===T1 && !A.els.bUse.hidden,'standing in front of it shows Use terminal');
  A.key('f',true); await step(100);
  check(A.np.TS.open && A.np.TS.mineF && A.np.TS.mineA && !A.els.term.hidden,'F opens it; alone, A turns both dials');
  const tg0=A.np.termTarget(T1.id,0); A.np.setDials(tg0.f,tg0.a); await step(1800);
  check(A.np.termN(T1.id)===1 && A.np.TS.solved===1,'matching and holding 1.5 s logs a sample');
  await step(1500);
  check(store.get(T1.id).n===1 && B.np.termN(T1.id)===1,'the count is saved on the terminal and reaches B', 'saved n='+store.get(T1.id).n);
  putAt(B,50.7,49.15,0); await step(1500);
  check(!!B.np.nearTerminal(),'B can use it too');
  B.click('bUse'); await step(600);
  check(A.np.TS.mineF && !A.np.TS.mineA && !B.np.TS.mineF && B.np.TS.mineA,'two at a terminal: A turns frequency, B amplitude', 'A '+A.np.TS.mineF+'/'+A.np.TS.mineA+', B '+B.np.TS.mineF+'/'+B.np.TS.mineA);
  const tg1=A.np.termTarget(T1.id,1); A.np.setDials(tg1.f,0.5); B.np.setDials(0.5,0.5); await step(2500);
  check(A.np.termN(T1.id)===1,'one dial right is not enough', 'match '+A.np.TS.m.toFixed(2));
  B.np.setDials(null,tg1.a); await step(2500);
  check(A.np.termN(T1.id)===2 && B.np.termN(T1.id)===2 && B.np.TS.heard>=1,'both dials right: logged on both screens', 'A '+A.np.termN(T1.id)+', B '+B.np.termN(T1.id));
  check(Math.abs(remoteOf(A,'bbb222').pose.a-3)<0.01,'A draws B at the terminal, paws on the desk');
  A.key('f',true); B.click('bLeave'); await step(1500);
  check(!A.np.TS.open && A.np.me.act===0 && !B.np.TS.open,'F leaves it, and so does the Leave button');
  putAt(A,40,40,0); await step(200); A.key('f',true); await step(300);
  check(!A.np.TS.open && /Nothing to use/.test(A.els.status.textContent),'F with no terminal near says so', A.els.status.textContent);
  const L2=makeDevice({peer:'hhh888',by:'u_H',name:'Hal'}); devs.push(L2); await step(2500);
  check(L2.np.termN(T1.id)===2,'a late joiner sees the samples logged', L2.np.termN(T1.id)); L2.M.leave(); L2.gone=true;
  // ---------------- nuzzle
  putAt(A,-20,-20,0); putAt(B,-20,-18.5,Math.PI); await step(1500);
  A.key('g',true); await step(300); B.key('g',true); await step(200);
  check(A.np.me.act===2 && B.np.me.act===2,'waving face to face starts a nuzzle on both', A.np.N.nz.why+' | '+B.np.N.nz.why);
  check(A.np.N.nz.led===1 && B.np.N.nz.joined===1,'A (lower peer label) leads, B joins');
  await step(1200);
  const sep=Math.hypot(A.np.me.x-B.np.me.x,A.np.me.z-B.np.me.z);
  check(Math.abs(sep-1.6)<0.12,'they stand on their marks 1.6 m apart (helmets touch when raised)', sep.toFixed(2)+' m');
  const RA2=remoteOf(A,'bbb222');
  await step(800);
  check(RA2.pose.a===2 && RA2.pose.ap>1.5 && RA2.pose.ap<3.3,'A draws B mid-nuzzle (rising, helmets together)', 'B at '+RA2.pose.ap.toFixed(2)+' s');
  await step(2800);
  check(A.np.me.act===0 && B.np.me.act===0,'the nuzzle ends on both');
  const sep2=Math.hypot(A.np.me.x-B.np.me.x,A.np.me.z-B.np.me.z);
  check(Math.abs(sep2-2.3)<0.15,'they step back apart', sep2.toFixed(2)+' m');
  check(A.np.heartsShown()>=4 && B.np.heartsShown()>=4,'hearts over both helmets on both screens', A.np.heartsShown()+' and '+B.np.heartsShown());
  putAt(B,B.np.me.x,B.np.me.z,0); await step(1200);
  A.key('g',true); await step(100); B.key('g',true); await step(500);
  check(A.np.me.act!==2 && /not facing/.test(A.np.N.nz.why),'facing away: no nuzzle, and the Diag says why', A.np.N.nz.why);
  await step(2500);
  // ---------------- 0.4: Clear all (debug), from the Diag, with a flaky database
  putAt(A,60,60,0); A.np.setBuilding(true); A.np.selectPiece(4);
  for(let i=0;i<8;i++){ await aim(A,60+i*1.2,63); A.np.placePiece(); await step(60); }
  A.np.setBuilding(false); A.np.aimRay=null; await step(1500);
  const nClear=store.size;
  check(nClear>15 && B.np.B.list.length===nClear,'before clearing: '+nClear+' pieces in the database and on B');
  A.click('readout'); A.click('bClear');
  check(/Tap again: clear \d+/.test(A.els.bClear.textContent) && store.size===nClear,'the first tap only asks', A.els.bClear.textContent);
  await step(4300);
  check(A.els.bClear.textContent==='Clear all','left alone, it disarms after 4 s');
  bus.delFlaky=0.25; A.click('bClear'); A.click('bClear'); await step(170);
  check(B.np.B.list.length===0 && A.np.B.list.length===0,'tap twice: both screens are empty within 170 ms', 'A '+A.np.B.list.length+', B '+B.np.B.list.length);
  await step(300); check(/cleared all/.test(B.els.status.textContent),'B is told', B.els.status.textContent);
  await step(12000); bus.delFlaky=0;
  const CL=A.np.B.clear;
  check(store.size===0 && !CL.running && CL.done===nClear && !Object.keys(CL.err).length,'every delete lands, retrying when the database says slow down', 'deleted '+CL.done+'/'+CL.n+' in '+(CL.ms/1000).toFixed(1)+' s, retries '+CL.retries);
  check(A.o.dbD.maxInflight<=3,'never more than three deletes at a time', A.o.dbD.maxInflight);
  putAt(B,70,70,0); B.np.setBuilding(true); B.np.selectPiece(0); await aim(B,70,73); B.np.placePiece(); await step(1500); B.np.setBuilding(false); B.np.aimRay=null;
  check(A.np.B.list.length===1 && store.size===1,'a piece placed after the clear shows on both', A.np.B.list.length);
  await step(60000);
  check(A.np.B.list.length===1 && B.np.B.list.length===1 && A.np.B.tombs.size===0,'and nothing comes back once the hold-off ends');
  A.click('bClose');
  // Diag
  for(const [nm,d] of [['A',A],['B',B]]){ d.click('readout'); const tx=d.els.diagText.value;
    const ver=(html.match(/const BUILD='([^']+)'/)||[])[1]; check(tx.startsWith('LUNABARA NET PROBE '+ver),nm+' Diag opens with the version', ver);
    const el=tx.split('\n').find(l=>l.startsWith('3d library')); check(/errors: 0\b/.test(el),nm+' page errors: 0', el); }
  console.log('\n--- B Diag sample ---\n'+B.els.diagText.value.split('\n').filter(l=>!l.startsWith('ua:')).join('\n'));
  // pages without a room
  const D=makeDevice({runtime:false}); const E=makeDevice({peer:'eee555',by:'u_E',noRoom:true}); devs.push(D,E);
  await step(1500);
  check(D.np.N.state==='no-runtime' && /Solo/.test(D.els.status.textContent),'opened outside the app: plays solo and says so', D.els.status.textContent);
  check(E.np.N.state==='unavailable' && /not available/.test(E.els.status.textContent),'room capability null: plays solo and says so', E.els.status.textContent);
  for(const d of [D,E]) check(d.ctx.__errs.n===0,'solo page has no errors');
  console.log(fails?('\n'+fails+' FAILED'):'\nall checks passed'); process.exitCode=fails?1:0;
})().catch(e=>{ console.error(e); process.exitCode=1; });
