// ==UserScript==
// @name         FaceCheck URL Extractor with Ratings (Desktop and Mobile)
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Extracts image URLs and ratings from FaceCheck results for both desktop and mobile
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const createFloatingDiv = () => {
        const div = document.createElement("div");
        Object.assign(div.style, {
            position: "fixed",
            left: isMobile ? "5%" : "10px",
            top: "70px",
            width: isMobile ? "90%" : "300px",
            maxHeight: isMobile ? "80%" : "300px",
            background: "rgba(0,0,0,0.8)",
            color: "#00FFFF",
            zIndex: "9999",
            padding: "10px",
            borderRadius: "8px",
            overflowY: "auto",
            fontSize: isMobile ? "14px" : "16px",
            display: "none"
        });
        div.innerHTML = isMobile ?
            `<h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;cursor:pointer" id="resultsToggle">▼ Results:</h2>
            <div id="resultsList"></div>` :
            `<h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;">Results:</h2>
            <div id="resultsList"></div>`;
        document.body.appendChild(div);
        return div;
    };

    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

    const extractUrls = (maxResults) => {
        let results = [];
        for (let i = 0; i < maxResults; i++) {
            const fimg = document.querySelector(`#fimg${i}`);
            if (fimg) {
                const bgImage = window.getComputedStyle(fimg).backgroundImage;
                const base64Match = bgImage.match(/base64,(.*)"/);
                if (base64Match) {
                    const urlMatch = atob(base64Match[1]).match(/https?:\/\/[^\s"]+/);
                    if (urlMatch) {
                        const domain = new URL(urlMatch[0]).hostname.replace('www.', '');
                        const distSpan = fimg.parentElement.querySelector('.dist');
                        const confidence = distSpan ? parseInt(distSpan.textContent) : 0;
                        let rating;

                        if (confidence >= 90) rating = 'Certain Match';
                        else if (confidence >= 83) rating = 'Confident Match';
                        else if (confidence >= 70) rating = 'Uncertain Match';
                        else if (confidence >= 50) rating = 'Weak Match';
                        else rating = 'No Match';

                        results.push({ url: urlMatch[0], domain, confidence, rating });
                    }
                }
            }
        }
        return results.sort((a, b) => b.confidence - a.confidence);
    };

    const displayResults = (results, linkDiv) => {
        const resultsList = linkDiv.querySelector('#resultsList');
        resultsList.innerHTML = results.length ? results.map((result, index) => {
            const ratingColor = result.rating === 'Certain Match' ? 'green' :
                                result.rating === 'Confident Match' ? 'yellow' :
                                result.rating === 'Uncertain Match' ? 'orange' :
                                result.rating === 'Weak Match' ? 'red' : 'white';
            return `<a href="${result.url}" target="_blank" style="color:#00FFFF;text-decoration:none;display:block;margin-bottom:10px">
                ${index + 1}. ${result.domain} <span style="color:${ratingColor};">(${result.confidence}% - ${result.rating})</span>
            </a>`;
        }).join('') : '<p>No URLs found</p>';
        linkDiv.style.display = "block";
    };

    const initiateExtraction = (linkDiv) => {
        setTimeout(() => {
            const userCount = parseInt(prompt("How many URLs to extract? (1-50)", "10"), 10);
            const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;
            setTimeout(() => {
                const results = extractUrls(maxResults);
                displayResults(results, linkDiv);
            }, 1000);
        }, 1000);
    };

    const linkDiv = createFloatingDiv();
    const checkInterval = setInterval(() => {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateExtraction(linkDiv);
            clearInterval(checkInterval);
        }
    }, 1000);

    if (isMobile) {
        linkDiv.querySelector('#resultsToggle').addEventListener('click', () => {
            const resultsList = linkDiv.querySelector('#resultsList');
            resultsList.style.display = resultsList.style.display === 'none' ? 'block' : 'none';
            linkDiv.querySelector('#resultsToggle').textContent = (resultsList.style.display === 'none' ? '▶' : '▼') + ' Results:';
        });
    }
})();
