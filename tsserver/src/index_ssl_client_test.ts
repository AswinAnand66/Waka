import express from "express";
import path from "path";
import cors from "cors";
import compression from "compression";
const mountRoutes = require("./api/api")
const mountIngestionRoutes = require("./PoIngestion/ingestion")
const log = require("./log");

log.logger("info","Log Service Started");
log.dblog("info","Db Log Service Started");
const fs = require('fs');

const app = express();
app.use(compression());

//SSL CONFIG
var key = fs.readFileSync('/root/sslwakatest/waka-test.key');
var cert = fs.readFileSync( '/root/sslwakatest/qa_wakatech_com.crt' );
var ca = fs.readFileSync( '/root/sslwakatest/qa_wakatech_com.ca-bundle' );

var options = {
key: key,
cert: cert,
ca: ca
};

var httpsPort=443;
var https = require('https');
https.createServer(options, app).listen(httpsPort, "172.31.25.125", () => console.log('WAKA Server listening on port '+httpsPort+'!'));

app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:5443']
}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST']);
    res.setHeader("Access-Control-Allow-Credentials", "false");
    next();
})

app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({
    limit: '20mb',
    extended: true
}));
app.use(express.static(path.join(__dirname, '../../waka-sop-ui/dist/waka-sop-ui/')));
app.use('/api', mountRoutes);
app.use('/ingestion', mountIngestionRoutes);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../waka-sop-ui/dist/waka-sop-ui/index.html')));
app.use(function applyXFrame(req, res, next) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
    next();
});

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
