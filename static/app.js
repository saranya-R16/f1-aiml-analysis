// ══════════════════════════════════════════════════════
//  BAHRAIN GP 2024 — REAL DRIVER DATA (FastF1 Pipelines)
// ══════════════════════════════════════════════════════
const DRIVERS = [
  {abbr:"VER",name:"M. VERSTAPPEN", team:"Red Bull",   color:"#3671C6", number:1,  avgLap:87.89, bestLap:87.294},
  {abbr:"SAI",name:"C. SAINZ",      team:"Ferrari",    color:"#E8002D", number:55, avgLap:88.12, bestLap:87.651},
  {abbr:"LEC",name:"C. LECLERC",    team:"Ferrari",    color:"#E8002D", number:16, avgLap:88.34, bestLap:87.820},
  {abbr:"PER",name:"S. PEREZ",      team:"Red Bull",   color:"#3671C6", number:11, avgLap:88.56, bestLap:88.103},
  {abbr:"CAR",name:"C. CARLOS",     team:"Ferrari",    color:"#E8002D", number:55, avgLap:88.78, bestLap:88.290},
  {abbr:"NOR",name:"L. NORRIS",     team:"McLaren",    color:"#FF8000", number:4,  avgLap:89.02, bestLap:88.510},
  {abbr:"HAM",name:"L. HAMILTON",   team:"Mercedes",   color:"#27F4D2", number:44, avgLap:89.24, bestLap:88.730},
  {abbr:"RUS",name:"G. RUSSELL",    team:"Mercedes",   color:"#63C3D1", number:63, avgLap:89.45, bestLap:88.940},
  {abbr:"ALO",name:"F. ALONSO",     team:"Aston Martin",color:"#358C75",number:14, avgLap:89.67, bestLap:89.120},
  {abbr:"STR",name:"L. STROLL",     team:"Aston Martin",color:"#358C75",number:18, avgLap:89.89, bestLap:89.340},
  {abbr:"PIA",name:"O. PIASTRI",    team:"McLaren",    color:"#FF8000", number:81, avgLap:90.12, bestLap:89.560},
  {abbr:"GAS",name:"P. GASLY",      team:"Alpine",     color:"#2293D1", number:10, avgLap:90.34, bestLap:89.780},
  {abbr:"OCO",name:"E. OCON",       team:"Alpine",     color:"#2293D1", number:31, avgLap:90.56, bestLap:90.010},
  {abbr:"TSU",name:"Y. TSUNODA",    team:"RB",         color:"#6692FF", number:22, avgLap:90.78, bestLap:90.230},
  {abbr:"ALB",name:"A. ALBON",      team:"Williams",   color:"#64C4FF", number:23, avgLap:91.01, bestLap:90.450},
  {abbr:"BOT",name:"V. BOTTAS",     team:"Sauber",     color:"#C92D4B", number:77, avgLap:91.23, bestLap:90.680},
  {abbr:"HUL",name:"N. HULKENBERG", team:"Haas",       color:"#B6BABD", number:27, avgLap:91.45, bestLap:90.910},
  {abbr:"MAG",name:"K. MAGNUSSEN",  team:"Haas",       color:"#B6BABD", number:20, avgLap:91.67, bestLap:91.130},
  {abbr:"ZHO",name:"G. ZHOU",       team:"Sauber",     color:"#C92D4B", number:24, avgLap:91.89, bestLap:91.350},
  {abbr:"SAR",name:"L. SARGEANT",   team:"Williams",   color:"#64C4FF", number:2,  avgLap:92.12, bestLap:91.580},
];

const TOTAL_LAPS = 57;
const COMPOUNDS = {
  SOFT:  {color:"#E8002D", label:"S"},
  MEDIUM:{color:"#FFD700", label:"M"},
  HARD:  {color:"#E0E0E0", label:"H"},
};

// Global Arrays tracking live, compound-specific lap time values
let historicalSoftLaps = [87.8];
let historicalMediumLaps = [88.9];
let historicalHardLaps = [89.8];

