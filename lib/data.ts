export type Status="UPCOMING"|"LIVE"|"HALF_TIME"|"FULL_TIME"|"POSTPONED"|"CANCELLED";
export interface Match{id:string;home:string;away:string;hg:number|null;ag:number|null;status:Status;kickoff?:string;minute?:string;mw?:number;source:string}

// 2026/27 clubs: 17 retained + promoted Coventry City, Ipswich Town, Hull City (West Ham, Burnley, Wolves relegated).
export const TEAMS=["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton & Hove Albion","Chelsea","Coventry City","Crystal Palace","Everton","Fulham","Hull City","Ipswich Town","Leeds United","Liverpool","Manchester City","Manchester United","Newcastle United","Nottingham Forest","Sunderland","Tottenham Hotspur"];
export const ALIASES:[string,string][]=[["AFC Bournemouth","Bournemouth"],["Brighton and Hove Albion","Brighton & Hove Albion"],["Brighton","Brighton & Hove Albion"],["Man City","Manchester City"],["Man United","Manchester United"],["Man Utd","Manchester United"],["Newcastle","Newcastle United"],["Spurs","Tottenham Hotspur"],["Tottenham","Tottenham Hotspur"],["Nott'm Forest","Nottingham Forest"],["Forest","Nottingham Forest"],["Leeds","Leeds United"],["Hull","Hull City"],["Ipswich","Ipswich Town"],["Coventry","Coventry City"],["Palace","Crystal Palace"],["Villa","Aston Villa"]];
export const canon=(n:string)=>{const a=ALIASES.find(x=>x[0].toLowerCase()===n.toLowerCase());const c=a?a[1]:n;return TEAMS.includes(c)?c:null};

// Last known table (after matchweek 5, 20 Sep 2026, via premierleague.com) — only shown if live data is unavailable.
export const FALLBACK_AT="20 Sep 2026";
export const FALLBACK:[string,number,number,number,number,number,number,number][]=[
["Manchester City",5,5,0,0,13,5,15],["Arsenal",5,4,0,1,8,4,12],["Brighton & Hove Albion",5,3,1,1,16,5,10],["Brentford",5,2,3,0,10,4,9],["Leeds United",5,2,3,0,7,3,9],["Liverpool",5,2,3,0,7,4,9],["Everton",5,2,3,0,6,3,9],["Hull City",5,2,2,1,6,4,8],["Newcastle United",5,2,2,1,9,9,8],["Chelsea",5,2,1,2,10,12,7],["Ipswich Town",5,2,0,3,7,11,6],["Manchester United",5,1,2,2,8,8,5],["Nottingham Forest",5,1,2,2,4,5,5],["Sunderland",5,1,1,3,6,10,4],["Crystal Palace",5,1,1,3,6,11,4],["Aston Villa",5,1,1,3,4,9,4],["Bournemouth",5,0,3,2,6,8,3],["Coventry City",5,1,0,4,1,10,3],["Fulham",5,0,2,3,5,8,2],["Tottenham Hotspur",5,0,2,3,2,8,2]];
