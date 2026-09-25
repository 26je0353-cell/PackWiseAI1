import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Search, ArrowRight, Check, ChevronLeft, Sparkles, Scale, Database, FileText, Leaf, ShieldCheck} from "lucide-react";
import "./styles.css";

const API="http://127.0.0.1:8000";

function App(){
  const [page,setPage]=useState("home");
  const [materials,setMaterials]=useState([]);
  const [recommendations,setRecommendations]=useState([]);
  const [selected,setSelected]=useState([]);
  const [loading,setLoading]=useState(false);
  const [query,setQuery]=useState("");
  const [form,setForm]=useState({
    food:"Potato Chips",category:"Snack",moisture_sensitivity:5,oxygen_sensitivity:5,
    light_sensitivity:4,fat_content:5,temperature:25,humidity:60,shelf_life:6,
    cost_priority:3,sustainability_priority:3
  });

  useEffect(()=>{fetch(API+"/materials").then(r=>r.json()).then(setMaterials).catch(()=>setMaterials([]))},[]);

  const recommend=async()=>{
    setLoading(true);
    try{
      const r=await fetch(API+"/recommend",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await r.json(); setRecommendations(d.recommendations||[]); setSelected([]); setPage("recommend");
    }catch(e){alert("Backend not running. Start FastAPI first.");}
    setLoading(false);
  };

  const toggle=(id)=>{
    setSelected(s=>s.includes(id)?s.filter(x=>x!==id):s.length<3?[...s,id]:s);
  };

  const nav=(p)=>setPage(p);

  return <div className="app">
    <header>
      <div className="brand" onClick={()=>nav("home")}><div className="logo">P</div><div><b>PackWise</b><span>AI</span><small>Smart Packaging Intelligence</small></div></div>
      <nav>
        <button onClick={()=>nav("home")}>Home</button>
        <button onClick={()=>nav("input")}>Get Recommendation</button>
        <button onClick={()=>nav("materials")}>Materials</button>
        {recommendations.length>0 && <button onClick={()=>nav("compare")}>Compare</button>}
      </nav>
    </header>

    {page==="home" && <Home go={nav}/>}
    {page==="input" && <Input form={form} setForm={setForm} onBack={()=>nav("home")} onAnalyze={recommend} loading={loading}/>}
    {page==="recommend" && <Recommend recs={recommendations} selected={selected} toggle={toggle} go={nav}/>}
    {page==="compare" && <Compare recs={recommendations.filter(r=>selected.includes(r.material_id))} all={recommendations} selected={selected} toggle={toggle}/>}
    {page==="materials" && <Materials materials={materials} query={query} setQuery={setQuery}/>}
    {page==="report" && <Report recs={recommendations} form={form}/>}
  </div>
}

function Home({go}){
 return <main>
   <section className="hero">
    <div className="pill"><Sparkles size={15}/> Explainable AI for Food Packaging</div>
    <h1>Smarter Packaging.<br/><em>Better Food Protection.</em></h1>
    <p>PackWise AI helps food manufacturers identify suitable packaging materials using food properties, storage conditions, shelf life, cost and sustainability priorities.</p>
    <div className="actions"><button className="primary" onClick={()=>go("input")}>Get Recommendation <ArrowRight size={18}/></button><button className="secondary" onClick={()=>go("materials")}>Explore Materials</button></div>
    <div className="stats"><div><strong>3</strong><span>Recommendations</span></div><div><strong>7+</strong><span>Material properties</span></div><div><strong>Explainable</strong><span>Decision support</span></div></div>
   </section>
   <section className="featureGrid">
    <Feature icon={<Sparkles/>} title="Explainable AI" text="See why each material matches your requirements."/>
    <Feature icon={<Scale/>} title="Compare Options" text="Select 2 or all 3 recommendations for side-by-side comparison."/>
    <Feature icon={<Leaf/>} title="Sustainability" text="Include sustainability and cost priorities in your decision."/>
    <Feature icon={<ShieldCheck/>} title="Food Protection" text="Evaluate moisture, oxygen and light barrier requirements."/>
   </section>
   <section className="how"><div><span className="eyebrow">HOW IT WORKS</span><h2>From food characteristics to packaging decisions.</h2></div>
   <div className="steps"><Step n="01" t="Describe Food" d="Enter commodity and key sensitivity parameters."/><Step n="02" t="Analyze" d="The transparent recommendation engine scores candidate materials."/><Step n="03" t="Compare" d="Compare the top 3 options before making a packaging decision."/><Step n="04" t="Report" d="Use the generated recommendation summary for your project workflow."/></div></section>
 </main>
}
function Feature({icon,title,text}){return <div className="card feature"><div className="icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function Step({n,t,d}){return <div className="step"><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></div>}

function Input({form,setForm,onBack,onAnalyze,loading}){
 const set=(k,v)=>setForm({...form,[k]:v});
 const Slider=({label,k,min=1,max=5})=><label className="slider"><div><span>{label}</span><b>{form[k]}/5</b></div><input type="range" min={min} max={max} value={form[k]} onChange={e=>set(k,+e.target.value)}/></label>;
 return <main className="page"><button className="back" onClick={onBack}><ChevronLeft size={18}/> Back</button><div className="pageHead"><span className="eyebrow">PACKAGING ANALYSIS</span><h1>Tell us about your food.</h1><p>These inputs drive the explainable recommendation engine.</p></div>
 <div className="formGrid"><section className="card form">
   <h2>Food profile</h2>
   <label>Food commodity<input value={form.food} onChange={e=>set("food",e.target.value)}/></label>
   <label>Category<select value={form.category} onChange={e=>set("category",e.target.value)}>{["Snack","Bakery","Dairy","Beverage","Grain","Processed","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
   <div className="two"><label>Storage temperature (°C)<input type="number" value={form.temperature} onChange={e=>set("temperature",+e.target.value)}/></label><label>Relative humidity (%)<input type="number" value={form.humidity} onChange={e=>set("humidity",+e.target.value)}/></label></div>
   <div className="two"><label>Required shelf life (months)<input type="number" value={form.shelf_life} onChange={e=>set("shelf_life",+e.target.value)}/></label><Slider label="Fat content" k="fat_content"/></div>
 </section>
 <section className="card form"><h2>Protection priorities</h2><Slider label="Moisture sensitivity" k="moisture_sensitivity"/><Slider label="Oxygen sensitivity" k="oxygen_sensitivity"/><Slider label="Light sensitivity" k="light_sensitivity"/>
 <div className="priority"><label>Cost priority <select value={form.cost_priority} onChange={e=>set("cost_priority",+e.target.value)}><option value="1">Low</option><option value="3">Medium</option><option value="5">High</option></select></label><label>Sustainability priority <select value={form.sustainability_priority} onChange={e=>set("sustainability_priority",+e.target.value)}><option value="1">Low</option><option value="3">Medium</option><option value="5">High</option></select></label></div>
 <button className="primary wide" onClick={onAnalyze} disabled={loading}>{loading?"Analyzing...":"Analyze Packaging"} <ArrowRight size={18}/></button></section></div></main>
}

function Recommend({recs,selected,toggle,go}){
 return <main className="page"><div className="pageHead row"><div><span className="eyebrow">AI RECOMMENDATION</span><h1>Your top 3 packaging options.</h1><p>Ranked using the current prototype's transparent scoring model.</p></div><button className="secondary" onClick={()=>go("input")}>Change Inputs</button></div>
 <div className="notice"><Sparkles size={18}/><span><b>Explainable result:</b> Scores are prototype decision-support values, not laboratory validation.</span></div>
 <div className="recGrid">{recs.map((r,i)=><RecommendationCard key={r.material_id} r={r} rank={i+1} selected={selected.includes(r.material_id)} toggle={toggle}/>)}</div>
 <div className="bottomBar"><span>{selected.length} selected for comparison</span><div><button className="secondary" onClick={()=>go("report")}>View Report</button><button className="primary" disabled={selected.length<2} onClick={()=>go("compare")}>Compare Selected <Scale size={18}/></button></div></div>
 </main>
}
function RecommendationCard({r,rank,selected,toggle}){
 return <article className={"card rec "+(selected?"selected":"")}><div className="rank">0{rank}</div><div className="score">{r.compatibility_score}<small>/100</small></div><h2>{r.short_name}</h2><p className="muted">{r.description}</p><div className="tags">{r.applications.map(a=><span key={a}>{a}</span>)}</div><div className="reason"><b>Why it fits</b>{r.reasons.map(x=><div key={x}><Check size={15}/>{x}</div>)}</div><div className="metrics">{Object.entries(r.properties).slice(0,6).map(([k,v])=><div key={k}><span>{k.replaceAll("_"," ")}</span><b>{v}/5</b></div>)}</div><button className={selected?"select active":"select"} onClick={()=>toggle(r.material_id)}>{selected?<><Check size={16}/> Selected</>:<>Select to Compare</>}</button></article>
}

function Compare({recs,all,selected,toggle}){
 const show=recs.length>=2?recs:all.filter(r=>selected.includes(r.material_id));
 const props=[["oxygen_barrier","Oxygen barrier"],["moisture_barrier","Moisture barrier"],["light_barrier","Light barrier"],["mechanical_strength","Mechanical strength"],["heat_resistance","Heat resistance"],["cost","Cost"],["sustainability","Sustainability"]];
 return <main className="page"><div className="pageHead"><span className="eyebrow">SIDE-BY-SIDE</span><h1>Compare packaging materials.</h1><p>Select 2 or all 3 recommendations above to compare them.</p></div>
 <div className="compareSelect">{all.map(r=><button key={r.material_id} className={selected.includes(r.material_id)?"chip active":"chip"} onClick={()=>toggle(r.material_id)}>{selected.includes(r.material_id)&&<Check size={14}/>} {r.short_name}</button>)}</div>
 {show.length<2?<div className="empty card">Select at least 2 materials.</div>:<div className="tableWrap card"><table><thead><tr><th>Property</th>{show.map(r=><th key={r.material_id}>{r.short_name}<small>{r.compatibility_score}/100</small></th>)}</tr></thead><tbody>{props.map(([k,l])=><tr key={k}><td>{l}</td>{show.map(r=><td key={r.material_id}><b>{r.properties[k]}/5</b></td>)}</tr>)}<tr><td>Applications</td>{show.map(r=><td key={r.material_id}>{r.applications.join(", ")}</td>)}</tr><tr><td>Advantages</td>{show.map(r=><td key={r.material_id}>{r.advantages.join(" • ")}</td>)}</tr><tr><td>Limitations</td>{show.map(r=><td key={r.material_id}>{r.limitations.join(" • ")}</td>)}</tr></tbody></table></div>}
 </main>
}

function Materials({materials,query,setQuery}){
 const filtered=materials.filter(m=>(m.name+" "+m.applications.join(" ")).toLowerCase().includes(query.toLowerCase()));
 return <main className="page"><div className="pageHead"><span className="eyebrow">MATERIAL EXPLORER</span><h1>Explore packaging materials.</h1><p>Review the material knowledge base used by the prototype.</p></div><div className="search"><Search size={19}/><input placeholder="Search materials or applications..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="materialGrid">{filtered.map(m=><article className="card material" key={m.id}><div className="materialTop"><div className="materialIcon"><Database size={20}/></div><span>{m.short}</span></div><h2>{m.name}</h2><p>{m.description}</p><div className="tags">{m.applications.map(a=><span key={a}>{a}</span>)}</div><div className="mini"><span>O₂ {m.oxygen}/5</span><span>H₂O {m.moisture}/5</span><span>Light {m.light}/5</span><span>Strength {m.strength}/5</span></div></article>)}</div></main>
}

function Report({recs,form}){
 return <main className="page"><div className="pageHead row"><div><span className="eyebrow">REPORT</span><h1>Packaging recommendation summary.</h1><p>Project-ready summary of the current prototype analysis.</p></div><button className="primary" onClick={()=>window.print()}><FileText size={18}/> Print / Save PDF</button></div>
 <div className="report card"><div className="reportHero"><div><span>FOOD</span><h2>{form.food}</h2><p>{form.category} · {form.temperature}°C · {form.humidity}% RH · {form.shelf_life} month target</p></div><div className="reportBadge">PackWise AI</div></div>
 <h3>Top recommendations</h3>{recs.map((r,i)=><div className="reportRow" key={r.material_id}><b>0{i+1}</b><div><h3>{r.material_name}</h3><p>{r.reasons.join(" · ")}</p></div><strong>{r.compatibility_score}/100</strong></div>)}
 <div className="disclaimer">Prototype note: compatibility scores and property ratings are demonstration data for the SIH prototype. Validate food-contact compliance, barrier performance, migration, shelf-life and applicable regulations before industrial use.</div></div></main>
}

createRoot(document.getElementById("root")).render(<App/>);
