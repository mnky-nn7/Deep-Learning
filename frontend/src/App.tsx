import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react';

type Point = { id: number; x: number; y: number };
type Point3D = { id: number; x1: number; x2: number; y: number };
type Weights3D = { w1: number; w2: number; b: number };

const initialData: Point[] = [
  { id: 1, x: -.75, y: 0 }, { id: 2, x: -.60, y: -.40 }, { id: 3, x: -.51, y: .02 },
  { id: 4, x: -.30, y: 0 }, { id: 5, x: -.15, y: .33 }, { id: 6, x: .15, y: .50 },
  { id: 7, x: .45, y: .50 }, { id: 8, x: .53, y: .83 }, { id: 9, x: .85, y: .70 },
  { id: 10, x: .98, y: .90 },
];
const initial3DData: Point3D[] = [
  { id: 1, x1: -1, x2: -1, y: -1.35 }, { id: 2, x1: -1, x2: 1, y: -.45 },
  { id: 3, x1: -.5, x2: 0, y: -.38 }, { id: 4, x1: 0, x2: -1, y: -.42 },
  { id: 5, x1: 0, x2: 0, y: .18 }, { id: 6, x1: 0, x2: 1, y: .65 },
  { id: 7, x1: .5, x2: -.5, y: .48 }, { id: 8, x1: .5, x2: .5, y: .92 },
  { id: 9, x1: 1, x2: -1, y: 1.10 }, { id: 10, x1: 1, x2: 1, y: 1.78 },
];

const predict = (x: number, a: number, b = 0) => a * x + b;
const cost = (data: Point[], a: number, b = 0) => data.reduce((s, p) => s + (predict(p.x, a, b) - p.y) ** 2, 0);
const gradient = (data: Point[], a: number, b: number) => data.reduce((g, p) => {
  const error = predict(p.x, a, b) - p.y;
  return { a: g.a + 2 * error * p.x, b: g.b + 2 * error };
}, { a: 0, b: 0 });
const fmt = (n: number, places = 3) => (n >= 0 ? '+' : '') + n.toFixed(places);

function RegressionPlot({ data, a, b, onAdd }: { data: Point[]; a: number; b: number; onAdd: (x: number, y: number) => void }) {
  const xMin = Math.min(-1.2, ...data.map(p => p.x - .15)), xMax = Math.max(1.2, ...data.map(p => p.x + .15));
  const yMin = Math.min(-1.3, ...data.map(p => p.y - .15), predict(xMin, a, b));
  const yMax = Math.max(1.3, ...data.map(p => p.y + .15), predict(xMax, a, b));
  const rx = (x: number) => 58 + (x - xMin) / (xMax - xMin) * 430;
  const ry = (y: number) => 344 - (y - yMin) / (yMax - yMin) * 288;
  const svgRef = useRef<SVGSVGElement>(null);
  const clickPlot = (e: MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current, matrix = svg?.getScreenCTM(); if (!svg || !matrix) return;
    const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY;
    const local = point.matrixTransform(matrix.inverse());
    onAdd(Number((xMin + (local.x - 58) / 430 * (xMax - xMin)).toFixed(2)), Number((yMin + (344 - local.y) / 288 * (yMax - yMin)).toFixed(2)));
  };
  const xticks = [-2,-1,0,1,2].filter(t => t >= xMin && t <= xMax), yticks = [-2,-1,0,1,2,3].filter(t => t >= yMin && t <= yMax);
  return <svg ref={svgRef} className="plot" viewBox="0 0 525 400" role="img" aria-label="선형 회귀 데이터와 예측 직선">
    <rect width="525" height="400" fill="white"/>
    {xticks.map(t => <g key={'x'+t}><line x1={rx(t)} x2={rx(t)} y1="56" y2="344" className="gridline"/><text x={rx(t)} y="363" textAnchor="middle" className="axis-tick">{t}</text></g>)}
    {yticks.map(t => <g key={'y'+t}><line x1="58" x2="488" y1={ry(t)} y2={ry(t)} className="gridline"/><text x="48" y={ry(t)+4} textAnchor="end" className="axis-tick">{t}</text></g>)}
    {xMin <= 0 && xMax >= 0 && <line x1={rx(0)} x2={rx(0)} y1="56" y2="344" className="zero-axis"/>}
    {yMin <= 0 && yMax >= 0 && <line x1="58" x2="488" y1={ry(0)} y2={ry(0)} className="zero-axis"/>}
    <line x1={rx(xMin)} y1={ry(predict(xMin,a,b))} x2={rx(xMax)} y2={ry(predict(xMax,a,b))} stroke="#1984c5" strokeWidth="2.6"/>
    {data.map(p => <circle key={p.id} cx={rx(p.x)} cy={ry(p.y)} r="4" fill="#ff790f" stroke="white"/>)}
    <rect x="68" y="50" width="135" height="48" fill="#eee" opacity=".97"/><line x1="78" y1="66" x2="106" y2="66" stroke="#1984c5" strokeWidth="2"/><text x="113" y="70" className="legend">hypothesis</text><circle cx="91" cy="83" r="3.4" fill="#ff790f"/><text x="113" y="87" className="legend">data</text>
    <text x="273" y="390" textAnchor="middle" className="axis-label">X Axis</text><text x="18" y="204" textAnchor="middle" transform="rotate(-90 18 204)" className="axis-label">Y Axis</text>
    <rect x="58" y="56" width="430" height="288" fill="transparent" className="plot-click" onClick={clickPlot}><title>클릭하여 데이터 추가</title></rect>
  </svg>;
}

