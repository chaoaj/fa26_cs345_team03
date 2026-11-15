(function (root) {
  'use strict';
  const P = { tip:[.50,0], lt:[.045,.088], rt:[.96,.073],
    crown:[.575,.106], lip:[.335,.167], shoulder:[.985,.188],
    mid:[.825,.565], heel:[.265,.765], lb:[0,.813],
    rb:[.97,.815], bottom:[.54,1] };
  const OUTLINE=['tip','rt','shoulder','rb','bottom','lb','lt'];
  const FACES = [
    {v:['tip','lt','crown'], d:[0,0,1,.2], c:['#ffe9bf','#8f8bff','#6423f5']},
    {v:['tip','crown','rt'], d:[.4,0,1,.14], c:['#4920ca','#7215ef','#f379ff']},
    {v:['lt','lip','crown'], d:[.1,.1,.6,.2], c:['#b5baff','#ffd3f3','#98c8ff']},
    {v:['crown','shoulder','rt'], d:[.6,.1,1,.2], c:['#3025d4','#7b14ed','#f170ff']},
    {v:['lt','lb','heel','lip'], d:[0,0,.6,0], c:['#ffbafa','#e750ee','#3641fc']},
    {v:['lip','heel','mid','shoulder','crown'], d:[.25,.2,.95,.6], c:['#6dbaff','#bb8fff','#ffb8ca','#fff1bf','#f586bd']},
    {v:['shoulder','mid','rb'], d:[.8,0,1,0], c:['#f7b5f7','#ce35ef','#6514d9']},
    {v:['heel','rb','mid'], d:[.25,.6,.9,.9], c:['#338eff','#05edf1','#7b9bff']},
    {v:['lb','bottom','heel'], d:[0,.8,.55,.95], c:['#001cba','#0786ff','#14dfff']},
    {v:['heel','bottom','rb'], d:[.3,.8,1,.95], c:['#12f5ed','#00a5f7','#1223ed','#7049ff']}
  ];
  function path(c, names) {
    c.beginPath(); names.forEach((n,i)=>{ const p=P[n]; i ? c.lineTo(...p) : c.moveTo(...p); }); c.closePath();
  }
  function gradient(c,d,colors) { const g=c.createLinearGradient(...d); colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v)); return g; }
  function patch(c,x,y,rx,ry,color) {
    c.save(); c.translate(x,y); c.scale(rx,ry);
    const g=c.createRadialGradient(0,0,0,0,0,1); g.addColorStop(0,color); g.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=g; c.fillRect(-1,-1,2,2); c.restore();
  }
  function drawCrystal(g,x,y,w,h,options={}) {
    if (![x,y,w,h].every(Number.isFinite) || w<=0 || h<=0) throw new RangeError('Crystal bounds must be finite; width and height must be positive.');
    const c=g && g.drawingContext;
    if (!c || typeof c.createLinearGradient!=='function') throw new TypeError('drawCrystal requires a p5 P2D drawing target.');
    const empty=!!options.empty, t=Number.isFinite(options.time)?options.time:0;
    const phase=Number.isFinite(options.phase)?options.phase:0;
    const pulse=options.animate ? .8+.2*Math.sin(t*2+phase) : 1;
    const glow=empty ? 0 : Math.max(0,Math.min(1,options.glow??.45))*pulse;
    c.save();
    try {
      c.translate(x,y); c.scale(w,h);
      c.lineJoin='round'; c.lineCap='round';
      if(glow>0) for(let i=10;i>=1;i--) {
        path(c,OUTLINE); c.lineWidth=i*.018; c.strokeStyle=`rgba(124,74,255,${glow*.013})`; c.stroke();
      }
      c.save(); path(c,OUTLINE); c.clip();
      for(let i=0;i<FACES.length;i++) {
        const f=FACES[i]; path(c,f.v);
        c.fillStyle=empty ? ['#4c4066','#403454','#655480','#3d3057','#382d50','#302741','#46345c','#2e2542','#3a2d53','#251e38'][i] : gradient(c,f.d,f.c);
        c.fill();
      }
      if(!empty) {
        c.save(); path(c,FACES[5].v); c.clip();
        patch(c,.72,.37,.30,.26,'rgba(255,253,224,.83)');
        patch(c,.73,.53,.27,.16,'rgba(255,146,132,.72)');
        patch(c,.40,.27,.17,.25,'rgba(83,219,255,.65)'); c.restore();
        c.save(); path(c,FACES[4].v); c.clip();
        patch(c,.09,.55,.16,.30,'rgba(255,229,255,.95)');
        patch(c,.24,.40,.13,.24,'rgba(255,59,230,.70)'); c.restore();
        c.fillStyle='rgba(225,252,255,.24)'; c.beginPath();
        c.moveTo(.07,.31); c.lineTo(.85,.62); c.lineTo(.85,.655); c.lineTo(.065,.35); c.closePath(); c.fill();
        c.fillStyle='rgba(219,253,255,.18)'; c.beginPath();
        c.moveTo(.28,.80); c.lineTo(.54,.985); c.lineTo(.46,.88); c.closePath(); c.fill();
      }
      c.restore();
      c.save(); c.scale(1/w,1/h);
      const edges=new Set();
      for(const f of FACES) for(let i=0;i<f.v.length;i++) {
        const a=f.v[i], b=f.v[(i+1)%f.v.length], key=[a,b].sort().join('/');
        if(edges.has(key)) continue; edges.add(key);
        c.beginPath(); c.moveTo(P[a][0]*w,P[a][1]*h); c.lineTo(P[b][0]*w,P[b][1]*h);
        c.lineWidth=Math.max(.55,w*.013); c.strokeStyle=empty?'rgba(117,96,150,.45)':'rgba(19,17,39,.74)'; c.stroke();
      }
      c.beginPath(); OUTLINE.forEach((n,i)=>{ const p=P[n]; i?c.lineTo(p[0]*w,p[1]*h):c.moveTo(p[0]*w,p[1]*h); }); c.closePath();
      c.lineWidth=Math.max(.7,w*.017); c.strokeStyle=empty?'#796596':'#21182e'; c.stroke();
      if(!empty) {
        c.beginPath(); c.moveTo(0,h*.807); c.lineTo(w*.045,h*.088); c.lineTo(w*.50,0);
        c.strokeStyle='rgba(255,230,234,.85)'; c.lineWidth=Math.max(.5,w*.018); c.stroke();
        c.beginPath(); c.moveTo(w*.52,h*.008); c.lineTo(w*.577,h*.103);
        c.strokeStyle='rgba(223,194,255,.65)'; c.lineWidth=Math.max(.5,w*.012); c.stroke();
      } c.restore();
    } finally { c.restore(); }
  }
  function drawCrystalMeter(g,x,y,w,h,count,total=10,options={}) {
    if (!Number.isInteger(total)||total<1||total>1000) throw new RangeError('total must be an integer from 1 to 1000.');
    if(!Number.isFinite(count)) throw new RangeError('count must be finite.');
    if (![x,y,w,h].every(Number.isFinite)||w<=0||h<=0) throw new RangeError('Invalid meter bounds.');
    const filled=Math.max(0,Math.min(total,Math.floor(count)));
    const gap=options.gap??h*.012;
    if(!Number.isFinite(gap)||gap<0||gap*(total-1)>=h) throw new RangeError('Meter gap does not fit.');
    const sh=(h-gap*(total-1))/total;
    for(let i=0;i<total;i++) drawCrystal(g,x,y+i*(sh+gap),w,sh,{...options,empty:i<total-filled,phase:(options.phase??0)+i*.67});
    return filled;
  }
  root.drawCrystal=drawCrystal; root.drawCrystalMeter=drawCrystalMeter;
  if(typeof module!=='undefined' && module.exports) module.exports={drawCrystal,drawCrystalMeter};
})(typeof globalThis!=='undefined'?globalThis:this);
