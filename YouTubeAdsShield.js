// ==UserScript==
// @name         YouTubeAdsShield
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Mute ads during playback and overlay video area with a black rectangle, keeping the skip button visible and clickable. Adds a white glowing "hope" box where the skip button appears and a centered monochrome ASCII monkey inside the video ad overlay.
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
    const SKIP_OUTLINE_MIN_WIDTH = 160;
    const SKIP_OUTLINE_MIN_HEIGHT = 48;
    const SKIP_OUTLINE_PADDING = 8;
    const OVERLAY_Z = 1000;
    const OUTLINE_Z = 1001;

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

    function maskElement(el) {
        if (el.dataset._masked === 'true') return;

        el.style.position = 'relative';

        const cover = document.createElement('div');
        cover.style.position = 'absolute';
        cover.style.top = '0';
        cover.style.left = '0';
        cover.style.width = '100%';
        cover.style.height = '100%';
        cover.style.backgroundColor = 'black';
        cover.style.opacity = '1';
        cover.style.zIndex = '999';
        cover.style.pointerEvents = 'none';
        el.appendChild(cover);

        el.style.pointerEvents = 'none';
        el.dataset._masked = 'true';
    }

    function hideInPageAds() {
        const adSelectors = [
            'ytd-promoted-video-renderer',
            'ytd-display-ad-renderer',
            'ytd-ad-slot-renderer',
            'ytd-companion-slot-renderer',
            'ytd-player-legacy-desktop-watch-ads-renderer',
            'ytd-action-companion-ad-renderer',
            'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
            'ytd-statement-banner-renderer'
        ];

        const ads = document.querySelectorAll(adSelectors.join(', '));
        ads.forEach(maskElement);

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

    // The "hope" box is centred on the real skip button and grows with it,
    // never smaller than the minimum size.
    function createOrUpdateSkipOutline(player, skipButton) {
        const sbRect = skipButton.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const width = Math.max(SKIP_OUTLINE_MIN_WIDTH, Math.round(sbRect.width + 2 * SKIP_OUTLINE_PADDING));
        const height = Math.max(SKIP_OUTLINE_MIN_HEIGHT, Math.round(sbRect.height + 2 * SKIP_OUTLINE_PADDING));

        const centerX = sbRect.left - playerRect.left + sbRect.width / 2;
        const centerY = sbRect.top - playerRect.top + sbRect.height / 2;

        let outline = document.getElementById(SKIP_OUTLINE_ID);
        if (!outline) {
            outline = document.createElement('div');
            outline.id = SKIP_OUTLINE_ID;
            outline.style.position = 'absolute';
            outline.style.boxSizing = 'border-box';
            outline.style.border = '3px solid white';
            outline.style.background = 'white';
            outline.style.pointerEvents = 'none';
            outline.style.zIndex = String(OUTLINE_Z);
            outline.style.borderRadius = '4px';
            outline.style.boxShadow =
                '0 0 4px rgba(255,255,255,1), ' +
                '0 0 10px rgba(255,255,255,0.95), ' +
                '0 0 20px rgba(255,255,255,0.8), ' +
                '0 0 35px rgba(100,180,255,0.65)';
            outline.style.display = 'flex';
            outline.style.alignItems = 'center';
            outline.style.justifyContent = 'center';
            outline.style.color = 'black';
            outline.style.fontFamily = 'Arial, sans-serif';
            outline.style.fontSize = '16px';
            outline.style.fontWeight = '400';
            outline.style.letterSpacing = '1px';
            outline.textContent = 'hope';

            ensurePositioned(player);
            player.appendChild(outline);
        }

        outline.style.width = `${width}px`;
        outline.style.height = `${height}px`;
        outline.style.left = `${Math.round(centerX - width / 2)}px`;
        outline.style.top = `${Math.round(centerY - height / 2)}px`;
    }

    function removeSkipOutline() {
        const outline = document.getElementById(SKIP_OUTLINE_ID);
        if (outline) outline.remove();
    }

    hideInPageAds();
    updateStatusAndVolume();

    const observer = new MutationObserver(scheduleInPageScan);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also repositions the "hope" box after resizes and fullscreen changes,
    // so no separate resize handler is needed.
    setInterval(updateStatusAndVolume, 100);
})();
