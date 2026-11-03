#!/usr/bin/env bash
# Capture what the YouTube app exposes on screen: the accessibility tree
# (XML) and a screenshot. Usage: ./capture-ad.sh [label]   e.g. ad, normal
set -euo pipefail

label="${1:-ad}"
dir="$(cd "$(dirname "$0")/.." && pwd)/captures"
mkdir -p "$dir"
base="$dir/$(date +%Y%m%d-%H%M%S)-$label"

out="$(adb shell uiautomator dump /sdcard/yas_dump.xml 2>&1 || true)"
if ! echo "$out" | grep -qi "dumped"; then
    echo "Screen tree capture failed: $out"
    echo "If it says 'could not get idle state', pause the video and try again."
    exit 1
fi
adb pull /sdcard/yas_dump.xml "$base.xml" >/dev/null
adb shell screencap -p /sdcard/yas_shot.png
adb pull /sdcard/yas_shot.png "$base.png" >/dev/null
adb shell rm -f /sdcard/yas_dump.xml /sdcard/yas_shot.png

echo "Saved:"
echo "  $base.xml"
echo "  $base.png"
