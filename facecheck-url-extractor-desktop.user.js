// ==UserScript==
// @name         URL Extractor for FaceCheck Results - Desktop
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Extracts image URLs from FaceCheck results with sorting by confidence and rating display
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create and style floating div for displaying results
    const createFloatingDiv = () => {
        const div = document.createElement("div");
        Object.assign(div.style, {
            position: "fixed", left: "10px", top: "70px", background: "black",
            color: "#00FFFF", opacity: "0.8", overflow: "auto", zIndex: "9999",
            padding: "10px", textAlign: "left", width: "300px", height: "300px",
            borderRadius: "8px", display: "none"
        });
        div.innerHTML = "<h2 style='color:#FFFFFF;font-size:18px;margin:0 0 10px 0'>Results:</h2>";
        document.body.appendChild(div);
        return div;
    };

    // Helper to determine rating and color based on confidence score
    const getRating = (confidence) => {
        if (confidence >= 90) return { rating: 'Certain Match', color: 'green' };
        if (confidence >= 83) return { rating: 'Confident Match', color: 'yellow' };
        if (confidence >= 70) return { rating: 'Uncertain Match', color: 'orange' };
        if (confidence >= 50) return { rating: 'Weak Match', color: 'red' };
        return { rating: 'No Match', color: 'white' };
    };

    // Function to extract URLs and ratings
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
        }).filter(Boolean);
    };

    // Display results in floating div
    const displayResults = (results, linkDiv) => {
        const resultsList = results.map((result, index) => `
            <li>${index + 1}. <a href="${result.url}" target="_blank" style="color:#00FFFF;text-decoration:none;">
            ${result.domain}</a> <span style="color:${result.color};">(${result.confidence}% - ${result.rating})</span>
            </li>
        `).join('');

        linkDiv.innerHTML += `<ul style='list-style:none;padding:0;'>${resultsList}</ul>`;
        linkDiv.style.display = "block";
    };

    // Start URL extraction after user prompt
    const initiateExtraction = (linkDiv) => {
        setTimeout(() => {
            const userCount = Math.min(Math.max(parseInt(prompt("How many URLs to extract? (1-50)", "10")) || 10, 1), 50);
            setTimeout(() => displayResults(extractUrls(userCount), linkDiv), 1000);
        }, 1000);
    };

    // Create floating div and check for results page
    const linkDiv = createFloatingDiv();
    const checkInterval = setInterval(() => {
        if (/https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href) && document.querySelector("#fimg0")) {
            initiateExtraction(linkDiv);
            clearInterval(checkInterval);
        }
    }, 1000);

})();