const palette = ['#173b83','#124f98','#0968ac','#0b80b4','#399cac','#77ad95','#b0c466','#e5d044','#f3b43c','#f59931','#f1722b','#e95824','#d93320'];
function ContourPlot({ data, a, b }: { data: Point[]; a: number; b: number }) {
  const canvas = useRef<HTMLCanvasElement>(null); const [show, setShow] = useState(true);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx || !canvas.current) return;
    const { width, height } = canvas.current, im = ctx.createImageData(width,height);
    for (let py=0; py<height; py++) for (let px=0; px<width; px++) {
      const w=-1+px/(width-1)*2, bias=1-py/(height-1)*2;
      const c=palette[Math.min(palette.length-1,Math.max(0,Math.floor(cost(data,w,bias)/1.15)))], off=(py*width+px)*4;
      im.data[off]=parseInt(c.slice(1,3),16); im.data[off+1]=parseInt(c.slice(3,5),16); im.data[off+2]=parseInt(c.slice(5,7),16); im.data[off+3]=255;
    } ctx.putImageData(im,0,0);
  }, [data]);
  const x=43+(a+1)/2*360, y=350-(b+1)/2*290;
  return <div className="contour-container"><div className="contour-topline"><span>COST : {cost(data,a,b).toFixed(3)}</span><button className="small-link" onClick={() => setShow(v=>!v)}>{show?'현재 위치 숨기기':'현재 위치 표시'}</button></div><svg viewBox="0 0 510 410" className="plot">
    <foreignObject x="43" y="60" width="360" height="290"><canvas ref={canvas} width="360" height="290" style={{width:360,height:290,display:'block'}}/></foreignObject>
    {[-1,-.5,0,.5,1].map(t=><g key={t}><text x={43+(t+1)/2*360} y="366" textAnchor="middle" className="axis-tick">{t}</text><text x="34" y={350-(t+1)/2*290+4} textAnchor="end" className="axis-tick">{t}</text></g>)}
    <text x="223" y="393" textAnchor="middle" className="axis-label">a Axis</text><text x="12" y="207" transform="rotate(-90 12 207)" className="axis-label">b Axis</text>
    {palette.slice().reverse().map((c,i)=><rect key={i} x="422" y={68+i*21} width="26" height="21" fill={c}/>)}
    {show&&a>=-1&&a<=1&&b>=-1&&b<=1&&<g><circle cx={x} cy={y} r="7" fill="none" stroke="white" strokeWidth="2.5"/><circle cx={x} cy={y} r="4" fill="#fa3b2f" stroke="white"/></g>}
  </svg><p className="helper">파란색에 가까울수록 오차제곱합이 작습니다. 빨간 점은 현재 (a, b)입니다.</p></div>;
}

function Knob({ label, value, onChange, disabled=false }: { label:string; value:number; onChange:(v:number)=>void; disabled?:boolean }) {
  return <div className="knob-field"><label className="knob-label">{label}: {value.toFixed(3)}</label><input aria-label={label} disabled={disabled} type="range" min="-1.5" max="1.5" step=".001" value={value} onChange={e=>onChange(Number(e.target.value))}/></div>;
}

