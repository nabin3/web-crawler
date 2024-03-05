const { printReport } = require('./report.js');


function main() {
    if (process.argv.length != 3) {
        console.log(' Please give only one URL \n usage:/ npm run start a_valid_URL \n');
        return;
    }
    
    printReport(process.argv[2]);
}


main();
