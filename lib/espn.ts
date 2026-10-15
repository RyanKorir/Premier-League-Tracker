import {Match,Status,canon} from "./data";
// Unofficial ESPN endpoint (no SLA). Queried one day at a time; days that are fully finished are never fetched again.
const BASE="https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard";
const day=864e5,ymd=(t:number)=>new Date(t).toISOString().slice(0,10).replace(/-/g,"");
const START=Date.UTC(2026,7,21),END=Date.UTC(2027,4,31);
export const store=new Map<string,any>(); // event id → latest raw event
const doneDays=new Set<string>();
async function fetchDay(d:string):Promise<any[]>{
  const r=await fetch(`${BASE}?dates=${d}`,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(8000),cache:"no-store"});
  if(!r.ok)throw new Error(`${d}: HTTP ${r.status}`);
  const j=await r.json();
  if(!Array.isArray(j.events))throw new Error(`${d}: unexpected response shape`);
  return j.events;
}
export async function fetchEspn():Promise<Match[]>{
  const now=Date.now(),last=Math.min(now+10*day,END),days:string[]=[];
  for(let t=START;t<=last;t+=day){const d=ymd(t);if(!doneDays.has(d))days.push(d)}
  const res:PromiseSettledResult<any[]>[]=[];
  for(let i=0;i<days.length;i+=12)res.push(...await Promise.allSettled(days.slice(i,i+12).map(fetchDay)));
  if(!res.some(r=>r.status==="fulfilled"))throw new Error((res[0] as PromiseRejectedResult)?.reason?.message??"ESPN unreachable");
  res.forEach((r,i)=>{
    if(r.status!=="fulfilled")return;
    for(const e of r.value)store.set(String(e.id),e);
    const d=days[i],t=Date.UTC(+d.slice(0,4),+d.slice(4,6)-1,+d.slice(6,8));
    if(t<now-2*day&&r.value.every(e=>e.status?.type?.state==="post"))doneDays.add(d);
  });
  const out:Match[]=[];
  for(const e of store.values()){
    const cs=e.competitions?.[0]?.competitors??[];
    const h=cs.find((x:any)=>x.homeAway==="home"),a=cs.find((x:any)=>x.homeAway==="away");
    const hn=canon(h?.team?.displayName??""),an=canon(a?.team?.displayName??"");
    if(!hn||!an){console.warn("Unmapped fixture",h?.team?.displayName,a?.team?.displayName);continue}
    const t=e.status?.type;let status:Status="UPCOMING";
    if(/POSTPONED/.test(t?.name))status="POSTPONED";else if(/CANCEL/.test(t?.name))status="CANCELLED";
    else if(t?.state==="in")status=t.name==="STATUS_HALFTIME"?"HALF_TIME":"LIVE";
    else if(t?.state==="post")status="FULL_TIME";
    const scored=status==="LIVE"||status==="HALF_TIME"||status==="FULL_TIME";
    out.push({id:`${hn}|${an}`,home:hn,away:an,hg:scored?Number(h.score):null,ag:scored?Number(a.score):null,status,kickoff:e.date,
      minute:status==="LIVE"?e.status?.displayClock:status==="HALF_TIME"?"HT":undefined,source:"ESPN"});
  }
  // Matchweek (derived): each team's nth league match by kick-off; a fixture takes the later of its two teams' counts.
  out.sort((a,b)=>(a.kickoff??"").localeCompare(b.kickoff??""));
  const n=new Map<string,number>();
  for(const m of out){const h=(n.get(m.home)??0)+1,a=(n.get(m.away)??0)+1;n.set(m.home,h);n.set(m.away,a);m.mw=Math.max(h,a)}
  return out;
}
