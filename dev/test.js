const fs = require('fs'),
    { join } = require('path');

const { readFileSync, writeFileSync } = fs;

const logLevel = [
    // levels when logging
    'log', // informing the action
    'info', // inform a positive result
    'warn', // a fail test but but the app still allows to work
    'error' // a fatal error
]

let testScore = 0; // the lower the score, the better

/**
 * Log a message
 * @param {Number} level Level of the log
 * @param {String} msg Message to be logged
 */
function log(level, msg) {
    testScore += level
    const prefix = logLevel[level];
    msg = `[${prefix}] ` + msg;

    console[prefix](msg)
}

// ----------------------------------------------------------------- Start tests
const buildFolder = join('Static-Wind', 'build');
const config = JSON.parse(readFileSync(
    join('Static-Wind', 'config.json'),
    'utf-8'
))

// check the existence of the release items
try {
    config.releaseItems.forEach(item => {
        if (!fs.existsSync(join(buildFolder, item)))
            throw Error(item + ' does not exist')
    })
    log(1, 'Release items exists')
} catch (err) {
    log(3, err)
    process.exit(1)
}