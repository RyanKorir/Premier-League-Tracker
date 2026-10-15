"use client";
import {createContext,useCallback,useContext,useEffect,useState} from "react";
import {FALLBACK,FALLBACK_AT,Match} from "@/lib/data";
import {table,Row} from "@/lib/standings";
import Scorers from "./Scorers";

interface Vid{id:string;date:string;home:string;away:string;title:string;src:string}
const HL=createContext<{find:(m:Match)=>Vid|undefined;play:(v:Vid)=>void}>({find:()=>undefined,play:()=>{}});
function Player({v,close}:{v:Vid;close:()=>void}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={close}>
    <div className="w-full max-w-3xl" onClick={e=>e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate">{v.title}</span><button onClick={close} className="rounded bg-slate-700 px-3 py-1">Close ✕</button></div>
      <div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/></div>
      <p className="mt-2 text-xs text-slate-400">Video: {v.src} on YouTube. If it doesn't play in your region, <a className="underline" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">watch it on YouTube</a>.</p>
    </div></div>;
}

type Payload={health:"LIVE"|"CACHED"|"SEED";matches:Match[];at:number|null;error?:string};
const fmt=(iso?:string)=>iso?new Date(iso).toLocaleString(undefined,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZoneName:"short"}):"Time TBC";
const ago=(t:number|null)=>{if(!t)return "never";const s=Math.round((Date.now()-t)/1000);return s<60?`${s}s ago`:`${Math.round(s/60)} min ago`};
const isLive=(m:Match)=>m.status==="LIVE"||m.status==="HALF_TIME";
const zone=(p:number)=>p<=4?"border-emerald-400":p===5?"border-sky-400":p>=18?"border-rose-400":"border-transparent";
const FC:Record<string,string>={W:"bg-emerald-500",D:"bg-slate-500",L:"bg-rose-500"};

function MatchRow({m}:{m:Match}){
  const live=isLive(m),done=m.status==="FULL_TIME",sc=m.hg!==null,{find,play}=useContext(HL),v=done?find(m):undefined;
  return <div className={`flex items-center gap-2 py-1.5 text-sm ${live?"text-emerald-300":""}`}>
    <span className="flex-1 text-right truncate">{m.home}</span>
    <span className="num w-14 text-center font-bold">{sc?`${m.hg} – ${m.ag}`:"vs"}</span>
    <span className="flex-1 truncate">{m.away}</span>
    <span className="w-28 text-right text-xs text-slate-400">{live?`● ${m.minute??"LIVE"}`:done?"FT":m.status==="UPCOMING"?fmt(m.kickoff):m.status.replace("_"," ")}</span>
    <span className="w-24 text-right text-xs">{v&&<button onClick={()=>play(v)} className="rounded bg-violet-500 px-2 py-0.5 font-semibold text-white">▶ Highlights</button>}</span>
  </div>;
}
const Sec=({t,children}:{t:string;children:React.ReactNode})=><section className="mt-10"><h2 className="mb-3 text-xl font-bold">{t}</h2>{children}</section>;
const Card=({children}:{children:React.ReactNode})=><div className="rounded-xl bg-slate-800/60 p-4 text-sm">{children}</div>;

function Table({ms}:{ms:Match[]}){
  const rows=table(ms),has=rows.some(r=>r.p>0);
  const show:Row[]=has?rows:FALLBACK.map(([team,p,w,d,l,gf,ga,pts],i)=>({team,p,w,d,l,gf,ga,gd:gf-ga,pts,form:[],pos:i+1}));
  return <div>
    <div className="overflow-x-auto rounded-xl bg-slate-800/60 p-3"><table className="num w-full min-w-[580px] text-sm">
      <thead className="text-xs text-slate-400"><tr><th className="text-left">#</th><th className="text-left">Club</th>{["P","W","D","L","GF","GA","GD","Pts"].map(h=><th key={h} className="w-9">{h}</th>)}<th className="text-left pl-3">Form</th></tr></thead>
      <tbody>{show.map(r=><tr key={r.team} className={`border-l-4 text-center ${zone(r.pos)}`}>
        <td className="pl-2 text-left">{r.pos}</td><td className="py-1 text-left">{r.team}</td>
        <td>{r.p}</td><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd>0?`+${r.gd}`:r.gd}</td><td className="font-bold">{r.pts}</td>
        <td className="pl-3 text-left"><span className="inline-flex gap-1">{r.form.map((f,i)=><span key={i} className={`inline-block h-4 w-4 rounded text-center text-[10px] leading-4 text-white ${FC[f]}`}>{f}</span>)}</span></td></tr>)}</tbody></table></div>
    <p className="mt-2 text-xs text-slate-500">{has?"":`Live data unavailable: showing the last known table (${FALLBACK_AT}). `}Green: Champions League · Blue: Europa League (or Champions League if England earns the extra place) · Red: relegation. Colours show current position, not confirmed outcomes.</p>
  </div>;
}

