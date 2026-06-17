const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, 'logs');
const SYSTEM_LOG = path.join(LOGS_DIR, 'system.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

function getTimestamp() {
    return new Date().toISOString();
}

function writeToFile(msg) {
    fs.appendFile(SYSTEM_LOG, msg + '\n', (err) => {
        if (err) console.error("Logger failed to write to file:", err);
    });
}

const logger = {
    info: (msg) => {
        const formatted = `[INFO] [${getTimestamp()}] ${msg}`;
        console.log(formatted);
        writeToFile(formatted);
    },
    warn: (msg) => {
        const formatted = `[WARN] [${getTimestamp()}] ${msg}`;
        console.warn(formatted);
        writeToFile(formatted);
    },
    error: (msg, err = '') => {
        const errDetails = err ? (err.stack || err.message || err) : '';
        const formatted = `[ERROR] [${getTimestamp()}] ${msg} ${errDetails}`;
        console.error(formatted);
        writeToFile(formatted);
    }
};

module.exports = logger;
