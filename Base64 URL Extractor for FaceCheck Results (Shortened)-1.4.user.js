// ==UserScript==
// @name         Base64 URL Extractor for FaceCheck Results (Sorted with Ratings)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Extracts image URLs from FaceCheck results with sorting by confidence and rating display
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create a floating div to display results
    const createFloatingDiv = () => {
        const div = document.createElement("div");
        // Set styles for the floating div
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

    // Function to check if the current page is a results page
    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

    // Function to extract URLs and display results
    const extractUrls = (maxResults, linkDiv, sortByConfidence) => {
        let results = [];
        // Loop through the results and extract information
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
                        const rating = distSpan.classList.contains('yellow') ? 'high' :
                                       distSpan.classList.contains('uncertain') ? 'uncertain' : 'low';
                        results.push({ url: urlMatch[0], domain, confidence, rating });
                    }
                }
            }
        }

        // Sort results by confidence
        if (sortByConfidence) {
            results.sort((a, b) => b.confidence - a.confidence);
        }

        // Generate HTML output for results
        let output = "<ul style='list-style:none;padding:0;'>";
        results.forEach((result, index) => {
            const ratingColor = result.rating === 'high' ? 'yellow' :
                                result.rating === 'uncertain' ? 'orange' : 'white';
            output += `<li>${index + 1}. <a href="${result.url}" target="_blank" style="color:#00FFFF;">${result.domain}</a> <span style="color:${ratingColor};">(${result.confidence}% - ${result.rating})</span></li>`;
        });
        linkDiv.innerHTML += output + "</ul>";
        linkDiv.style.display = "block";
    };

    // Function to initiate the extraction process
    const initiateExtraction = (linkDiv) => {
        setTimeout(() => {
            // Prompt user for number of URLs to extract
            const userCount = parseInt(prompt("How many URLs to extract? (1-50)", "10"), 10);
            const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;
            // Extract URLs after a short delay
            setTimeout(() => extractUrls(maxResults, linkDiv), 1000);
        }, 1000);
    };

    // Create the floating div to display results
    const linkDiv = createFloatingDiv();
    // Check periodically if we're on a results page
    const checkInterval = setInterval(() => {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateExtraction(linkDiv);
            clearInterval(checkInterval);
        }
    }, 1000);
})();
