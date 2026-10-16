import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const maxDuration=60;
const B="https://site.api.espn.com/apis/site/v2/sports/soccer/";
const T:[string,string[]][]=[["eng.1",["20261010"]],["eng.2",["20261017","20261010"]],["eng.league_cup",["20260922","20260923","20260915"]],["eng.fa",["20261017","20261114","20261010"]],["esp.1",["20261010","20261011"]],["ita.1",["20261011","20261010"]],["ger.1",["20261017","20261010"]],["fra.1",["20261010","20261011"]],["uefa.champions",["20261014","20261013"]],["uefa.europa",["20261015"]],["uefa.nations",["20261010"]]];
const s=(x:any,n=160)=>JSON.stringify(x)?.slice(0,n);
export async function GET(){
  const out=await Promise.all(T.map(async([slug,dates])=>{
    for(const d of dates){
      try{
        const r=await fetch(`${B}${slug}/scoreboard?dates=${d}`,{cache:"no-store",signal:AbortSignal.timeout(8000)});
        if(!r.ok){continue}
        const j=await r.json();const ev=j.events??[];if(!ev.length)continue;
        const e=ev[0],c=e.competitions?.[0]??{};
        return {slug,d,n:ev.length,name:e.name,season:s(e.season),leagues:s((j.leagues??[]).map((l:any)=>({n:l.name,season:l.season?.displayName,slug:l.slug}))),notes:s(c.notes),type:s(c.type),group:s(c.group),leg:s(c.leg),week:s(e.week),status:e.status?.type?.name,teams:ev.slice(0,3).map((x:any)=>x.name),keys:Object.keys(c).join(",")};
      }catch(err){return {slug,err:String(err)}}
    }
    return {slug,empty:true};
  }));
  const st=await Promise.all(["uefa.champions","eng.2"].map(async sl=>{try{const r=await fetch(`https://site.api.espn.com/apis/v2/sports/soccer/${sl}/standings`,{cache:"no-store",signal:AbortSignal.timeout(8000)});const j=await r.json();const en=j.children?.[0]?.standings?.entries??[];return {sl,status:r.status,children:(j.children??[]).length,entries:en.length,sample:s(en[0]?.team?.displayName),seasonName:j.children?.[0]?.name}}catch(e){return {sl,err:String(e)}}}));
  return NextResponse.json({out,st});
}
