// ==UserScript==
// @name         URL Extractor for FaceCheck Results - Desktop
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Extracts image URLs from FaceCheck results and displays them in a popup with confidence ratings. Supports grouping and hover interactions.
// @author       vin31_ modified by Nthompson096, perplexity.ai and 0wn3dg0d
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // CSS Variables for easy theme management
    const styles = `
        :root {
            --popup-bg: black;
            --popup-color: #00FFFF;
            --popup-opacity: 0.9;
            --popup-border: 1px solid #00FFFF;
            --popup-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            --popup-radius: 8px;
            --popup-padding: 10px;
            --popup-width: 300px;
            --popup-max-height: 400px;
        }
        .popup {
            position: fixed;
            background: var(--popup-bg);
            color: var(--popup-color);
            opacity: var(--popup-opacity);
            border: var(--popup-border);
            box-shadow: var(--popup-shadow);
            border-radius: var(--popup-radius);
            padding: var(--popup-padding);
            width: var(--popup-width);
            max-height: var(--popup-max-height);
            overflow-y: auto;
            display: none;
            pointer-events: auto;
            transition: opacity 0.3s ease;
        }
        .popup.visible {
            display: block;
        }
    `;

    // Inject styles into the document
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Create and style the popup window
    const createPopup = () => {
        const popup = document.createElement("div");
        popup.classList.add("popup");
        document.body.appendChild(popup);
        return popup;
    };

    // Helper function to determine rating and color based on confidence score
    const getRating = (confidence) => {
        if (confidence >= 90) return { rating: 'Certain Match', color: 'green' };
        if (confidence >= 83) return { rating: 'Confident Match', color: 'yellow' };
        if (confidence >= 70) return { rating: 'Uncertain Match', color: 'orange' };
        if (confidence >= 50) return { rating: 'Weak Match', color: 'red' };
        return { rating: 'No Match', color: 'white' };
    };

    // Function to extract URLs and ratings
    const extractUrls = (fimg) => {
        const parentAnchor = fimg.closest('a');
        const groupId = parentAnchor.getAttribute('data-grp');
        const results = [];

        // If it's a group, collect all elements of the group
        if (groupId) {
            const groupElements = document.querySelectorAll(`a[data-grp="${groupId}"]`);
            groupElements.forEach(groupElement => {
                const groupFimg = groupElement.querySelector('.facediv');
                if (!groupFimg) return;

                const bgImage = window.getComputedStyle(groupFimg).backgroundImage;
                const base64Match = bgImage.match(/base64,(.*)"/);
                const urlMatch = base64Match ? atob(base64Match[1]).match(/https?:\/\/[^\s"]+/) : null;
                if (!urlMatch) return;

                const domain = new URL(urlMatch[0]).hostname.replace('www.', '');
                const distSpan = groupFimg.parentElement.querySelector('.dist');
                const confidence = distSpan ? parseInt(distSpan.textContent) : 0;
                const { rating, color } = getRating(confidence);

                results.push({ url: urlMatch[0], domain, confidence, rating, color });
            });
        } else {
            // If it's a standalone element
            const bgImage = window.getComputedStyle(fimg).backgroundImage;
            const base64Match = bgImage.match(/base64,(.*)"/);
            const urlMatch = base64Match ? atob(base64Match[1]).match(/https?:\/\/[^\s"]+/) : null;
            if (urlMatch) {
                const domain = new URL(urlMatch[0]).hostname.replace('www.', '');
                const distSpan = fimg.parentElement.querySelector('.dist');
                const confidence = distSpan ? parseInt(distSpan.textContent) : 0;
                const { rating, color } = getRating(confidence);

                results.push({ url: urlMatch[0], domain, confidence, rating, color });
            }
        }

        return results;
    };

    // Function to display results in the popup window
    const displayResults = (results, popup, fimg) => {
        const rect = fimg.getBoundingClientRect();
        popup.style.left = `${rect.right - 155}px`;
        popup.style.top = `${rect.top}px`;

        const resultsList = results.map(result => `
            <li>
                <a href="${result.url}" target="_blank" style="color:#00FFFF;text-decoration:none;">
                    ${result.domain}
                </a>
                <span style="color:${result.color};">(${result.confidence}% - ${result.rating})</span>
            </li>
        `).join('');

        popup.innerHTML = `<ul style='list-style:none;padding:0;'>${resultsList}</ul>`;
        popup.classList.add('visible');
    };

    // Create the popup window
    const popup = createPopup();

    // Add event listeners for all fimg elements
    const addHoverListeners = () => {
        const fimgElements = document.querySelectorAll('[id^="fimg"]');
        let hoverTimeout;
        let isPopupHovered = false;

        fimgElements.forEach(fimg => {
            fimg.addEventListener('mouseenter', () => {
                if (isPopupHovered) return;
                clearTimeout(hoverTimeout);
                const results = extractUrls(fimg);
                if (results.length > 0) {
                    displayResults(results, popup, fimg);
                }
            });

            fimg.addEventListener('mouseleave', () => {
                if (isPopupHovered) return;
                hoverTimeout = setTimeout(() => {
                    popup.classList.remove('visible');
                }, 300);
            });
        });

        // Event handler for the popup
        popup.addEventListener('mouseenter', () => {
            isPopupHovered = true;
            clearTimeout(hoverTimeout);
        });

        popup.addEventListener('mouseleave', () => {
            isPopupHovered = false;
            popup.classList.remove('visible');
        });
    };

    // Start adding event listeners after the page loads
    const checkInterval = setInterval(() => {
        if (/https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href) && document.querySelector('[id^="fimg"]')) {
            addHoverListeners();
            clearInterval(checkInterval);
        }
    }, 1000);

})();
