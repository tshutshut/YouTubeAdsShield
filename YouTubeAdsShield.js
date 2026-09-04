// ==UserScript==
// @name         YouTube Ad Overlay with Skip Button Visible + Skip Outline
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Mute ads during playback and overlay video area with a black rectangle, keeping the skip button visible and clickable. Adds a white glowing "hope" box where the skip button appears and a centered monochrome ASCII monkey inside the video ad overlay.
// @author       tshutshut
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DEFAULT_VOLUME = 0.5;
    let overlay = null;

    const SKIP_OUTLINE_ID = 'skip-outline';
    const SKIP_OUTLINE_WIDTH = 160;
    const SKIP_OUTLINE_HEIGHT = 48;
    const OVERLAY_Z = 1000;
    const OUTLINE_Z = 1001;

    const MONKEY_ASCII = `MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
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

    function isVisible(el) {
        return el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    }

    function updateStatusAndVolume() {
        const video = document.querySelector('video');
        const adPlaying = document.querySelector('.ad-showing');
        const skipButton = document.querySelector('.ytp-skip-ad-button');

        if (!video) return;

        if (adPlaying) {
            if (!video.muted && video.volume > 0) {
                video.volume = 0;
            }

            createVideoOverlay(skipButton);

            if (isVisible(skipButton)) {
                createOrUpdateSkipOutline(skipButton);
            } else {
                removeSkipOutline();
            }
        } else {
            if (video.volume === 0) {
                video.volume = DEFAULT_VOLUME;
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
            const badge = el.querySelector('#badge, .badge');
            if (badge && /ad|sponsored/i.test(badge.textContent)) {
                maskElement(el);
            }
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

    function createVideoOverlay(skipButton) {
        const player = document.querySelector('.html5-video-player');
        if (!player || document.getElementById('video-overlay')) return;

        overlay = document.createElement('div');
        overlay.id = 'video-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = String(OVERLAY_Z);

        createMonkeyAscii(overlay);

        if (skipButton) {
            const hole = document.createElement('div');
            const rect = skipButton.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            hole.style.position = 'absolute';
            hole.style.width = `${rect.width}px`;
            hole.style.height = `${rect.height}px`;
            hole.style.left = `${rect.left - playerRect.left}px`;
            hole.style.top = `${rect.top - playerRect.top}px`;
            hole.style.backgroundColor = 'transparent';
            hole.style.pointerEvents = 'auto';

            overlay.appendChild(hole);
        }

        const existingPosition = getComputedStyle(player).position;
        if (existingPosition === 'static' || !existingPosition) {
            player.style.position = 'relative';
        }

        player.appendChild(overlay);
    }

    function removeVideoOverlay() {
        const existingOverlay = document.getElementById('video-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }

    function createOrUpdateSkipOutline(skipButton) {
        if (!skipButton) return;

        const player = document.querySelector('.html5-video-player');
        if (!player) return;

        const sbRect = skipButton.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        const centerX = sbRect.left - playerRect.left + sbRect.width / 2;
        const centerY = sbRect.top - playerRect.top + sbRect.height / 2;

        const left = Math.round(centerX - SKIP_OUTLINE_WIDTH / 2 - 8);
        const top = Math.round(centerY - SKIP_OUTLINE_HEIGHT / 2);

        let outline = document.getElementById(SKIP_OUTLINE_ID);
        if (!outline) {
            outline = document.createElement('div');
            outline.id = SKIP_OUTLINE_ID;
            outline.style.position = 'absolute';
            outline.style.width = `${SKIP_OUTLINE_WIDTH}px`;
            outline.style.height = `${SKIP_OUTLINE_HEIGHT}px`;
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

            const existingPosition = getComputedStyle(player).position;
            if (existingPosition === 'static' || !existingPosition) {
                player.style.position = 'relative';
            }
            player.appendChild(outline);
        }

        outline.style.left = `${left}px`;
        outline.style.top = `${top}px`;
    }

    function removeSkipOutline() {
        const outline = document.getElementById(SKIP_OUTLINE_ID);
        if (outline) outline.remove();
    }

    hideInPageAds();
    updateStatusAndVolume();

    const observer = new MutationObserver(() => {
        hideInPageAds();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(updateStatusAndVolume, 100);

    window.addEventListener('resize', () => {
        const skipButton = document.querySelector('.ytp-skip-ad-button');
        removeVideoOverlay();
        createVideoOverlay(skipButton);

        if (isVisible(skipButton)) {
            createOrUpdateSkipOutline(skipButton);
        } else {
            removeSkipOutline();
        }
    });
})();
