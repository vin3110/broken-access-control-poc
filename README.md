# facecheck.id-results-extractor
A Tampermonkey script to extract URLs from FaceCheck.id results for free.
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

## Why Does This Work?

FaceCheck.id embeds search result images as a string of a base64-encoded webp file. These images often contain embedded metadata in the form of XMP (Extensible Metadata Platform) data, which is typically included in image files to store information such as copyright details, camera settings, or links related to the image.

In the case of FaceCheck.id, the XMP metadata often contains URLs to the website it got it's images from, like social media profiles or other web pages related to the search result. 

The critical point here is that FaceCheck.id does not strip or remove this XMP metadata before embedding the webp images on their results page. As a result, the metadata, including the URLs, remains intact within the image data, allowing it to be accessed and decoded without needing to pay for the results.

I have tried finding their contact info to let them know about this, but they didn't leave their info on their website, or pretty much anywhere else. So I thought I'd share this for casual users to use (while it still works).
