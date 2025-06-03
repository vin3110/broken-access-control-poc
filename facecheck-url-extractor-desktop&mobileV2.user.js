// ==UserScript==
// @name         FaceCheck URL Extractor with Ratings (Mobile and Desktop)
// @namespace    http://tampermonkey.net/
// @version      2.0.3
// @description  Extracts image URLs and ratings from FaceCheck results for both mobile and desktop with hover functionality
// @author       vin31_ modified by Nthompson096, perplexity.ai and 0wn3dg0d
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Function to get cookie value by name
    const getCookie = (name) => {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
        return targetCookie ? targetCookie.split('=')[1] : null;
    };

    // Determine the theme based on the cookie
    const theme = getCookie('theme') || 'dark'; // Default to dark theme if cookie is not set

    // MOBILE FUNCTIONALITY
    if (isMobile) {
        // Mobile layout configuration
        const layoutConfig = {
            left: "5%",
            top: "70px",
            width: "90%",
            maxHeight: "80%",
            fontSize: "14px"
        };

        // Create and style the floating results div for mobile
        const createFloatingDiv = () => {
            const div = document.createElement("div");
            Object.assign(div.style, {
                position: "fixed",
                left: layoutConfig.left,
                top: layoutConfig.top,
                width: layoutConfig.width,
                maxHeight: layoutConfig.maxHeight,
                background: "rgba(0,0,0,0.8)",
                color: "#00FFFF",
                zIndex: "9999",
                padding: "10px",
                borderRadius: "8px",
                overflowY: "auto",
                fontSize: layoutConfig.fontSize,
                display: "none"
            });
            div.innerHTML = `
                <h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;cursor:pointer" id="resultsToggle">
                    ▼ Results:
                </h2>
                <div id="resultsList"></div>`;
            document.body.appendChild(div);

            // Toggle visibility for mobile
            div.querySelector('#resultsToggle').addEventListener('click', () => {
                const resultsList = div.querySelector('#resultsList');
                resultsList.style.display = resultsList.style.display === 'none' ? 'block' : 'none';
                div.querySelector('#resultsToggle').textContent = (resultsList.style.display === 'none' ? '▶' : '▼') + ' Results:';
            });

            return div;
        };

        // Mobile URL extraction
        const extractUrlsMobile = (maxResults) => {
            return Array.from({ length: maxResults }, (_, i) => {
                const fimg = document.querySelector(`#fimg${i}`);
                if (!fimg) return null;

                const bgImage = window.getComputedStyle(fimg).backgroundImage;
                const base64Match = bgImage.match(/base64,(.*)"/);
                const urlMatch = base64Match ? atob(base64Match[1]).match(/https?:\/\/[^\s"]+/) : null;
                if (!urlMatch) return null;

                const domain = new URL(urlMatch[0]).hostname.replace('www.', '');
                const distSpan = fimg.parentElement.querySelector('.dist');
                const confidence = distSpan ? parseInt(distSpan.textContent) : 0;
                const { rating, color } = getRating(confidence);

                return { url: urlMatch[0], domain, confidence, rating, color };
            }).filter(Boolean).sort((a, b) => b.confidence - a.confidence);
        };

        // Display the extracted results in the floating div
        const displayResults = (results, linkDiv) => {
            const resultsList = linkDiv.querySelector('#resultsList');
            resultsList.innerHTML = results.length
                ? results.map((result, index) => `
                    <a href="${result.url}" target="_blank" style="color:#00FFFF;text-decoration:none;display:block;margin-bottom:10px">
                        ${index + 1}. ${result.domain} <span style="color:${result.color};">(${result.confidence}% - ${result.rating})</span>
                    </a>`).join('')
                : '<p>No URLs found</p>';
            linkDiv.style.display = "block";
        };

        // Initialize extraction with user prompt
        const initiateExtraction = (linkDiv) => {
            setTimeout(() => {
                const userCount = Math.min(Math.max(parseInt(prompt("How many URLs to extract? (1-50)", "10")) || 10, 1), 50);
                setTimeout(() => displayResults(extractUrlsMobile(userCount), linkDiv), 1000);
            }, 1000);
        };

        // Create the floating div and check periodically for results
        const linkDiv = createFloatingDiv();
        const checkInterval = setInterval(() => {
            if (isResultsPage() && document.querySelector("#fimg0")) {
                initiateExtraction(linkDiv);
                clearInterval(checkInterval);
            }
        }, 1000);

    } else {
        // DESKTOP FUNCTIONALITY

        // CSS Variables for easy theme management
        const styles = `
            :root {
                --popup-bg: ${theme === 'light' ? '#ffffff' : '#1e1e1e'};
                --popup-color: ${theme === 'light' ? '#007acc' : '#00ffff'};
                --popup-opacity: 0.95;
                --popup-border: 1px solid ${theme === 'light' ? 'rgba(0, 122, 204, 0.2)' : 'rgba(0, 255, 255, 0.2)'};
                --popup-shadow: 0 4px 12px ${theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
                --popup-radius: 12px;
                --popup-padding: 16px;
                --popup-width: 320px;
                --popup-max-height: 400px;
                --popup-transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .popup {
                position: fixed;
                background: var(--popup-bg);
                color: var(--popup-color);
                opacity: 0;
                border: var(--popup-border);
                box-shadow: var(--popup-shadow);
                border-radius: var(--popup-radius);
                padding: var(--popup-padding);
                width: var(--popup-width);
                max-height: var(--popup-max-height);
                overflow-y: auto;
                pointer-events: auto;
                transition: var(--popup-transition);
                transform: translateY(-10px);
                backdrop-filter: blur(10px);
                z-index: 9999;
            }
            .popup.visible {
                opacity: var(--popup-opacity);
                transform: translateY(0);
            }
            .popup ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .popup li {
                margin: 8px 0;
            }
            .popup a {
                color: var(--popup-color);
                text-decoration: none;
                transition: color 0.2s ease;
            }
            .popup a:hover {
                color: #ff6f61;
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

        // Desktop URL extraction with group support
        const extractUrlsDesktop = (fimg) => {
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
        const displayResultsDesktop = (results, popup, fimg) => {
            const rect = fimg.getBoundingClientRect();
            popup.style.left = `${rect.right - 155}px`;
            popup.style.top = `${rect.top}px`;

            const resultsList = results.map(result => `
                <li>
                    <a href="${result.url}" target="_blank">
                        ${result.domain}
                    </a>
                    <span style="color:${result.color};">(${result.confidence}% - ${result.rating})</span>
                </li>
            `).join('');

            popup.innerHTML = `<ul>${resultsList}</ul>`;
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
                    const results = extractUrlsDesktop(fimg);
                    if (results.length > 0) {
                        displayResultsDesktop(results, popup, fimg);
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
            if (isResultsPage() && document.querySelector('[id^="fimg"]')) {
                addHoverListeners();
                clearInterval(checkInterval);
            }
        }, 1000);
    }

    // SHARED FUNCTIONS

    // Helper function to determine rating and color based on confidence score
    const getRating = (confidence) => {
        if (confidence >= 90) return { rating: 'Certain Match', color: isMobile ? 'green' : '#4caf50' };
        if (confidence >= 83) return { rating: 'Confident Match', color: isMobile ? 'yellow' : '#ffeb3b' };
        if (confidence >= 70) return { rating: 'Uncertain Match', color: isMobile ? 'orange' : '#ff9800' };
        if (confidence >= 50) return { rating: 'Weak Match', color: isMobile ? 'red' : '#f44336' };
        return { rating: 'No Match', color: isMobile ? 'white' : '#9e9e9e' };
    };

    // Helper to check if on results page
    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

})();
