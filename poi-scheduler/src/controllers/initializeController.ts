import { Initialize } from "../models/initialize";
const fs = require('fs');
const path = require('path');
const config = require("../config/constants");
const { machineIdSync } = require('node-machine-id');

let log = require("../log");
let systemId = machineIdSync({original: true})+'-ws01';
let initClass = new Initialize();
let dbConnected = false;

function dirAvailablityChecker() {
    if (!fs.existsSync(path.join(__dirname, config.settings.uploadPath))) {
        fs.mkdirSync(path.join(__dirname, config.settings.uploadPath));
        log.logger("info", "File Upload Directory Created.");
        console.log("File Upload Directory Created.");
    } else {
        log.logger("info", "File Upload Directory Available.");
        console.log("File Upload Directory Available.");
    }
}

function setDbConnected() {
    return dbConnected;
}

async function checkDb() {
    let result = await initClass.checkDB();
    if (result.success) {
        console.log("Database Connection Established.");
        dbConnected = true;
        console.log("Database connected to", config.settings.pgDbConfig.host);
        registerScheduler();
    }
    else {
        dbConnected = false;
        console.log("Database Connection Failed, Retrying...");
        log.logger("error", `checkDb(), PSQL Connection Error ${result.message}, trying to connect in 10 sec`);
    }
    return dbConnected
}
async function registerScheduler(){
    let param = {
        scheduler_uid: systemId,
        scheduler_name: 'PO Ingestion',
        status: 'Running'
    };
    let result = await initClass.registerScheduler(param);
    if(result.success){
        //updating agent status once in 5 minutes.
        setInterval(() => {
            updateSchedulerStatus();
        }, 5*60*1000);
        log.logger("info", `Scheduler registered. - ${systemId}`);
        console.log("Scheduler registered. -", systemId);
    } else {
        log.logger("info", `Scheduler failed to register. - ERROR ${result.message} `);
        console.log("Scheduler failed to register.", result.message);
    }
}

async function updateSchedulerStatus(){
    let param = {
        scheduler_uid: systemId,
        scheduler_name: 'PO Ingestion'
    };
    let result = await initClass.updateSchedulerStatus(param);
    if(!result.success){
        registerScheduler();
        log.logger("info", `Update Scheduler status failed. - ERROR ${result.message} `);
        console.log("Update Scheduler status failed. - ERROR ", result.message);
    }
  }

export = { dbConnected: setDbConnected, checkDb, checkDir: dirAvailablityChecker };
