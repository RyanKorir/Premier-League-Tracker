import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(){
  const out=await Promise.all(["uefa.champions","eng.1","eng.2","esp.1","ger.1","ita.1","fra.1","uefa.europa","uefa.nations","eng.league_cup"].map(async sl=>{
    try{
      const r=await fetch(`https://site.api.espn.com/apis/v2/sports/soccer/${sl}/standings`,{cache:"no-store",signal:AbortSignal.timeout(8000)});
      const j=await r.json();const ch=j.children??[];
      const en=ch[0]?.standings?.entries??[];
      const notes=[...new Set(ch.flatMap((c:any)=>(c.standings?.entries??[]).map((e:any)=>e.note?.description)))];
      return {sl,status:r.status,children:ch.length,childNames:ch.slice(0,4).map((c:any)=>c.name),n:en.length,notes,e0:JSON.stringify(en[0]).slice(0,900),statNames:(en[0]?.stats??[]).map((s:any)=>s.name).join(","),keys:Object.keys(j).join(",")};
    }catch(e){return {sl,err:String(e)}}
  }));
  return NextResponse.json(out);
}
