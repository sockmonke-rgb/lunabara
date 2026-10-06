// Lunabara route simulation: 7 capybaras, moving rover, 20 simulated minutes.
// Run: node navsim.js [seed]   Try seeds 7 11 23 99 314.
// Pass: unfinished trips 0, overlap 0.00, greenhouse wall crossings 0, habitat dome crossings 0, wallow side crossings 0,
// bathhouse wall crossings 0 (0.51).
// Keep the obstacle and place lists in step with the game file.
// 0.41: adds the landing pad (obstacle), unloading beside it and stowing crates by the airlock (places),
// 0.43: a spot to watch landings from, and a wider unloading spot.
// and two capybaras that start on the pad, where crewmates from Earth step off the lander.
// 0.43: the landing-watch spots, and ROVER-1's run out to the pad on every other loop.

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// 0.51: the spread-out layout (same numbers as the game: HABX/GHX/PLX… there)
const HABX=-9.0, HABZ=4.5, GHX=-11.0, GHZ=-6.3, PLX=8.6, PLZ=8.6, WHX=12.5, WHZ=-4.0, LABX=1.8, LABZ=13.5, CMX=17.0, CMZ=13.5, LZX=-23.0, LZZ=6.5, CBX=-6.5, CBZ=13.0, RX=-19.0, RZ=-1.0, LSX=6.5, LSZ=0.4, NX=-12.5, NZ=17.5;
const POOL={x:PLX,z:PLZ}, DOME_R=4.4;
let seed=+(process.argv[2]||7); const rand=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
const MD=[1.5,5,8.5].map(z=>({x:19.5+Math.cos(1.25)*z,z:-2.5+Math.sin(1.25)*z,r:1.1,place:'massdriver'}));
const obstacles=[{x:HABX+0.8,z:HABZ,r:3.9,place:'habitat'},{x:GHX,z:GHZ,r:3.6,place:'greenhouse'},{x:PLX,z:PLZ,r:2.4,place:'wallow'},{x:PLX,z:PLZ,r:DOME_R,place:'bathhouse'},{x:WHX,z:WHZ,r:1.6,place:'wheel'},
{x:-19.5,z:13.5,r:0.6,place:'array'},{x:19.5,z:-15,r:0.6,place:'array'},{x:-3,z:20.5,r:0.6,place:'array'},{x:CMX,z:CMZ,r:1.0,place:'comms'},{x:1.2,z:-15.2,r:1.3,place:'mine'},{x:LABX,z:LABZ,r:2.1,place:'lab'},{x:RX,z:RZ,r:2.5,place:'reactor'},{x:LSX,z:LSZ,r:1.3,place:'lifesupport'},{x:CBX,z:CBZ,r:0.95,place:'compost'}].concat(MD,[{x:NX,z:NZ,r:1.5,place:'nursery'},
{x:LZX,z:LZZ,r:1.6,place:'pad'},{x:16.637,z:16.092,r:0.45,place:'commsdesk'}]);
const roverOb={x:0,z:0,r:1.3,place:'rover'};
const RP=[[0.6,1.2],[3,-4.5],[3.4,-11],[0.2,-13.4],[-0.4,-9],[0.3,-3]];
const PADR=[[0.6,1.2],[-2.5,8.6],[-14,9.6],[-19.5,9.4],[LZX,LZZ+3.0]];   // 0.51: the cargo run goes north of the habitat
// 0.43: every other loop ROVER-1 drives out to the landing pad and back along the same lane
function padAt(u){ const v=u<0.5?u*2:2-u*2, f=v*(PADR.length-1), i=Math.min(PADR.length-2,Math.floor(f)), t=f-i, a=PADR[i], b=PADR[i+1]; return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
function roverAt(u){ const n=RP.length, f=u*n, i=Math.floor(f)%n, t=f-Math.floor(f), a=RP[i], b=RP[(i+1)%n]; return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
const PLACES={
  habitat:{x:HABX+5.5,z:HABZ+0.1,r:0.4},
  wallow:{x:POOL.x,z:POOL.z,r:1.3},
  greenhouse:{x:GHX+0.2,z:GHZ,r:1.2,door:{x:GHX+4.5,z:GHZ}},
  wheel:{x:WHX,z:WHZ,r:0,single:true},
  mine:{x:2.9,z:-13.6,r:0.5},
  comms:{x:CMX-1.2,z:CMZ+1.5,r:0},
  array:{x:-18.3,z:12.7,r:0.6},
};
// Every other destination in the game (kept here, right after PLACES, so resyncing the routing code never removes it)
PLACES.lab={x:LABX,z:LABZ-2.8,r:0.3}; PLACES.survey={x:-5,z:-12,r:0}; PLACES.reactor={x:RX+3.1,z:RZ,r:0};
PLACES.lifesupport={x:LSX,z:LSZ-2,r:0.3}; PLACES.peelscoop={x:PLX,z:PLZ-3.15,r:0.2}; PLACES.compost={x:CBX+0.5,z:CBZ-1.5,r:0.2};
PLACES.sleep={x:HABX+5.5,z:HABZ+0.1,r:0.2}; PLACES.spread={x:CBX+0.5,z:CBZ-1.5,r:0.2}; PLACES.massdriver={x:22.88,z:1.646,r:0};
PLACES.unload={x:LZX+2.7,z:LZZ,r:0.9}; PLACES.deliver={x:HABX+5.4,z:HABZ-1.2,r:0.2}; PLACES.padwatch={x:LZX+2.2,z:LZZ-3.6,r:0};
const PAD_SPOTS=[[-20.8,2.9],[-21.6,2.6],[-20.1,3.4],[-20.6,2.1]];   // 0.54: south-east of the pad   // where the colony watches a landing
const SS=[[-5,-12],[6,-10],[5,-15],[-3,-17],[9,-9],[-9,-10.5],[-6.5,-15.5],[8,-14]];

// 0.49: ramps into the wallow (same numbers as the game): walkers go in and out over a ramp, never through the side
const POOL_R=2.3, RAMP_OUT=1.3, RAMP_IN=1.05, RAMP_W=0.9;
const POOL_RAMPS=[Math.PI,0.25].map(a=>{ const ux=Math.cos(a), uz=Math.sin(a);
  return {a,ux,uz, ox:POOL.x+ux*(POOL_R+RAMP_OUT+0.25), oz:POOL.z+uz*(POOL_R+RAMP_OUT+0.25), ix:POOL.x+ux*(POOL_R-RAMP_IN-0.1), iz:POOL.z+uz*(POOL_R-RAMP_IN-0.1)}; });
function onRamp(x,z,r){ const dx=x-POOL.x, dz=z-POOL.z, along=dx*r.ux+dz*r.uz, lat=Math.abs(-dx*r.uz+dz*r.ux);
  return lat<RAMP_W/2+0.12 && along>POOL_R-RAMP_IN-0.2 && along<POOL_R+RAMP_OUT+0.3 ? along : null; }
function inPool(x,z){ return Math.hypot(x-POOL.x,z-POOL.z)<POOL_R+0.05; }
function nearestRamp(x,z){ let b=POOL_RAMPS[0], bd=1e9; for(const r of POOL_RAMPS){ const d=Math.hypot(x-r.ox,z-r.oz); if(d<bd){ bd=d; b=r; } } return b; }
// 0.51: the bathhouse dome over the wallow, entered by its airlock door (same numbers as the game)
const DOORS={greenhouse:PLACES.greenhouse.door, bathhouse:{x:POOL.x-DOME_R-1.0,z:POOL.z,in:{x:POOL.x-POOL_R-RAMP_OUT-0.25,z:POOL.z}}};
function inDome(x,z){ return Math.hypot(x-POOL.x,z-POOL.z)<DOME_R-0.05; }
function inDoorway(x,z){ return Math.abs(z-POOL.z)<0.7 && x>POOL.x-DOME_R-1.3 && x<POOL.x-DOME_R+1.0; }
function doorBoxAt(x,z){ for(const o of obstacles){ const d=DOORS[o.place]; if(!d) continue;
    if(o.place==='greenhouse' ? inGH(x,z) : o.place==='bathhouse' ? inDome(x,z) : Math.hypot(x-o.x,z-o.z)<o.r) return o; } return null; }
// Two seats side by side, facing Earth low on the horizon
const EARTH_AZ=1.25, EARTH_DX=Math.cos(EARTH_AZ), EARTH_DZ=Math.sin(EARTH_AZ), EARTH_YAW=Math.atan2(EARTH_DX,EARTH_DZ);
const SEATS=[{x:CMX-1.2+0.949*0.45,z:CMZ+1.5-0.316*0.45,who:null},{x:CMX-1.2-0.949*0.45,z:CMZ+1.5+0.316*0.45,who:null}];
function segHit(ax,az,bx,bz,ign){
  let best=null, bt=2;
  const vx=bx-ax, vz=bz-az, L2=vx*vx+vz*vz||1e-6;
  for(const o of obstacles){
    if(ignored(o,ign)) continue;
    const t=clamp(((o.x-ax)*vx+(o.z-az)*vz)/L2,0,1), px=ax+vx*t, pz=az+vz*t;
    if(t<=0.001) continue; // closest at the start: we're walking away from it, not into it
    if(Math.hypot(o.x-px,o.z-pz)<o.r+0.5 && t<bt){ bt=t; best={o,px,pz}; }
  }
  return best;
}
function ignored(o,ign){ return ign.indexOf(o.place)>=0 || ign.indexOf(o)>=0; }
function freeAt(x,z,ign){ for(const o of obstacles){ if(!ignored(o,ign) && Math.hypot(x-o.x,z-o.z)<o.r+0.6) return false; } return true; }
function legs(ax,az,bx,bz,ign,out,depth){
  const h=segHit(ax,az,bx,bz,ign);
  if(!h || depth>6){ out.push({x:bx,z:bz,ign}); return; }
  // Try points around the blocking building; keep the shortest one that is clear of every building.
  let best=null, bestL=1e9;
  const domeLeg=ign.some(o=>(o.place||o)==='bathhouse') && inDome(ax,az);
  for(const k of (domeLeg?[0.75,1.1,1.45]:[1.1,2.2,3.5])){
    for(let i=0;i<16;i++){
      const a=i/16*Math.PI*2, wx=h.o.x+Math.cos(a)*(h.o.r+k), wz=h.o.z+Math.sin(a)*(h.o.r+k);
      if(!freeAt(wx,wz,ign)) continue;
      if(domeLeg && !inDome(wx,wz)) continue;   // 0.51: a detour inside the bathhouse stays inside it
      const s1=segHit(ax,az,wx,wz,ign);
      if(s1 && s1.o===h.o) continue;
      const s2=segHit(wx,wz,bx,bz,ign);
      if(s2 && s2.o===h.o) continue; // must actually get us around this building
      const L=Math.hypot(wx-ax,wz-az)+Math.hypot(bx-wx,bz-wz)+(s2?3:0);
      if(L<bestL){ bestL=L; best={x:wx,z:wz}; }
    }
    if(best) break;
  }
  if(!best){ out.push({x:bx,z:bz,ign}); return; }
  legs(ax,az,best.x,best.z,ign,out,depth+1); legs(best.x,best.z,bx,bz,ign,out,depth+1);
}
function inGH(x,z){ return Math.abs(x-GHX)<3.35 && Math.abs(z-GHZ)<2.25; }   // 0.49: the greenhouse's real footprint, not its circle
function inside(x,z){ return obstacles.filter(o=>Math.hypot(x-o.x,z-o.z)<o.r+0.55); }
// First get clear of anything we are standing in (a pool, a doorway), then plan normally.
function exitPoint(x,z,tx,tz,list){
  // Heading straight for the target is fine only if we're clear within a metre; otherwise step out the nearest way.
  const d=Math.hypot(tx-x,tz-z)||1, ux=(tx-x)/d, uz=(tz-z)/d;
  const ghStart=inGH(x,z);   // 0.49: never step straight through the greenhouse glass
  for(let s=0.25;s<=1.0;s+=0.25){ const px=x+ux*s, pz=z+uz*s; if(!ghStart && inGH(px,pz)) break; if(!list.some(o=>Math.hypot(px-o.x,pz-o.z)<o.r+0.6)) return {x:px,z:pz}; }
  let px=x, pz=z;
  for(let k=0;k<3;k++) for(const o of list){ const ox=px-o.x, oz=pz-o.z, od=Math.hypot(ox,oz)||1, R=o.r+0.7; if(od<R){ px=o.x+ox/od*R; pz=o.z+oz/od*R; } }
  return {x:px,z:pz};
}
// 0.50: pull the string. legs() can leave detour points that zigzag back and forth (one plan had 9 waypoints within half a
// metre), which made capybaras spin on the spot. Drop any waypoint the walker can skip in a straight, clear line, but only
// within one run of waypoints that share the same permissions, so doors and ramps are never cut.
function sameIgn(a,b){ if(a===b) return true; if(!a||!b||a.length!==b.length) return false; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) return false; return true; }
function smoothPath(ax,az,out){
  const res=[]; let px=ax, pz=az, i=0;
  while(i<out.length){
    let j=i;
    for(let k=out.length-1;k>i;k--){ let ok=true; for(let q=i;q<=k;q++) if(!sameIgn(out[q].ign,out[i].ign) || (q<k && out[q].keep)){ ok=false; break; }
      if(ok && !segHit(px,pz,out[k].x,out[k].z,out[k].ign||[])){ j=k; break; } }
    res.push(out[j]); px=out[j].x; pz=out[j].z; i=j+1; }
  return res; }
function route(c,key,tx,tz){ return smoothPath(c.x,c.z,routeRaw(c,key,tx,tz)); }
function routeRaw(c,key,tx,tz){
  // 0.51: doored buildings (the greenhouse and the bathhouse) are left and entered by their doors; the pool by a ramp.
  const out=[], P=PLACES[key];
  let ax=c.x, az=c.z;
  const tgtB=doorBoxAt(tx,tz);
  // Out of the water by a ramp, never through the pool's side
  if(key!=='wallow' && (inPool(ax,az) || POOL_RAMPS.some(r=>onRamp(ax,az,r)!==null && Math.hypot(ax-POOL.x,az-POOL.z)<POOL_R+0.6))){
    const r=(tgtB && tgtB.place==='bathhouse') ? nearestRamp(ax,az) : nearestRamp(DOORS.bathhouse.in.x,DOORS.bathhouse.in.z);   // leaving the bathhouse: the ramp by the door
    if(inPool(ax,az) && !(onRamp(ax,az,r)>POOL_R-RAMP_IN-0.05)) out.push({x:r.ix,z:r.iz,ign:['wallow','bathhouse'],keep:true});
    out.push({x:r.ox,z:r.oz,ign:['wallow','bathhouse'],keep:true}); ax=r.ox; az=r.oz; }
  // Leave the building we're in by its door, unless where we're going is in it too
  const myB=doorBoxAt(ax,az);
  if(myB && myB!==tgtB){ const d=DOORS[myB.place];
    if(d.in){ legs(ax,az,d.in.x,d.in.z,[myB],out,0); out[out.length-1].keep=true; out.push({x:d.x,z:d.z,ign:[myB],keep:true}); }   // through the airlock, not the glass
    else { legs(ax,az,d.x,d.z,[myB],out,0); out[out.length-1].keep=true; }
    ax=d.x; az=d.z; }
  // Get clear of anything else we're standing in
  const stuckIn=inside(ax,az).filter(o=>o.place!==key && o!==tgtB && o!==myB && !(key==='wallow' && o.place==='bathhouse'));
  if(stuckIn.length){
    const goal=tgtB && myB!==tgtB ? DOORS[tgtB.place] : {x:tx,z:tz};
    const e=exitPoint(ax,az,goal.x,goal.z,stuckIn);
    out.push({x:e.x,z:e.z,ign:stuckIn.slice(),keep:true}); ax=e.x; az=e.z;
  }
  // In by the door of the building the destination is in
  if(tgtB && myB!==tgtB){ const d=DOORS[tgtB.place]; legs(ax,az,d.x,d.z,[],out,0); out[out.length-1].keep=true; ax=d.x; az=d.z;
    if(d.in){ out.push({x:d.in.x,z:d.in.z,ign:[tgtB.place],keep:true}); ax=d.in.x; az=d.in.z; } }
  // Into the water by the nearest ramp
  if(key==='wallow' && !inPool(ax,az)){
    const r=nearestRamp(ax,az), al=onRamp(ax,az,r);
    if(al===null || al>POOL_R+0.6) legs(ax,az,r.ox,r.oz,['bathhouse'],out,0);
    out.push({x:r.ix,z:r.iz,ign:['wallow','bathhouse'],keep:true}); out.push({x:tx,z:tz,ign:['wallow','bathhouse']}); return out; }
  // Only buildings the destination actually sits inside (the pool, the wheel, the greenhouse) may be entered.
  const into=inside(tx,tz);
  legs(ax,az,tx,tz,into,out,0);
  return out;
}
function pushOut(c,ign,ghost){
  const list=[roverOb].concat(obstacles);   // 0.49: the rover first, so a shove from it can never end inside a building
  for(const o of list){
    if(ignored(o,ign)) continue;
    if(ghost && o.r<2) continue; // squeezing past the rover or a mast is fine; walking through a building is not
    const ox=c.x-o.x, oz=c.z-o.z, od=Math.hypot(ox,oz), rr=o.r+0.45;
    if(od<rr && od>1e-4){ c.x=o.x+ox/od*rr; c.z=o.z+oz/od*rr; }
  }
}
const keys=Object.keys(PLACES);
// Start spots: three in the greenhouse, two by the airlock, two on the landing pad (where crewmates step off the lander)
const caps=[]; for(let i=0;i<7;i++) caps.push({x:i<3?GHX+(rand()-.5)*3:i<5?HABX+3.6+(rand()-.5)*0.6:LZX+1.2+(rand()-.5)*0.6,z:i<3?GHZ+(rand()-.5)*2:i<5?HABZ+(rand()-.5)*1.5:LZZ+0.6+(rand()-.5)*0.6,place:null,from:null,path:null,pi:0,stuckT:0,stuckN:0,ghostT:0,t0:0,tx:0,tz:0});
function pick(c,T){ let k; do{k=keys[Math.floor(rand()*keys.length)];}while(k===c.place);
  const p=PLACES[k]; let tx=p.x,tz=p.z; if(k==='wallow'){ const a=rand()*6.283, r=Math.sqrt(rand())*1.3; tx+=Math.cos(a)*r; tz+=Math.sin(a)*r; } if(k==='wheel'){tx+=1.4;tz+=0.5;} if(k==='survey'){const q=SS[Math.floor(rand()*SS.length)];tx=q[0];tz=q[1];} if(k==='reactor'&&rand()<0.5){tx=RX+0.54;tz=RZ+3.05;} if(k==='massdriver'&&rand()<0.5){tx=19.27;tz=2.844;} if(k==='padwatch'){const q=PAD_SPOTS[Math.floor(rand()*PAD_SPOTS.length)];tx=q[0];tz=q[1];}
  c.from=c.place; c.place=k; c.tx=tx; c.tz=tz; c.path=route(c,k,tx,tz); c.pi=0; c.t0=T; }
let domeWall=0, poolWall=0, domeHits=0, wallHits=0, padHits=0, T=0, trips=0, slow=0, worstTrip=0, pen=0, ghosts=0; const dt=1/30;
for(let f=0; f<30*60*20; f++){ T+=dt; const loop=Math.floor(T*1.4/40), [rx,rz]=loop%2 ? padAt((T*1.4/40)%1) : roverAt((T*1.4/40)%1); roverOb.x=rx; roverOb.z=rz;
 for(const c of caps){
  if(!c.path){ pick(c,T); continue; }
  const wp=c.path[c.pi]; const dx=wp.x-c.x, dz=wp.z-c.z, d=Math.hypot(dx,dz);
  if(d<0.2){ c.pi++; if(c.pi>=c.path.length){ trips++; const dur=T-c.t0; worstTrip=Math.max(worstTrip,dur); if(dur>40) slow++;
      if(c.place==='wheel'){c.x=WHX+1.5;c.z=WHZ+0.6;} pick(c,T);} continue; }
  const st=Math.min(d,1.2*dt), px=c.x, pz=c.z, pd0=Math.hypot(c.x-POOL.x,c.z-POOL.z); c.x+=dx/d*st; c.z+=dz/d*st;
  if(c.ghostT>0){c.ghostT-=dt;} pushOut(c,wp.ign,c.ghostT>0);
  if(Math.hypot(c.x-HABX,c.z-HABZ)<2.8) domeHits++;
  { const b1=Math.hypot(c.x-POOL.x,c.z-POOL.z); if(T>5 && (pd0-DOME_R)*(b1-DOME_R)<0 && !inDoorway(c.x,c.z)) domeWall++; }   // 0.51: through the bathhouse glass
  { const pd1=Math.hypot(c.x-POOL.x,c.z-POOL.z); if(T>5 && (pd0-POOL_R)*(pd1-POOL_R)<0 && !POOL_RAMPS.some(r=>onRamp(c.x,c.z,r)!==null)) poolWall++; }   // 0.49: over the wallow's side, not a ramp
  if(T>5 && Math.hypot(c.x-LZX,c.z-LZZ)<1.2) padHits++;   // walking under the lander, after the start-up shuffle
  { const gx=c.x-GHX, gz=c.z-GHZ; if(T>5 && Math.abs(gx)<3.2 && Math.abs(gz)<2.1 && (Math.abs(gz)>1.5 || gx<-2.6)) wallHits++; /* after the start-up shuffle */ }
  if(c.ghostT<=0) for(const o of obstacles){ if(ignored(o,wp.ign)) continue; const p2=o.r-Math.hypot(c.x-o.x,c.z-o.z); if(p2>pen) pen=p2; }
  if(Math.hypot(c.x-px,c.z-pz)<st*0.3){ c.stuckT+=dt; if(c.stuckT>1.2){ c.stuckN++; c.path=route(c,c.place,c.tx,c.tz); c.pi=0; c.stuckT=0; if(c.stuckN>=2){c.ghostT=1.5;c.stuckN=0;ghosts++;} } }
  else { c.stuckT=Math.max(0,c.stuckT-dt); if(c.stuckT===0) c.stuckN=0; }
 }}
const unfinished=caps.map(c=>(T-c.t0)).filter(d=>d>45).length; const stuckNow=caps.filter(c=>T-c.t0>45).map(c=>c.place+'@'+c.x.toFixed(1)+','+c.z.toFixed(1));
console.log('unfinished trips over 45s:',unfinished,stuckNow.join(' '));
console.log('20 min sim: trips',trips,'trips over 40s',slow,'longest trip s',worstTrip.toFixed(1),'ghost squeezes',ghosts,'max overlap into a building',pen.toFixed(2),'greenhouse wall crossings',wallHits,'habitat dome crossings',domeHits,'pad crossings',padHits,'wallow side crossings',poolWall,'bathhouse wall crossings',domeWall);