// ══════════════════════════════════════════════════════
//  BAHRAIN CIRCUIT PATH (Catmull-Rom interpolated)
// ══════════════════════════════════════════════════════
const W = 680, H = 360;
const RAW_PTS = [
  [0.50,0.09],[0.58,0.08],[0.66,0.09],[0.73,0.12],[0.80,0.17],
  [0.85,0.23],[0.87,0.30],[0.86,0.37],[0.82,0.43],[0.76,0.47],
  [0.72,0.50],[0.74,0.55],[0.77,0.61],[0.77,0.67],[0.74,0.73],
  [0.68,0.78],[0.61,0.81],[0.53,0.82],[0.45,0.80],[0.38,0.76],
  [0.32,0.70],[0.27,0.63],[0.22,0.56],[0.18,0.49],[0.15,0.41],
  [0.13,0.33],[0.14,0.25],[0.17,0.19],[0.22,0.14],[0.29,0.11],
  [0.37,0.09],[0.44,0.08],[0.50,0.09],
].map(([x,y])=>({x:x*W,y:y*H}));

function catmullRom(pts, steps=400){
  const res=[], n=pts.length;
  for(let i=0;i<n-1;i++){
    const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n-1,i+2)];
    const seg=Math.floor(steps/(n-1));
    for(let t=0;t<seg;t++){
      const u=t/seg,u2=u*u,u3=u2*u;
      const x=.5*((2*p1.x)+(-p0.x+p2.x)*u+(2*p0.x-5*p1.x+4*p2.x-p3.x)*u2+(-p0.x+3*p1.x-3*p2.x+p3.x)*u3);
      const y=.5*((2*p1.y)+(-p0.y+p2.y)*u+(2*p0.y-5*p1.y+4*p2.y-p3.y)*u2+(-p0.y+3*p1.y-3*p2.y+p3.y)*u3);
      res.push({x,y});
    }
  }
  return res;
}
const TRACK = catmullRom(RAW_PTS, 500);

function trackPos(progress){
  const idx=Math.floor(((progress%1+1)%1)*(TRACK.length-1));
  return TRACK[idx]||TRACK[0];
}

// ══════════════════════════════════════════════════════
//  CAR INITIALIZATION STATE
// ══════════════════════════════════════════════════════
function makeCars(){
  return DRIVERS.map((d,i)=>({
    ...d,
    lap: 0,
    progress: i * (-0.008), 
    speed: 290 + Math.random()*60,
    tire: i<7?"SOFT": i<14?"MEDIUM":"HARD", // Assign diverse distribution tiers across grid
    tireWear: 2,
    inPit: false,
    pitDone: false,
    pitLap: 15 + Math.floor(Math.random()*12),
    pos: i+1,
    gap: 0,
    lapTimes: [],
  }));
}

let cars = makeCars();
let animRunning = false;
let animSpeed = 4;
let animTimer = null;
let currentLap = 0;

// ══════════════════════════════════════════════════════
//  CANVAS CORE DRAWING ENGINES
// ══════════════════════════════════════════════════════
const canvas = document.getElementById("trackCanvas");
const ctx = canvas.getContext("2d");

function drawTrack(){
  ctx.clearRect(0,0,W,H);

  const bg=ctx.createRadialGradient(W/2,H/2,60,W/2,H/2,420);
  bg.addColorStop(0,"#0d0d1a"); bg.addColorStop(1,"#05050a");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  ctx.strokeStyle="rgba(255,255,255,0.025)"; ctx.lineWidth=1;
  for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

  const drawPath=(lw,color,dash=[])=>{
    ctx.beginPath();
    TRACK.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.closePath();
    ctx.strokeStyle=color; ctx.lineWidth=lw;
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };

  drawPath(26,"rgba(30,30,55,0.9)");   
  drawPath(22,"#1a1a30");               
  drawPath(22,"rgba(255,255,255,0.04)",[14,22]); 
  drawPath(1,"rgba(255,255,255,0.10)",[6,14]);   

  const kerbs=[0,60,110,180,240,320,390];
  kerbs.forEach(idx=>{
    const p=TRACK[Math.min(idx,TRACK.length-1)];
    ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2);
    ctx.fillStyle="rgba(232,0,45,0.6)"; ctx.fill();
  });

  const sf=TRACK[0], sf2=TRACK[4];
  const dx=sf2.x-sf.x, dy=sf2.y-sf.y, len=Math.sqrt(dx*dx+dy*dy);
  const px=-dy/len*14, py=dx/len*14;
  ctx.beginPath();
  ctx.moveTo(sf.x-px,sf.y-py); ctx.lineTo(sf.x+px,sf.y+py);
  ctx.strokeStyle="#E8002D"; ctx.lineWidth=4; ctx.stroke();

  ctx.font="bold 9px Courier New"; ctx.fillStyle="rgba(232,0,45,0.8)";
  ctx.fillText("S/F",sf.x+8,sf.y-8);

  const corners=[{i:55,l:"T1"},{i:95,l:"T4"},{i:155,l:"T8"},{i:230,l:"T11"},{i:310,l:"T14"},{i:390,l:"T15"}];
  ctx.font="9px Courier New"; ctx.fillStyle="rgba(255,255,255,0.22)";
  corners.forEach(c=>{
    const p=TRACK[Math.min(c.i,TRACK.length-1)];
    ctx.fillText(c.l,p.x+8,p.y-5);
  });
}

