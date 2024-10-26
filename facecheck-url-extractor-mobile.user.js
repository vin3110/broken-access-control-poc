// ==UserScript==
// @name         Mobile-Friendly Base64 URL Extractor for FaceCheck Results
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  Extracts image URLs from FaceCheck results and displays them in a mobile-friendly UI
// @author       vin31_
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create and add the floating div
    function createFloatingDiv() {
        const linkDiv = document.createElement("div");
        linkDiv.id = "image-link";
        Object.assign(linkDiv.style, {
            position: "fixed",
            left: "5%",
            top: "70px",
            width: "90%",
            maxHeight: "80%",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#00FFFF",
            zIndex: "9999",
            padding: "10px",
            borderRadius: "8px",
            overflowY: "auto",
            fontSize: "14px",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)"
        });

        const resultsHeader = document.createElement("h2");
        resultsHeader.innerText = "Results:";
        resultsHeader.style.color = "#FFFFFF";
        resultsHeader.style.fontSize = "16px";
        resultsHeader.style.margin = "0 0 10px 0";

        linkDiv.appendChild(resultsHeader);
        document.body.appendChild(linkDiv);

        // Add close button
        const closeButton = document.createElement("button");
        closeButton.innerText = "X";
        Object.assign(closeButton.style, {
            position: "absolute",
            right: "10px",
            top: "10px",
            background: "transparent",
            border: "none",
            color: "#FFFFFF",
            fontSize: "16px",
            cursor: "pointer"
        });
        closeButton.onclick = () => linkDiv.style.display = "none";
        linkDiv.appendChild(closeButton);
    }

    // Check if the current page is a results page
    function isResultsPage() {
        const url = window.location.href;
        return url.match(/https:\/\/facecheck\.id\/?(([a-z]{2})?\#.+)/);
    }

    // Ask user for number of URLs to extract
    function askForNumberOfUrls() {
        return new Promise(resolve => {
            const modal = document.createElement("div");
            Object.assign(modal.style, {
                position: "fixed",
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "10000"
            });

            const content = document.createElement("div");
            Object.assign(content.style, {
                background: "#FFFFFF",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center"
            });

            content.innerHTML = `
                <p>How many URLs would you like to extract? (1-50)</p>
                <input type="number" id="urlCount" min="1" max="50" value="10" style="width:100%;margin:10px 0;padding:5px;">
                <button id="submitCount" style="background:#00FFFF;border:none;padding:10px;border-radius:5px;cursor:pointer;">Submit</button>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            document.getElementById("submitCount").onclick = () => {
                const count = parseInt(document.getElementById("urlCount").value, 10);
                document.body.removeChild(modal);
                resolve(count);
            };
        });
    }

    // Extract and display URLs
    async function findElementsAndExtractUrls(maxResults) {
        let foundUrls = [];

        for (let i = 0; i < maxResults; i++) {
            let fimgElement = document.querySelector(`#fimg${i}`);
            if (fimgElement) {
                let backgroundImage = window.getComputedStyle(fimgElement).getPropertyValue('background-image');
                let base64String = backgroundImage.match(/base64,(.*)"/);
                if (base64String && base64String[1]) {
                    let decodedString = atob(base64String[1]);
                    let urlMatch = decodedString.match(/https?:\/\/[^\s"]+/);
                    if (urlMatch) {
                        let extractedUrl = urlMatch[0];
                        let domain = new URL(extractedUrl).hostname.replace('www.', '');
                        foundUrls.push({url: extractedUrl, domain: domain});
                    }
                }
            }
        }

        const linkDiv = document.getElementById("image-link");
        if (foundUrls.length > 0) {
            let output = "<ul style='list-style: none; padding: 0; margin: 0;'>";
            foundUrls.forEach((item, index) => {
                output += `<li style="margin-bottom: 10px;"><a href="${item.url}" target="_blank" style="color: #00FFFF; text-decoration: none;">${index + 1}. ${item.domain}</a></li>`;
            });
            output += "</ul>";
            linkDiv.innerHTML += output;
        } else {
            linkDiv.innerHTML += "<p>No URLs found</p>";
        }
    }

    // Main function to initiate URL extraction
    async function initiateUrlExtraction() {
        if (document.querySelector("#fimg0")) {
            createFloatingDiv();
            const userCount = await askForNumberOfUrls();
            const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;
            setTimeout(() => findElementsAndExtractUrls(maxResults), 1000);
        }
    }

    // Check for results page every second
    const checkResultsPage = setInterval(() => {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateUrlExtraction();
            clearInterval(checkResultsPage);
        }
    }, 1000);
})();
