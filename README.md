# facecheck.id-results-extractor

A script written in JavaScript to extract URLs from FaceCheck.id results for free. This script extracts base64-encoded img.webp data from FaceCheck search results. After the results page is detected the script displays the results on the webpage as clickable links. *(The way the results are displayed is different depending on the version you use.)

## Available Scripts

There are three versions of the script, tailored for different devices:

1. **facecheck-url-extractor-desktop&mobileV2.user.js**: Optimized for desktop use, this updated version introduces a new, interactive hover-based popup instead of a static results box.
   
* -> Sorting may change the order in which the links are displayed. I recommend trying both and finding your preference.

## Details on Version 2

   - Interactive Hover-Based Popup: Results appear dynamically when hovering over search images.

   - Group Support: Automatically detects and displays related URLs for grouped images.

   - Confidence Ratings: Visual ratings are displayed clearly:
      - Green (90%+): Certain Match
      - Yellow (83-89%): Confident Match
      - Orange (70-82%): Uncertain Match
      - Red (50-69%): Weak Match
      - Grey (<50%): No Match

   - Dynamic Theme Switching: Supports both dark and light themes based on your site's theme setting.

   - Enhanced User Experience: Smooth animations, and responsive interactions.

   - Added in mobile functionality
 
## How to Install

### For Desktop Browsers

1. Install Tampermonkey in your browser (available for Chrome, Firefox, and others).
2. Click on the Tampermonkey icon in your browser and select "Create a new script".
3. Copy the content from the desired script file:
   - `facecheck-url-extractor-desktop&mobileV2.user.js`
4. Paste the copied content into the Tampermonkey editor.
5. Save the script.

### For Mobile Browsers

To install on mobile, you need a mobile browser extention that supports running local JavaScript scripts ('Userscripts' app on iOS)('Tampermonkey' on Android).

1. **Install Userscripts/Tampermonkey**:
   - On **Android**: Install a compattible browser, for example: **Firefox** or **Kiwi Browser**, from the Google Play Store, then add the Tampermonkey extension from the browser’s add-ons/extensions page.
   - On **iOS**: Userscripts is available as a standalone app that can run user scripts in any browser.
I recommend watching a setup tutorial if you're confused about any of this.
   
2. **Add the Script**:
   - Browse to the GitHub in your browser.
   - Download the desired script file:
       - `facecheck-url-extractor-desktop&mobileV2.user.js`
   - Paste the script into the correct location. (Again, I recommend watching a setup tutorial if you're confused about any of this.)

## How to Use

### V2 (mobile):
1. Navigate to the results page on FaceCheck.id.
2. Enable the script and use the FaceCheck.id search.
3. A popup will ask how many URLs you'd like to extract (between 1 and 50).
4. The script will extract and display the URLs found in a black box in the upper-left corner of the webpage.
![image](https://github.com/user-attachments/assets/15cc1eca-e248-4782-98bd-4f5cee129403)


### V2:
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

FaceCheck.id embeds search result images as a string of a base64-encoded webp file. These images often contain embedded metadata in the form of XMP (Extensible Metadata Platform) data, which is typically included in image files to store information such as copyright details, camera settings, or links related to the image.

In the case of FaceCheck.id, the XMP metadata often contains URLs to the website it got it's images from, like social media profiles or other web pages related to the search result. 

The critical point here is that FaceCheck.id does not strip or remove this XMP metadata before embedding the webp images on their results page. As a result, the metadata, including the URLs, remains intact within the image data, allowing it to be accessed and decoded without needing to pay for the results.

I have tried finding their contact info to let them know about this, but they didn't leave their info on their website, or pretty much anywhere else. So I thought I'd share this for casual users to use (while it still works).

## Disclaimers

Please note that the results produced by this script may vary depending on the quality of the results provided by FaceCheck.id. 
While the script successfully extracts URLs, the relevance and accuracy of these URLs are entirely dependent on the search results generated by FaceCheck.id.

### Ethical Use

I do not condone or support the use of FaceCheck.id for doxing, harassment, or any other unethical or illegal activities. This script is intended for educational purposes and responsible use only. Please ensure that any use of the data extracted follows all applicable laws and respects the privacy and rights of individuals.

### Legal Disclaimer

The use of this script to extract URLs from FaceCheck.id may be subject to the Terms of Service of the website. Bypassing paywalls or circumventing access restrictions can potentially violate the terms set by the service provider. It is the user's responsibility to ensure that they comply with all applicable laws, regulations, and terms of service when using this script.

I do not take responsibility for any misuse of this script or any legal consequences that may arise from its use. This script is intended for educational purposes and ethical use only. If you are uncertain about the legality of using this script in your region, please consult a legal professional.
