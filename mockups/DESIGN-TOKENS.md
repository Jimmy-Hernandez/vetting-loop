# Mzalendo design tokens — surveyed from live CSS 2026-09-24 (design gate, do not guess)
Source: mzalendo.com /static/css/core.0b7aa815e4be.css

## Palette
- Primary RED family: hsl(358 81% 41%); light hsl(358 84% 49%); dark hsl(358 76% 25%); hex anchors #A51E27, #8d1820, #7a1620, tint #f3d6d8
- Secondary GREEN family: hsl(144 100% 25%)
- Alpha steps of primary: 80/50/20
- Grayscale: hue 0 sat 0%; #fff, #f8f9fa, #f0f0f0, #eee, #ddd, #ccc, #000
## Type
- --font-main: 'Montserrat', sans-serif (single family site-wide)
- --font-size-base: 1rem
## Space scale (rem)
0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3  (--space-1..7)
## Containers
- narrow: 1120px; max: min(2400px, max(1392px, 100vw-4.8rem)); gutter clamp(1rem,1.65vw,2.4rem)
## Radii
4px / 8px / 14px / pill 999px
## Posture (observed)
Institutional, dense tables, Font Awesome 6 icons, flat surfaces, thin #ddd/#e66 borders, minimal shadow. Red = action/accent, never decorative neon.

# Our rule: UPGRADE, NOT TRANSPLANT
Keep: palette family, Montserrat, spacing rhythm, 1120px prose measure, flat+thin-border posture, restraint.
Improve: hierarchy, whitespace breathing, data-viz clarity, empty-state storytelling, mobile.
