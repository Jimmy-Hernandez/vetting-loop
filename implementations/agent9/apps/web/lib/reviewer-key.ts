/**
 * Public key of the tip reviewers. Tips are encrypted to this key in the
 * browser. The matching private key is held offline by the reviewers and is
 * never deployed. Rotate by replacing this file and redeploying.
 */
export const REVIEWER_PUBLIC_JWK: JsonWebKey = {
  "kty": "EC",
  "crv": "P-256",
  "x": "g2dO54SqjuNowwicVHF-3k38RYtFo4pvGq7qM1vImU0",
  "y": "TgJZ1zk5Bf3kEGCwdP8XPmtCo0Z8xltkcOo6-gnC-Wc"
};

/** sha256(x.y), first 80 bits. Published so readers can compare out of band. */
export const REVIEWER_FINGERPRINT = "4727 D952 06C3 BE4A 461C";