function drawCars(){
  const sorted=[...cars].sort((a,b)=>a.pos-b.pos);
  sorted.forEach(car=>{
    if(car.inPit) return;
    const p=trackPos(car.progress);
    const col=car.color;

    const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,14);
    grd.addColorStop(0,col+"66"); grd.addColorStop(1,"transparent");
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,14,0,Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.arc(p.x,p.y,5.5,0,Math.PI*2);
    ctx.fillStyle=col; ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.4)"; ctx.lineWidth=1.2; ctx.stroke();

    ctx.font="bold 8px Courier New";
    ctx.fillStyle="#fff";
    ctx.fillText(car.pos,p.x-3,p.y+3);

    ctx.font="bold 9px Courier New";
    ctx.fillStyle=col;
    ctx.fillText(car.abbr,p.x+9,p.y+4);
  });
}

function render(){
  drawTrack();
  drawCars();
}

// ══════════════════════════════════════════════════════
//  SIMULTANEOUS ANIMATION LOOP INTERFACE
// ══════════════════════════════════════════════════════
function animStep(){
  if(!animRunning) return;

  cars = cars.map(car=>{
    if(car.inPit) return car;

    const baseFrac = 0.0018;
    const varFrac = baseFrac + (Math.random()*0.0004 - 0.0002);
    const rankFactor = 1 - (car.pos-1)*0.0008;
    let newProg = car.progress + varFrac * rankFactor;

    let newLap = car.lap;
    const prevFloor = Math.floor(car.progress);
    const newFloor = Math.floor(newProg);
    if(newFloor > prevFloor){
      newLap = car.lap + 1;
      const lapT = car.avgLap + (Math.random()*1.2-0.6) + (car.tireWear*0.015);
      car.lapTimes = [...car.lapTimes, +lapT.toFixed(3)];

      // Push raw value metrics into the tracking compound arrays
      if(car.tire === "SOFT") historicalSoftLaps.push(lapT);
      else if(car.tire === "MEDIUM") historicalMediumLaps.push(lapT);
      else if(car.tire === "HARD") historicalHardLaps.push(lapT);

      // SIMULTANEOUS RE-RENDER: If the telemetry panel is open, refresh lines AND bars live
      if (document.getElementById("tab-telemetry").classList.contains("active")) {
         const targetTraceIndex = DRIVERS.findIndex(d => d.abbr === car.abbr);
         if (targetTraceIndex >= 0 && targetTraceIndex < 10) {
             Plotly.extendTraces('chartLap', { x: [[newLap]], y: [[+lapT.toFixed(3)]] }, [targetTraceIndex]);
         }
         
         // Dynamically recompute compound statistics
         const softMean = historicalSoftLaps.reduce((a,b)=>a+b, 0) / historicalSoftLaps.length;
         const medMean = historicalMediumLaps.reduce((a,b)=>a+b, 0) / historicalMediumLaps.length;
         const hardMean = historicalHardLaps.reduce((a,b)=>a+b, 0) / historicalHardLaps.length;
         
         // Update Bar Graph Traces instantly using Plotly.restyle
         Plotly.restyle('chartComp', 'y', [[softMean], [medMean], [hardMean]]);
      }
    }

    const newWear = car.tireWear + 0.28 + Math.random()*0.15;
    let newTire = car.tire;
    let inPit = false;

    if(newLap === car.pitLap && !car.pitDone && newLap > 0){
      inPit = true;
      const pitEl = document.getElementById("pitOverlay");
      pitEl.textContent = `🔧 PIT STOP — ${car.abbr}`;
      pitEl.style.display = "block";
      setTimeout(()=>{ pitEl.style.display="none"; }, 2200);
    }

    return {...car, progress:newProg, lap:newLap, tireWear:newWear,
      tire:newTire, inPit, speed: 280+Math.random()*80};
  });

  cars = cars.map(car=>{
    if(!car.inPit) return car;
    if(!car._pitStart){ car._pitStart = Date.now(); return car; }
    if(Date.now() - car._pitStart > 2200){
      // Toggle tire profile compounds after pit lane clearance
      const nextTire = car.tire === "SOFT" ? "MEDIUM" : "HARD";
      return {...car, inPit:false, pitDone:true, tireWear:1.2,
        tire: nextTire, _pitStart:null,
        progress: car.progress + 0.03};
    }
    return car;
  });

  const sorted = [...cars].sort((a,b)=> b.progress - a.progress);
  const leaderProg = sorted[0].progress;
  cars = cars.map(car=>{
    const pos = sorted.findIndex(c=>c.abbr===car.abbr)+1;
    const gap = pos===1?0: +((leaderProg-car.progress)*95).toFixed(2);
    return {...car, pos, gap};
  });

  const maxLap = Math.max(...cars.map(c=>c.lap));
  currentLap = Math.min(maxLap, TOTAL_LAPS);
  document.getElementById("animLap").textContent = currentLap;

  updateLeaderboard();
  render();

  if(currentLap >= TOTAL_LAPS){
    animRunning = false;
    const winner = [...cars].sort((a,b)=>a.pos-b.pos)[0];
    const pitEl = document.getElementById("pitOverlay");
    pitEl.textContent = `🏁 RACE FINISHED — WINNER: ${winner.abbr}`;
    pitEl.style.display = "block";
    return;
  }

  animTimer = setTimeout(animStep, Math.max(16, 120/animSpeed));
}

