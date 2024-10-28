// ==UserScript==
// @name         FaceCheck URL Extractor (Collapsible)
// @namespace    http://tampermonkey.net/
// @version      1.8.0
// @description  Extracts image URLs from FaceCheck results with collapsible list
// @author       vin31_ modifed by Nthompson096 with perplexity.ai
// @match        https://facecheck.id/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';
    const extractUrls = max => [...Array(max)].map((_, i) => {
        const bg = window.getComputedStyle(document.querySelector(`#fimg${i}`) || {}).backgroundImage;
        const url = atob(bg.match(/base64,(.*)"/)?.[1] || '').match(/https?:\/\/[^\s"]+/)?.[0];
        return url ? {url, domain: new URL(url).hostname.replace('www.', '')} : null;
    }).filter(Boolean);

    const init = async () => {
        if (document.querySelector('#fimg0')) {
            const div = Object.assign(document.createElement('div'), {
                style: 'position:fixed;left:5%;top:70px;width:90%;max-height:80%;background:rgba(0,0,0,0.8);color:#00FFFF;z-index:9999;padding:10px;border-radius:8px;overflow-y:auto;font-size:14px',
                innerHTML: `
                    <h2 style="color:#FFF;margin:0 0 10px;cursor:pointer" id="resultsToggle">▼ Results:</h2>
                    <div id="resultsList" style="display:block"></div>
                    <button style="position:absolute;right:10px;top:10px;background:none;border:none;color:#FFF;cursor:pointer" onclick="this.parentNode.style.display='none'">X</button>
                `
            });
            document.body.appendChild(div);

            const urls = extractUrls(Math.min(Math.max(parseInt(prompt('How many URLs to extract? (1-50)', '10')) || 10, 1), 50));
            const resultsList = div.querySelector('#resultsList');
            resultsList.innerHTML = urls.length ? urls.map((item, i) => `<a href="${item.url}" target="_blank" style="color:#00FFFF;text-decoration:none;display:block;margin-bottom:10px">${i+1}. ${item.domain}</a>`).join('') : '<p>No URLs found</p>';

            div.querySelector('#resultsToggle').addEventListener('click', () => {
                resultsList.style.display = resultsList.style.display === 'none' ? 'block' : 'none';
                div.querySelector('#resultsToggle').textContent = (resultsList.style.display === 'none' ? '▶' : '▼') + ' Results:';
            });
        }
    };

    const checkInterval = setInterval(() => {
        if (/https:\/\/facecheck\.id\/?(([a-z]{2})?\#.+)/.test(location.href) && document.querySelector('#fimg0')) {
            init();
            clearInterval(checkInterval);
        }
    }, 1000);
})();
