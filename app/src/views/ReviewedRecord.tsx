import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
interface Nominee {id:string;slug:string;name:string;portfolio:string;status:string;sources:{url:string;passage:string;lineStart:number;lineEnd:number}[];review:string}
interface Release {title:string;episode:string;nominees:Nominee[];review:{registerSha256:string;counts:Record<string,number>;note:string}}
export default function ReviewedRecord({mode='home'}:{mode?:string}) {
 const [data,setData]=useState<Release|null>(null);const [error,setError]=useState(false);const {idOrSlug}=useParams();
 useEffect(()=>{fetch('/data/release.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(setData).catch(()=>setError(true))},[]);
 if(!data)return <main className="doc"><h1>VETTA</h1><p role="status">{error?'The reviewed record could not be loaded. Please try again.':'Loading the reviewed record…'}</p></main>;
 const person=data.nominees.find(n=>n.slug===idOrSlug||n.id===idOrSlug);
 const withheld=['hearings','ledger','vote'].includes(mode);
 return <main className="doc">
 <section className="sec"><p className="hero-kicker">Kenya · Parliamentary vetting</p><h1>{mode==='nominee'?person?.name??'Record not found':mode==='nominees'?'The nominee register':withheld?'Source review in progress':data.title}</h1>
 <p className="standfirst">VETTA follows the public record of parliamentary vetting: who was nominated, what citizens submitted, what the committee asked, and how decisions were made.</p>
 <div className="empty" role="note"><strong>Accuracy release · 25 September 2026.</strong> The August 2024 roster has been checked against the parliamentary record. Dossier claims, hearing metrics and the wider appointment ledger are withheld while source review continues. This is not a finding about any person.</div>
 {withheld&&<p>This section is withheld from this release. <Link to="/nominees">Read the reviewed roster</Link> or <Link to="/corrections">see the correction record</Link>.</p>}
 </section>
 {!withheld&&<section className="sec"><h2>{mode==='nominee'?'Reviewed roster entry':data.episode}</h2><p>20 nominees · 19 House approvals · 1 committee rejection recommendation. The local Hansard does not separately record the rejection vote. These are historical process outcomes, not assessments of conduct.</p>
 <div className="acts-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 260px), 1fr))'}}>{(mode==='nominee'?(person?[person]:[]):data.nominees).map(n=><article className="card" key={n.id}>
 <h3><Link to={'/nominee/'+n.slug}>{n.name}</Link></h3><p>{n.portfolio}</p><p><strong>{n.status==='approved'?'Approved by the House':'Rejection recommended by committee'}</strong></p>
 {mode==='nominee'&&<><p>{n.review}</p>{Array.from(new Map(n.sources.map(s=>[s.passage,s])).values()).map((s,i)=><div key={i}><blockquote>{s.passage}</blockquote><a href={s.url} target="_blank" rel="noopener noreferrer">Read the parliamentary source</a></div>)}</>}
 </article>)}</div></section>}
 <section className="sec"><h2>Keep the record accountable</h2><p><Link to="/corrections">Corrections and review status</Link> · <Link to="/resilience">Verify or download this release</Link> · <Link to="/tips">Encrypted tips</Link> · <Link to="/support">Support the work</Link></p></section>
 </main>;
}
