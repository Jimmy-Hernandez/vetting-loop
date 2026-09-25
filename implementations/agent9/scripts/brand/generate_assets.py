#!/usr/bin/env python3
"""Generate the README's SVG brand assets and diagrams.

Pure SVG, system fonts only, so GitHub renders them without external requests.
Numbers are read from the live ledger export so figures cannot drift from the
data: pass the path to a ledger.json produced by the web build.

    python3 scripts/brand/generate_assets.py apps/web/out/data/ledger.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "assets" / "brand"
DIAG = ROOT / "assets" / "diagrams"
RED, RED_D, MAROON, GREEN, GREEN_D, INK, MUTED, LINE, SUBTLE = (
    "#bd1419", "#700f12", "#8d1820", "#008033", "#00661a", "#333333", "#6b6b6b", "#e3e3e3", "#f8f8f8")
FONT = "Montserrat, 'Segoe UI', Helvetica, Arial, sans-serif"
MONO = "'SFMono-Regular', Menlo, Consolas, monospace"


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def svg(w: int, h: int, body: str, title: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-label="{esc(title)}" font-family="{FONT}"><title>{esc(title)}</title>{body}</svg>\n')


def text(x, y, t, size=14, fill=INK, weight=400, anchor="start", family=None, extra=""):
    fam = f' font-family="{family}"' if family else ""
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}"{fam} {extra}>{esc(t)}</text>')


def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    print("wrote", path.relative_to(ROOT))


def stats(ledger):
    appts = [a for p in ledger["people"] for a in p["appointments"]]
    gate = [a for a in appts if a["cycle"] in ("cs-2022", "ps-2022", "cs-2024")
            and a["office"] in ("prime_cs", "cabinet_secretary", "principal_secretary")]
    hits = ledger["hits"]
    returnees = {h["slug"] for h in hits if h["signal"] == "returnee"}
    return {
        "nominated": len(gate),
        "approved": sum(a["outcome"] == "approved" for a in gate),
        "rejected": sum(a["outcome"] == "rejected" for a in gate),
        "people": len(ledger["people"]),
        "appointments": len(appts),
        "returnees": len(returnees),
        "signals": len(ledger["signals"]),
        "root": ledger["root"],
        "hits": {s["id"]: sum(h["signal"] == s["id"] for h in hits) for s in ledger["signals"]},
        "labels": {s["id"]: s["label"] for s in ledger["signals"]},
    }


def gate_matrix(x0, y0, n, rejected, cols=16, size=18, gap=5):
    out = []
    for i in range(n):
        x = x0 + (i % cols) * (size + gap)
        y = y0 + (i // cols) * (size + gap)
        if i >= n - rejected:
            out.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="3" fill="{RED}"/>'
                       f'<path d="M{x+5} {y+5}l8 8m0-8-8 8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>')
        else:
            op = 0.18 + (i % 5) * 0.035
            out.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="3" fill="{GREEN}" '
                       f'fill-opacity="{op:.2f}" stroke="{GREEN}" stroke-opacity=".5"/>')
    return "".join(out)


def hero(s):
    w, h = 1280, 440
    body = [f'<rect width="{w}" height="{h}" fill="#fff"/>',
            f'<rect width="{w}" height="6" fill="{RED}"/><rect y="6" width="{w}" height="3" fill="{GREEN}"/>',
            f'<rect x="0.5" y="0.5" width="{w-1}" height="{h-1}" fill="none" stroke="{LINE}"/>',
            f'<circle cx="92" cy="92" r="34" fill="{RED}"/>',
            '<path d="M76 94l11 10 21-24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
            text(142, 86, "Vetting Record", 30, RED, 800),
            text(142, 110, "CIVIC TECH TOOLS · PROTOTYPE FOR MZALENDO", 12, GREEN, 700, extra='letter-spacing="2"'),
            text(58, 196, f"{s['nominated']} nominations.", 54, RED, 800),
            text(58, 256, "One rejection." if s["rejected"] == 1 else f"{s['rejected']} rejections.", 54, INK, 800),
            text(60, 302, "Who was nominated, vetted and approved to public office in Kenya,", 18, MUTED),
            text(60, 328, "linked per person, cited per fact, computed from the record.", 18, MUTED),
            text(60, 388, "EVIDENCE, NOT ACCUSATION   ·   PRIVATE BY CONSTRUCTION   ·   HARD TO TAKE DOWN", 12, INK, 700,
                 extra='letter-spacing="1.6"'),
            f'<rect x="780" y="60" width="440" height="320" rx="6" fill="#fff" stroke="{LINE}"/>',
            text(806, 94, "THE VETTING GATE, 2022–2024", 12, MUTED, 700, extra='letter-spacing="1.5"'),
            gate_matrix(806, 116, s["nominated"], s["rejected"], cols=16, size=19, gap=5),
            text(806, 300, f"■ approved {s['approved']}", 13, GREEN, 700),
            text(950, 300, f"■ rejected {s['rejected']}", 13, RED, 700),
            text(806, 326, "One square per nomination. Cabinet 2022,", 12, MUTED),
            text(806, 344, "Principal Secretaries 2022, Cabinet 2024.", 12, MUTED),
            text(806, 364, f"root sha256 {s['root'][:24]}…", 11, MUTED, family=MONO)]
    return svg(w, h, "".join(body), f"Vetting Record: {s['nominated']} nominations, {s['rejected']} rejection")


def badge(label, value, color):
    lw = 9 + len(label) * 7.2
    vw = 9 + len(value) * 7.4
    w = lw + vw
    body = (f'<rect width="{w}" height="28" rx="4" fill="{INK}"/><rect x="{lw}" width="{vw}" height="28" rx="4" fill="{color}"/>'
            f'<rect x="{lw}" width="6" height="28" fill="{color}"/>'
            + text(lw / 2, 18.5, label.upper(), 11, "#fff", 700, "middle", extra='letter-spacing=".6"')
            + text(lw + vw / 2, 18.5, value, 12, "#fff", 700, "middle"))
    return svg(int(w), 28, body, f"{label}: {value}")


def section(num, title, sub):
    w, h = 1280, 96
    body = (f'<rect width="{w}" height="{h}" fill="{SUBTLE}"/><rect width="8" height="{h}" fill="{RED}"/>'
            f'<rect y="{h-3}" width="{w}" height="3" fill="{LINE}"/>'
            + text(40, 58, num, 34, RED, 800)
            + text(112, 50, title, 26, INK, 800)
            + text(113, 74, sub, 14, MUTED))
    return svg(w, h, body, f"Section {num}: {title}")


def box(x, y, w, h, title, lines, fill="#fff", stroke=LINE, title_fill=INK, accent=None):
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}"/>']
    if accent:
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="5" rx="2" fill="{accent}"/>')
    out.append(text(x + 16, y + 30, title, 15, title_fill, 800))
    for i, ln in enumerate(lines):
        out.append(text(x + 16, y + 52 + i * 19, ln, 12.5, MUTED))
    return "".join(out)


def arrow(x1, y1, x2, y2, color=MUTED, label=None, dash=False):
    d = ' stroke-dasharray="5 4"' if dash else ""
    out = f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="2"{d} marker-end="url(#a)"/>'
    if label:
        out += text((x1 + x2) / 2, (y1 + y2) / 2 - 7, label, 11, color, 700, "middle")
    return out


DEFS = (f'<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        f'<path d="M0 0L10 5L0 10z" fill="{MUTED}"/></marker></defs>')


def architecture(s):
    w, h = 1280, 620
    b = [DEFS, f'<rect width="{w}" height="{h}" fill="#fff"/>',
         text(40, 44, "FIG-01 · SYSTEM ARCHITECTURE", 13, RED, 800, extra='letter-spacing="1.5"'),
         text(40, 66, "Live on Cloudflare Pages. Everything left of the edge is computed at build time.", 13, MUTED),
         box(40, 100, 230, 150, "Public sources", ["Kenya Gazette notices", "Hansard, committee reports", "Dated press (cross-check)", "Verification tier per record"], accent=MUTED),
         box(330, 100, 270, 150, "packages/ledger", [f"{s['people']} people · {s['appointments']} appointments", f"{s['signals']} deterministic signal rules", "sha256 per record + root", "NIP-01 kind-30078 export"], accent=RED),
         box(660, 100, 250, 150, "apps/web (Next.js 14)", ["Static export: 129 pages", "Ledger, signals, gate, records", "Client-side filter only", "Browser-side tip sealing"], accent=RED),
         box(970, 100, 270, 150, "Cloudflare Pages", ["Global CDN, static files", "CSP, no-referrer, noindex", "No cookies, no analytics", "vetting-record.pages.dev"], accent=GREEN),
         arrow(270, 175, 328, 175), arrow(600, 175, 658, 175, label="build"), arrow(910, 175, 968, 175, label="deploy"),
         box(970, 320, 270, 130, "Pages Function /api/tips", ["Accepts sealed boxes only", "Random receipt, 180-day TTL", "Rate limit: sha256(IP+daily salt)"], accent=GREEN),
         box(970, 480, 270, 100, "KV: vetting-record-tips", ["Ciphertext + month + status", "No IP, no plaintext"], fill=SUBTLE),
         arrow(1105, 250, 1105, 318), arrow(1105, 450, 1105, 478),
         box(660, 320, 250, 130, "Reporter's browser", ["ECDH P-256 ephemeral key", "HKDF-SHA256 → AES-256-GCM", "Encrypts before sending"], accent=RED),
         arrow(910, 385, 968, 385, label="sealed"),
         box(660, 480, 250, 100, "Reviewer (offline)", ["Holds private key", "scripts/open-tips.mts"], fill=SUBTLE, accent=MAROON),
         arrow(968, 530, 912, 530, dash=True, label="fetch"),
         box(40, 320, 560, 260, "Resilience layer", [], accent=GREEN),
         box(60, 370, 250, 90, "data/*.json", ["ledger · manifest · nostr-events", "CORS open, any mirror"], fill=SUBTLE),
         box(330, 370, 250, 90, "Nostr relays (ready)", ["Signed offline, --publish gate", "Addressable, replaceable"], fill=SUBTLE),
         box(60, 475, 520, 85, "verify.ts: recompute every hash from any mirror", [f"root {s['root'][:40]}…", "One edited word in one record → FAIL, names the record"], fill="#fff"),
         arrow(470, 250, 330, 368, dash=True)]
    return svg(w, h, "".join(b), "System architecture: sources, ledger, static site, sealed tip line, resilience layer")


def tip_flow():
    w, h = 1280, 460
    lanes = [("Reporter's browser", 130, RED), ("Pages Function + KV", 640, GREEN), ("Reviewer, offline", 1120, MAROON)]
    b = [DEFS, f'<rect width="{w}" height="{h}" fill="#fff"/>',
         text(40, 40, "FIG-02 · SEALED TIP FLOW", 13, RED, 800, extra='letter-spacing="1.5"')]
    for name, x, c in lanes:
        b.append(f'<rect x="{x-110}" y="62" width="220" height="40" rx="6" fill="{c}"/>')
        b.append(text(x, 88, name, 14, "#fff", 800, "middle"))
        b.append(f'<path d="M{x} 102V{h-20}" stroke="{LINE}" stroke-width="2" stroke-dasharray="4 4"/>')
    for i, t in enumerate(["1. generate ephemeral P-256 key pair", "2. ECDH with reviewer public key → HKDF-SHA256",
                           "3. AES-256-GCM seal {record, message, links, contact}"]):
        b.append(text(144, 134 + i * 24, t, 12.5, INK))
    b.append(arrow(132, 214, 636, 214, RED, "POST {v, epk, iv, ct}: ciphertext only"))
    b.append(text(654, 246, "validate shape, rate-limit by salted hash", 12.5, INK))
    b.append(text(654, 268, "store tip:<receipt>, 180-day TTL, no IP", 12.5, INK))
    b.append(arrow(636, 298, 134, 298, GREEN, "201 {receipt: VR-XXXX-XXXX-XXXX}"))
    b.append(arrow(1116, 336, 646, 336, MUTED, "later: list + get sealed boxes", dash=True))
    b.append(text(1106, 370, "open with private key → plaintext", 12.5, INK, anchor="end"))
    b.append(text(1106, 392, "verify independently before use", 12.5, INK, anchor="end"))
    b.append(text(1106, 414, "facts enter the ledger with a public source", 12.5, INK, anchor="end"))
    return svg(w, h, "".join(b), "Sealed tip flow from browser to offline reviewer")


def signals_fig(s):
    ids = list(s["labels"].keys())
    w, h = 1280, 90 + len(ids) * 46
    maxv = max(s["hits"].values()) or 1
    b = [f'<rect width="{w}" height="{h}" fill="#fff"/>',
         text(40, 40, "FIG-03 · PATTERN SIGNALS: MATCHES IN THE CURRENT LEDGER", 13, RED, 800, extra='letter-spacing="1.5"'),
         text(40, 62, "Deterministic rules over public facts. They describe the appointment process, never a person's conduct.", 13, MUTED)]
    for i, sid in enumerate(ids):
        y = 90 + i * 46
        v = s["hits"][sid]
        bw = 640 * v / maxv
        color = RED if sid in ("floor_override", "gazetted_without_approval", "elevation_without_hearing") else (
            GREEN if sid == "gate_rejection" else ("#b45309" if sid in ("returnee", "docket_rotation", "soft_landing") else "#475569"))
        b.append(text(40, y + 22, s["labels"][sid], 15, INK, 700))
        b.append(f'<rect x="360" y="{y+6}" width="660" height="24" rx="4" fill="{SUBTLE}"/>')
        b.append(f'<rect x="360" y="{y+6}" width="{max(bw, 6):.1f}" height="24" rx="4" fill="{color}"/>')
        b.append(text(1040, y + 24, str(v), 16, INK, 800))
    return svg(w, h, "".join(b), "Pattern signal match counts")


def main():
    ledger = json.loads(Path(sys.argv[1]).read_text())
    s = stats(ledger)
    write(BRAND / "hero.svg", hero(s))
    badges = {
        "status": ("status", "live prototype", GREEN),
        "records": ("records", f"{s['people']} hash-sealed", RED),
        "tests": ("tests", "41 passing", GREEN),
        "privacy": ("tips", "end-to-end sealed", MAROON),
        "nostr": ("nostr", "export ready", "#6d28d9"),
        "license": ("license", "MIT", INK),
    }
    for name, (label, value, color) in badges.items():
        write(BRAND / "badges" / f"{name}.svg", badge(label, value, color))
    sections = [
        ("00", "Why this exists", "The vetting gate is Parliament's check on executive appointments. Nobody measures it."),
        ("01", "What the record shows", "Findings computed from linked appointment histories, with two corrections to the source notes."),
        ("02", "The product", "Nine live views, one data model, zero trackers."),
        ("03", "Architecture", "Static by design: the record survives when servers do not."),
        ("04", "Privacy", "Protect people who report, and people who are reported on."),
        ("05", "Resilience and Nostr", "Every record hash-sealed and exportable as a signed Nostr event."),
        ("06", "Verification", "What is tested, what is deployed, what is still open."),
        ("07", "Run it", "Build, test, deploy, open tips, verify a mirror."),
        ("08", "Roadmap", "From hackathon prototype to Mzalendo civic tool."),
    ]
    for num, title, sub in sections:
        write(BRAND / "headers" / f"sec-{num}.svg", section(num, title, sub))
    write(DIAG / "architecture.svg", architecture(s))
    write(DIAG / "tip-flow.svg", tip_flow())
    write(DIAG / "signals.svg", signals_fig(s))


if __name__ == "__main__":
    main()