const predict3D = (p: Pick<Point3D,'x1'|'x2'>, w: Weights3D) => w.w1*p.x1+w.w2*p.x2+w.b;
const cost3D = (data: Point3D[], w: Weights3D) => data.length ? data.reduce((s,p)=>s+(predict3D(p,w)-p.y)**2,0)/data.length : 0;
const gradient3D = (data: Point3D[], w: Weights3D): Weights3D => {
  if (!data.length) return {w1:0,w2:0,b:0};
  const g=data.reduce((s,p)=>{const e=predict3D(p,w)-p.y;return {w1:s.w1+e*p.x1,w2:s.w2+e*p.x2,b:s.b+e};},{w1:0,w2:0,b:0});
  return {w1:2*g.w1/data.length,w2:2*g.w2/data.length,b:2*g.b/data.length};
};

function Regression3DPlot({ data, weights, yaw, pitch, onRotate }: { data:Point3D[]; weights:Weights3D; yaw:number; pitch:number; onRotate:(yaw:number,pitch:number)=>void }) {
  const drag=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null),[dragging,setDragging]=useState(false);
  const startDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,yaw,pitch};setDragging(true)};
  const moveDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{if(!drag.current)return;const rawYaw=drag.current.yaw+(e.clientX-drag.current.x)*.55,nextYaw=((rawYaw+180)%360+360)%360-180,nextPitch=Math.max(-89,Math.min(89,drag.current.pitch-(e.clientY-drag.current.y)*.4));onRotate(nextYaw,nextPitch)};
  const endDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;setDragging(false)};
  const range=Math.max(2,Math.abs(weights.w1)+.25,Math.abs(weights.w2)+.25),size=17;
  const values=Array.from({length:size},(_,zi)=>Array.from({length:size},(_,xi)=>{
    const w1=-range+xi/(size-1)*range*2,w2=-range+zi/(size-1)*range*2;
    return {w1,w2,cost:cost3D(data,{w1,w2,b:weights.b})};
  }));
  const costs=values.flat().map(v=>v.cost),minCost=Math.min(...costs),maxCost=Math.max(...costs);
  const height=(value:number)=>Math.sqrt(Math.max(0,(value-minCost)/(maxCost-minCost||1)))*2.7;
  const yr=yaw*Math.PI/180,pr=pitch*Math.PI/180;
  const project=(w1:number,h:number,w2:number)=>{const x=w1/range*2.15,z=w2/range*2.15,y=h-1.2,rx=x*Math.cos(yr)-z*Math.sin(yr),rz=x*Math.sin(yr)+z*Math.cos(yr),ry=y*Math.cos(pr)-rz*Math.sin(pr);return{x:280+rx*74,y:238-ry*74,depth:y*Math.sin(pr)+rz*Math.cos(pr)}};
  const cells=Array.from({length:size-1},(_,zi)=>Array.from({length:size-1},(_,xi)=>{
    const raw=[values[zi][xi],values[zi][xi+1],values[zi+1][xi+1],values[zi+1][xi]],points=raw.map(v=>project(v.w1,height(v.cost),v.w2));
    return {key:`${xi}-${zi}`,points,depth:points.reduce((s,p)=>s+p.depth,0)/4,level:raw.reduce((s,v)=>s+height(v.cost),0)/(4*2.7)};
  })).flat().sort((a,b)=>b.depth-a.depth);
  const currentCost=cost3D(data,weights),current=project(weights.w1,height(currentCost),weights.w2);
  const origin=project(-range,0,-range),w1End=project(range,0,-range),w2End=project(-range,0,range),costEnd=project(-range,2.9,-range);
  return <svg className={`plot plot-3d ${dragging?'is-dragging':''}`} viewBox="0 0 560 420" role="img" aria-label="가중치에 따른 3차원 비용함수 곡면. 드래그하여 회전할 수 있습니다." onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
    <rect width="560" height="420" fill="#fbfdff"/>
    {cells.map(cell=><polygon key={cell.key} points={cell.points.map(p=>`${p.x},${p.y}`).join(' ')} fill={`hsl(${218-cell.level*38} ${76+cell.level*8}% ${35+cell.level*30}%)`} stroke="rgba(225,246,255,.34)" strokeWidth=".55"/>)}
    <line x1={origin.x} y1={origin.y} x2={w1End.x} y2={w1End.y} className="surface-axis"/><line x1={origin.x} y1={origin.y} x2={w2End.x} y2={w2End.y} className="surface-axis"/><line x1={origin.x} y1={origin.y} x2={costEnd.x} y2={costEnd.y} className="surface-axis"/>
    <text x={w1End.x+8} y={w1End.y} className="axis-label">w₁</text><text x={w2End.x+8} y={w2End.y} className="axis-label">w₂</text><text x={costEnd.x-8} y={costEnd.y-8} className="axis-label">MSE</text>
    <circle cx={current.x} cy={current.y} r="8" fill="#e9f9ff" stroke="#073e78" strokeWidth="3"><title>{`현재 위치: w₁=${weights.w1.toFixed(3)}, w₂=${weights.w2.toFixed(3)}, MSE=${currentCost.toFixed(5)}`}</title></circle>
    <g transform="translate(18 18)" className="no-pointer"><rect width="194" height="72" rx="5" fill="white" stroke="#dfe7ed"/><circle cx="14" cy="17" r="4" fill="#e9f9ff" stroke="#073e78" strokeWidth="2"/><text x="25" y="21" className="legend">현재 경사하강 위치</text><rect x="10" y="33" width="11" height="8" fill="#3299cf"/><text x="25" y="42" className="legend">비용함수 MSE 곡면</text><text x="10" y="62" className="drag-hint">↔ 마우스로 드래그하여 회전</text></g>
  </svg>;
}