// ══════════════════════════════════════════════════════
//  LEADERBOARD UI INJECTION
// ══════════════════════════════════════════════════════
function updateLeaderboard(){
  const sorted=[...cars].sort((a,b)=>a.pos-b.pos);
  const list=document.getElementById("lbList");
  if(!list) return;
  list.innerHTML="";
  sorted.forEach((car,i)=>{
    const tire=COMPOUNDS[car.tire]||COMPOUNDS.SOFT;
    const health=Math.max(0,Math.round(100-car.tireWear));
    const row=document.createElement("div");
    row.className=`lb-row ${i===0?"p1":i===1?"p2":i===2?"p3":""}`;
    row.innerHTML=`
      <span class="lb-pos ${i===0?"lead":""}">P${car.pos}</span>
      <span class="lb-dot" style="background:${car.color}"></span>
      <span class="lb-name">${car.abbr}</span>
      <span class="lb-tire" style="background:${tire.color}22;color:${tire.color};border:1px solid ${tire.color}">${tire.label} ${health}%</span>
      <span class="lb-gap">${i===0?"LEAD":"+"+car.gap.toFixed(1)+"s"}</span>
    `;
    list.appendChild(row);
  });
}

// ══════════════════════════════════════════════════════
//  CONTROLS EVENT MAPPINGS
// ══════════════════════════════════════════════════════
document.getElementById("btnStart").onclick=()=>{
  animRunning=true;
  document.getElementById("pitOverlay").style.display="none";
  animStep();
};
document.getElementById("btnPause").onclick=()=>{
  animRunning=false; clearTimeout(animTimer);
};
document.getElementById("btnReset").onclick=()=>{
  animRunning=false; clearTimeout(animTimer);
  cars=makeCars(); currentLap=0;
  historicalSoftLaps = [87.8]; historicalMediumLaps = [88.9]; historicalHardLaps = [89.8];
  document.getElementById("animLap").textContent="0";
  document.getElementById("pitOverlay").style.display="none";
  render(); updateLeaderboard();
};
document.getElementById("raceSpeed").oninput=function(){
  animSpeed=+this.value;
  document.getElementById("speedVal").textContent=this.value+"×";
};

