const { crawlPage } = require("./crawl");


/**
* Print report in nice way.
* @param {string} baseURL - Will generate report of internal-links count for this webssite.
* @returns - nothing returns only print the report.
*/
async function printReport(baseURL) {
    console.log(`Starting to crwal ${baseURL}`);
    console.log('========== \n  REPORT  \n==========');
    const pagesMap = {};

    await crawlPage(baseURL, baseURL, pagesMap);

    for (const [page, pageCount] of Object.entries(pagesMap).sort((page1, page2) => {return page2[1] - page1[1]})) {
        console.log(`Found ${pageCount} internal links to URL: ${page}`);
    }
}


module.exports = {
    printReport
};
