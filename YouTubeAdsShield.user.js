// ==UserScript==
// @name         YouTube Ad Overlay with Skip Button Visible + Skip Outline
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Mute ads during playback and overlay video area with a black rectangle, keeping the skip button visible and clickable. Adds a fixed-size white outline where the skip button appears. The overlay adjusts on window resize and appears only during ads.
// @author       tshutshut
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // Constants and top-level state
    // -------------------------------------------------------------------------

    // Default volume to restore when an ad ends (used if volume was forced to 0)
    const DEFAULT_VOLUME = 0.5;

    // Handle to the ad overlay element (created during ads, removed otherwise)
    let overlay = null;

    // Fixed-size white outline around the skip button area
    const SKIP_OUTLINE_ID = 'skip-outline';
    const SKIP_OUTLINE_WIDTH = 160; // px — adjust to taste
    const SKIP_OUTLINE_HEIGHT = 48; // px — adjust to taste
    const OVERLAY_Z = 1000; // z-index of the black overlay
    const OUTLINE_Z = 1001; // z-index of the white outline (above overlay)

    // -------------------------------------------------------------------------
    // Debug / status floating box UI (fixed in the viewport)
    // -------------------------------------------------------------------------

    // Create a small fixed-position panel to show mouse coordinates + status
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.top = '50px'; // avoid overlapping with YT header
    box.style.left = '15px';
    box.style.width = '70px';
    box.style.background = 'rgba(10, 10, 10, 1)'; // red background for visibility
    box.style.color = 'white';
    box.style.padding = '10px';
    box.style.boxSizing = 'border-box';
    box.style.zIndex = '2147483647'; // sit above all site layers (max-ish z-index)
    box.style.fontSize = '14px';
    box.style.fontFamily = 'monospace';
    box.style.lineHeight = '1.5';

    // Create mouse position line
    // const mouseLine = document.createElement('div');
    // mouseLine.textContent = 'mouse pos x: --, y: --';

    // Create status line for "video" / "ad" / "ad skip"
    const statusLine = document.createElement('div');
    statusLine.textContent = 'Status: ...';

    // Append lines into the floating box and attach to document
    // box.appendChild(mouseLine);
    box.appendChild(statusLine);
    document.body.appendChild(box);

    // Track mouse and display current client coordinates
    /*
    document.addEventListener('mousemove', (e) => {
        // Using clientX/clientY keeps values relative to the viewport (not page scroll)
        mouseLine.textContent = `mouse pos x: ${e.clientX}, y: ${e.clientY}`;
    });*/

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    /**
     * FUNCTION: isVisible
     *
     * Purpose:
     *   Checks whether a DOM element is visibly rendered (i.e., has a layout box
     *   and is not hidden via CSS visibility).
     *
     * Inputs:
     *   - el: HTMLElement | null
     *       The element to test.
     *
     * Outputs:
     *   - None (no DOM mutations).
     *
     * Returns:
     *   - Boolean:
     *       true  => the element exists, has a non-null offsetParent, and CSS visibility != 'hidden'
     *       false => otherwise (including if el is null/undefined)
     *
     * Notes:
     *   - offsetParent check filters out elements with display:none or detached from layout.
     *   - This is a heuristic; elements can still be "invisible" for other reasons (opacity 0, clipped, etc.).
     */
    function isVisible(el) {
        return el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    }

    // -------------------------------------------------------------------------
    // Core logic: detect ad state, mute/unmute, manage overlays
    // -------------------------------------------------------------------------

    /**
     * FUNCTION: updateStatusAndVolume
     *
     * Purpose:
     *   - Polls YouTube's player state to determine if an ad is playing.
     *   - Mutes video during ads; restores volume after ads.
     *   - Updates the debug/status box text.
     *   - Creates/removes the full-player overlay with a “hole” over the skip button.
     *   - Creates/updates/removes the white skip outline rectangle.
     *
     * Inputs:
     *   - None (queries DOM for video elements and ad markers).
     *
     * Outputs:
     *   - Mutates the <video> element volume when needed.
     *   - Adds/removes overlay and outline DOM elements over the player.
     *   - Updates text content of the statusLine debug element.
     *
     * Returns:
     *   - void
     *
     * Notes:
     *   - Relies on YouTube's current CSS classes:
     *       * '.ad-showing' on the player during ads.
     *       * '.ytp-skip-ad-button' for the skip button (if present).
     *   - These class names can change; if behavior breaks, update selectors.
     */
    function updateStatusAndVolume() {
        const video = document.querySelector('video'); // primary <video>
        const adPlaying = document.querySelector('.ad-showing'); // ad state marker
        const skipButton = document.querySelector('.ytp-skip-ad-button'); // skip button

        if (!video) return; // Bail if no video (e.g., initial page load, transitions)

        if (adPlaying) {
            // During ads: force silence by setting volume to 0 (non-destructive vs muted flag)
            if (!video.muted && video.volume > 0) {
                video.volume = 0; // mute by volume so we can restore consistently
            }

            // Update the status line depending on skip button visibility
            if (isVisible(skipButton)) {
                statusLine.textContent = 'ad skip';
            } else {
                statusLine.textContent = 'ad';
            }

            // Ensure overlay is present and positioned (with a hole over the skip button if available)
            createVideoOverlay(skipButton);

            // Ensure the white outline is drawn and positioned if the skip button is visible
            if (isVisible(skipButton)) {
                createOrUpdateSkipOutline(skipButton);
            } else {
                removeSkipOutline();
            }
        } else {
            // Not an ad: normal video playback
            statusLine.textContent = 'video';

            // If we previously set volume to 0, restore a reasonable default
            if (video.volume === 0) {
                video.volume = DEFAULT_VOLUME;
            }

            // Remove ad overlay and skip outline if present
            removeVideoOverlay();
            removeSkipOutline();
        }
    }

    // -------------------------------------------------------------------------
    // Page ad masking for "in-page" ads (thumbnails, companion, etc.)
    // -------------------------------------------------------------------------

    /**
     * FUNCTION: maskElement
     *
     * Purpose:
     *   Visually masks a given element by placing a full-cover black overlay on it
     *   and disabling pointer events, effectively "hiding" it while keeping layout.
     *
     * Inputs:
     *   - el: HTMLElement
     *       The target element to mask.
     *
     * Outputs:
     *   - Mutates the target element's style (position, pointer-events) and appends a child overlay.
     *
     * Returns:
     *   - void
     *
     * Notes:
     *   - Uses a data attribute (data-_masked) to avoid double-masking the same element.
     *   - Keeps layout intact vs. display:none, which avoids reflow jumps.
     */
    function maskElement(el) {
        if (el.dataset._masked === 'true') return; // Avoid re-applying mask

        el.style.position = 'relative'; // host for absolutely-positioned child

        const cover = document.createElement('div'); // local var, not to clash with global 'overlay'
        cover.style.position = 'absolute';
        cover.style.top = '0';
        cover.style.left = '0';
        cover.style.width = '100%';
        cover.style.height = '100%';
        cover.style.backgroundColor = 'black';
        cover.style.opacity = '1';
        cover.style.zIndex = '999';
        cover.style.pointerEvents = 'none'; // don't block pointer events to *siblings*
        el.appendChild(cover);

        el.style.pointerEvents = 'none'; // disable clicks on the masked element itself
        el.dataset._masked = 'true';
    }

    /**
     * FUNCTION: hideInPageAds
     *
     * Purpose:
     *   Finds and masks common YouTube in-page ad containers (e.g., promoted videos,
     *   display ads, companion slots). Also attempts a heuristic on regular video
     *   renderers with "Ad"/"Sponsored" badges.
     *
     * Inputs:
     *   - None.
     *
     * Outputs:
     *   - Masks matching ad elements (adds overlays and sets pointer-events).
     *
     * Returns:
     *   - void
     *
     * Notes:
     *   - This may need updates as YouTube changes component names.
     *   - The badge-based heuristic is conservative; adjust the selector/regex if needed.
     */
    function hideInPageAds() {
        const adSelectors = [
            'ytd-promoted-video-renderer',
            'ytd-display-ad-renderer',
            'ytd-ad-slot-renderer',
            'ytd-companion-slot-renderer',
            'ytd-player-legacy-desktop-watch-ads-renderer',
            'ytd-action-companion-ad-renderer'
        ];

        // Mask all known ad container types
        const ads = document.querySelectorAll(adSelectors.join(', '));
        ads.forEach(maskElement);

        // Heuristic: look for badges that indicate "Ad" or "Sponsored"
        const possibleAds = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer');
        possibleAds.forEach(el => {
            const badge = el.querySelector('#badge, .badge');
            if (badge && /ad|sponsored/i.test(badge.textContent)) {
                maskElement(el);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Video overlay creation/removal (with clickable hole over skip button)
    // -------------------------------------------------------------------------

    /**
     * FUNCTION: createVideoOverlay
     *
     * Purpose:
     *   Adds a full-size opaque overlay on top of the HTML5 video player area while an ad is playing,
     *   with a transparent "hole" positioned exactly over the Skip Ad button to keep it clickable.
     *
     * Inputs:
     *   - skipButton: HTMLElement | null
     *       The DOM node for the YouTube skip button ('.ytp-skip-ad-button').
     *       If null/undefined, overlay is added without a hole.
     *
     * Outputs:
     *   - Appends a new overlay <div id="video-overlay"> into the player container.
     *
     * Returns:
     *   - void
     *
     * Notes:
     *   - The overlay uses pointer-events: none so it doesn’t block clicks,
     *     and adds a child "hole" with pointer-events: auto to allow clicking on the
     *     underlying skip button through that rectangle.
     *   - Overlay is only created if one does not already exist.
     */
    function createVideoOverlay(skipButton) {
        const player = document.querySelector('.html5-video-player'); // YouTube player root
        if (!player || document.getElementById('video-overlay')) return; // Nothing to do

        // Create the full-cover overlay layer
        overlay = document.createElement('div');
        overlay.id = 'video-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)'; // full black
        overlay.style.pointerEvents = 'none'; // don't block interactions except where we explicitly re-enable
        overlay.style.zIndex = String(OVERLAY_Z);

        // If we have a skip button, cut a "hole" over it to allow clicking
        if (skipButton) {
            const hole = document.createElement('div');

            // Compute absolute rects and translate skipButton rect into player-local coordinates
            const rect = skipButton.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            hole.style.position = 'absolute';
            hole.style.width = `${rect.width}px`;
            hole.style.height = `${rect.height}px`;
            hole.style.left = `${rect.left - playerRect.left}px`;
            hole.style.top = `${rect.top - playerRect.top}px`;
            hole.style.backgroundColor = 'transparent';
            hole.style.pointerEvents = 'auto'; // re-enable pointer events over the hole only

            overlay.appendChild(hole);
        }

        // Ensure the player can host absolutely-positioned children
        const existingPosition = getComputedStyle(player).position;
        if (existingPosition === 'static' || !existingPosition) {
            player.style.position = 'relative';
        }

        player.appendChild(overlay);
    }

    /**
     * FUNCTION: removeVideoOverlay
     *
     * Purpose:
     *   Deletes the overlay added by createVideoOverlay (if present).
     *
     * Inputs:
     *   - None.
     *
     * Outputs:
     *   - Removes the DOM node with id="video-overlay" if it exists.
     *
     * Returns:
     *   - void
     *
     * Notes:
     *   - Safe to call repeatedly; will do nothing if overlay is not present.
     */
    function removeVideoOverlay() {
        const existingOverlay = document.getElementById('video-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }

    // -------------------------------------------------------------------------
    // White "skip outline" creation/removal (fixed-size frame over skip area)
    // -------------------------------------------------------------------------

    /**
     * FUNCTION: createOrUpdateSkipOutline
     *
     * Purpose:
     *   Draws (or repositions) a fixed-size white rectangle above the video player,
     *   centered on the current skip button position. The rectangle is purely visual
     *   and allows clicks to pass through it (no interaction blocking).
     *
     * Inputs:
     *   - skipButton: HTMLElement | null
     *       Reference to the '.ytp-skip-ad-button'. If null/undefined, no outline is drawn.
     *
     * Outputs:
     *   - Adds or updates a <div id="skip-outline"> inside the player container.
     *
     * Returns:
     *   - void
     */
    function createOrUpdateSkipOutline(skipButton) {
        if (!skipButton) return;

        const player = document.querySelector('.html5-video-player');
        if (!player) return;

        // Get geometry relative to viewport, then translate to player-local coordinates
        const sbRect = skipButton.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        // Compute the center of the skip button, then center our fixed-size rectangle there
        const centerX = sbRect.left - playerRect.left + sbRect.width / 2;
        const centerY = sbRect.top - playerRect.top + sbRect.height / 2;

        const left = Math.round(centerX - SKIP_OUTLINE_WIDTH / 2);
        const top = Math.round(centerY - SKIP_OUTLINE_HEIGHT / 2);

        // Either re-use existing outline or create it
        let outline = document.getElementById(SKIP_OUTLINE_ID);
        if (!outline) {
            outline = document.createElement('div');
            outline.id = SKIP_OUTLINE_ID;
            outline.style.position = 'absolute';
            outline.style.border = '3px solid white'; // white frame
            outline.style.background = 'transparent'; // no fill
            outline.style.pointerEvents = 'none'; // DO NOT consume clicks
            outline.style.zIndex = String(OUTLINE_Z); // above black overlay
            outline.style.borderRadius = '2px'; // slight rounding
            outline.style.boxShadow = '0 0 1px rgba(255,255,255,0.9)'; // subtle glow

            // Ensure the player can host absolutely-positioned children
            const existingPosition = getComputedStyle(player).position;
            if (existingPosition === 'static' || !existingPosition) {
                player.style.position = 'relative';
            }
            player.appendChild(outline);
        }

        // Size + position update on every call (keeps it aligned as UI shifts)
        outline.style.width = `${SKIP_OUTLINE_WIDTH}px`;
        outline.style.height = `${SKIP_OUTLINE_HEIGHT}px`;
        outline.style.left = `${left}px`;
        outline.style.top = `${top}px`;
    }

    /**
     * FUNCTION: removeSkipOutline
     *
     * Purpose:
     *   Removes the white rectangle that frames the skip button.
     *
     * Inputs:
     *   - None.
     *
     * Outputs:
     *   - Deletes the DOM node with id="skip-outline" if present.
     *
     * Returns:
     *   - void
     */
    function removeSkipOutline() {
        const outline = document.getElementById(SKIP_OUTLINE_ID);
        if (outline) outline.remove();
    }

    // -------------------------------------------------------------------------
    // Initial run + observers + timers
    // -------------------------------------------------------------------------

    // First pass: mask in-page ads (thumbnails/companion) and set playback state
    hideInPageAds();
    updateStatusAndVolume();

    // Observe DOM changes (YouTube is a SPA; content is added dynamically)
    const observer = new MutationObserver(() => {
        // On any DOM change, re-check in-page ads (cheap heuristic; runs very often)
        hideInPageAds();
        // Note: We do not update the overlay here to avoid excessive layout thrash.
        // The setInterval below handles ad-state polling at 100ms cadence.
    });

    // Start observing for child mutations anywhere in the document
    observer.observe(document.body, { childList: true, subtree: true });

    // Poll the player state frequently to catch ad start/stop and adjust overlay/volume
    // 100ms is a tradeoff between responsiveness and overhead.
    setInterval(updateStatusAndVolume, 100);

    // Reposition overlay hole and outline when the window resizes (skip button rect will move)
    window.addEventListener('resize', () => {
        const skipButton = document.querySelector('.ytp-skip-ad-button');
        removeVideoOverlay(); // Remove old overlay (invalid geometry)
        createVideoOverlay(skipButton); // Recreate with updated coordinates

        // Reposition the outline too
        if (isVisible(skipButton)) {
            createOrUpdateSkipOutline(skipButton);
        } else {
            removeSkipOutline();
        }
    });

    // -------------------------------------------------------------------------
    // End of IIFE
    // -------------------------------------------------------------------------
})();