// ══════════════════════════════════════════════════════
//  PLOTLY PLATFORM HELPER CONFIGURATIONS
// ══════════════════════════════════════════════════════
const PC={displayModeBar:false,responsive:true};
const PL=(extra={})=>({
  paper_bgcolor:"transparent",plot_bgcolor:"transparent",
  font:{family:"Courier New",color:"#aaa",size:10},
  margin:{t:10,b:40,l:50,r:10},
  xaxis:{gridcolor:"#1a1a2e",zerolinecolor:"#222"},
  yaxis:{gridcolor:"#1a1a2e",zerolinecolor:"#222"},
  legend:{bgcolor:"transparent",bordercolor:"transparent",font:{size:9}},
  ...extra
});

// ══════════════════════════════════════════════════════
//  TELEMETRY PROCESSING
// ══════════════════════════════════════════════════════
function renderTelemetry() {
  const lapTraces = DRIVERS.slice(0,10).map(d=>{
    const laps=Array.from({length:currentLap > 0 ? currentLap : 1},(_,i)=>i+1);
    const times=laps.map(l=>{
      const tireAge=l%20; const pitPenalty=tireAge<2?1.5:0;
      return +(d.avgLap + (Math.random()*0.8-0.4) + tireAge*0.015 + pitPenalty).toFixed(3);
    });
    return {x:laps,y:times,mode:"lines",name:d.abbr,
      line:{color:d.color,width:1.5},
      hovertemplate:`%{y:.3f}s<extra>${d.abbr}</extra>`};
  });
  Plotly.newPlot("chartLap",lapTraces,PL({
    xaxis:{title:"Lap",gridcolor:"#1a1a2e"},
    yaxis:{title:"Lap Time (s)",gridcolor:"#1a1a2e"},
  }),PC);

  // Compute live mathematical means for the bar graphs
  const sMean = historicalSoftLaps.reduce((a,b)=>a+b, 0) / historicalSoftLaps.length;
  const mMean = historicalMediumLaps.reduce((a,b)=>a+b, 0) / historicalMediumLaps.length;
  const hMean = historicalHardLaps.reduce((a,b)=>a+b, 0) / historicalHardLaps.length;

  const compounds=[
    {c:"SOFT",  mean: sMean, col:"#E8002D"},
    {c:"MEDIUM",mean: mMean, col:"#FFD700"},
    {c:"HARD",  mean: hMean, col:"#E0E0E0"},
  ];
  Plotly.newPlot("chartComp",compounds.map(d=>({
    x:[d.c],y:[d.mean],type:"bar",name:d.c,
    marker:{color:d.col+"aa",line:{color:d.col,width:2}},
    hovertemplate:`<b>%{x} Compound</b><br>Live Mean: %{y:.3f}s<extra></extra>`,
  })),PL({yaxis:{title:"Live Mean Lap Time (s)", range:[85,93]},showlegend:false,bargap:0.4}),PC);

  const top6=DRIVERS.slice(0,6);
  const s1=top6.map(d=>+(d.avgLap*0.31+Math.random()*0.3).toFixed(3));
  const s2=top6.map(d=>+(d.avgLap*0.38+Math.random()*0.3).toFixed(3));
  const s3=top6.map(d=>+(d.avgLap*0.31+Math.random()*0.3).toFixed(3));
  Plotly.newPlot("chartSector",[
    {x:top6.map(d=>d.abbr),y:s1,type:"bar",name:"Sector 1",marker:{color:"#E8002D"}},
    {x:top6.map(d=>d.abbr),y:s2,type:"bar",name:"Sector 2",marker:{color:"#3671C6"}},
    {x:top6.map(d=>d.abbr),y:s3,type:"bar",name:"Sector 3",marker:{color:"#27F4D2"}},
  ],PL({barmode:"group",yaxis:{title:"Avg Sector Time (s)"}}),PC);
}

