import {TEAMS,ALIASES} from "./data";
// Free, official highlights only: found in the public YouTube RSS feed of licensed publishers and played in YouTube's
// official embedded player. Every video is checked for country availability so visitors only see highlights that play
// where they are. Add official channels to FEEDS (by @handle) to widen coverage.
const FEEDS=[{name:"Premier League",handle:"premierleague"}];
export interface Vid{id:string;date:string;home:string;away:string;title:string;src:string;countries?:string[]|null;chk?:number}
const known=new Map<string,Vid>(),chanIds=new Map<string,string>();
let at=0;
export const diag:{feeds?:Record<string,string>}={feeds:{}};
const dec=(s:string)=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");
const NAMES:[string,string][]=[...TEAMS.map(t=>[t,t] as [string,string]),...ALIASES];
function teamsIn(title:string):string[]{
  const low=title.toLowerCase(),hits:[number,string][]=[];
  for(const [a,c] of NAMES){const i=low.indexOf(a.toLowerCase());if(i>=0)hits.push([i,c])}
  hits.sort((x,y)=>x[0]-y[0]);
  return [...new Set(hits.map(h=>h[1]))].slice(0,2);
}
async function channelId(handle:string):Promise<string|undefined>{
  if(chanIds.has(handle))return chanIds.get(handle);
  const r=await fetch(`https://www.youtube.com/@${handle}`,{signal:AbortSignal.timeout(8000),cache:"no-store",headers:{"Accept-Language":"en"}});
  const m=(await r.text()).match(/"channelId":"(UC[\w-]{22})"/)||[];
  if(m[1])chanIds.set(handle,m[1]);return m[1];
}
async function avail(v:Vid){
  if(v.chk&&Date.now()-v.chk<216e5)return; // re-check every 6 hours
  try{
    const r=await fetch(`https://www.youtube.com/watch?v=${v.id}`,{signal:AbortSignal.timeout(8000),cache:"no-store",headers:{"Accept-Language":"en"}});
    const h=await r.text();
    if(!h.includes('"playabilityStatus"'))return;
    const c=h.match(/"availableCountries":\[([^\]]*)\]/);
    v.countries=c?c[1].replace(/"/g,"").split(",").filter(Boolean):null;v.chk=Date.now(); // null = no restriction; undefined = unverified (never shown)
  }catch{}
}
export async function getHighlights():Promise<Vid[]>{
  if(Date.now()-at>300000){
    at=Date.now();
    await Promise.allSettled(FEEDS.map(async f=>{
      try{
        const id=await channelId(f.handle);if(!id)throw new Error("channel not found");
        const url=`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,o={signal:AbortSignal.timeout(8000),cache:"no-store" as const};
        let r=await fetch(url,o);if(!r.ok)r=await fetch(url,{...o,signal:AbortSignal.timeout(8000)});
        if(!r.ok)throw new Error("HTTP "+r.status);
        const xml=await r.text();let n=0;
        for(const m of xml.matchAll(/<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g)){
          const title=dec(m[2]);
          if(!/highlights/i.test(title)||!/premier league/i.test(title))continue;
          const t=teamsIn(title);if(t.length<2)continue;
          n++;if(!known.has(m[1]))known.set(m[1],{id:m[1],date:m[3],home:t[0],away:t[1],title,src:f.name});
        }
        diag.feeds![f.name]=`ok, ${n} PL highlight(s) in feed`;
      }catch(e){diag.feeds![f.name]="error: "+String((e as Error).message);at=Date.now()-240000} // retry in ~1 minute
    }));
    await Promise.allSettled([...known.values()].map(avail));
  }
  return [...known.values()].sort((a,b)=>b.date.localeCompare(a.date));
}
