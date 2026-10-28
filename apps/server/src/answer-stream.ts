/** Keep the private follow-up block (including its partial opening fence) off screen. */
export function visibleStreamText(raw:string){
 const marker='```salesbuddy-followups';const at=raw.indexOf(marker);if(at>=0)return raw.slice(0,at).trimEnd();
 for(let n=Math.min(marker.length-1,raw.length);n>0;n--)if(raw.endsWith(marker.slice(0,n)))return raw.slice(0,-n);
 return raw;
}
