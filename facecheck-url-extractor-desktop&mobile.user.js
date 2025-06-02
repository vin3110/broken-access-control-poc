// ==UserScript==
// @name         FaceCheck URL Extractor with Ratings (Desktop and Mobile)
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Extracts image URLs and ratings from FaceCheck results for both desktop and mobile
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Layout configuration based on device
    const layoutConfig = {
        left: isMobile ? "5%" : "10px",
        top: "70px",
        width: isMobile ? "90%" : "300px",
        maxHeight: isMobile ? "80%" : "300px",
        fontSize: isMobile ? "14px" : "16px"
    };

    // Create and style the floating results div
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
            <h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;${isMobile ? 'cursor:pointer' : ''}" id="resultsToggle">
                ${isMobile ? '▼' : ''} Results:
            </h2>
            <div id="resultsList"></div>`;
        document.body.appendChild(div);

        // Toggle visibility for mobile
        if (isMobile) {
            div.querySelector('#resultsToggle').addEventListener('click', () => {
                const resultsList = div.querySelector('#resultsList');
                resultsList.style.display = resultsList.style.display === 'none' ? 'block' : 'none';
                div.querySelector('#resultsToggle').textContent = (resultsList.style.display === 'none' ? '▶' : '▼') + ' Results:';
            });
        }
        return div;
    };

    // Determine rating based on confidence score
    const getRating = (confidence) => {
        if (confidence >= 90) return { rating: 'Certain Match', color: 'green' };
        if (confidence >= 83) return { rating: 'Confident Match', color: 'yellow' };
        if (confidence >= 70) return { rating: 'Uncertain Match', color: 'orange' };
        if (confidence >= 50) return { rating: 'Weak Match', color: 'red' };
        return { rating: 'No Match', color: 'white' };
    };

    // Extract URLs and ratings from the page
    const extractUrls = (maxResults) => {
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
            setTimeout(() => displayResults(extractUrls(userCount), linkDiv), 1000);
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

    // Helper to check if on results page
    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

})();
