import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';

type Point = { id: number; x: number; y: number };
const initialData: Point[] = [
  { id: 1, x: -.75, y: 0 }, { id: 2, x: -.60, y: -.40 },
  { id: 3, x: -.51, y: .02 }, { id: 4, x: -.30, y: 0 },
  { id: 5, x: -.15, y: .33 }, { id: 6, x: .15, y: .50 },
  { id: 7, x: .45, y: .50 }, { id: 8, x: .53, y: .83 },
  { id: 9, x: .85, y: .70 }, { id: 10, x: .98, y: .90 },
];
// 원점을 지나는 직선: h(x) = a*x
const predict = (x: number, a: number, b = 0) => a * x + b;
// 오차제곱합: S(a) = Σ(a*x_i - y_i)^2
const cost = (data: Point[], a: number, b = 0) =>
  data.reduce((sum, p) => sum + (predict(p.x, a, b) - p.y) ** 2, 0);
// 미분: S'(a) = 2*Σ((a*x_i - y_i)*x_i)
const gradient = (data: Point[], a: number, b: number) =>
  data.reduce((sum, p) => {
    const error = predict(p.x, a, b) - p.y;
    return { a: sum.a + 2 * error * p.x, b: sum.b + 2 * error };
  }, { a: 0, b: 0 });

const fmt = (n: number, places = 3) => (n >= 0 ? '+' : '') + n.toFixed(places);

function RegressionPlot({ data, a, b, onAdd }: { data: Point[]; a: number; b: number; onAdd: (x: number, y: number) => void }) {
  const xMin = Math.min(-1.2, ...data.map(p => p.x - .15));
  const xMax = Math.max(1.2, ...data.map(p => p.x + .15));
  const minY = Math.min(-1.3, ...data.map(p => p.y - .15), predict(xMin, a, b));
  const maxY = Math.max(1.3, ...data.map(p => p.y + .15), predict(xMax, a, b));
  const rx = (x: number) => 58 + (x - xMin) / (xMax - xMin) * 430;
  const ry = (y: number) => 344 - (y - minY) / (maxY - minY) * 288;
  const xticks = [-2, -1, 0, 1, 2].filter(t => t >= xMin && t <= xMax);
  const yticks = [-2, -1, 0, 1, 2, 3].filter(t => t >= minY && t <= maxY);
  const svgRef = useRef<SVGSVGElement>(null);
  const clickPlot = (e: MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const point = svg.createSVGPoint(); point.x = e.clientX; point.y = e.clientY;
    const matrix = svg.getScreenCTM(); if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    const x = xMin + (local.x - 58) / 430 * (xMax - xMin);
    const y = minY + (344 - local.y) / 288 * (maxY - minY);
    onAdd(Number(x.toFixed(2)), Number(y.toFixed(2)));
  };
  return <svg ref={svgRef} className="plot" viewBox="0 0 525 400" role="img" aria-label="선형회귀 데이터와 예측 직선 그래프">
    <rect x="0" y="0" width="525" height="400" fill="white" />
    {xticks.map(t => <g key={'x'+t}><line x1={rx(t)} x2={rx(t)} y1="56" y2="344" className="gridline"/><text x={rx(t)} y="363" textAnchor="middle" className="axis-tick">{t}</text></g>)}
    {yticks.map(t => <g key={'y'+t}><line x1="58" x2="488" y1={ry(t)} y2={ry(t)} className="gridline"/><text x="48" y={ry(t)+4} textAnchor="end" className="axis-tick">{t}</text></g>)}
    {xMin <= 0 && xMax >= 0 && <line x1={rx(0)} x2={rx(0)} y1="56" y2="344" className="zero-axis"/>}
    {minY <= 0 && maxY >= 0 && <line x1="58" x2="488" y1={ry(0)} y2={ry(0)} className="zero-axis"/>}
    <line x1={rx(xMin)} y1={ry(predict(xMin, a, b))} x2={rx(xMax)} y2={ry(predict(xMax, a, b))} stroke="#1984c5" strokeWidth="2.6"/>
    {data.map(p => <circle key={p.id} cx={rx(p.x)} cy={ry(p.y)} r="4" fill="#ff790f" stroke="white" strokeWidth=".6"/>)}
    <rect x="68" y="50" width="135" height="48" fill="#eee" opacity=".97"/>
    <line x1="78" y1="66" x2="106" y2="66" stroke="#1984c5" strokeWidth="2"/><text x="113" y="70" className="legend">hypothesis</text>
    <circle cx="91" cy="83" r="3.4" fill="#ff790f"/><text x="113" y="87" className="legend">data</text>
    <text x="273" y="390" textAnchor="middle" className="axis-label">X Axis</text>
    <text x="18" y="204" textAnchor="middle" transform="rotate(-90 18 204)" className="axis-label">Y Axis</text>
    <rect x="58" y="56" width="430" height="288" fill="transparent" className="plot-click" onClick={clickPlot}>
      <title>그래프를 클릭하면 데이터 점이 추가돼요</title>
    </rect>
  </svg>;
}

