# facecheck.id-results-extractor
A Tampermonkey script to extract URLs from FaceCheck.id results for free
This script extracts base64-encoded img.webp data from FaceCheck search results. After the results page is detected, it asks the user how many URLs to extract (up to 20) and displays them in a popup.

## How to Install
1. Install Tampermonkey in your browser (available for Chrome, Firefox, and others).
2. Click on the Tampermonkey icon in your browser, and select "Create a new script".
3. Copy the content from the `facecheck-url-extractor.user.js` file and paste it into the Tampermonkey editor.
4. Save the script.

## How to Use
1. Navigate to the results page on FaceCheck.id.
2. A popup will ask how many URLs you'd like to extract (between 1 and 20).
3. The script will extract and display the URLs found in a popup.