function ThreeDimensionalRegression() {
  const [data,setData]=useState(initial3DData),[weights,setWeights]=useState<Weights3D>({w1:0,w2:0,b:0}),[rate,setRate]=useState(.08),[steps,setSteps]=useState(0),[running,setRunning]=useState(false);
  const [inputs,setInputs]=useState({x1:'0',x2:'0',y:'0'}),[yaw,setYaw]=useState(-38),[pitch,setPitch]=useState(28); const nextId=useRef(11); const mse=useMemo(()=>cost3D(data,weights),[data,weights]);
  useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>{setWeights(w=>{const g=gradient3D(data,w),n={w1:w.w1-rate*g.w1,w2:w.w2-rate*g.w2,b:w.b-rate*g.b};if(!Object.values(n).every(v=>Number.isFinite(v)&&Math.abs(v)<1e6)){setRunning(false);return w}return n});setSteps(n=>n+1)},80);return()=>window.clearInterval(timer)},[running,data,rate]);
  const reset=()=>{setRunning(false);setWeights({w1:0,w2:0,b:0});setSteps(0)},change=(id:number,field:'x1'|'x2'|'y',value:number)=>{setRunning(false);setData(d=>d.map(p=>p.id===id?{...p,[field]:value}:p))};
  const valid=Object.values(inputs).every(v=>v.trim()&&Number.isFinite(Number(v)));
  return <section className="three-d-section"><div className="section-heading"><div><span className="section-kicker">MULTIPLE LINEAR REGRESSION</span><h2>3차원 선형 회귀</h2><p>두 입력값 x₁, x₂로 y를 예측하고, 경사하강법으로 오차제곱평균을 최소화합니다.</p></div><div className="equation">ŷ = {weights.w1.toFixed(3)}x₁ {fmt(weights.w2)}x₂ {fmt(weights.b)}</div></div>
    <div className="three-d-grid"><div className="panel"><div className="panel-title panel-title-row"><span>3D Cost Surface</span><span>MSE {mse.toFixed(5)}</span></div><Regression3DPlot data={data} weights={weights} yaw={yaw} pitch={pitch} onRotate={(nextYaw,nextPitch)=>{setYaw(nextYaw);setPitch(nextPitch)}}/><div className="view-controls"><label>좌우 회전 <input type="range" min="-180" max="180" value={yaw} onChange={e=>setYaw(Number(e.target.value))}/></label><label>상하 각도 <input type="range" min="-89" max="89" value={pitch} onChange={e=>setPitch(Number(e.target.value))}/></label><div className="view-buttons"><button className="view-button" onClick={()=>setPitch(89)}>위에서 보기</button><button className="view-button" onClick={()=>setPitch(-89)}>아래에서 보기</button><button className="view-button" onClick={()=>{setYaw(-38);setPitch(28)}}>기본 시점</button></div></div></div>
      <aside className="controls controls-3d"><div className="weight-cards">{(['w1','w2','b'] as const).map(k=><div key={k}><span>{k==='w1'?'w₁':k==='w2'?'w₂':'b'}</span><strong>{weights[k].toFixed(4)}</strong></div>)}</div><label className="control-label" htmlFor="rate3d">Learning rate <strong>{rate.toFixed(3)}</strong></label><input id="rate3d" className="full-slider" type="range" min=".001" max=".3" step=".001" value={rate} onChange={e=>setRate(Number(e.target.value))}/><div className="actions"><button className="btn btn-blue" disabled={running||!data.length} onClick={()=>setRunning(true)}>Learn</button><button className="btn btn-red" onClick={()=>setRunning(false)}>Stop</button><button className="btn btn-muted" onClick={reset}>Reset</button></div><div className="stats stats-3d"><span>학습 횟수 <strong>{steps}</strong></span><span>데이터 <strong>{data.length}개</strong></span></div><p className="hint">곡면의 높이는 비용(MSE)입니다. 빨간 점이 경사하강법에 따라 오목한 곡면의 최저점으로 이동합니다. 절편 b는 현재 학습값으로 곡면 계산에 반영됩니다.</p></aside></div>
    <section className="dataset dataset-3d"><div className="data-heading"><strong>3D Dataset</strong><span>x₁, x₂는 입력값이고 y는 정답값입니다.</span></div><div className="table-scroll"><table><thead><tr><th></th>{data.map((p,i)=><th key={p.id}>D{i+1}</th>)}</tr></thead><tbody>{(['x1','x2','y'] as const).map(f=><tr key={f}><th className="orange">{f==='x1'?'x₁':f==='x2'?'x₂':'y'}</th>{data.map(p=><td key={p.id}><input className="table-input orange" type="number" step="any" value={p[f]} onChange={e=>change(p.id,f,Number(e.target.value))}/></td>)}</tr>)}<tr><th className="blue">ŷ</th>{data.map(p=><td key={p.id} className="blue">{predict3D(p,weights).toFixed(3)}</td>)}</tr><tr><th>(ŷ-y)²</th>{data.map(p=><td key={p.id}>{((predict3D(p,weights)-p.y)**2).toFixed(3)}</td>)}</tr><tr><th>삭제</th>{data.map(p=><td key={p.id}><button className="delete" onClick={()=>{setRunning(false);setData(d=>d.filter(q=>q.id!==p.id))}}>×</button></td>)}</tr></tbody></table></div>
      <div className="add-row"><span>3D 데이터 추가</span>{(['x1','x2','y'] as const).map(f=><label key={f}>{f==='x1'?'x₁':f==='x2'?'x₂':'y'} <input type="number" step="any" value={inputs[f]} onChange={e=>setInputs(v=>({...v,[f]:e.target.value}))}/></label>)}<button className="btn btn-blue" disabled={!valid} onClick={()=>{setRunning(false);setData(d=>[...d,{id:nextId.current++,x1:Number(inputs.x1),x2:Number(inputs.x2),y:Number(inputs.y)}])}}>+ 추가</button><button className="btn btn-muted" onClick={()=>{setData(initial3DData);nextId.current=11;reset()}}>기본값 복원</button></div></section>
  </section>;
}

