// ==UserScript==
// @name         YouTubeAdsShield
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Mute ads during playback and overlay video area with a black rectangle, keeping the skip button clickable. Marks the skip button with a small box of random ASCII characters, and shows a centered monochrome ASCII monkey inside the video ad overlay.
// @author       tshutshut
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://music.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const OVERLAY_ID = 'video-overlay';
    const SKIP_OUTLINE_ID = 'skip-outline';
    const OVERLAY_Z = 1000;
    const OUTLINE_Z = 1001;

    // Skip box: a small rectangle of random ASCII marking the skip button.
    const SKIP_BOX_CHARSET = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    const SKIP_BOX_ROWS = 12;           // character rows inside the box; sets the font size
    const SKIP_BOX_BORDER_PX = 1;
    const SKIP_BOX_FONT = '"Courier New", Courier, monospace';

    const MONKEY_ASCII = `
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNKOxx0WMMMWWWWWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMN0xl:,;cxKOkdollo0WMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNNOl;;;,'';:c:;;'';kXWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNKOxdlc:;,;:;,,,;;::;'..,:lodk0XWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNKko:;,,,,;;;:::::::cc::;;;;;;,,'',:lx0NMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMWKxc,'',;;;::cccccccclllccccccc:::;;;,,'',cxKWMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMNOo;'',,;;::ccclllllllooolllllllllcc:::;;,,''',lONMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMW0l,''',;;:::ccclllloooooooooooolllllcc::::;;,,''.'l0WMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMXx,..',,;;::::ccccllllllllooollllllccccc::::;;;,,''..,dXMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMKl'..',,,;;;;;;::::::cccccccccccccc:::::;;;;;;;;,,,''...lKMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMW0:....'',,,,,,,;::::;;;;;;;::::;;;;;,,;;;:;;;,,,,,,,''....:0WMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMWWXKOOkc.....'''',;codxkOOOkxdl:,,,,,,,,',:ldxkOOOkxdoc;'''''.....ckOO0XWWMMMMMMMMMMMMM
MMMMMMMMMMMWN0Oxoodxxo,...'.';lxO000000000K0Odc,'..',cdO00000000000Oxl;''....,oxddoodk0NWMMMMMMMMMMM
MMMMMMMMMMWKkdlcldxO0x:....':dkOOOkkkOOkxkOOOOOdc;;cxOOOOkxxkkkkkkkOOkd:'....:x0OxdlcldkKWMMMMMMMMMM
MMMMMMMMMW0xo::lxxO0Oo,....:dkxxxkOO00OxoloxxkOOkkkkOOkxdoloxO00Okkxxxxo;....,dO0kxdl;:ox0WMMMMMMMMM
MMMMMMMMMKxo::oxxk00kl'...,ldddkO00OkxddxxkkdodkkkkkkdodkkxxxdxkO00Oxdooc'...'lk0Oxxdl::oxKMMMMMMMMM
MMMMMMMMWOoc:ldxkO0Ox:...,lxxkO00kxxxk000Okdl:cdxxxxdc:ldkO00Okxxxk00Okxdl,...:xO0kxxdl;coOWMMMMMMMM
MMMMMMMMXxl::dxkOO0kd;..:dkO000OkkO000OkxdoolcclddddlccloodxkO00Okxxk000Okd;..:dO0Okkxo::lkNMMMMMMMM
MMMMMMMMNxl:cdkkOOOko;':dkO0000O000Okxdxxkkkxl:cooooc:oxkOkxddxkO000OO000Okd:';okOOOkxd:;lkNMMMMMMMM
MMMMMMMMWOl::dxkkkkxl;:dxkOO000000kxxkO0Okxoc;;lddddl;;coxO00Okxxk000000OOkxo:;lxkOkkxo:;lOWMMMMMMMM
MMMMMMMMMXd::ldxkxxo:;ldxkOO00000OOO0OOxdllc;,cdxkkxdc,;clodkO00OOO000OOOkkdoc;:dxkkxdl;;dXMMMMMMMMM
MMMMMMMMMWKl;codddoc;;codxkOOOO0000OOxdddooc::oxkkkkxo::ldddddxOO0000OOOkkxdl:;;lddddl:;lKWMMMMMMMMM
MMMMMMMMMMWKo:clllc;';:lodxkkOOOOOOOkxxxdl:;:okO0000Oko:;:ldxxxkOOOOOOOkkxdlc:,,;llol:;oKWMMMMMMMMMM
MMMMMMMMMMMMKl,;::;'',:clodxxkkkkkkkxxoc;,;cdddOKKKKOdooc;,;cdxkkkkkkkkxdolc:;,'';::;,cKMMMMMMMMMMMM
MMMMMMMMMMMMK:'','..',;:ccloddxxxxxdoc;,;loxo'.;kKKk;.'oxoc;,;codxxxxxddolcc:;,'.',,'.:KMMMMMMMMMMMM
MMMMMMMMMMMWk,.....',;::cccclloooolc;,;cdkOOkl,;d00d,,lkOOkdc;,;clooooolccc::;;,......,kWMMMMMMMMMMM
MMMMMMMMMMMNo.....',;;:ccccc::::::;,,:oxkO00KK0O0KK0O0KK00Okdl:,,;:ccccc:ccc::;,'......oNMMMMMMMMMMM
MMMMMMMMMMMXc....',,;::ccc::;,,'...,coxkO00KKKKKKKKKKKKK00OOkxo:'..',,;;::ccc::;,'.....cKMMMMMMMMMMM
MMMMMMMMMMMK;....',;:::c:::;,'.. .'coxkkO000KKKKKKKKKK0000OOkxdl:....'',;:ccc::;,,'....;0WMMMMMMMMMM
MMMMMMMMMMMK:...'',;::::::;,'..  .,ldxkxdxOO000000000000Okdodxdoc'.  .'',;:::::;;,'....:KMMMMMMMMMMM
MMMMMMMMMMMNo....',;;;;;;;,'...  .'coxkxddoooddxxxxxxddoooodxxdl:'.  ..',,;::::;;,'....oNMMMMMMMMMMM
MMMMMMMMMMMMO,...'',,,,,,''...   ..,coxxkOOkxddddddddddxkkkkxdlc,..   ..'',;;;;,,''...,OMMMMMMMMMMMM
MMMMMMMMMMMMNd'...'''''''.....   ...,codxkkOOO0000000OOOOkxxol:,...   ....'',,,'''...'dNMMMMMMMMMMMM
MMMMMMMMMMMMMNd'............,ll'......;clddxkkkkkkkkkkxxxdol:,......'lo,............'dNMMMMMMMMMMMMM
MMMMMMMMMMMMMMWOc'........'c0WWKd:''....,;clooodddddooolc:;'....'':dKWW0c'........'cOWMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMN0dc;,,;cd0NMMMMMNKK0dc,....',,;;;;;;,,'....,cx0KXNMMMMMN0dc;,;:ld0NMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMWNNXNWMMMMMMMMMMMMMWXOxl:,'........',:lxOXWMMMMMMMMMMMMMWNNNNWMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNXK0KKKKKKXNWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM`;

    // The main watch-page player. Scoping everything to it avoids grabbing
    // homepage hover previews or other <video> elements by mistake.
    const PLAYER_SELECTOR = '#movie_player';

    // YouTube has renamed the skip button several times; check all known names.
    const SKIP_BUTTON_SELECTORS = [
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button'
    ];

    // Whole-word match for ad badges, in English and French.
    // Lookarounds on \p{L} instead of \b so accented letters (é) count as letters.
    const AD_BADGE_PATTERN = /(?<!\p{L})(ad|ads|sponsored|annonce|sponsoris[ée]e?)(?!\p{L})/iu;

    // Mute bookkeeping: remember whether the user was already muted before the
    // ad, and restore exactly that afterwards. Volume level is never touched.
    let mutedByShield = false;
    let userWasMuted = false;

    function isVisible(el) {
        if (!el || el.offsetParent === null) return false;
        if (getComputedStyle(el).visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function getPlayer() {
        return document.querySelector(PLAYER_SELECTOR);
    }

    function getSkipButton(player) {
        for (const selector of SKIP_BUTTON_SELECTORS) {
            const button = player.querySelector(selector);
            if (isVisible(button)) return button;
        }
        return null;
    }

    function ensurePositioned(el) {
        const position = getComputedStyle(el).position;
        if (position === 'static' || !position) {
            el.style.position = 'relative';
        }
    }

    function updateStatusAndVolume() {
        const player = getPlayer();
        if (!player) return;
        const video = player.querySelector('video');
        if (!video) return;

        const adPlaying = player.classList.contains('ad-showing');

        if (adPlaying) {
            if (!mutedByShield) {
                userWasMuted = video.muted;
                mutedByShield = true;
            }
            if (!video.muted) {
                video.muted = true;
            }

            createVideoOverlay(player);

            const skipButton = getSkipButton(player);
            if (skipButton) {
                createOrUpdateSkipOutline(player, skipButton);
            } else {
                removeSkipOutline();
            }
        } else {
            if (mutedByShield) {
                video.muted = userWasMuted;
                mutedByShield = false;
            }

            removeVideoOverlay();
            removeSkipOutline();
        }
    }

    // Outer cards that wrap an ad or post. The curtain goes on these rather
    // than on the inner element, so the whole card is covered.
    const CARD_CONTAINERS = [
        'ytd-search-pyv-renderer',            // sponsored result in search
        'ytd-rich-item-renderer',             // one item of the home / subscriptions grid
        'ytd-backstage-post-thread-renderer'  // wrapper around a channel post
    ].join(', ');

    // In-page ads.
    const AD_SELECTORS = [
        'ytd-promoted-video-renderer',
        'ytd-display-ad-renderer',
        'ytd-ad-slot-renderer',
        'ytd-search-pyv-renderer',
        'ytd-in-feed-ad-layout-renderer',
        'ytd-companion-slot-renderer',
        'ytd-player-legacy-desktop-watch-ads-renderer',
        'ytd-action-companion-ad-renderer',
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
        'ytd-statement-banner-renderer'
    ].join(', ');

    // The "Sponsored" label on newer ad cards.
    const AD_BADGE_SELECTORS = 'ad-badge-view-model, badge-shape.ytBadgeShapeAd';

    // Channel posts (text/image updates, formerly the Community tab).
    // Not ads, but curtained everywhere all the same.
    const POST_SELECTORS = 'ytd-post-renderer';

    // Cards a "Sponsored" badge can sit in.
    const BADGE_CARDS = 'ytd-ad-slot-renderer, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, yt-lockup-view-model';

    // Put a black curtain over an element. The content stays in the page, it
    // just can't be seen, clicked or reached with the keyboard.
    function maskElement(el) {
        const target = el.closest(CARD_CONTAINERS) || el;
        if (target.dataset._masked === 'true') return;
        // Already inside a curtain: nothing to add.
        if (target.parentElement && target.parentElement.closest('[data-_masked="true"]')) return;

        // An element shown as "contents" or "inline" has no box of its own, so
        // a 100% cover inside it lands in the wrong place. Give it a real box.
        const display = getComputedStyle(target).display;
        if (display === 'contents' || display === 'inline') {
            target.style.display = 'block';
        }
        ensurePositioned(target);

        const cover = document.createElement('div');
        cover.style.position = 'absolute';
        cover.style.top = '0';
        cover.style.left = '0';
        cover.style.width = '100%';
        cover.style.height = '100%';
        cover.style.backgroundColor = 'black';
        cover.style.opacity = '1';
        cover.style.zIndex = '999';
        // The curtain itself catches clicks, whatever the content's own CSS says.
        cover.style.pointerEvents = 'auto';
        target.appendChild(cover);

        // No clicks, no keyboard focus on what's behind the curtain.
        target.inert = true;
        target.dataset._masked = 'true';
    }

    function hideInPageAds() {
        document.querySelectorAll(AD_SELECTORS).forEach(maskElement);
        document.querySelectorAll(POST_SELECTORS).forEach(maskElement);

        document.querySelectorAll(AD_BADGE_SELECTORS).forEach(badge => {
            const card = badge.closest(BADGE_CARDS);
            if (card) maskElement(card);
        });

        const possibleAds = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer');
        possibleAds.forEach(el => {
            if (el.dataset._masked === 'true') return;
            const badge = el.querySelector('#badge, .badge');
            if (badge && AD_BADGE_PATTERN.test(badge.textContent)) {
                maskElement(el);
            }
        });
    }

    // YouTube mutates the DOM constantly; batch scans to at most one per frame.
    let scanScheduled = false;
    function scheduleInPageScan() {
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(() => {
            scanScheduled = false;
            hideInPageAds();
        });
    }

    function createMonkeyAscii(overlayElement) {
        if (overlayElement.querySelector('.monkey-ascii')) return;

        const monkey = document.createElement('pre');
        monkey.className = 'monkey-ascii';
        monkey.textContent = MONKEY_ASCII;
        monkey.style.position = 'absolute';
        monkey.style.left = '50%';
        monkey.style.top = '50%';
        monkey.style.transform = 'translate(-50%, -50%)';
        monkey.style.margin = '0';
        monkey.style.padding = '0';
        monkey.style.color = '#aaa';
        monkey.style.background = 'transparent';
        monkey.style.fontFamily = '"Courier New", Courier, monospace';
        monkey.style.fontWeight = '400';
        monkey.style.lineHeight = '1';
        monkey.style.whiteSpace = 'pre';
        monkey.style.fontSize = 'clamp(2px, 0.35vw, 4px)';
        monkey.style.letterSpacing = '0';
        monkey.style.fontVariantLigatures = 'none';
        monkey.style.pointerEvents = 'none';
        monkey.style.userSelect = 'none';
        monkey.style.zIndex = '1';

        overlayElement.appendChild(monkey);
    }

    // The overlay ignores all pointer events, so clicks fall through to the real
    // skip button underneath it. No "hole" element is needed.
    function createVideoOverlay(player) {
        if (document.getElementById(OVERLAY_ID)) return;

        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = String(OVERLAY_Z);

        createMonkeyAscii(overlay);

        ensurePositioned(player);
        player.appendChild(overlay);
    }

    function removeVideoOverlay() {
        const existingOverlay = document.getElementById(OVERLAY_ID);
        if (existingOverlay) existingOverlay.remove();
    }

    // Where the skip box goes, relative to the player: exactly over the skip
    // button, so the box and the clickable area are the same rectangle.
    // Clipped to the player so it never spills outside the video.
    function skipBoxRect(player, skipButton) {
        const b = skipButton.getBoundingClientRect();
        const p = player.getBoundingClientRect();

        const left = Math.max(b.left, p.left);
        const right = Math.min(b.right, p.right);
        const top = Math.max(b.top, p.top);
        const bottom = Math.min(b.bottom, p.bottom);

        if (right - left < 10 || bottom - top < 10) return null;
        return {
            left: Math.round(left - p.left),
            top: Math.round(top - p.top),
            width: Math.round(right - left),
            height: Math.round(bottom - top)
        };
    }

    // Measure the real size of one character cell (fonts and browser minimum
    // font sizes vary, so this is measured rather than assumed).
    function measureCell(container) {
        const probe = document.createElement('span');
        probe.textContent = 'M'.repeat(20);
        probe.style.visibility = 'hidden';
        probe.style.position = 'absolute';
        container.appendChild(probe);
        const rect = probe.getBoundingClientRect();
        probe.remove();
        return { width: rect.width / 20, height: rect.height };
    }

    function randomChar() {
        return SKIP_BOX_CHARSET[Math.floor(Math.random() * SKIP_BOX_CHARSET.length)];
    }

    // Fill the box with random characters. Built once per box size, so it
    // stays still while the ad plays.
    function fillSkipBox(box, width, height) {
        const innerW = width - 2 * SKIP_BOX_BORDER_PX;
        const innerH = height - 2 * SKIP_BOX_BORDER_PX;

        const text = document.createElement('pre');
        text.style.margin = '0';
        text.style.padding = '0';
        text.style.color = 'white';
        text.style.fontFamily = SKIP_BOX_FONT;
        text.style.fontSize = `${(innerH / SKIP_BOX_ROWS).toFixed(2)}px`;
        text.style.lineHeight = '1';
        text.style.letterSpacing = '0';
        text.style.whiteSpace = 'pre';
        text.style.fontVariantLigatures = 'none';
        text.style.userSelect = 'none';

        box.replaceChildren(text);
        const cell = measureCell(text);
        const cols = Math.max(1, Math.floor(innerW / cell.width));
        const rows = Math.max(1, Math.floor(innerH / cell.height));

        const lines = [];
        for (let r = 0; r < rows; r++) {
            let line = '';
            for (let c = 0; c < cols; c++) {
                line += randomChar();
            }
            lines.push(line);
        }
        text.textContent = lines.join('\n');
    }

    function createOrUpdateSkipOutline(player, skipButton) {
        const rect = skipBoxRect(player, skipButton);
        if (!rect) {
            removeSkipOutline();
            return;
        }

        let box = document.getElementById(SKIP_OUTLINE_ID);
        if (!box) {
            box = document.createElement('div');
            box.id = SKIP_OUTLINE_ID;
            box.style.position = 'absolute';
            box.style.boxSizing = 'border-box';
            box.style.border = `${SKIP_BOX_BORDER_PX}px solid white`;
            box.style.background = 'black';
            box.style.overflow = 'hidden';
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.pointerEvents = 'none';
            box.style.zIndex = String(OUTLINE_Z);

            ensurePositioned(player);
            player.appendChild(box);
        }

        box.style.left = `${rect.left}px`;
        box.style.top = `${rect.top}px`;
        box.style.width = `${rect.width}px`;
        box.style.height = `${rect.height}px`;

        const sizeKey = `${rect.width}x${rect.height}`;
        if (box.dataset.size !== sizeKey) {
            box.dataset.size = sizeKey;
            fillSkipBox(box, rect.width, rect.height);
        }
    }

    function removeSkipOutline() {
        const outline = document.getElementById(SKIP_OUTLINE_ID);
        if (outline) outline.remove();
    }

    hideInPageAds();
    updateStatusAndVolume();

    const observer = new MutationObserver(scheduleInPageScan);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also repositions the skip box after resizes and fullscreen changes,
    // so no separate resize handler is needed.
    setInterval(updateStatusAndVolume, 100);
})();
