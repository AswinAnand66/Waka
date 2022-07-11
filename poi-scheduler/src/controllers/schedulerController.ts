import { schedulerModel } from "../models/schedulerModel";
const { checkDb } = require("../controllers/initializeController");
const { XMLValidator } = require("fast-xml-parser");
const path = require('path');
const config = require("../config/constants");
const fetch = require('node-fetch');
const fs = require('fs');
const { machineIdSync } = require('node-machine-id');

let log = require("../log");
let systemId = machineIdSync({original: true});
let schedulerClass = new schedulerModel();

function startPOISchedulerService() {
    try {
        if (config.settings.poiSchedulerRunningMode) {
            getPOISchedule();
            setInterval(() => {
                log.logger("info", "POI Schedule will be processed.");
                getPOISchedule();
            }, 50000);
            console.log('POI Scheduler running mode is : %s', config.settings.poiSchedulerRunningMode);
        } else {
            log.logger("info", "POI scheduler is in stopped state.");
            console.log("POI scheduler is in stopped state");
        }   
    } catch (error) {
        log.logger("error", `Getting Error in startPOISchedulerService - ${error}`);
        console.log('Getting Error in startPOISchedulerService : ', error);
    }
}

async function getPOISchedule() {
    try {
        let result = await schedulerClass.getPOISchedule();
        if (result.success && result.rowCount > 0) {
            let resRows = result.rows;
            resRows.map((poi: any) => {
                schedulePOI(poi);
            });
        } else {
            if (result.qry_error) {
                log.logger("error", `startPoiScheduler(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("error", `startPoiScheduler(), PSQL Connection Error ${result.message}`);
                checkDb();
            }
        }
    }
    catch (e: any) {
        console.log('Getting Error in getPOISchedule : ', e);
        log.logger("error", `getPOISchedule function Error - ${e.message}`);
    }
}

function schedulePOI(poi: any) {
    try {
        if (isActiveTest(poi)) {
            if(poi.last_ran_on!=null){
                var diffInMillis = new Date().getTime() - poi.last_ran_on.getTime()
                var isLessThanHour = diffInMillis < poi.frequency * 60 * 60 * 1000;
                if(!isLessThanHour) {
                    console.log("Started processing the schedule for POIS Id - " + poi.pois_id);
                    log.logger("info", `Started processing the schedule for POIS Id ${poi.pois_id}`);
                    processPOIScheduler(poi);
                }
            } else if (poi.last_ran_on==null) {
                console.log("Started processing the schedule for POIS Id - " + poi.pois_id);
                log.logger("info", `Started processing the schedule for POIS Id ${poi.pois_id}`);
                processPOIScheduler(poi);
            }
        } else {
            console.log("POIS Id " + poi.pois_id + " is skipped to queue as start time is in future " + new Date(Number(poi.start_date)).toLocaleString());
            log.logger("info", `POIS Id ${poi.pois_id} is skipped to queue as start time is in future -- ${new Date(Number(poi.start_date)).toLocaleString()}`);
        }
    } catch (e: any) {
        console.log("Could not schedule for POIS ID " + poi.poi_id + " Exception " + e.message);
        log.logger("error", `Could not schedule for POIS ID - ${poi.poi_id} :: Exception ${e.message}`);
    }
}

async function processPOIScheduler(resData: any) {
    try {
        let result;
        let test = resData;
        let headers: any = {}
        test.request_headers.map((header: any) => {
            headers[header.name] = header.value;
        });
        result = await getData(test.testurl, headers);
        if (result.success) {
            let poi_id = test.poi_id.toString();
            let filename = '_' + test.company_id.toString() + '.xml';
            let dataset = result.resBody;
            let unqFileName = new Date().getTime().toString(36);
            let relativePath = unqFileName + filename;
            let filePath = path.join(__dirname, config.settings.uploadPath, 'poi' + poi_id, unqFileName + filename);
            if (validateXML(dataset) == true) {
                if (!fs.existsSync(path.join(__dirname, config.settings.uploadPath, 'poi' + poi_id))) {
                    fs.mkdirSync(path.join(__dirname, config.settings.uploadPath, 'poi' + poi_id));
                }
                fs.writeFileSync(filePath, dataset);
                test["relativePath"] = relativePath;
                test["scheduler_uid"] = systemId
                let dbResult = await schedulerClass.insScheduleRunningStatus(test);
                if (dbResult.success) {
                    return { success: true, rowCount: dbResult.rowCount, result: dbResult.result };
                }
                else {
                    return { success: false, message: result.message };
                }
            } else {
                let validationData = validateXML(dataset);
                let ErrResult = await schedulerClass.updFailedScheduleStatus(test, validationData.err);
                if (ErrResult.success) {
                    return { success: true, result: ErrResult.result };
                }
                else {
                    return { success: false, message: result.message };
                }
            }
        } else {
            await schedulerClass.updErrorScheduleStatus(test, result.statusCode, result.statusText);
            console.log("Schedule for POIS ID - " + resData.pois_id +" is failed with "+ result.statusCode + " " + result.statusText);
            log.logger("info", `Schedule for POIS ID - ${resData.pois_id} is failed with ${result.statusCode} ${result.statusText}`);
        }
    } catch (e:any) {
        console.log('processPOIScheduler failed with exeception : ', e.message);
        log.logger("error", `processPOIScheduler function Error - ${e.message}`);
    }
}


function getData(url: any, headers: any) {
    let startTime = new Date().getTime();
    let duration = null;
    let controller = new AbortController();
    let timeout = setTimeout(() => {
        controller.abort();
    }, config.settings.abortRequestTimeOutInMs);

    let options = {
        method: 'GET',
        headers: headers,
        body: null,
        signal: controller.signal
    }

    return fetch(url, options)
        .then(async (res: any) => {
            let bodyContent = await res.text();
            duration = new Date().getTime() - startTime;
            res['respTime'] = duration;
            let statusCode = res.status
            let response = {}
            if(statusCode.toString().startsWith(2)){
                response = { success: res.ok, error: false, res: res, resBody: bodyContent };
            } else {
                response = { success: res.ok, error: true, res: res, resBody: bodyContent, statusCode: statusCode, statusText: res.statusText };
            }
            return response
        })
        .then((fullResponse: any) => {
            return fullResponse;
        })
        .catch((err: any) => {
            console.log('Getting error in fetch the url <>',url,'<> : ', err);
            log.logger("error", `Getting error in fetch the url <> ${url} <> : Error - ${err}`);
            return { success: false, error: true, res: err, err: err };
        }).finally(() => {
            clearTimeout(timeout);
        });
}

function isActiveTest(test: any) {
    let isActiveTest = false;
    try {
        let today = new Date();
        let previousDate = new Date(new Date().setDate(today.getDate() - 1)).toISOString().slice(0, 10);
        let nextDate = new Date(new Date().setDate(today.getDate() + 1)).toISOString().slice(0, 10);
        let currentDate = today.toISOString().slice(0, 10);
        let currentTime = today.toISOString().slice(11, 19);
        let currentDay = new Date(new Date().getTime() - (test.timezone_offset * 60 * 1000)).toString().split(' ')[0].toLowerCase();
        let IsDaysEnabled = test.selected_days.indexOf(currentDay) == -1 ? false : true;
        let currentDateTime = currentDate + ' ' + currentTime;
        if (IsDaysEnabled) {
            if (test.start_time > test.end_time && currentTime < test.start_time) {
                isActiveTest = currentDateTime >= previousDate + ' ' + test.start_time && currentDateTime <= currentDate + ' ' + test.end_time ? true : false;
            } else if (test.start_time > test.end_time) {
                isActiveTest = currentDateTime >= currentDate + ' ' + test.start_time && currentDateTime <= nextDate + ' ' + test.end_time ? true : false;
            } else {
                isActiveTest = currentDateTime >= currentDate + ' ' + test.start_time && currentDateTime <= currentDate + ' ' + test.end_time ? true : false;
            }
        }
    } catch (e: any) {
        console.log('isActiveTest failed with exeception : ', e.message);
        log.logger("error", `isActiveTest function Error - ${e.message}`);
    } finally {
        return isActiveTest;
    }
}

function validateXML(xmlData: any) {
    const validatioResult = XMLValidator.validate(xmlData, {
        allowBooleanAttributes: true
    });
    return validatioResult
}

export = { startPOISchedulerService };
