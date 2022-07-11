import { Initialize } from "../models/initialize";
let log = require("../log");
const settings = require('../config/constants');

let initClass = new Initialize();
let dbConnected = false;

interface lookupValue {
    lookup_name_id: number;
    lookup_name: string;
    display_name: string;
    lookup_type: string;
    company_id: number;
}

interface country {
    id: number;
    name: string;
    iso3: string | undefined;
    iso2: string | undefined;
}

interface state {
    id: number;
    name: string;
    country_id: number;
}

interface city {
    id: number,
    name: string,
    state_id: number,
    country_id: number
}

let lookupValue: lookupValue[] = [];
let countryArr: country[] = [];
let stateArr: state[] = [];
let cityArr: city[] = [];

function setLookupValueColl() {
    return lookupValue;
}

function setCountryColl() {
    return countryArr;
}

function setStateColl() {
    return stateArr;
}

function setCityColl() {
    return cityArr;
}

function setDbConnected() {
    return dbConnected;
}

async function checkDb() {
    let result = await initClass.checkDB();
    if (result.success) {
        dbConnected = true;
        console.log("Database connected to", settings.settings.pgDbConfig.host);
        if (lookupValue.length == 0) {
            await getLookupValues();
        }
        if (countryArr.length == 0) {
            getCountry();
        }
        if (stateArr.length == 0) {
            getState();
        }
        if (cityArr.length == 0) {
            getCity();
        }
    }
    else {
        dbConnected = false;
        log.logger("error", `checkDb(), PSQL Connection Error ${result.message}, trying to connect in 10 sec`);
        setTimeout(() => {
            checkDb();
        }, 10000);
    }
    console.log("DbConnected", dbConnected);
}

async function getLookupValues() {
    try {
        let result = await initClass.getLookupValues();
        if (result.success) {
            lookupValue = result.rows;
        } else {
            if (result.qry_error) {
                log.logger("error", `getLookupValues(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("error", `getLookupValues(), PSQL Connection Error ${result.message}`);
                checkDb();
            }
        }
    }
    catch (e:any) {
        log.logger("error", `getLookupValues(), function Error ${e.message}`);
    }
}

async function getCountry() {
    try {
        let result = await initClass.getCountry();
        if (result.success) {
            countryArr = result.rows;
        } else {
            if (result.qry_error) {
                log.logger("error", `getCountry(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("error", `getCountry(), PSQL Connection Error ${result.message}`);
                checkDb();
            }
        }
    }
    catch (e:any) {
        log.logger("error", `getCountry(), function Error ${e.message}`);
    }
}

async function getState() {
    try {
        let result = await initClass.getState();
        if (result.success) {
            stateArr = result.rows;
        } else {
            if (result.qry_error) {
                log.logger("error", `getState(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("error", `getState(), PSQL Connection Error ${result.message}`);
                checkDb();
            }
        }
    }
    catch (e:any) {
        log.logger("error", `getState(), function Error ${e.message}`);
    }
}

async function getCity() {
    try {
        let result = await initClass.getCity();
        if (result.success) {
            cityArr = result.rows;
        } else {
            if (result.qry_error) {
                log.logger("error", `getCity(), Query Error ${result.message}`);
            }
            else if (result.connection_error) {
                log.logger("error", `getCity(), PSQL Connection Error ${result.message}`);
                checkDb();
            }
        }
    }
    catch (e:any) {
        log.logger("error", `getCity(), function Error ${e.message}`);
    }
}

async function getTotalCntByModule(param:any) {
    try {
        let result = await initClass.getTotalCntByModule(param);
        if (result.success) {
            return { success: true, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        log.logger("error", `getPorts(), function Error ${e.message}`);
        return { success: false, message: e.message };
    }
}

async function getPorts() {
    try {
        let result = await initClass.getPorts();
        if (result.success) {
            return { success: true, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        log.logger("error", `getPorts(), function Error ${e.message}`);
        return { success: false, message: e.message };
    }
}

async function getCountryCode() {
    try {
        let result = await initClass.getCountryCode();
        if (result.success) {
            return { success: true, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        log.logger("error", `getCountryCode(), function Error ${e.message}`);
        return { success: false, message: e.message };
    }
}

async function getAdminLookups() {
    try {
        let result = await initClass.getAdminLookups();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getLookup(param: any) {
    try {
        let result = await initClass.getLookup(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getlookupTypeList() {
    try {
        let result = await initClass.getlookupTypeList();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getServiceTypeList() {
    try {
        let result = await initClass.getServiceTypeList();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getserviceTypeColl(param: any) {
    try {
        let result = await initClass.getserviceTypeColl(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getCompanyList(param: any) {
    try {
        let result = await initClass.getCompanyList(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function insLookupEntry(param: any) {
    try {
        let result = await initClass.addLookup(param);
        if (result.success) {
            await getLookupValues();
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updateLookupEntry(param: any) {
    try {
        let result = await initClass.updateLookup(param);
        if (result.success) {
            await getLookupValues();
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function addServiceEntry(param: any) {
    try {
        let result = await initClass.addServiceEntry(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updateServiceEntry(param: any) {
    try {
        let result = await initClass.updateServiceEntry(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function delServiceEntry(param: any) {
    try {
        let result = await initClass.delServiceEntry(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function delLookupName(param: any) {
    try {
        let result = await initClass.delLookupName(param);
        if (result.success) {
            await getLookupValues();
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getLookupTypeId(type: string) {
    try {
        let result = await initClass.getLookupTypeId(type);
        if (result.success) {
            await getLookupValues();
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getServiceChargeGroup() {
    try {
        let result = await initClass.getServiceChargeGroup();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getChargeUom() {
    try {
        let result = await initClass.getChargeUom();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getLCLValidity() {
    try {
        let result = await initClass.getLCLValidity();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getCurrency() {
    try {
        let result = await initClass.getCurrency();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

export = { getTotalCntByModule, lookupValueColl: setLookupValueColl, countryColl: setCountryColl, stateColl: setStateColl, cityColl: setCityColl, dbConnected: setDbConnected, checkDb, getPorts, getCountryCode, insLookupEntry, updateLookupEntry, delLookupName, getAdminLookups, getLookup, getlookupTypeList, getServiceTypeList, getCompanyList, getLookupTypeId, getServiceChargeGroup, getCurrency, getChargeUom, getLCLValidity, delServiceEntry, getserviceTypeColl, addServiceEntry, updateServiceEntry};
