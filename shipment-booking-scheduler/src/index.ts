const log = require("./log");
const mountSchedulerController = require("./controllers/sbScheduler")

mountSchedulerController.initShipmentBookingScheduler();

console.log("Shipment Booking Scheduler Started and Running....");

process.on('unhandledRejection', (err:Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    log.logger('error',`unhandledRejection ${err.message} in process ${process.pid}`);
})

process.on('uncaughtException', (err:Error) => {
    log.logger('error',`uncaughtException ${err.message} in process ${process.pid}`);
    console.error(`Uncaught Exception: ${err.message}`);
})
