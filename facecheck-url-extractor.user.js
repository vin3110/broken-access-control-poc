// ==UserScript==
// @name         Base64 URL Extractor for FaceCheck Results with Delayed User Input
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Asks the user how many image URLs to extract (up to 50), and displays them in a floating UI
// @author       vin31_
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add a floating div to display the extracted URLs with new styling using vanilla JavaScript
    setTimeout(function() {
        const linkDiv = document.createElement("div");
        linkDiv.id = "image-link";
        linkDiv.style.position = "fixed";
        linkDiv.style.left = "10px";
        linkDiv.style.top = "70px";
        linkDiv.style.background = "black";
        linkDiv.style.color = "#00FFFF";
        linkDiv.style.opacity = "0.8";
        linkDiv.style.overflow = "auto";
        linkDiv.style.zIndex = "9999";
        linkDiv.style.padding = "10px";
        linkDiv.style.textAlign = "left";
        linkDiv.style.width = "300px";
        linkDiv.style.height = "300px";
        linkDiv.style.borderRadius = "8px";

        // Add a white header "Results:" at the top of the box
        const resultsHeader = document.createElement("h2");
        resultsHeader.innerText = "Results:";
        resultsHeader.style.color = "#FFFFFF"; // text color
        resultsHeader.style.fontSize = "18px"; // font size
        resultsHeader.style.margin = "0 0 10px 0"; // margin for spacing

        // Append the header to the linkDiv
        linkDiv.appendChild(resultsHeader);

        // Append the linkDiv to the body
        document.body.appendChild(linkDiv);
    }, 500);

    // Function to check if the current page is a results page
    function isResultsPage() {
        return window.location.href.match(/https:\/\/facecheck\.id\/#.+/);
    }

    // Function to ask user input once the results page is detected
    function askForNumberOfUrls() {
        return parseInt(prompt("How many URLs would you like to extract? (Enter a number between 1 and 50)", "10"), 10);
    }

    // Function to loop through the results and extract URLs
    function findElementsAndExtractUrls(maxResults) {
        let foundUrls = []; // Array to store all found URLs

        // Loop through the results (fimg0, fimg1, etc.) up to maxResults
        for (let i = 0; i < maxResults; i++) {
            let fimgElement = document.querySelector(`#fimg${i}`);

            if (fimgElement) {
                // Get the CSS background-image value
                let backgroundImage = window.getComputedStyle(fimgElement).getPropertyValue('background-image');

                // Extract the base64 string from the background-image
                let base64String = backgroundImage.match(/base64,(.*)"/);
                if (base64String && base64String[1]) {
                    // Decode the base64 string
                    let decodedString = atob(base64String[1]);

                    // Search for a URL in the decoded string
                    let urlMatch = decodedString.match(/https?:\/\/[^\s"]+/);

                    if (urlMatch) {
                        let extractedUrl = urlMatch[0];
                        // Extract just the domain name for display purposes
                        let domain = new URL(extractedUrl).hostname.replace('www.', '');
                        // Add the extracted URL and domain to the array
                        foundUrls.push({url: extractedUrl, domain: domain});
                    }
                }
            }
        }

        // If URLs are found, display them in the floating UI
        if (foundUrls.length > 0) {
            let output = "<ul style='list-style: none; padding: 0;'>"; // List for output
            for (let i = 0; i < foundUrls.length; i++) {
                output += `<li>${i + 1}. <a href="${foundUrls[i].url}" target="_blank" style="color: #00FFFF;">${foundUrls[i].domain}</a></li>`;
            }
            output += "</ul>";
            document.getElementById("image-link").innerHTML += output; // Append the results under the header
        } else {
            document.getElementById("image-link").innerText = "No URLs found";
        }
    }

    // Function to start the URL extraction after fimg0 is detected
    function initiateUrlExtraction() {
        const fimg0 = document.querySelector("#fimg0"); // Check if fimg0 exists
        if (fimg0) {
            // 1-second delay before prompting the user
            setTimeout(function() {
                // Ask the user how many URLs they want to extract
                const userCount = askForNumberOfUrls();
                // Validate user input, default to 10 if input is invalid
                const maxResults = (isNaN(userCount) || userCount < 1 || userCount > 50) ? 10 : userCount;

                // After 1 second, start extracting the URLs
                setTimeout(function() {
                    findElementsAndExtractUrls(maxResults);
                }, 1000); // 1 second delay for URL extraction
            }, 1000); // 1 second delay before asking for URLs
        }
    }

    // Use setInterval to check every 1000 ms (1 second) if fimg0 is detected
    const checkResultsPage = setInterval(function() {
        if (isResultsPage() && document.querySelector("#fimg0")) {
            initiateUrlExtraction(); // Start the process when fimg0 is detected
            clearInterval(checkResultsPage); // Stop checking once fimg0 is found
        }
    }, 1000); // Delay set to 1000ms (1 second)

})();
