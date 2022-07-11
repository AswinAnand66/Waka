import express from "express";
import path from "path";
import cors from "cors";
import compression from "compression";
const mountRoutes = require("./api/api")
const log = require("./log");
log.logger("info","Log Service Started");
log.dblog("info","Db Log Service Started");
const fs = require('fs');

const app = express();
app.use(compression());

//SSL CONFIG
var key = fs.readFileSync('C:\\waka\\ssl\\waka.key');
var cert = fs.readFileSync('C:\\waka\\ssl\\wakatech_com.crt' );
var ca = fs.readFileSync( 'C:\\waka\\ssl\\wakatech_com.ca-bundle' );

//SSL CONFIG
//var key = fs.readFileSync('/home/ec2-user/nodejs-crt-sk/ui-key.pem');
//var cert = fs.readFileSync( '/home/ec2-user/nodejs-crt-sk/ssl_certificate.cer' );
//var ca = fs.readFileSync( '/home/ec2-user/nodejs-crt-sk/IntermediateCA.cer' );

var options = {
key: key,
cert: cert,
ca: ca
};

var httpsPort=443;
var https = require('https');
https.createServer(options, app).listen(httpsPort, () => console.log('WAKA Server listening on port '+httpsPort+'!'));


// var httpsPort=9999;
// var https = require('https');
// https.createServer(options, app).listen(httpsPort, "10.0.1.128", () => console.log('WAKA Server listening on port '+httpsPort+'!'));

//HTTP listening port can be modified by changing below.
//var httpPort=8000;
//var http = require('http');
//http.createServer(app).listen(httpPort, () => console.log('WAKA Server listening on port '+httpPort+'!'));

app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:5443']
}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST']);
    res.setHeader("Access-Control-Allow-Credentials", "false");
    next();
})

app.use(express.json({limit: '30mb'}));
app.use(express.urlencoded({
    limit: '30mb',
    extended: true
}));
app.use(express.static(path.join(__dirname, '../../waka-sop-ui/dist/waka-sop-ui/')));
app.use(mountRoutes);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../waka-sop-ui/dist/waka-sop-ui/index.html')));
app.use(function applyXFrame(req, res, next) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
    next();
});

//var httpPort = 3000;
//app.listen(httpPort, () => console.log('WAKA Node Server listening on port ' + httpPort + '!'));

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
