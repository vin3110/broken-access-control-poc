// ==UserScript==
// @name         FaceCheck URL Extractor with Ratings (Desktop and Mobile)
// @namespace    http://tampermonkey.net/
// @version      2.2.1
// @description  Extracts image URLs and ratings from FaceCheck results for both desktop and mobile
// @author       vin31_ modified by Nthompson096 and perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Check if the user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Function to create and style the floating results div
    const createFloatingDiv = () => {
        const div = document.createElement("div");
        // Set styles for the floating div
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
        // Create different HTML structures for mobile and desktop
        div.innerHTML = isMobile ?
            `<h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;cursor:pointer" id="resultsToggle">▼ Results:</h2>
            <div id="resultsList"></div>` :
            `<h2 style="color:#FFFFFF;font-size:18px;margin:0 0 10px 0;">Results:</h2>
            <div id="resultsList"></div>`;
        document.body.appendChild(div);
        return div;
    };

    // Function to check if the current page is a results page
    const isResultsPage = () => /https:\/\/facecheck\.id\/(?:[a-z]{2})?\#.+/.test(window.location.href);

    // Function to extract URLs and ratings from the page
    const extractUrls = (maxResults) => {
        let results = [];
        for (let i = 0; i < maxResults; i++) {
            const fimg = document.querySelector(`#fimg${i}`);
            if (fimg) {
                // Extract background image URL
                const bgImage = window.getComputedStyle(fimg).backgroundImage;
                const base64Match = bgImage.match(/base64,(.*)"/);
                if (base64Match) {
                    const urlMatch = atob(base64Match[1]).match(/https?:\/\/[^\s"]+/);
                    if (urlMatch) {
                        // Extract domain and confidence score
                        const domain = new URL(urlMatch[0]).hostname.replace('www.', '');
                        const distSpan = fimg.parentElement.querySelector('.dist');
                        const confidence = distSpan ? parseInt(distSpan.textContent) : 0;
                        // Determine rating based on confidence score
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
        // Sort results by confidence score in descending order
        return results.sort((a, b) => b.confidence - a.confidence);
    };

    // Function to display the extracted results in the floating div
    const displayResults = (results, linkDiv) => {
        const resultsList = linkDiv.querySelector('#resultsList');
        resultsList.innerHTML = results.length ? results.map((result, index) => {
            // Determine color based on rating
            const ratingColor = result.rating === 'Certain Match' ? 'green' :
                                result.rating === 'Confident Match' ? 'yellow' :
                                result.rating === 'Uncertain Match' ? 'orange' :
                                result.rating === 'Weak Match' ? 'red' : 'white';
            // Create HTML for each result
            return `<a href="${result.url}" target="_blank" style="color:#00FFFF;text-decoration:none;display:block;margin-bottom:10px">
                ${index + 1}. ${result.domain} <span style="color:${ratingColor};">(${result.confidence}% - ${result.rating})</span>
            </a>`;
        }).join('') : '<p>No URLs found</p>';
        linkDiv.style.display = "block";
    };

    // Function to initiate the URL extraction process
    const initiateExtraction = (linkDiv) => {
        setTimeout(() => {
            // Prompt user for number of URLs to extract
            const userCount = parseInt(prompt("How many URLs to extract? (1-50)", "10"), 10);
            const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;
            setTimeout(() => {
                const results = extractUrls(maxResults);
                displayResults(results, linkDiv);
            }, 1000);
        }, 1000);
    };

    // Create the floating div
    const linkDiv = createFloatingDiv();

    // Check periodically if we're on a results page and start extraction when ready
    const checkInterval = setInterval(() => {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateExtraction(linkDiv);
            clearInterval(checkInterval);
        }
    }, 1000);

    // Add toggle functionality for mobile devices only
    if (isMobile) {
        linkDiv.querySelector('#resultsToggle').addEventListener('click', () => {
            const resultsList = linkDiv.querySelector('#resultsList');
            resultsList.style.display = resultsList.style.display === 'none' ? 'block' : 'none';
            linkDiv.querySelector('#resultsToggle').textContent = (resultsList.style.display === 'none' ? '▶' : '▼') + ' Results:';
        });
    }
})();
