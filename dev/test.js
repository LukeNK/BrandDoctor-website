// this is the file that provides the tests
module.exports = { onBuildComplete }

const { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } = require('fs'),
    { join } = require('path');

const logLevel = [
    // levels when logging
    'log', // informing the action
    'info', // inform an issue
    'warn', // a fail test but but the app still allows to work
    'error' // a fatal error
]

let testScore = 0, // the lower the score, the better
    testReport = [];

/**
 * Log a message
 * @param {Number} level Level of the log
 * @param {String} msg Message to be logged
 */
function log(level, msg) {
    testScore += level

    const prefix = logLevel[level];
    msg = `[${prefix}] ` + msg;

    console[prefix](msg);
    testReport.push(msg);
}

function onBuildComplete(config) {
    const buildFolder = 'build';

    // stats report
    {
        if (config.release) log(0, 'Test for release ' + config.release);
        log(0, readdirSync(buildFolder).length + ' items found in root')
    }

    log(0, 'Start file existence test');
    {
        // important files to check
        [
            ...config.releaseItems,
            'asset/script',
            'asset/style',
            'index.html',
            '404.html',
        ].forEach(item => {
            if (!existsSync(join(buildFolder, item)))
                log(3, item + ' does not exist');
        })

        if (!existsSync(join(buildFolder, 'sitemap.txt')))
            log(2, 'sitemap.txt does not exist');

        if (existsSync(join(buildFolder, 'dev')))
            log(1, 'dev folder found in build')
    }

    // ------------------------------------------------------------- Save result
    log(0, `Test completed with the score of ` + testScore);

    for (let l1 in testReport) {
        let line = testReport[l1];
        if (line.startsWith('[error]'))
            testReport[l1] = `<strong>${line}</strong>`;
        else if (line.startsWith('[warn]'))
            testReport[l1] = `<b>${line}</b>`;
        else if (line.startsWith('[info]'))
            testReport[l1] = `<i>${line}</i>`;
    }

    testReport = `<!DOCTYPE html>
        <style>
            code * {background-color: black;}
            strong {color: red;}
            b {color: orange;}
            i {color: cyan;}
        </style>
        <h1>Score: ${testScore}</h1>
        <pre><code>${testReport.join('\n')}</code></pre>`;

    mkdirSync(join(buildFolder, 'status'));
    writeFileSync(
        join(buildFolder, 'status', 'index.html'),
        testReport,
        'utf-8'
    )
}