const palette = ['#173b83','#124f98','#0968ac','#0b80b4','#399cac','#77ad95','#b0c466','#e5d044','#f3b43c','#f59931','#f1722b','#e95824','#d93320'];
function colorFor(v: number) {
  const idx = Math.min(palette.length - 1, Math.max(0, Math.floor(v / 1.15)));
  return palette[idx];
}
function ContourPlot({ data, weights }: { data: Point[]; weights: { w: number; b: number } }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [showPath, setShowPath] = useState(true);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const context = el.getContext('2d');
    if (!context) return;
    const width = el.width, height = el.height;
    const im = context.createImageData(width, height);
    const [min, max] = [-1, 1];
    for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
      const w = min + px / (width - 1) * (max - min);
      const b = max - py / (height - 1) * (max - min);
      const hex = colorFor(data.reduce((sum, p) => sum + (predict(p.x, w, b) - p.y) ** 2, 0));
      const off = (py * width + px) * 4;
      im.data[off] = parseInt(hex.slice(1,3), 16);
      im.data[off+1] = parseInt(hex.slice(3,5), 16);
      im.data[off+2] = parseInt(hex.slice(5,7), 16);
      im.data[off+3] = 255;
    }
    context.putImageData(im, 0, 0);
  }, [data]);
  const x = 43 + (weights.w + 1) / 2 * 360;
  const y = 350 - (weights.b + 1) / 2 * 290;
  return <div className="contour-container">
    <div className="contour-topline"><span>COST : {cost(data, weights.w, weights.b).toFixed(3)}</span><button className="small-link" onClick={() => setShowPath(p => !p)}>{showPath ? '현재 위치 숨기기' : '현재 위치 표시'}</button></div>
    <svg viewBox="0 0 510 410" className="plot" aria-label="가중치와 편향에 따른 비용함수 등고선">
      <foreignObject x="43" y="60" width="360" height="290"><canvas ref={canvas} width="360" height="290" style={{ width: '360px', height: '290px', display: 'block' }}/></foreignObject>
      {[-1,-.5,0,.5,1].map(t => <g key={t}><text x={43+(t+1)/2*360} y="366" textAnchor="middle" className="axis-tick">{t}</text><text x="34" y={350-(t+1)/2*290+4} textAnchor="end" className="axis-tick">{t}</text></g>)}
      <text x="223" y="393" textAnchor="middle" className="axis-label">a Axis</text>
      <text x="12" y="207" textAnchor="middle" transform="rotate(-90 12 207)" className="axis-label">b Axis</text>
      {palette.slice().reverse().map((c,i) => <rect key={i} x="422" y={68+i*21} width="26" height="21" fill={c}/>)}
      {[0,2,4,6,8,10,12,14].map(t => <text key={t} x="455" y={348-t/14*280} className="axis-tick">{t}</text>)}
      {showPath && weights.w >= -1 && weights.w <= 1 && weights.b >= -1 && weights.b <= 1 && <g><circle cx={x} cy={y} r="7" fill="none" stroke="white" strokeWidth="2.5"/><circle cx={x} cy={y} r="4" fill="#fa3b2f" stroke="white" strokeWidth="1"/></g>}
    </svg>
    <p className="helper">색상이 푸를수록 오차제곱합이 작아요. 빨간 점은 현재 (a, b)입니다.</p>
  </div>;
}

function Knob({ label, value, onChange, disabled = false }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <div className="knob-field">
    <label className="knob-label">{label}: {value.toFixed(3)}</label>
    <input aria-label={label} disabled={disabled} title={disabled ? '현재 계산식은 절편 0으로 고정됩니다.' : undefined} type="range" min="-1.5" max="1.5" step="0.001" value={value} onChange={e => onChange(Number(e.target.value))}/>
  </div>;
}

