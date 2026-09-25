# A pending receipt is intentionally not labeled verified.
import pathlib,json,hashlib
from opentimestamps.core.serialize import StreamDeserializationContext
from opentimestamps.core.timestamp import DetachedTimestampFile
from opentimestamps.core.notary import PendingAttestation,BitcoinBlockHeaderAttestation
root=pathlib.Path(__file__).resolve().parents[2]
dist=root/'app/dist'
with (dist/'manifest.json.ots').open('rb') as f: proof=DetachedTimestampFile.deserialize(StreamDeserializationContext(f))
assert proof.file_digest==hashlib.sha256((dist/'manifest.json').read_bytes()).digest(), 'Detached proof hashes a different manifest'
attestations=[a for _,a in proof.timestamp.all_attestations()]
record={'proofMatchesManifest':True,'calendarReceipts':sum(isinstance(a,PendingAttestation) for a in attestations),'bitcoinBlockAttestations':sum(isinstance(a,BitcoinBlockHeaderAttestation) for a in attestations),'bitcoinVerified':False}
(root/'qa/timestamp-results.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record))