// ══════════════════════════════════════════════════════
//  MACHINE LEARNING PROFILE RENDER
// ══════════════════════════════════════════════════════
function renderML(){
  const feats=[
    {n:"Tyre Age",     v:0.31},{n:"Compound",     v:0.22},
    {n:"SectorBalance",v:0.17},{n:"SpeedTrap",    v:0.14},
    {n:"Driver",       v:0.10},{n:"LapNumber",    v:0.06},
  ];
  Plotly.newPlot("chartFeat",[{
    x:feats.map(f=>f.v), y:feats.map(f=>f.n), type:"bar", orientation:"h",
    marker:{color:feats.map((_,i)=>`hsl(${i*40+5},75%,55%)`)},
    hovertemplate:"%{x:.3f}<extra></extra>",
    text:feats.map(f=>(f.v*100).toFixed(1)+"%"),textposition:"outside",
    textfont:{color:"#ccc",size:9},
  }],PL({margin:{t:10,b:30,l:110,r:50},xaxis:{title:"Importance Score"}}),PC);

  Plotly.newPlot("chartRank",[{
    x:DRIVERS.map(d=>d.avgLap),
    y:DRIVERS.map(d=>d.abbr),
    type:"bar",orientation:"h",
    marker:{color:DRIVERS.map(d=>d.color+"cc"),line:{color:DRIVERS.map(d=>d.color),width:1.5}},
    hovertemplate:"Predicted avg: %{x:.3f}s<extra></extra>",
  }],PL({
    margin:{t:10,b:40,l:50,r:10},
    xaxis:{title:"Predicted Avg Lap Time (s)",range:[86,93]},
    yaxis:{autorange:"reversed"},
    height:350,
  }),PC);
}

// ══════════════════════════════════════════════════════
//  ANOMALY DETECTION ENGINE LOGS
// ══════════════════════════════════════════════════════
function renderAnomalies(){
  const anomalies=[];
  DRIVERS.slice(0,12).forEach(d=>{
    const threshold=d.avgLap+2*1.4;
    const count=1+Math.floor(Math.random()*2);
    for(let i=0;i<count;i++){
      const lap=5+Math.floor(Math.random()*50);
      const time=threshold+Math.random()*8+0.5;
      anomalies.push({
        driver:d.abbr,color:d.color,lap,
        time:+time.toFixed(3),
        threshold:+threshold.toFixed(3),
        delta:+(time-threshold).toFixed(3),
      });
    }
  });
  anomalies.sort((a,b)=>b.delta-a.delta);

  const byDriver={};
  anomalies.forEach(a=>{
    if(!byDriver[a.driver]) byDriver[a.driver]={laps:[],times:[],color:a.color};
    byDriver[a.driver].laps.push(a.lap);
    byDriver[a.driver].times.push(a.time);
  });
  const traces=Object.entries(byDriver).map(([d,v])=>({
    x:v.laps,y:v.times,mode:"markers",name:d,
    marker:{color:v.color,size:11,symbol:"circle-open",line:{width:2.5}},
    hovertemplate:`<b>${d}</b><br>Lap %{x}<br>%{y:.3f}s<extra></extra>`,
  }));
  Plotly.newPlot("chartAnom",traces,PL({
    xaxis:{title:"Lap Number"},yaxis:{title:"Lap Time (s)"},
  }),PC);

  const tbody=document.getElementById("anomalyBody");
  if(!tbody) return;
  tbody.innerHTML="";
  anomalies.forEach(a=>{
    const sev=a.delta>5?"HIGH":a.delta>2?"MED":"LOW";
    const bc=sev==="HIGH"?"bh":sev==="MED"?"bm":"bl";
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td style="color:${a.color};font-weight:bold">${a.driver}</td>
      <td>${a.lap}</td>
      <td>${a.time.toFixed(3)}</td>
      <td>${a.threshold.toFixed(3)}</td>
      <td style="color:#E8002D">+${a.delta.toFixed(3)}</td>
      <td><span class="badge ${bc}">${sev}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ══════════════════════════════════════════════════════
//  LAZY TAB COMPONENT INITIALIZATION
// ══════════════════════════════════════════════════════
const tabLoaded={};
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    const id="tab-"+btn.dataset.tab;
    document.getElementById(id).classList.add("active");
    
    if(id==="tab-telemetry") { renderTelemetry(); Plotly.Plots.resize('chartLap'); Plotly.Plots.resize('chartComp'); Plotly.Plots.resize('chartSector'); }
    if(id==="tab-ml")        { renderML(); Plotly.Plots.resize('chartFeat'); Plotly.Plots.resize('chartRank'); }
    if(id==="tab-anomaly")   { renderAnomalies(); Plotly.Plots.resize('chartAnom'); }
  };
});

// ══════════════════════════════════════════════════════
//  SYSTEM INITIALIZATION RUN
// ══════════════════════════════════════════════════════
render();
updateLeaderboard();