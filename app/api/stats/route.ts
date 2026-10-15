import {NextResponse} from "next/server";
import {getStats} from "@/lib/stats";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function GET(){
  try{return NextResponse.json(await getStats(),{headers:{"Cache-Control":"public, s-maxage=30, stale-while-revalidate=60"}})}
  catch(e){return NextResponse.json({error:String((e as Error).message)},{status:502})}
}
