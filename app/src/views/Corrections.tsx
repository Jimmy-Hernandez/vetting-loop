import {useEffect,useState} from 'react';
export default function Corrections(){
 const [entries,setEntries]=useState<{date:string;action:string;reason?:string;record?:string;value?:string;source?:string;passage?:string}[]>([]);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{fetch('/data/corrections.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setEntries(d.entries)).catch(()=>setFailed(true))},[]);
 return <main className="doc"><h1>Corrections and review</h1><p>Source evidence must support both adverse and favourable claims. Unapproved material is withheld from the site, downloads and new Nostr publications.</p>
 <p>A cryptographic signature identifies the publisher. A fingerprint detects changed bytes. Neither establishes that a claim is true.</p>
 {failed&&<p role="alert">The correction history could not be loaded.</p>}
 {entries.map((e,i)=><section className="sec" key={i}><p>{e.date}</p><h2>{e.action}</h2><p>{e.reason??e.value}</p>{e.passage&&<blockquote>{e.passage}</blockquote>}{e.source&&<a href={e.source}>Primary source</a>}</section>)}
 <h2>Challenge a record</h2><p>Include the person, field, primary source, exact passage and proposed correction. The encrypted tip channel remains closed until reviewer access and recovery are verified.</p></main>;
}
