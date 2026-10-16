import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const maxDuration=60;
const g=async(u:string)=>{const r=await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(9000),headers:{"Accept-Language":"en"}});return {r,t:await r.text()}};
const IDS:Record<string,string>={premierleague:"UCpryVRk_VDudG8SHXgWcG0w",SkySportsPremierLeague:"UCTU_wC79Dgi9rh4e9-baTqA",CBSSportsGolazo:"UCX_tjI6Q_4JD1E3234CwemA",ESPNFC:"UCiWLfSweyRNmLpgEHekhoAg"};
export async function GET(){
  const out=await Promise.all(Object.entries(IDS).map(async([h,id])=>{
    const f=await g(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    const es=[...f.t.matchAll(/<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g)];
    const hl=es.filter(e=>/highlight/i.test(e[2]));
    const av=await Promise.all(hl.slice(0,2).map(async e=>{
      const w=await g(`https://www.youtube.com/watch?v=${e[1]}`);
      const c=w.t.match(/"availableCountries":\[([^\]]*)\]/);const l=c?c[1].replace(/"/g,"").split(",").filter(Boolean):null;
      return {id:e[1],n:l?l.length:"all",KE:l?l.includes("KE"):true,US:l?l.includes("US"):true,GB:l?l.includes("GB"):true,list:l&&l.length<=8?l:undefined};
    }));
    return {h,titles:es.slice(0,10).map(e=>e[3].slice(0,10)+" "+e[2].slice(0,80)),hl:hl.length,av};
  }));
  return NextResponse.json(out);
}
