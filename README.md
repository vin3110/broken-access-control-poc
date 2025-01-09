# facecheck.id-results-extractor

*Modified version of [vin3110's original script](https://github.com/vin3110/facecheck.id-results-extractor)*

A JavaScript userscript that enhances FaceCheck.id by providing an interactive hover-based URL extraction system. This modified version extracts base64-encoded img.webp data from FaceCheck search results and displays them in a sleek popup interface. The script automatically detects result elements and shows URLs with confidence ratings when hovering over results.

## Key Features

- **Hover-Based Interface**: URLs are displayed in a floating popup when hovering over search results
- **Group Support**: Automatically detects and displays all related URLs for grouped results
- **Confidence Rating System**: Visual color-coded confidence ratings:
  - Green (90%+): Certain Match
  - Yellow (83-89%): Confident Match
  - Orange (70-82%): Uncertain Match
  - Red (50-69%): Weak Match
  - White (<50%): No Match

## Changes from Original Version

### Removed Features
- **Manual URL count selection prompt**: The script no longer asks the user to manually specify the number of URLs to extract
- **Static results box in the corner**: The fixed results box has been replaced with a dynamic, hover-based popup

### Added Features
- **Hover-based interaction system**: URLs and confidence ratings are now displayed in a sleek, floating popup when hovering over search results
- **Automatic group detection and handling**: The script now detects and displays all related URLs for grouped results without requiring manual input

## Installation (Desktop only)

1. Install Tampermonkey in your browser (available for Chrome, Firefox, and other major browsers)
2. Click on the Tampermonkey icon and select "Create a new script"
3. Copy the content from `facecheck-url-extractor.user.js`
4. Paste the copied content into the Tampermonkey editor
5. Save the script

## How to Use

1. Navigate to FaceCheck.id
2. Perform your search as usual
3. Hover over any result to see the extracted URLs and confidence ratings
4. Move your cursor to the popup to interact with the links
5. Click any URL to open it in a new tab

![alt text](https://github.com/0wn3dg0d/facecheck.id-results-extractor-v2/blob/main/hiw1.png)

## What is FaceCheck.id?

FaceCheck.id is an online facial recognition tool that enables users to search the web for similar images or profiles by uploading a photo. While the service offers free searches, detailed results such as source links are typically behind a paywall.

## Technical Details

The script works by:
1. Detecting base64-encoded webp images in the page
2. Extracting embedded XMP metadata containing source URLs
3. Processing confidence ratings from the page
4. Grouping related results based on FaceCheck.id's internal grouping system
5. Presenting the data in a user-friendly hover interface

## Disclaimers

### Accuracy and Reliability
Results accuracy depends entirely on FaceCheck.id's search capabilities and the quality of the embedded metadata. Not all results may contain extractable URLs.

### Ethical Use
This script is intended for educational and responsible use only. Users must ensure compliance with applicable laws and respect individual privacy rights.

### Legal Notice
Usage of this script may be subject to FaceCheck.id's Terms of Service. Users are responsible for ensuring their compliance with all applicable terms and conditions.

## Credits
- Original script by [vin3110](https://github.com/vin3110)
- Modified by 0wn3dg0d
