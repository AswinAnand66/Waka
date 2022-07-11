import { isArray } from "util";
import { schemaValidationModel } from "../models/schemaValidationModel";
let log = require("../log");
const path = require('path');
const config = require("../config/constants");
const fs = require('fs');
const xml2js = require("xml2js");

let schemaClass = new schemaValidationModel();

function startSchemaValidationService() {
    try {
        if (config.settings.schemaValidationRunningMode) {
            setInterval(() => {
                log.schemalog("info", "Schema Validation will be processed.");
                schemaUnderProcessChecker();
            }, 60000 * 10);
            console.log('Schema Validation running mode is : %s', config.settings.schemaValidationRunningMode);
        } else {
            log.schemalog("info", "Schema Validation is in stopped state.");
            console.log("Schema Validation is in stopped state");
        }   
    } catch (error) {
        log.schemalog("error", `Getting Error in startSchemaValidationService() - ${error}`);
        console.log('Getting Error in startSchemaValidationService() : ', error);
    }
}

async function schemaUnderProcessChecker() {
    try {
        let result = await schemaClass.schemaUnderProcessChecker();
        if (result.success && result.rowCount > 0) {
            for (let po_data of result.rows) {
                await schemaErrorValidation(po_data);
            }
        } else if ( result.success && result.rowCount == 0 ) {
            log.schemalog("info", "No Schema Under Process to validate.");
        }
    }  catch (error) {
        log.schemalog("error", `Getting Error in schemaUnderProcessChecker() - ${error}`);
        console.log('Getting Error in schemaUnderProcessChecker() : ', error);
    }
}

async function schemaErrorValidation(po_data: any) {
    try {
        log.schemalog("info", `Schema Error Validation started for POISRS ID ${po_data.poisrs_id}`);
        let filePath = path.join(__dirname, config.settings.uploadPath, 'poi' + po_data.poi_id, po_data.filepath);
        let xmlData = fs.readFileSync(filePath, 'utf8');
        let jsonData = await xml2js.parseStringPromise(xmlData);
        let result = await schemaClass.getPOTemplate(po_data);
        if (result.success && result.rowCount > 0) {
            let company_id = result.rows[0].company_id;
            let missingKeys: any[] = [];
            let PO_Template = result.rows[0].po_template;
            await objValidation(jsonData, PO_Template, missingKeys);
            if (missingKeys.length > 0) {
                let res = await schemaClass.insSchemaErrors(missingKeys, po_data.poi_id);
                if (res.success) {
                    await schemaClass.updPOIScheduleStatus(po_data, false);
                } else {
                    log.schemalog("info", `Insert Schema Error failed for POISRS ID ${po_data.poisrs_id} , ERROR - ${res.message}`);
                }
                log.schemalog("info", `Schema Error Validation process done for POISRS ID ${po_data.poisrs_id} with schema errors.`);
            } else {
                await processPORawData(jsonData, PO_Template, company_id, po_data.poisrs_id);
                await schemaClass.updPOIScheduleStatus(po_data, true);
                let chkTable = await schemaClass.checkPOTableExists(company_id);
                chkTable.success && !chkTable.rows[0].exists ? await schemaClass.createPOCompanyTable(company_id) : '';
                log.schemalog("info", `Schema Error Validation process done for POISRS ID ${po_data.poisrs_id}, Data processed to PO Raw Table.`);
            }
        }
    } catch (error) {
        log.schemalog("error", `Getting Error in schemaErrorValidation() - ${error}`);
        console.log('Getting Error in schemaErrorValidation() : ', error);
    }
}

async function processPORawData(jsonData: any, PO_Template: any, company_id: any, poisrs_id: any) {
    try {
        let data = await getPORawData(jsonData, PO_Template);
        let po_array: any = [];
        let po_child_array: any = [];
        let po_child_tableName = 'po_raw_' + company_id;
        let poDataColl: any = [];
        await PreparJsonRecordSet(data, po_array, po_child_array, poDataColl);
        for (let key in poDataColl) {
            let po_raw: any = [];
            po_raw.push(poDataColl[key]['po_raw']);
            let POResult = await schemaClass.insPORawData(po_raw, company_id, poisrs_id);
            if (POResult.success && POResult.rowCount > 0) {
                log.schemalog("info", `Insert PO Raw Data done for POISRS ID ${poisrs_id}`);
                let po_raw_chiild: any = [];
                poDataColl[key]['po_raw_child']['po_raw_id'] = POResult.rows[0].po_raw_id;
                po_raw_chiild.push(poDataColl[key]['po_raw_child']);
                let insChildData = await schemaClass.insPORawChildData(po_raw_chiild, po_child_tableName);
                if(insChildData.success && insChildData.rowCount > 0) {
                    log.schemalog("info", `Insert PO Raw Child Data done for POISRS ID ${poisrs_id}`);
                } else {
                    if(!insChildData.success) {
                        log.schemalog("info", `Insert PO Raw Child Data failed for POISRS ID ${poisrs_id} , ERROR - ${POResult.message}`);
                    }
                }
            } else {
                if(!POResult.success) {
                    log.schemalog("info", `Insert PO Raw Data failed for POISRS ID ${poisrs_id} , ERROR - ${POResult.message}`);
                }
            }
        }
    } catch (error) {
        log.schemalog("error", `Getting Error in processPORawData() - ${error}`);
        console.log('Getting Error in processPORawData() : ', error);
    }
}