function App() {
  const [data, setData] = useState<Point[]>(initialData);
  const nextId = useRef(11);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [throughOrigin, setThroughOrigin] = useState(false);
  const [learningRate, setLearningRate] = useState(.04);
  const [steps, setSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const [addX, setAddX] = useState('0');
  const [addY, setAddY] = useState('0');
  const [showCost, setShowCost] = useState(true);
  const totalCost = useMemo(() => cost(data, a, b), [data, a, b]);
  const changeData = (id: number, field: 'x' | 'y', value: number) => setData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  const addPoint = (x: number, y: number) => { setRunning(false); setData(prev => [...prev, { id: nextId.current++, x, y }]); };
  const reset = () => { setRunning(false); setA(0); setB(0); setSteps(0); };
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const derivative = gradient(data, a, b);
      const nextA = a - learningRate * derivative.a;
      const nextB = throughOrigin ? 0 : b - learningRate * derivative.b;
      if (![nextA, nextB].every(value => Number.isFinite(value) && Math.abs(value) <= 1e6)) {
        setRunning(false);
        return;
      }
      setA(nextA);
      setB(nextB);
      setSteps(n => n+1);
    }, 90);
    return () => window.clearInterval(timer);
  }, [running, data, learningRate, a, b, throughOrigin]);
  const solve = () => {
    if (data.length === 0) return;
    const meanX = throughOrigin ? 0 : data.reduce((sum, p) => sum + p.x, 0) / data.length;
    const meanY = throughOrigin ? 0 : data.reduce((sum, p) => sum + p.y, 0) / data.length;
    const numerator = data.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
    const denominator = data.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
    setRunning(false);
    if (denominator === 0) {
      // With a free intercept, the constant mean is a least-squares solution.
      if (!throughOrigin) { setA(0); setB(meanY); }
      return;
    }
    const nextA = numerator / denominator;
    setA(nextA);
    setB(throughOrigin ? 0 : meanY - nextA * meanX);
  };
  return <div className="page">
    <main>
      <div className="graphs">
        <section className="panel"><div className="panel-title">Linear Regression</div><RegressionPlot data={data} a={a} b={b} onAdd={addPoint}/></section>
        <section className="panel"><div className="panel-title">Cost Function</div>{showCost ? <ContourPlot data={data} weights={{ w: a, b }}/> : <div className="empty-cost">Cost Function 표시가 꺼져 있습니다.</div>}</section>
      </div>
      <div className="bottom-layout">
        <aside className="controls">
          <div className="knobs"><Knob label="a" value={a} onChange={value => { setRunning(false); setA(value); }}/><Knob label="b" value={b} onChange={value => { setRunning(false); setB(value); }} disabled={throughOrigin}/></div>
          <label className="checkbox-line"><input type="checkbox" checked={throughOrigin} onChange={e => { setRunning(false); setThroughOrigin(e.target.checked); if (e.target.checked) setB(0); }}/> 원점을 지나는 직선 (b = 0)</label>
          <p className="hint">{throughOrigin ? 'h(x) = ax' : 'h(x) = ax + b'}</p>
          <label className="checkbox-line"><input type="checkbox" checked={showCost} onChange={e=>setShowCost(e.target.checked)}/> cost 표시</label>
          <label className="control-label" htmlFor="rate">Learning rate <strong>{learningRate.toFixed(3)}</strong></label>
          <input id="rate" className="full-slider" type="range" min="0.001" max="0.2" step="0.001" value={learningRate} onChange={e=>setLearningRate(Number(e.target.value))}/>
          <div className="actions"><button className="btn btn-blue" onClick={()=>setRunning(true)} disabled={running || data.length===0}>Learn</button><button className="btn btn-red" onClick={()=>setRunning(false)}>Stop</button><button className="btn btn-muted" onClick={reset}>Reset</button></div>
          <div className="stats"><span>학습 횟수: <strong>{steps}</strong></span><span>현재 비용: <strong>{totalCost.toFixed(4)}</strong></span></div>
          <button className="solve" onClick={solve}>최소제곱법으로 즉시 계산</button>
          <p className="hint">슬라이더로 기울기 a와 절편 b를 조절하세요. 그래프를 클릭해 점을 추가할 수도 있어요.</p>
        </aside>
        <section className="dataset">
          <div className="data-heading"><strong>Dataset</strong><span>{data.length}개 데이터</span></div>
          <div className="table-scroll"><table><thead><tr><th></th>{data.map((p,i)=><th key={p.id}>D{i+1}</th>)}</tr></thead><tbody>
            <tr><th className="orange">x</th>{data.map(p=><td key={p.id}><input aria-label={'x '+p.id} className="table-input orange" type="number" step="any" value={p.x} onChange={e=>changeData(p.id,'x', Number(e.target.value))}/></td>)}</tr>
            <tr><th className="orange">y</th>{data.map(p=><td key={p.id}><input aria-label={'y '+p.id} className="table-input orange" type="number" step="any" value={p.y} onChange={e=>changeData(p.id,'y', Number(e.target.value))}/></td>)}</tr>
            <tr><th className="blue">h</th>{data.map(p=><td key={p.id} className="blue">{fmt(predict(p.x,a,b))}</td>)}</tr>
            <tr><th>(h-y)^2</th>{data.map(p=><td key={p.id}>{((predict(p.x,a,b)-p.y)**2).toFixed(3)}</td>)}</tr>
            <tr><th>삭제</th>{data.map(p=><td key={p.id}><button className="delete" title="데이터 삭제" onClick={()=>{setRunning(false);setData(d=>d.filter(q=>q.id!==p.id));}}>×</button></td>)}</tr>
          </tbody></table></div>
          <div className="add-row"><span>데이터 추가</span><label>x <input type="number" step="any" value={addX} onChange={e=>setAddX(e.target.value)}/></label><label>y <input type="number" step="any" value={addY} onChange={e=>setAddY(e.target.value)}/></label><button className="btn btn-blue" disabled={!addX.trim()||!addY.trim()||!Number.isFinite(Number(addX))||!Number.isFinite(Number(addY))} onClick={()=>addPoint(Number(addX),Number(addY))}>+ 추가</button><button className="btn btn-muted" onClick={()=>{setRunning(false);setData(initialData);nextId.current=11;reset();}}>기본값 복원</button></div>
        </section>
      </div>
    </main>
    <footer>React + TypeScript · 브라우저에서 직접 계산하는 데모 · Python/FastAPI는 추후 연결 가능</footer>
  </div>;
}

export default App;
