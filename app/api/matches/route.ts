import {NextResponse} from "next/server";
import {Match} from "@/lib/data";
import {fetchEspn} from "@/lib/espn";
export const dynamic="force-dynamic";
export const maxDuration=60;
let snap:{matches:Match[];at:number}|null=null; // last good snapshot (per instance)
const H={"Cache-Control":"public, s-maxage=10, stale-while-revalidate=20"};
export async function GET(){
  try{
    const matches=await fetchEspn();
    snap={matches,at:Date.now()};
    return NextResponse.json({health:"LIVE",matches,at:snap.at},{headers:H});
  }catch(e){
    const error=String((e as Error).message??e).slice(0,300);
    console.error("Provider failed:",error);
    if(snap)return NextResponse.json({health:"CACHED",...snap,error},{headers:H});
    return NextResponse.json({health:"SEED",matches:[],at:null,error},{headers:H});
  }
}
