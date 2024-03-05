const { JSDOM } = require('jsdom');
const { URL } = require('url');

/**
* Normalizes a URL.
*
* @param {string} url -The url which we want to normalize
* @returns {string} - The normalized url
*/
function normalizeURL(url){
  const urlObj = new URL(url);

  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  
  // Trancating end '/' from URL
  if (fullPath.length > 0 && fullPath.slice(-1) === '/'){
    fullPath = fullPath.slice(0, -1);
  }

  return fullPath;
}


/**
* Find URL in a given webpage and save them in an array
*
* @param {string} htmlBody - The HTML content to extract URLs from.
* @param {string} baseURL - The base URL.
* @returns {string[]} - An array of URL strings.
*/
function getURLsFromHTML(htmlBody, baseURL) {
    const dom = new JSDOM(htmlBody);
    const urls = [];

    // Creating an array of all <a> tag on webpage
    const aElements = dom.window.document.querySelectorAll('a');
    for (const aElement of aElements) {
        
        // Checking if found a relitive url
        if (aElement.href.slice(0, 1) === '/') {
            try {
                // Here converting relative url to absoluteURL
                urls.push(new URL(aElement.href, baseURL).href);
            } catch(err) {
                console.log(`${err.message}: ${aElement.href}`);
            }
        } else {
            // This block will execute if found an absolueURL
            try {
                urls.push(new URL(aElement.href).href);
            } catch(err) {
                console.log(`${err.message}: ${aElement.href}`);
            }
        }
    } 
    return urls;
}


/**
* Recursively crawl all URL in a agiven webpage.
*
* @param {string} baseURL - this is baseURL,for which we want to generate report.
* @param {string} currentURL - this is the url to crwal in this recursive iteration, in case of first call of crawlPage baseURL and currentURL will be same.
* @param {string: int} pagesMap - keep tarck of how many times an webpage linked internally.
* @returns - this function return nothing, it just mutate pagesMap object.
*/
async function crawlPage(baseURL, currentURL, pagesMap) {
    promiseArray = [];

    try {
        const response = await fetch(currentURL);

        // If can't fetch or got error from server we return from function 
        if (response.status >= 400 && response.status < 600) {
            console.log(`HTTP error in fetching ${currentURL}: Status code => ${response.status}`);
            return;
        }

        const contentType = response.headers.get('Content-Type');

        // If fetched itemis not a html page we don't srawl it and returned from function
        if (!contentType.includes('text/html')) {
            console.log(`Got non-html response from ${currentURL}: type=${contentType}, crawler has skipped this link`);
            return;

        } else {
            const linkArray = getURLsFromHTML(await response.text(), baseURL);

            for (const link of linkArray) {

                // When we find another domain different from our baseURL we don't want to srawl it and skip it
                if (new URL(link).hostname !== new URL(baseURL).hostname) {
                    continue;
                }

                const normalizedLink = normalizeURL(link);

                /* If link is present i pagesMap, that means we have crawled it before so we just increment it's count but 
                       don't scrawl it
                    */
                if (normalizedLink in pagesMap) {
                    pagesMap[normalizedLink]++;
                    continue;
                } else {
                    /* In case of we find our base url we don't want to scrawl it and we will start it's counting from '0',  
                       because the baseURL is our starting point, this is just personal choice
                    */
                    if (normalizedLink === normalizeURL(baseURL)) {
                        
                        pagesMap[normalizedLink] = 0;
                        continue;
                    } else {
                        // We only push a promise in promiseArray if it is never crawled before(it didn't exist in map)
                        pagesMap[normalizedLink] = 1;
                        promiseArray.push(crawlPage(baseURL, link, pagesMap));
                    }
                }
            }
            /* This crawlPage call wait for all its promises to resolve then it's execution will be completed
               and here .catch(err) used if any promise get rejected, it will handle that error and prevent Promise.all to end it waiting early
            */
            await Promise.all(promiseArray).catch((err) => console.log(err.message));
            return;
        }
    } catch(err) {
        console.log(err.message);
    }
}


module.exports = {
    crawlPage,
    getURLsFromHTML,
    normalizeURL
};
