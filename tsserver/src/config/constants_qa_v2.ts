import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
const fs = require('fs');
const path = require('path');
const rand = randomBytes(32).toString('hex');

let settings = {
    jwtKey: '81d7cadc5912cc86e46c0534108fd4b26c36ea6c127bdc390a436f143314407f',
    pgDbConfig: {
        user: 'postgres',
        database: 'postgres',
        port: 5432,
        // host: '3.137.70.250',
        // password:'W@l@$1001',

        /*Appedo Test Env*/
      
        host: '10.1.101.225',
        password: 'jX3c0YIQXvqNdjpM',

        /* WAKA Test Env*/
        // host: '3.230.83.192',
        // password: 'W@k@tech',

        max: 50, // max number of clients in the pool
        idleTimeoutMillis: 300000,
    },
    tokenExpiresIn: '12h',
    fileUploadPath: '../../tsserver/fileuploads/',
    ordersTransactionAttachementPath: '../../tsserver/fileuploads/ordersTransaction',
    ingestionUploadPath: '../../tsserver/fileuploads/ingestion/'
};

//const MAIL_SERVICE_URL = "http://localhost:8822/mailer";
const MAIL_SERVICE_URL = "http://test.appedo.com:8822/mailer";
const ENCRYPTION_KEY = "5c88acf7989cbc7841@ar$tgrdc$td^h";  //process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
// const WAKA_URL="https://test.appedo.com:9999";
const WAKA_URL = "https://wakatech.com";
const isMailServiceEnabled = false;
function encrypt(eKey: string, text: string) {
    let startNum = hexToShort(eKey.substring(eKey.length - 2));
    let key = eKey.substring(startNum, startNum + 32);
    let iv = randomBytes(IV_LENGTH);
    let cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(dKey: string, text: string) {
    let startNum = hexToShort(dKey.substring(dKey.length - 2));
    let key = dKey.substring(startNum, startNum + 32);
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift()!, 'hex');
    let encryptedText = Buffer.from(textParts.join(":"), 'hex');
    let decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function MD5Hash(msgBuffer: Buffer) {
    return createHash('md5').update(msgBuffer).digest("hex");
}

function randomString(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-#^&';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function shortToHex(short: number) {
    return short.toString(16).padStart(2, "0");
}

function hexToShort(hex: string) {
    return parseInt(hex, 16);
}

function randBytes(length: number) {
    return randomBytes(length);
}

dirAvailablityChecker();
function dirAvailablityChecker() {
    if (!fs.existsSync(path.join(__dirname, settings.ordersTransactionAttachementPath))) {
        fs.mkdirSync(path.join(__dirname, settings.ordersTransactionAttachementPath));
    }
}

module.exports = { decrypt, encrypt, settings, MD5Hash, MAIL_SERVICE_URL, WAKA_URL, randomString, shortToHex, hexToShort, randBytes, isMailServiceEnabled };