async function objValidation(obj: any, po_obj: any, missingKeys: any, str?: string) {
    try {
        let prev = '';
        for (var property in obj) {
            if (po_obj.hasOwnProperty(property)) {
                const s = isArray(obj) ? prev + str + '[' + property + ']' + '.' : (str != undefined ? str : '') + property + (isArray(obj[property]) ? '' : '.');

                if (typeof obj[property] == "object" && !isArray(obj[property])) {
                    objValidation(obj[property], po_obj[property], missingKeys, s);
                } else if (typeof obj[property] == "object" && isArray(obj[property])) {
                    obj[property].some((val: any) => { return typeof val == "object" }) ? arrValidation(obj[property], po_obj[property], missingKeys, s) : '';
                }

            } else if (!property.includes('$')) {
                prev = (str != undefined ? str : '');
                missingKeys.push({ missing_key: property, missing_key_hierarchy: prev + property });
            }
        }
    } catch (error) {
        log.schemalog("error", `Getting Error in objValidation() - ${error}`);
        console.log('Getting Error in objValidation() : ', error);
    }
}

async function arrValidation(obj: any, po_obj: any, missingKeys: any, str?: string) {
    try {
        let prev = '';
        for (let property in obj) {
            const s = isArray(obj) ? prev + str + '[' + property + ']' + '.' : (str != undefined ? str : '') + property + (isArray(obj[property]) ? '' : '.');
            if (typeof obj[property] == "object" && !isArray(obj[property])) {
                objValidation(obj[property], po_obj[0], missingKeys, s);
            } else if (typeof obj[property] == "object" && isArray(obj[property])) {
                console.log('Length : ', obj[property].length);
                obj[property].length > 1 ? arrValidation(obj[property], po_obj[0], missingKeys, s) : '';
            }
        }
    } catch (error) {
        log.schemalog("error", `Getting Error in arrValidation() - ${error}`);
        console.log('Getting Error in arrValidation() : ', error);
    }
}

async function getPORawData(obj: any, po_obj: any, po_array?: any[]) {
    try {
        let po_data = po_array != undefined ? JSON.parse(po_array.pop()) : {};
        let po_arr = po_array != undefined ? po_array : [];
        let is_pushed = false;
        for (var property in po_obj) {
            if (po_obj.hasOwnProperty(property)) {
                if (typeof po_obj[property] == "object") {
                    is_pushed = true;
                    if (isArray(po_obj[property])) {
                        for (var idx in obj[property]) {
                            po_arr.push(JSON.stringify(po_data));
                            await getPORawData(obj[property][idx], po_obj[property][0], po_arr);
                        }
                    } else {
                        po_arr.push(JSON.stringify(po_data));
                        await getPORawData(obj[property], po_obj[property], po_arr);
                    }
                } else {
                    if (po_obj[property] != '') {
                        po_data[po_obj[property]] = obj.hasOwnProperty(property) ? obj[property][0] : '""';
                    }
                }
            }
        }
        if (!is_pushed) {
            po_arr.push(po_data);
        }
        return po_arr;
    } catch (error) {
        log.schemalog("error", `Getting Error in getPORawData() - ${error}`);
        console.log('Getting Error in getPORawData() : ', error);
    }
}

async function PreparJsonRecordSet(data: any, po_array: any, po_child_array: any, poDataColl: any) {
    try {
        for (var property in data) {
            let po_data: any = {};
            let po_child_data: any = {};
            for (let key in data[property]) {
                let splited_key = key.toString().split('.');
                // if (splited_key[1].toLowerCase() == 'ordernumber') {
                //     po_data[splited_key[1].toString()] = data[property][key].replace('\'', '');
                //     po_child_data[splited_key[1].toString()] = data[property][key].replace('\'', ''); 
                // } else 
                if (splited_key[0] == 'po_raw') {
                    let param = splited_key[1].toString();
                    po_data[param] = data[property][key].replace('\'', '');
                } else {
                    po_child_data[splited_key[1].toString()] = data[property][key].replace('\'', '');
                }
            }
            po_array.push(po_data);
            po_child_array.push(po_child_data);
            poDataColl.push({ po_raw: po_data, po_raw_child: po_child_data });
        }
    } catch (error) {
        log.schemalog("error", `Getting Error in PreparJsonRecordSet() - ${error}`);
        console.log('Getting Error in PreparJsonRecordSet() : ', error);
    }
}

export = { startSchemaValidationService };
