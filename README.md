# Broken access control on FaceCheck.id — security PoC to extract result assets

This repository documents a cybersecurity proof of concept that demonstrates how result URLs can be extracted from FaceCheck.id search responses due to exposed metadata. The script parses base64‑encoded img.webp data on the results page and surfaces the discovered links as clickable items. *(Display details vary.)*

Disclosure: The vendor (FaceCheck.id) was notified via publicly available channels multiple times; no response has been received to date.

## OWASP A01: Broken Access Control

This PoC maps to OWASP Top 10 A01:2021 | Broken Access Control. Result source URLs are exposed to any client via image metadata returned by the server, without an authorization check. This is an access control failure, not a client-side bypass.

- Evidence: Source URLs present in XMP inside base64-encoded WebP images on the results page.
- Impact: Unauthorized disclosure of origin links that may identify individuals.
- Mitigations: Strip XMP/EXIF server-side, avoid embedding origin URLs in client-delivered assets, and enforce authorization on sensitive fields.

Reference: https://owasp.org/Top10/A01_2021-Broken_Access_Control/

## Available Scripts

As of now there is one version of the script usable on desktop and mobile.


1. **facecheck-id-results-exposure-poc.user.js**: Optimized for desktop use, this updated version introduces a new, interactive hover-based popup instead of a static results box.
   
* -> Sorting may change the order in which the links are displayed. I recommend trying both and finding your preference.

## Details on Version 2

   - Interactive Popups: Results appear dynamically when hovering over search images.

   - Group Support: Automatically detects and displays related URLs for grouped images.

   - Confidence Ratings: Visual ratings are displayed clearly:
      - Green (90%+): Certain Match
      - Yellow (83-89%): Confident Match
      - Orange (70-82%): Uncertain Match
      - Red (50-69%): Weak Match
      - Grey (<50%): No Match

   - Dynamic Theme Switching: Supports both dark and light themes based on your site's theme setting.

   - Enhanced User Experience: Smooth animations, and responsive interactions.

   - Added in extra mobile functionality
 
## How to Install

### For Desktop Browsers

1. Install Tampermonkey in your browser (available for Chrome, Firefox, and others).
2. Click on the Tampermonkey icon in your browser and select "Create a new script".
3. Copy the content from the desired script file:
   - `facecheck-id-results-exposure-poc.user.js`
4. Paste the copied content into the Tampermonkey editor.
5. Save the script.

### For Mobile Browsers

To install on mobile, you need a mobile browser extension that supports running local JavaScript scripts ('Userscripts' app on iOS)('Tampermonkey' on Android).

1. **Install Userscripts/Tampermonkey**:
   - On **Android**: Install a compatible browser, for example: **Firefox** or **Kiwi Browser**, from the Google Play Store, then add the Tampermonkey extension from the browser’s add-ons/extensions page.
   - On **iOS**: Userscripts is available as a standalone app that can run user scripts in any browser.
I recommend watching a setup tutorial if you're confused about any of this.
   
2. **Add the Script**:
   - Browse to the GitHub in your browser.
   - Download the desired script file:
       - `facecheck-id-results-exposure-poc.user.js`
   - Paste the script into the correct location. (Again, I recommend watching a setup tutorial if you're confused about any of this.)

## How to Use

### (Mobile):
1. Navigate to the results page on FaceCheck.id.
2. Enable the script and use the FaceCheck.id search.
3. Will show the results on top of the picture below it (see the example)

![image](https://github.com/user-attachments/assets/18a38c62-d444-4779-a372-d3ef1ee79a3b)



### (Desktop):
1. Navigate to FaceCheck.id and run your search.
2. Hover your cursor over individual results.
4. A popup will display URLs along with their confidence ratings.
5. Click URLs to open in new tabs.
![image](https://github.com/user-attachments/assets/e04ffa98-f9a6-44ce-a4b5-79466e388bac)


## What is FaceCheck.id?

FaceCheck.id is an online facial recognition tool that allows users to upload a photo and search the web for similar images or profiles. 
The platform is often used to identify individuals by cross-referencing facial features with images found across various websites, including social media, blogs, and other public platforms.
FaceCheck.id used to be totally free.
While the service offers free searches, detailed results, such as links to the sources of the images, are placed behind a paywall.

## Why Does This Work?

At a high level, this is a broken access control / data exposure issue. FaceCheck.id embeds search result images as base64‑encoded webp files. These images often contain embedded XMP (Extensible Metadata Platform) metadata.

In practice, the XMP frequently includes source URLs (e.g., social profiles or pages tied to the result). Because this metadata is not stripped before the images are embedded on the results page, the URLs remain accessible to any client that receives the page and can be decoded without crossing an authorization boundary.

Responsible disclosure attempts were made; as of this writing, no response has been received from the vendor.

## Disclaimers

Please note that the results produced by this script may vary depending on the quality of the results provided by FaceCheck.id. 
While the script successfully extracts URLs, the relevance and accuracy of these URLs are entirely dependent on the search results generated by FaceCheck.id.

### Ethical Use

I do not condone or support the use of FaceCheck.id for doxing, harassment, or any other unethical or illegal activities. This script is intended for educational purposes and responsible use only. Please ensure that any use of the data extracted follows all applicable laws and respects the privacy and rights of individuals.

### Legal Disclaimer

The use of this script to extract URLs from FaceCheck.id may be subject to the Terms of Service of the website. Bypassing paywalls or circumventing access restrictions can potentially violate the terms set by the service provider. It is the user's responsibility to ensure that they comply with all applicable laws, regulations, and terms of service when using this script.

I do not take responsibility for any misuse of this script or any legal consequences that may arise from its use. This script is intended for educational purposes and ethical use only. If you are uncertain about the legality of using this script in your region, please consult a legal professional.
