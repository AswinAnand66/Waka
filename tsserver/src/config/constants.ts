import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
const fs = require('fs');
const path = require('path');
const rand = randomBytes(32).toString('hex');

let settings = {
    // jwtKey: process.env.WAKA_JWT_KEY, //81d7cadc5912cc86e46c0534108fd4b26c36ea6c127bdc390a436f143314407f
    jwtKey: '81d7cadc5912cc86e46c0534108fd4b26c36ea6c127bdc390a436f143314407f',
    pgDbConfig: {
        // user: process.env.WAKA_DATABASE_USERNAME,
        // database: process.env.WAKA_DATABASE_NAME,
        // port: process.env.WAKA_DATABASE_PORT,
        // host: process.env.WAKA_DATABASE_HOST,
        // password: process.env.WAKA_DATABASE_PASSWORD,
        // max: process.env.WAKA_DATABASE_MAX_CONNECTION, //50
        // idleTimeoutMillis: process.env.WAKA_DATABASE_IDLE_TIMEOUT, //300000

        user: 'postgres',
        database: 'waka', 
        port: 5432,
        /*Appedo Test Env*/
        host: '35.160.246.188',
        password: 'n0#ntry@^pp#d0',
        max: 50, // max number of clients in the pool
        idleTimeoutMillis: 300000,

    },
    // tokenExpiresIn: process.env.WAKA_TOKEN_EXPIRES,
    tokenExpiresIn: '12h',
    fileUploadPath: '../../tsserver/fileuploads/',
    ordersTransactionAttachementPath: '../../tsserver/fileuploads/ordersTransaction',
    ingestionUploadPath: '../../tsserver/fileuploads/ingestion/'
};
 
const MAIL_SERVICE_URL = process.env.WAKA_MAIL_SERVICE_URL
const IV_LENGTH:any = process.env.WAKA_IV_LENGTH
const WAKA_URL = process.env.WAKA_URL
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
