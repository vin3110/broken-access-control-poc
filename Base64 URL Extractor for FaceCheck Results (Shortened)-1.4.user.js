// ==UserScript==
// @name         Base64 URL Extractor for FaceCheck Results (Sorted with Ratings)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Extracts image URLs from FaceCheck results with sorting by confidence and rating display
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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

    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

    const extractUrls = (maxResults, linkDiv, sortByConfidence) => {
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
                        if (confidence >= 90) {
                            rating = 'high';
                        } else if (confidence >= 70) {
                            rating = 'medium';
                        } else {
                            rating = 'low';
                        }
                        results.push({ url: urlMatch[0], domain, confidence, rating });
                    }
                }
            }
        }

        if (sortByConfidence) {
            results.sort((a, b) => b.confidence - a.confidence);
        }

        let output = "<ul style='list-style:none;padding:0;'>";
        results.forEach((result, index) => {
            const ratingColor = result.rating === 'high' ? 'yellow' :
                                result.rating === 'medium' ? 'orange' : 'white';
            output += `<li>${index + 1}. <a href="${result.url}" target="_blank" style="color:#00FFFF;">${result.domain}</a> <span style="color:${ratingColor};">(${result.confidence}% - ${result.rating})</span></li>`;
        });
        linkDiv.innerHTML += output + "</ul>";
        linkDiv.style.display = "block";
    };

    const initiateExtraction = (linkDiv) => {
        setTimeout(() => {
            const userCount = parseInt(prompt("How many URLs to extract? (1-50)", "10"), 10);
            const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;
            setTimeout(() => extractUrls(maxResults, linkDiv, true), 1000);
        }, 1000);
    };

    const linkDiv = createFloatingDiv();
    const checkInterval = setInterval(() => {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateExtraction(linkDiv);
            clearInterval(checkInterval);
        }
    }, 1000);
})();
