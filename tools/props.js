// 0.55 check: nobody walks through the pad's berm or light masts (not obstacles), and the uplink dishes are kept clear.
// Runs the colony 25 simulated minutes with the mass driver built and landers coming, at speed x1 (30 fps).
const H=require('./harness');   // 0.55
const store={ lunabara: JSON.stringify({colony:{o2:95,reactor:100,samples:3,fruit:12,yuzu:4,peels:0,compost:60,md:100,he3:3,launched:9,drops:1,pups:[{name:'KIWI',parent:'PIP'},{name:'MIKAN',parent:'LUNA'}]},savedAt:Date.now()}), 'lunabara-look':JSON.stringify({chat:0}) };
const L=H(process.argv[2],'capys,pups,colony,landerS,LZX,LZZ,PAD_R,PAD_MASTS,UPLINK',store);
const R1=L.PAD_R+0.32, A0=Math.PI*0.75, A1=Math.PI*1.62;
const masts=L.PAD_MASTS.map(([d,r])=>[L.LZX+Math.cos(d*Math.PI/180)*r, L.LZZ+Math.sin(d*Math.PI/180)*r]);
let minBerm=1e9, minMast=1e9, minUp=1e9, who='', landed=0, frames=0, onPad=0;
const dAng=a=>{ a=((a-A0)%(2*Math.PI)+2*Math.PI)%(2*Math.PI); return a<=A1-A0; };
let prev='';
while(frames<45000){ L.step(1); frames++; if(L.landerS.state!==prev){ if(L.landerS.state==='landed') landed++; prev=L.landerS.state; }
  const all=L.capys.filter(c=>c.root.visible).concat(L.pups.filter(p=>p.root.visible && !p.riding));
  for(const c of all){ const dx=c.x-L.LZX, dz=c.z-L.LZZ, r=Math.hypot(dx,dz), a=Math.atan2(dz,dx);
    if(dAng(a)){ const d=Math.abs(r-R1); if(d<minBerm){ minBerm=d; who=c.name+' '+c.state+' '+(c.place||''); } }
    else { /* off the berm's arc: distance to its two ends */ for(const e of [A0,A1]){ const ex=L.LZX+Math.cos(e)*R1, ez=L.LZZ+Math.sin(e)*R1, d=Math.hypot(c.x-ex,c.z-ez); if(d<minBerm){ minBerm=d; who=c.name+' '+c.state+' '+(c.place||'')+' (berm end)'; } } }
    for(const [mx,mz] of masts) minMast=Math.min(minMast,Math.hypot(c.x-mx,c.z-mz));
    for(const [ux,uz] of L.UPLINK) minUp=Math.min(minUp,Math.hypot(c.x-ux,c.z-uz)); } }
console.log('frames',frames,'landers landed',landed,'drops',L.colony.drops,'adults',L.capys.length);
console.log('closest to the berm line m',minBerm.toFixed(2),'('+who+')','closest to a mast m',minMast.toFixed(2),'closest to an uplink post m',minUp.toFixed(2));
const ok=minBerm>0.45 && minMast>0.5 && minUp>0.45;
console.log(ok?'PASS: nobody walks through the berm, the masts or the uplink':'FAIL: someone came too close'); if(!ok) process.exitCode=1;