function App() {
  const [data,setData]=useState(initialData),[a,setA]=useState(0),[b,setB]=useState(0),[origin,setOrigin]=useState(false),[rate,setRate]=useState(.04),[steps,setSteps]=useState(0),[running,setRunning]=useState(false),[addX,setAddX]=useState('0'),[addY,setAddY]=useState('0'),[showCost,setShowCost]=useState(true); const nextId=useRef(11),totalCost=useMemo(()=>cost(data,a,b),[data,a,b]);
  const reset=()=>{setRunning(false);setA(0);setB(0);setSteps(0)},add=(x:number,y:number)=>{setRunning(false);setData(d=>[...d,{id:nextId.current++,x,y}])},change=(id:number,f:'x'|'y',v:number)=>{setRunning(false);setData(d=>d.map(p=>p.id===id?{...p,[f]:v}:p))};
  useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>{const g=gradient(data,a,b),na=a-rate*g.a,nb=origin?0:b-rate*g.b;if(![na,nb].every(v=>Number.isFinite(v)&&Math.abs(v)<1e6)){setRunning(false);return}setA(na);setB(nb);setSteps(n=>n+1)},90);return()=>window.clearInterval(timer)},[running,data,a,b,rate,origin]);
  const solve=()=>{if(!data.length)return;const mx=origin?0:data.reduce((s,p)=>s+p.x,0)/data.length,my=origin?0:data.reduce((s,p)=>s+p.y,0)/data.length,num=data.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0),den=data.reduce((s,p)=>s+(p.x-mx)**2,0);setRunning(false);if(!den){if(!origin){setA(0);setB(my)}return}const na=num/den;setA(na);setB(origin?0:my-na*mx)};
  return <div className="page"><main><div className="graphs"><section className="panel"><div className="panel-title">Linear Regression</div><RegressionPlot data={data} a={a} b={b} onAdd={add}/></section><section className="panel"><div className="panel-title">Cost Function</div>{showCost?<ContourPlot data={data} a={a} b={b}/>:<div className="empty-cost">Cost Function 표시가 꺼져 있습니다.</div>}</section></div>
    <div className="bottom-layout"><aside className="controls"><div className="knobs"><Knob label="a" value={a} onChange={v=>{setRunning(false);setA(v)}}/><Knob label="b" value={b} onChange={v=>{setRunning(false);setB(v)}} disabled={origin}/></div><label className="checkbox-line"><input type="checkbox" checked={origin} onChange={e=>{setRunning(false);setOrigin(e.target.checked);if(e.target.checked)setB(0)}}/> 원점을 지나는 직선 (b = 0)</label><p className="hint">{origin?'h(x) = ax':'h(x) = ax + b'}</p><label className="checkbox-line"><input type="checkbox" checked={showCost} onChange={e=>setShowCost(e.target.checked)}/> cost 표시</label><label className="control-label" htmlFor="rate">Learning rate <strong>{rate.toFixed(3)}</strong></label><input id="rate" className="full-slider" type="range" min=".001" max=".2" step=".001" value={rate} onChange={e=>setRate(Number(e.target.value))}/><div className="actions"><button className="btn btn-blue" disabled={running||!data.length} onClick={()=>setRunning(true)}>Learn</button><button className="btn btn-red" onClick={()=>setRunning(false)}>Stop</button><button className="btn btn-muted" onClick={reset}>Reset</button></div><div className="stats"><span>학습 횟수: <strong>{steps}</strong></span><span>현재 비용: <strong>{totalCost.toFixed(4)}</strong></span></div><button className="solve" onClick={solve}>최소제곱법으로 즉시 계산</button><p className="hint">슬라이더로 a와 b를 조절하거나 그래프를 클릭해 점을 추가하세요.</p></aside>
      <section className="dataset"><div className="data-heading"><strong>Dataset</strong><span>{data.length}개 데이터</span></div><div className="table-scroll"><table><thead><tr><th></th>{data.map((p,i)=><th key={p.id}>D{i+1}</th>)}</tr></thead><tbody>{(['x','y'] as const).map(f=><tr key={f}><th className="orange">{f}</th>{data.map(p=><td key={p.id}><input className="table-input orange" type="number" step="any" value={p[f]} onChange={e=>change(p.id,f,Number(e.target.value))}/></td>)}</tr>)}<tr><th className="blue">h</th>{data.map(p=><td key={p.id} className="blue">{fmt(predict(p.x,a,b))}</td>)}</tr><tr><th>(h-y)²</th>{data.map(p=><td key={p.id}>{((predict(p.x,a,b)-p.y)**2).toFixed(3)}</td>)}</tr><tr><th>삭제</th>{data.map(p=><td key={p.id}><button className="delete" onClick={()=>{setRunning(false);setData(d=>d.filter(q=>q.id!==p.id))}}>×</button></td>)}</tr></tbody></table></div><div className="add-row"><span>데이터 추가</span><label>x <input type="number" step="any" value={addX} onChange={e=>setAddX(e.target.value)}/></label><label>y <input type="number" step="any" value={addY} onChange={e=>setAddY(e.target.value)}/></label><button className="btn btn-blue" disabled={!addX.trim()||!addY.trim()||!Number.isFinite(Number(addX))||!Number.isFinite(Number(addY))} onClick={()=>add(Number(addX),Number(addY))}>+ 추가</button><button className="btn btn-muted" onClick={()=>{setData(initialData);nextId.current=11;reset()}}>기본값 복원</button></div></section></div>
    <ThreeDimensionalRegression/></main><footer>React + TypeScript · 브라우저에서 직접 계산하는 데모</footer></div>;
}

export default App;
