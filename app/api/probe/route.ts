import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const maxDuration=60;
const g=async(u:string)=>{const r=await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(9000),headers:{"Accept-Language":"en"}});return {r,t:await r.text()}};
const H=["premierleague","SkySportsPremierLeague","NBCSports","ESPNFC","SuperSportTV","beINSPORTSUSA","optussport","DAZNFootball","CBSSportsGolazo","TNTSportsUK","SkySportsFootball","PremierLeagueRussia","PremierLeagueAfrica"];
export async function GET(){
  const out=await Promise.all(H.map(async h=>{
    const o:any={h};
    try{
      const p=await g(`https://www.youtube.com/@${h}`);o.page=p.r.status;
      const m=p.t.match(/"channelId":"(UC[\w-]{22})"/);if(!m)return o;o.id=m[1];
      const f=await g(`https://www.youtube.com/feeds/videos.xml?channel_id=${m[1]}`);o.rss=f.r.status;
      const es=[...f.t.matchAll(/<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g)];
      o.n=es.length;o.newest=es[0]?.[3]?.slice(0,10);
      const hl=es.filter(e=>/highlights/i.test(e[2])&&/premier league|\bPL\b/i.test(e[2]));o.pl=hl.length;
      o.sample=hl.slice(0,2).map(e=>`${e[3].slice(0,10)} ${e[2]}`.slice(0,90));
      o.avail=await Promise.all(hl.slice(0,3).map(async e=>{
        const w=await g(`https://www.youtube.com/watch?v=${e[1]}`);
        const c=w.t.match(/"availableCountries":\[([^\]]*)\]/);const l=c?c[1].replace(/"/g,"").split(",").filter(Boolean):null;
        return {id:e[1],n:l?l.length:"all",KE:l?l.includes("KE"):true,US:l?l.includes("US"):true,GB:l?l.includes("GB"):true,list:l&&l.length<=8?l:undefined};
      }));
    }catch(e){o.err=String(e).slice(0,60)}
    return o;
  }));
  return NextResponse.json(out);
}
