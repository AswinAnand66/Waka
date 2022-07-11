const log = require("./log");
const { checkDb, dbConnected, checkDir } = require("./controllers/initializeController");
const schedulerController = require("./controllers/schedulerController");
const schemaController = require("./controllers/schemaValidationController");
const masterController = require("./controllers/masterValidationController");

console.log('WAKA PO Ingestion Scheduler Started...');
log.logger("info", "WAKA PO Ingestion Scheduler Started.");
log.schemalog("info", "WAKA PO Ingestion Scheduler Started.");
log.masterlog("info", "WAKA PO Ingestion Scheduler Started.");

checkDir();

checkDb().then((dbConnected:boolean) => {
    if (dbConnected) {
        schedulerController.startPOISchedulerService();
        schemaController.startSchemaValidationService();
        masterController.startMasterValidationService();
    } else {
        setTimeout(() => {
            checkDb();
        }, 10000);
    }
});

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
