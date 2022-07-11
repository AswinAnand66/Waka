import { schedulerModel } from "../models/scheduler";
let log = require("../log");
const config = require("../config/constants");
const { machineIdSync } = require('node-machine-id');

let schedulerClass = new schedulerModel();
let dbConnected = false;
let systemId = machineIdSync({original: true})+'-ws02';

function setDbConnected() {
    return dbConnected;
}

async function registerScheduler(){
    let param = {
        scheduler_uid: systemId,
        scheduler_name: 'Shipment Booking',
        status: 'Running'
    };
    let result = await schedulerClass.registerScheduler(param);
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
        scheduler_name: 'Shipment Booking'
    };
    let result = await schedulerClass.updateSchedulerStatus(param);
    if(!result.success){
        registerScheduler();
        log.logger("info", `Update Scheduler status failed. - ERROR ${result.message} `);
        console.log("Update Scheduler status failed. - ERROR ", result.message);
    }
  }

async function initShipmentBookingScheduler() {
    let result = await schedulerClass.checkDB();
    if (result.success) {
        dbConnected = true;
        console.log("Database connected to", config.settings.pgDbConfig.host);
        registerScheduler();
        startShipmentBookingSchedulerService();
    }
    else {
        dbConnected = false;
        log.logger("error", `initShipmentBookingScheduler(), PSQL Connection Error ${result.message}, trying to connect in 10 sec`);
        setTimeout(() => {
            initShipmentBookingScheduler();
        }, 10000);
    }
    console.log("DB Connected - ", dbConnected);
}

function startShipmentBookingSchedulerService() {
    if (config.settings.shipmentBookingSchedulerRunningMode) {
        log.logger("info",`Shipment Booking Scheduler running mode is : ${config.settings.shipmentBookingSchedulerRunningMode}`);
        getShipmentBookingSchedule();
        setInterval(() => {
            getShipmentBookingSchedule();
        }, 60000 * 10);
    } else {
        log.logger("info", "Shipment Booking scheduler is in stopped state");
    }
}

async function getShipmentBookingSchedule() {
    log.logger("info", 'Started Shipment Booking Check.');
    try {
        let result = await schedulerClass.getSbSchedule();
        if (result.success && result.rowCount > 0) {
            let resRows = result.rows;
            resRows.map((sopIds: any) => {
                log.logger("info", `Shipment Booking Process queued for SOP ID - ${ sopIds.sop_id }`);
                scheduleShipmentBooking(sopIds);
            });
        } else {
            if (result.qry_error) {
                log.logger("info", `getShipmentBookingSchedule(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("info", `getShipmentBookingSchedule(), PSQL Connection Error ${result.message}`);
                initShipmentBookingScheduler();
            } 
            else if (result.rowCount == 0) {
                log.logger("info", 'Nothing to process for Shipment Booking');
            }
        }
    }
    catch (e: any) {
        log.logger("error", `getShipmentBookingSchedule() function Error ${e.message}`);
    }
}

async function scheduleShipmentBooking(sopId: any) {
    try {
        let gendate = sopId.generate_date;
        let maxDate:any;
        let dateColumn = gendate.mapped_column == 'Contract Shipment Date' ? 'ship_date' : gendate.mapped_column == 'Delivery Date' ? 'delivery_date' : 'cargo_ready_date';
        let dateCheck = await schedulerClass.getShipmentBookingLastProcessedDate(sopId.principal_id, sopId.ff_id, dateColumn);
        if(dateCheck.success) {
            if(dateCheck.rows[0].ref_date != null) {
                let d = new Date(dateCheck.rows[0].ref_date);
                let doo = new Date(d.setDate(d.getDate() + 1));
                let newdate = new Date( doo.getTime() + Math.abs(doo.getTimezoneOffset()*60000) );
                maxDate = newdate.toISOString();
            } else {
                maxDate = null
            }
        }
        let result = await schedulerClass.getPoData(sopId.principal_id, sopId.ff_id, dateColumn, gendate.date, maxDate);
        if (result.success && result.rowCount > 0) {
            log.logger("info", `Started Shipment Booking Process for SOP ID - ${sopId.sop_id}`);
            let POdata = result.rows;
            for(let key of POdata) { 
                let SBResult = await schedulerClass.insShipmentBookingDetails(key);
                if (SBResult.success) {
                    log.logger("info", `Processing Shipment Booking Details for PO ID - ${key.po_id}`);
                    await schedulerClass.updShipmentBookingStatus(sopId.sop_id, sopId.principal_id, key.po_id, SBResult.success, `Shipment Booking details processed sucessfully for PO ID - ${key.po_id}`, systemId );
                } else {
                    await schedulerClass.updShipmentBookingStatus(sopId.sop_id, sopId.principal_id, key.po_id, SBResult.success, `Shipment Booking details process failed for PO ID - ${key.po_id}, ERROR - ${SBResult.message}`, systemId );
                    log.logger("info", `Error Processing Shipment Booking Details for PO ID  - ${key.po_id}`);
                }
            }
            log.logger("info", `Completed Shipment Booking Process for SOP ID - ${sopId.sop_id}`);
        } else if (result.success && result.rowCount == 0) {
            log.logger("info", `Nothing to Process Shipment Booking for SOP ID - ${sopId.sop_id}`);
        } else {
            log.logger("error", `scheduleShipmentBooking() failed for SOP ID - ${sopId.sop_id} with exception ${result.message}`);
        }
    } catch (e: any) {
        log.logger("error", `scheduleShipmentBooking() failed for SOP ID - ${sopId.sop_id} with exception ${e.message}`);
    }
}

export = { dbConnected: setDbConnected, initShipmentBookingScheduler };
