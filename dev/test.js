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
    const buildFolder = config.buildPath;

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
        });

        // things you don't want to see
        [
            '.vscode',
            '.GITIGNORE',
            'comp',
            'node_modules',
            'status',
            'dev',
            'package.json',
            'README.md',
        ].forEach(item => {
            if (existsSync(join(buildFolder, item)))
                log(1, item + ' item found in build');
        })
    }

    log(0, 'Begin SEO test')
    let cacheFiles = {}; // cache just in case other tests also need to read files
    {
        if (!existsSync(join(buildFolder, 'sitemap.txt')))
            log(2, 'sitemap.txt does not exist');

        config.releaseItems.forEach(path => {
            if (path == '') return; // skip removed file
            path = join(buildFolder, path);
            if (extname(path) == '')
                path = join(path, 'index.html');
            if (!existsSync(path))
                return log(2, path + ' in sitemap, but not an HTML file');

            let cacheFile = cacheFiles[path];

            // remove capitalization
            cacheFile = readFileSync(path, 'utf-8').toLowerCase();

            if (!cacheFile.startsWith('<!doctype html>'))
                log(1, path + ' does not start with doctype declaration');

            if (!cacheFile.includes('<meta charset="utf-8">'))
                log(1, path + ' does not set charset');

            if (!cacheFile.includes('<title>'))
                log(2, path + ' does not include title');

            if (!cacheFile.includes('<meta name="description" content="'))
                log(2, path + ' does not include meta description');

            if (
                !cacheFile.includes('<nav')
                || !cacheFile.includes('<footer')
            )
                log(2, path + ' does not include nav or footer');

            // content check
            let emptyAnchors = (cacheFile.match(/<a>/g) || []).length;
            if (emptyAnchors)
                log(2, `${path} has ${emptyAnchors} empty anchors`);
        });
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
        <meta name="robots" content="noindex, nofollow">
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