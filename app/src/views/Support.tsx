import config from '../publisher-config.json';
export default function Support(){
 const destination=(config as {donationUrl?:string}).donationUrl;
 const enabled=destination&&/^https:\/\//.test(destination);
 return <main className="doc"><h1>Support the work</h1><p>Donations will go to a destination controlled by Caroline.</p>{enabled?<a className="btn btn-primary" href={destination} rel="noopener noreferrer" target="_blank">Donate through Caroline’s payment page</a>:<p role="status">Donations are not yet open. Caroline’s payment destination and control of that destination must be confirmed before a payment link is enabled.</p>}</main>;
}