function Fixtures({ms}:{ms:Match[]}){
  const [sel,setSel]=useState<number|null>(null);
  const mws=[...new Set(ms.map(m=>m.mw!))].sort((a,b)=>a-b);
  if(!mws.length)return <Card><span className="text-slate-400">No fixtures loaded yet.</span></Card>;
  const cur=mws.find(w=>ms.some(m=>m.mw===w&&(m.status==="UPCOMING"||isLive(m))))??mws[mws.length-1];
  const w=sel??cur,i=mws.indexOf(w);
  const list=ms.filter(m=>m.mw===w).sort((a,b)=>(a.kickoff??"").localeCompare(b.kickoff??""));
  const days=new Map<string,Match[]>();
  for(const m of list){const k=m.kickoff?new Date(m.kickoff).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"}):"Date TBC";days.set(k,[...(days.get(k)??[]),m])}
  return <div>
    <div className="mb-3 flex items-center gap-2 text-sm">
      <button disabled={i<=0} onClick={()=>setSel(mws[i-1])} className="rounded bg-slate-700 px-3 py-1 disabled:opacity-40">‹ Prev</button>
      <select value={w} onChange={e=>setSel(+e.target.value)} className="rounded bg-slate-700 px-2 py-1">{mws.map(x=><option key={x} value={x}>Matchweek {x}{x===cur?" (current)":""}</option>)}</select>
      <button disabled={i>=mws.length-1} onClick={()=>setSel(mws[i+1])} className="rounded bg-slate-700 px-3 py-1 disabled:opacity-40">Next ›</button>
    </div>
    {[...days].map(([d,g])=><div key={d} className="mb-3"><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-300">{d}</div><Card>{g.map(m=><MatchRow key={m.id} m={m}/>)}</Card></div>)}
    <p className="text-xs text-slate-500">Matchweeks are derived from each club's match order, so rearranged fixtures may appear in a different week from the official one.</p>
  </div>;
}

export default function Page(){
  const [d,setD]=useState<Payload|null>(null),[busy,setBusy]=useState(false),[err,setErr]=useState(false),[,tick]=useState(0),[vids,setVids]=useState<Vid[]>([]),[playing,setPlaying]=useState<Vid|null>(null);
  const load=useCallback(async(manual=false)=>{setBusy(true);try{const r=await fetch(manual?`/api/matches?t=${Date.now()}`:"/api/matches",{cache:"no-store"});if(!r.ok)throw 0;setD(await r.json());setErr(false)}catch{setErr(true)}setBusy(false)},[]);
  const live=!!d?.matches.some(isLive);
  useEffect(()=>{let on=true;const f=async()=>{try{const r=await fetch("/api/highlights");if(r.ok){const j=await r.json();if(on)setVids(j.videos)}}catch{}};f();const id=setInterval(f,300000);return()=>{on=false;clearInterval(id)}},[]);
  useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape")setPlaying(null)};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[]);
  const find=(m:Match)=>{const k=Date.parse(m.kickoff??"");return vids.find(v=>v.home===m.home&&v.away===m.away&&(isNaN(k)||Math.abs(Date.parse(v.date)-k)<4*864e5))};
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const f=()=>{if(!document.hidden)load(true)};document.addEventListener("visibilitychange",f);return()=>document.removeEventListener("visibilitychange",f)},[load]);
  useEffect(()=>{ // adaptive polling: 15s with live matches, else 30s; paused while tab hidden
    const id=setInterval(()=>{if(!document.hidden)load()},live?15000:30000);
    const t=setInterval(()=>tick(x=>x+1),10000);
    return()=>{clearInterval(id);clearInterval(t)};
  },[live,load]);

  const ms=d?.matches??[],played=ms.filter(m=>m.status==="FULL_TIME").length;
  const health=err&&!d?"ERROR":d?.health??"LOADING";
  const chip:Record<string,[string,string]>={LIVE:["text-emerald-400",`LIVE DATA · updated ${ago(d?.at??null)}`],CACHED:["text-amber-400",`CACHED · provider unavailable · last update ${ago(d?.at??null)}`],SEED:["text-sky-400","OFFLINE · showing the last known table"],ERROR:["text-rose-400","DATA ERROR · unable to retrieve data"],LOADING:["text-slate-400","Loading…"]};
  const liveNow=ms.filter(isLive);

  return <HL.Provider value={{find,play:setPlaying}}><main className="mx-auto max-w-6xl px-4 py-6">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold tracking-tight">PREMIER LEAGUE <span className="text-violet-400">2026/27</span></h1><p className="text-slate-400">Live Season Tracker</p></div>
      <div className="text-right text-sm"><div className={chip[health][0]}>● {chip[health][1]}</div>{d?.error&&health!=="LIVE"&&<div className="max-w-xs text-xs text-slate-500">{d.error}</div>}
        <button onClick={()=>load(true)} disabled={busy} className="mt-1 rounded bg-slate-700 px-3 py-1 hover:bg-slate-600 disabled:opacity-50">{busy?"Updating…":"↻ Refresh"}</button></div>
    </header>
    <p className="mt-2 text-sm text-slate-400 num">Matches played: {played} / 380 · Reigning champions: Arsenal</p>

    {!d&&!err&&<div className="mt-6 grid gap-3 sm:grid-cols-2">{[1,2,3,4].map(i=><div key={i} className="h-40 animate-pulse rounded-xl bg-slate-800/60"/>)}</div>}
    {err&&!d&&<p className="mt-6 text-rose-300">We couldn't retrieve data. Please try again.</p>}

    {d&&<>
      <Sec t="Live now">{liveNow.length?<Card>{liveNow.map(m=><MatchRow key={m.id} m={m}/>)}</Card>:<Card><span className="text-slate-400">No matches in play.</span></Card>}</Sec>
      <Sec t="League table"><Table ms={ms}/></Sec>
      <Sec t="Fixtures & results"><Fixtures ms={ms}/></Sec>
    </>}

    <Sec t="Top scorers & assisters"><Scorers/></Sec>

    <Sec t="Rules & season facts">
      <div className="grid gap-3 md:grid-cols-2">
        <Card><b>How the league works</b><p className="mt-1 text-slate-300">20 clubs play each other home and away: 38 matches each, 380 in total. Win 3 points, draw 1, loss 0. The bottom three are relegated to the EFL Championship and three clubs come up. This season Coventry City, Ipswich Town and Hull City replaced West Ham, Burnley and Wolves.</p></Card>
        <Card><b>Table order</b><p className="mt-1 text-slate-300">Points, then goal difference, then goals scored. Only if the title, relegation or a European place is still undecided after the final matchweek: head-to-head points, then head-to-head away goals, then a play-off at a neutral site (Premier League Handbook 2026/27).</p></Card>
        <Card><b>European places</b><ul className="mt-1 list-disc pl-5 text-slate-300"><li>Top 4: Champions League</li><li>5th: Europa League, or the Champions League if England earns one of the extra places for the two best-ranked associations</li><li>FA Cup winners: Europa League. If they finish in the top five, 6th place takes that spot</li></ul></Card>
        <Card><b>New this season</b><ul className="mt-1 list-disc pl-5 text-slate-300"><li>Five-second countdown for delayed throw-ins and goal-kicks (opposition gets the throw-in or a corner)</li><li>Ten seconds for a substituted player to leave the pitch</li><li>Injured players must stay off for at least one minute</li><li>VAR can overturn a clearly wrong second yellow card</li><li>Trial: if play stops for a goalkeeper injury, the team takes an outfield player off</li><li>Yellow card for hair-pulling without excessive force</li><li>No gambling sponsors on the front of match shirts</li></ul></Card>
        <Card><b>Season dates</b><ul className="mt-1 text-slate-300"><li>21 Aug 2026 – 30 May 2027 (opening and final weeks moved back a week for the World Cup)</li><li>33 weekend and 5 midweek rounds</li><li>Four international breaks, including a first-ever three-week break in late Sep–early Oct</li><li>Winter transfer window: 1 Jan – 1 Feb 2027</li></ul></Card>
        <Card><b>Champions</b><p className="mt-1 text-slate-300">Arsenal won the 2025/26 title, their first in 22 years.</p></Card>
      </div>
    </Sec>

    <footer className="mt-12 border-t border-slate-800 pt-4 text-xs text-slate-500">
      Rules and season facts: <a className="underline" href="https://www.premierleague.com/">premierleague.com</a> · Live match data: ESPN · Highlights: free official YouTube uploads, shown only where they play in your country. Not affiliated with the Premier League. Data may be delayed; cached data is labelled.
    </footer>
  </main>{playing&&<Player v={playing} close={()=>setPlaying(null)}/>}</HL.Provider>;
}
