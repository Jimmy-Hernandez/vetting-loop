import json,hashlib,urllib.request,urllib.error,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
expected=(root/'app/dist/data/release.json').read_bytes()
results=[]
for host in ['https://vetta.agent9.dev','https://vetta-dci.pages.dev','https://vetta-ke.pages.dev']:
 for path in ['/data/release.json','/manifest.json','/manifest-event.json','/.well-known/nostr.json?name=vetta','/downloads/vetta-offline.zip','/data/episode.json','/data/divisions.json','/data/hansard-excerpts.json','/data/terry/ledger.json']:
  try:
   with urllib.request.urlopen(urllib.request.Request(host+path,headers={'User-Agent':'VETTA-release-verifier/1.0'}),timeout=20) as r:
    b=r.read();row={'host':host,'path':path,'status':r.status,'type':r.headers.get('Content-Type'),'cors':r.headers.get('Access-Control-Allow-Origin')}
    if path=='/data/release.json':row['exactReleaseMatch']=b==expected
    elif path in ['/data/episode.json','/data/divisions.json','/data/hansard-excerpts.json','/data/terry/ledger.json']:
     try:legacy=json.loads(b);row['legacyDataExcluded']=legacy.get('status')=='withheld' and not any(k in legacy for k in ['nominees','people','excerpts','divisions'])
     except:row['legacyDataExcluded']=True
    elif '?' not in path:row['sha256Match']=hashlib.sha256(b).digest()==hashlib.sha256((root/'app/dist'/path.lstrip('/')).read_bytes()).digest()
    else:row['publicKeyMatch']=json.loads(b)['names']['vetta']==json.loads((root/'app/src/publisher-config.json').read_text())['pubkey']
  except urllib.error.HTTPError as e:row={'host':host,'path':path,'status':e.code,'legacyDataExcluded':path=='/data/episode.json' and e.code in [404,410]}
  except Exception as e:row={'host':host,'path':path,'error':type(e).__name__}
  results.append(row)
(root/'qa/live-results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
