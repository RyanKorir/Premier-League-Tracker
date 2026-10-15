import type {Match} from "./data";
import {TEAMS} from "./data";
export interface Row{team:string;p:number;w:number;d:number;l:number;gf:number;ga:number;gd:number;pts:number;form:string[];pos:number}
// Premier League order: points, goal difference, goals scored. (Head-to-head points / away goals and a neutral-site play-off
// only apply if the title, relegation or a European place is undecided after the final matchweek.) Remaining ties: alphabetical.
export function table(ms:Match[]):Row[]{
  const fin=ms.filter(m=>m.status==="FULL_TIME"&&m.hg!==null&&m.ag!==null).sort((a,b)=>(a.kickoff??"").localeCompare(b.kickoff??""));
  const t=new Map<string,Row>(TEAMS.map(n=>[n,{team:n,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,form:[],pos:0}]));
  for(const m of fin){
    const h=t.get(m.home),a=t.get(m.away);if(!h||!a)continue;const x=m.hg!,y=m.ag!;
    h.p++;a.p++;h.gf+=x;h.ga+=y;a.gf+=y;a.ga+=x;
    if(x>y){h.w++;a.l++;h.pts+=3;h.form.push("W");a.form.push("L")}else if(x<y){a.w++;h.l++;a.pts+=3;a.form.push("W");h.form.push("L")}else{h.d++;a.d++;h.pts++;a.pts++;h.form.push("D");a.form.push("D")}
  }
  return [...t.values()].map(r=>({...r,gd:r.gf-r.ga,form:r.form.slice(-5)})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team.localeCompare(b.team)).map((r,i)=>({...r,pos:i+1}));
}
