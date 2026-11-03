# AndroidShield

The same principle as the browser script, for the YouTube app on Android:
when a player ad is on screen, cover the video in black and turn the media
volume down. The Skip button stays YouTube's, and you press it yourself.

Nothing is patched, blocked or skipped. The YouTube app is not modified.
This is the automatic equivalent of putting your phone face down and
turning the sound off.

Scope for now: **player ads only**. Feed ads, posts and products are out of
scope for the app.

## How it will work

- An Android accessibility service watches what the YouTube app shows on
  screen (the same information screen readers use).
- When it recognises a player ad (for example the "Skip" / "Ignorer" button,
  or the "Ad" label under the video), it draws a black curtain over the video
  area and turns the media volume down.
- A small box of random characters sits over the Skip button; taps go
  through to the real button.
- When the ad ends, the curtain goes and your previous volume comes back.

Not on the Play Store. Build it and install it on your own phone.

## Setting up your phone and computer

### On the computer
1. Install **Android Studio** (https://developer.android.com/studio). It is
   needed later to build the app, and it includes `adb`, the tool that talks
   to the phone. If you only want `adb` for now, the standalone
   **SDK Platform-Tools** package is enough.
2. Make sure `adb` runs from a terminal:
   `adb version`
   If it isn't found, add the `platform-tools` folder to your PATH, or run it
   from inside that folder.

### On the phone
3. Turn on **Developer options**: Settings → About phone → tap
   **Build number** seven times. (Samsung: About phone → Software
   information. Xiaomi: About phone → MIUI / HyperOS version.)
4. In Settings → System → **Developer options**, turn on **USB debugging**.
   On Xiaomi, also turn on **Install via USB** and
   **USB debugging (Security settings)**.
5. Plug the phone into the computer with a USB cable that carries data (some
   charging cables don't). If the phone asks what the USB connection is for,
   choose **File transfer**.
6. Accept the **"Allow USB debugging?"** prompt on the phone, and tick
   **Always allow from this computer**.

### Check the connection
7. On the computer:
   `adb devices`
   The phone should be listed as `device`. If it says `unauthorized`, unlock
   the phone and accept the prompt from step 6.
8. Note the model and Android version:
   `adb shell getprop ro.product.model`
   `adb shell getprop ro.build.version.release`

## First step: capture what the YouTube app shows during an ad

This is the app equivalent of copying the HTML of a page.

1. Open the YouTube app and start a video. Wait for an ad, ideally a
   skippable one, with the Skip button visible.
2. Run `tools/capture-ad.sh` (macOS / Linux), or `tools/capture-ad.ps1` on
   Windows. It saves the screen tree as XML and a screenshot into
   `android/captures/`.
3. Do it once more with a **normal video playing** (no ad), so the two can be
   compared.

If the capture fails with `could not get idle state`, the moving video is
keeping the screen "busy": pause the ad and run it again.
