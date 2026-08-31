#!/usr/bin/env bash
# Regenerates every app icon from a single source definition.
# Usage: bash assets/source/build-icons.sh   (run from the project root)
set -euo pipefail
cd "$(dirname "$0")/../.."

# Donut ring: mid-radius 250, stroke 100 -> inner 200 / outer 300.
# Segment lengths are fractions of the circumference (2*pi*250 = 1570.80),
# each shortened by a 12px gap. Colors are the app's category palette.
read -r -d '' MARK <<'EOF' || true
  <g transform="rotate(-90 512 512)" fill="none" stroke-width="100">
    <circle cx="512" cy="512" r="250" stroke="#f97316" stroke-dasharray="490.7 1080.1" stroke-dashoffset="0"/>
    <circle cx="512" cy="512" r="250" stroke="#10b981" stroke-dasharray="396.4 1174.4" stroke-dashoffset="-502.7"/>
    <circle cx="512" cy="512" r="250" stroke="#3b82f6" stroke-dasharray="333.6 1237.2" stroke-dashoffset="-911.1"/>
    <circle cx="512" cy="512" r="250" stroke="#a855f7" stroke-dasharray="302.2 1268.6" stroke-dashoffset="-1256.7"/>
  </g>
  <g fill="none" stroke="#ffffff" stroke-width="42" stroke-linecap="round">
    <path d="M 592.4 416.3 A 125 125 0 1 0 592.4 607.8"/>
    <path d="M 372 482 H 588"/>
    <path d="M 372 542 H 570"/>
  </g>
EOF

# Mark alone, transparent — Android adaptive foreground and the splash logo.
cat > assets/source/mark.svg <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
$MARK
</svg>
EOF

# Full-bleed icon on the app's dark indigo gradient.
cat > assets/source/icon.svg <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a2668"/>
      <stop offset="1" stop-color="#0f0e2a"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
$MARK
</svg>
EOF

rsvg-convert -w 1024 -h 1024 assets/source/icon.svg -o assets/icon.png
rsvg-convert -w 1024 -h 1024 assets/source/mark.svg -o assets/adaptive-icon.png
rsvg-convert -w 1024 -h 1024 assets/source/mark.svg -o assets/splash-icon.png
rsvg-convert -w 96   -h 96   assets/source/icon.svg -o assets/favicon.png
echo "Icons regenerated."
