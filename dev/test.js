// this is the file that provides the tests
module.exports = { onBuildComplete }

const { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } = require('fs'),
    { join, extname } = require('path');

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
        log(0, 'Test performed at: ' + (new Date()).toISOString())
        if (config.release) log(0, 'Test for release ' + config.release);
        log(0, readdirSync(buildFolder).length + ' items found in root');
        log(0, config.releaseItems.length + ' release items');
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
                return log(3, item + ' does not exist');

            if (
                extname(item) == ''
                && existsSync(join(buildFolder, item, config.languages[0] + '.json'))
            )
                log(3, item + ' translation file still exist')
        })

        if (!existsSync(join(buildFolder, 'sitemap.txt')))
            log(2, 'sitemap.txt does not exist');

        // things you don't want to see
        [
            '.vscode',
            '.GITIGNORE',
            'comp',
            'node_modules',
            'status',
            'package.json',
            'README.md',
        ].forEach(item => {
            if (existsSync(join(buildFolder, item)))
                log(1, item + ' folder found in build');
        })
    }

    log(0, 'Begin SEO test')
    let cacheFiles = {}; // cache just in case other tests also need to read files
    config.releaseItems.forEach(path => {
        if (path == '') return; // skip removed file
        path = join(buildFolder, path);
        if (extname(path) == '')
            path = join(path, 'index.html');
        if (!existsSync(path))
            return log(2, path + ' in sitemap, but not an HTML file');

        // remove capitalization
        cacheFiles[path] = readFileSync(path, 'utf-8').toLowerCase();

        if (!cacheFiles[path].startsWith('<!doctype html>'))
            log(1, path + ' does not start with doctype declaration');

        if (!cacheFiles[path].includes('<title>'))
            log(1, path + ' does not include title');

    });

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
            h1 {color: rgb(${Math.min(255, testScore)}, 0, 0);}
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