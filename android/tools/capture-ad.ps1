# Capture what the YouTube app exposes on screen: the accessibility tree
# (XML) and a screenshot. Usage: .\capture-ad.ps1 [label]   e.g. ad, normal
param([string]$Label = "ad")
$ErrorActionPreference = "Stop"

$dir = Join-Path (Split-Path $PSScriptRoot -Parent) "captures"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$base = Join-Path $dir ("{0}-{1}" -f (Get-Date -Format "yyyyMMdd-HHmmss"), $Label)

$out = (adb shell uiautomator dump /sdcard/yas_dump.xml 2>&1) | Out-String
if ($out -notmatch "dumped") {
    Write-Host "Screen tree capture failed: $out"
    Write-Host "If it says 'could not get idle state', pause the video and try again."
    exit 1
}
adb pull /sdcard/yas_dump.xml "$base.xml" | Out-Null
adb shell screencap -p /sdcard/yas_shot.png
adb pull /sdcard/yas_shot.png "$base.png" | Out-Null
adb shell rm -f /sdcard/yas_dump.xml /sdcard/yas_shot.png

Write-Host "Saved:"
Write-Host "  $base.xml"
Write-Host "  $base.png"
