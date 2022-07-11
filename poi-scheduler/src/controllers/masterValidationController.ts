import { masterValidationModel } from "../models/masterValidationModel";
let log = require("../log");
const config = require("../config/constants");

let masterClass = new masterValidationModel();

function startMasterValidationService() {
    try {
        if (config.settings.masterValidationRunningMode) {
            setInterval(() => {
                log.masterlog("info", "Master Validation will be processed.");
                masterUnderProcessChecker();
            }, 60000 * 10);
            console.log('Master Validation running mode is : %s', config.settings.masterValidationRunningMode);
        } else {
            log.masterlog("info", "Master Validation is in stopped state.");
            console.log("Master Validation is in stopped state");
        }   
    } catch (error) {
        log.masterlog("error", `Getting Error in startMasterValidationService() - ${error}`);
        console.log('Getting Error in startMasterValidationService() : ', error);
    }
}

async function masterUnderProcessChecker() {
    try {
        let result = await masterClass.masterUnderProcessChecker();
        if (result.success && result.rowCount > 0) {
            for (let po_data of result.rows) {
                log.masterlog("info", `Master Error Validation started for POISRS ID ${po_data.poisrs_id}`);
                let master = await masterErrorValidation(po_data);
                if (master.success) {
                    let param: any = {
                        company_id: po_data.company_id,
                        poi_id: po_data.poi_id,
                        poisrs_id: po_data.poisrs_id,
                        pois_id: po_data.pois_id
                    }
                    let res1 = await masterClass.getMasterErrors(param);
                    if (res1.success && res1.rowCount > 0 && res1.rows[0].error_count == 0) {
                        let masterSuccess = await masterClass.updPOIMasterStatus(param, true);
                        if (masterSuccess.success) {
                            await createPODataTable(param);                            
                        }
                    } else if (res1.success && res1.rowCount > 0 && res1.rows[0].error_count > 0) {
                        await masterClass.updMasterUnderProcess(param);
                    }
                } else {
                    log.masterlog("info", `Master Error Validation failed for POISRS ID ${po_data.poisrs_id}`);
                }
            }
        } else {
            console.log('No Master Under Process to validate.');
            log.masterlog("info", "No Master Under Process to validate.");
        }   
    } catch (error) {
        log.masterlog("error", `Getting Error in masterUnderProcessChecker() - ${error}`);
        console.log('Getting Error in masterUnderProcessChecker() : ', error);
    }
}

async function createPODataTable(param: any) {
    try {
        let chkTable = await masterClass.checkPOCompanyTableExists(param);
        if (chkTable.success) {
            if (chkTable.rowCount == 0) {
                let createTable = await masterClass.createPOCompanyTable(param.company_id);
                if (createTable.success) {
                    let dataCount = await masterClass.checkTableRowCount(param);
                    if (dataCount.success && dataCount.rows[0].count == 0) {
                        let poRawData = await masterClass.getPoRawData(param);
                        if (poRawData.success && poRawData.rowCount > 0) {
                            param["po_raw_datas"] = poRawData.rows;
                            let insPo = await masterClass.insPOData(param);
                            if (insPo.success) {
                                let masterSuccess = await masterClass.updPOIMasterStatus(param, true);
                                if (masterSuccess.success) {
                                    log.masterlog("info", `Master Error Validation completed for POISRS ID ${param.poisrs_id}`);
                                }
                            }
                        }
                    }
                }
            } else {
                let dataCount = await masterClass.checkTableRowCount(param);
                if (dataCount.success && dataCount.rows[0].count == 0) {
                    let poRawData = await masterClass.getPoRawData(param);
                    if (poRawData.success && poRawData.rowCount > 0) {
                        param["po_raw_datas"] = poRawData.rows;
                        let insPo = await masterClass.insPOData(param);
                        console.log("insPo 2", insPo)
                    }
                }
            }
        } else {
            console.log('checkPOCompanyTableExists', chkTable)
        }
    } catch (error) {
        console.log('Getting Error in createPODataTable : ', error);
    }
}

async function masterErrorValidation(po_data: any) {
    try {
        let param: any = {}
        param["company_id"] = po_data.company_id;
        param["poisrs_id"] = po_data.poisrs_id;
        let res1 = await masterClass.getSupplierDetails(param);
        if (res1.success && res1.rowCount > 0) {
            for (let supplier of res1.rows) {
                await checkSupplier(po_data, supplier);
            }
            console.log(`Supplier validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Supplier Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        let res2 = await masterClass.getFactoryDetails(param);
        if (res2.success && res2.rowCount > 0) {
            for (let factory of res2.rows) {
                await checkFactory(po_data, factory);
            }
            console.log(`Factory validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Factory Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        let res3 = await masterClass.getBuyerDetails(param);
        if (res3.success && res3.rowCount > 0) {
            for (let buyer of res3.rows) {
                await checkBuyer(po_data, buyer);
            }
            console.log(`Buyer validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Buyer Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        let res4 = await masterClass.getOrgPortDetails(param);
        if (res4.success && res4.rowCount > 0) {
            for (let port of res4.rows) {
                await checkOrgPort(po_data, port);
            }
            console.log(`Org Port validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Org Port Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        let res5 = await masterClass.getDestPortDetails(param);
        if (res5.success && res5.rowCount > 0) {
            for (let port of res5.rows) {
                await checkDestPort(po_data, port);
            }
            console.log(`Dest Port validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Dest Port Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        let res6 = await masterClass.getIncotermsDetails(param);
        if (res6.success && res6.rowCount > 0) {
            for (let inco of res6.rows) {
                await checkIncoTerms(po_data, inco);
            }
            console.log(`Incoterms validated ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        } else {
            console.log(`Incoterms Unavailable ! for poi_id : ${po_data.poi_id} and poisrs_id : ${po_data.poisrs_id}`);
        }
        return { success: true }
    } catch (error) {
        console.log('Getting Error masterErrorValidation : ', error);
        return { success: false }
    }
}


async function checkSupplier(po_data: any, sup: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_SUPPLIER_NAME',
            company_id: po_data.company_id,
            supplier_name: sup.suppliername,
            supplier_code: sup.suppliercode
        }
        let res2 = await masterClass.checkErrorNInvite(param1);
        if (res2.success && res2.rowCount > 0) {
            if (res2.rows[0].company_invite_id != null) {
                if (res2.rows[0].is_accepted) {
                    param1["waka_ref_supplier_id"] = res2.rows[0].company_id;
                    await masterClass.inSupplierRef(param1);
                } else {
                    param1["error_value"] = sup.suppliername;
                    param1["ref_code"] = sup.suppliercode;
                    let err = await masterClass.checkPoMasterErrorExists(param1);
                    if (err.success && err.rowCount == 0) {
                        param1["is_invite_sent"] = true;
                        param1["waka_ref_supplier_id"] = res2.rows[0].company_id;
                        let insErr = await masterClass.insPoMasterError(param1);
                        if (insErr.success) {
                            param1['poi_master_error_id'] = insErr.rows[0].poi_me_id;
                            param1["company_invite_id"] = res2.rows[0].company_invite_id;
                            await masterClass.updCompanyInviteError(param1);
                        }
                    }
                }
            } else {
                param1["error_value"] = sup.suppliername;
                param1["ref_code"] = sup.suppliercode;
                let err = await masterClass.checkPoMasterErrorExists(param1);
                if (err.success && err.rowCount == 0) {
                    param1["is_invite_sent"] = true;
                    param1["waka_ref_supplier_id"] = res2.rows[0].company_id;
                    let insErr = await masterClass.insPoMasterError(param1);
                    if (insErr.success && insErr.rowCount > 0) {
                        param1["poi_master_error_id"] = insErr.rows[0].poi_me_id;
                        let insSup = await masterClass.insSupplierInviteCompany(param1);
                        if (insSup.success && insSup.rowCount > 0) {
                            console.log(`Invited ${sup.suppliername} Supplier`);
                        }
                    }
                }
            }
        } else {
            param1["error_value"] = sup.suppliername;
            param1["ref_code"] = sup.suppliercode;
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        }
    } catch (error) {
        console.log('Getting Error checkSupplier :', error);
    }
}

async function checkFactory(po_data: any, fac: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_FACTORY_NAME',
            company_id: po_data.company_id,
            factory_name: fac.factoryname,
            factory_code: fac.factorycode
        }
        let res2 = await masterClass.checkFacErrorNInvite(param1);
        if (res2.success && res2.rowCount > 0) {
            if (res2.rows[0].company_invite_id != null) {
                if (res2.rows[0].is_accepted) {
                    param1["waka_ref_factory_id"] = res2.rows[0].company_id;
                    await masterClass.insFactoryRef(param1);
                } else {
                    param1["error_value"] = fac.factoryname;
                    param1["ref_code"] = fac.factorycode;
                    let err = await masterClass.checkPoMasterErrorExists(param1);
                    if (err.success && err.rowCount == 0) {
                        param1["is_invite_sent"] = true;
                        param1["waka_ref_factory_id"] = res2.rows[0].company_id;
                        let insErr = await masterClass.insPoMasterError(param1);
                        if (insErr.success) {
                            param1['poi_master_error_id'] = insErr.rows[0].poi_me_id;
                            param1["company_invite_id"] = res2.rows[0].company_invite_id;
                            await masterClass.updCompanyInviteError(param1);
                        }
                    }
                }
            } else {
                param1["error_value"] = fac.factoryname;
                param1["ref_code"] = fac.factorycode;
                let err = await masterClass.checkPoMasterErrorExists(param1);
                if (err.success && err.rowCount == 0) {
                    param1["is_invite_sent"] = true;
                    param1["waka_ref_factory_id"] = res2.rows[0].company_id;
                    let insErr = await masterClass.insPoMasterError(param1);
                    if (insErr.success && insErr.rowCount > 0) {
                        param1["poi_master_error_id"] = insErr.rows[0].poi_me_id;
                        let insSup = await masterClass.insFactoryInviteCompany(param1);
                        if (insSup.success && insSup.rowCount > 0) {
                            console.log(`Invited ${fac.factoryname} Factory`);
                        }
                    }
                }
            }
        } else {
            param1["error_value"] = fac.factoryname;
            param1["ref_code"] = fac.factorycode;
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        }
    } catch (error) {
        console.log('Getting Error checkFactory : ', error);
    }
}

async function checkBuyer(po_data: any, buy: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_BUYER_NAME',
            company_id: po_data.company_id,
            buyer_name: buy.buyername,
            buyer_code: buy.buyercode,
        }
        let res2 = await masterClass.checkBuyerErrorNInvite(param1);
        if (res2.success && res2.rowCount > 0) {
            if (res2.rows[0].is_accepted) {
                param1["waka_ref_buyer_id"] = res2.rows[0].company_id;
                await masterClass.insBuyerRef(param1);
            } else if (!res2.rows[0].is_accepted) {
                param1["error_value"] = buy.buyername;
                param1["ref_code"] = buy.buyercode;
                let err = await masterClass.checkPoMasterErrorExists(param1);
                if (err.success && err.rowCount == 0) {
                    param1["is_invite_sent"] = true;
                    param1["waka_ref_buyer_id"] = res2.rows[0].company_id;
                    let insErr = await masterClass.insPoMasterError(param1);
                    if (insErr.success) {
                        param1['poi_master_error_id'] = insErr.rows[0].poi_me_id;
                        param1["company_invite_id"] = res2.rows[0].company_invite_id;
                        await masterClass.updCompanyInviteError(param1);
                    }
                }
            } else if (res2.rows[0].is_accepted == null) {
                param1["error_value"] = buy.buyername;
                param1["ref_code"] = buy.buyercode;
                let err = await masterClass.checkPoMasterErrorExists(param1);
                if (err.success && err.rowCount == 0) {
                    param1["is_invite_sent"] = true;
                    param1["waka_ref_factory_id"] = res2.rows[0].company_id;
                    let insErr = await masterClass.insPoMasterError(param1);
                    if (insErr.success) {
                        param1["poi_master_error_id"] = insErr.rows[0].poi_me_id;
                        await masterClass.insBuyerInviteCompany(param1);
                    }
                }
            }
        } else {
            param1["error_value"] = buy.buyername;
            param1["ref_code"] = buy.buyercode;
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        }
    } catch (error) {
        console.log('Getting Error checkBuyer : ', error);
    }
}


async function checkOrgPort(po_data: any, port: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_ORIGIN_PORT',
            company_id: po_data.company_id,
            port_name: port.originportname,
            port_code: port.originportcode,
        }
        let res2 = await masterClass.checkPortErrorNRef(param1);
        if (res2.success && res2.rowCount > 0) {
            if (res2.rows[0].port_id != null) {
                param1["waka_ref_port_id"] = res2.rows[0].port_id;
                await masterClass.insPortRef(param1);
            }
        } else {
            param1["error_value"] = port.originportname;
            param1["ref_code"] = port.originportcode;
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        }
    } catch (error) {
        console.log('Getting Error checkOrgPort : ', checkOrgPort);
    }
}

async function checkDestPort(po_data: any, port: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_DESTINATION_PORT',
            company_id: po_data.company_id,
            port_name: port.destinationportname,
            port_code: port.destinationportcode,
        }
        let res2 = await masterClass.checkPortErrorNRef(param1);
        if (res2.success && res2.rowCount > 0) {
            if (res2.rows[0].port_id != null) {
                param1["waka_ref_port_id"] = res2.rows[0].port_id;
                await masterClass.insPortRef(param1);
            }
        } else {
            param1["error_value"] = port.destinationportname;
            param1["ref_code"] = port.destinationportcode;
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        }
    } catch (error) {
        console.log('Getting Error checkDestPort : ', error);
    }
}

async function checkIncoTerms(po_data: any, inco: any) {
    try {
        let param1: any = {
            poi_id: po_data.poi_id,
            error_type: 'MASTER_INCOTERMS_NAME',
            company_id: po_data.company_id,
            incoterms_name: inco.incoterms,
        }
        let res2 = await masterClass.checkIncoRef(param1);
        if (res2.success && res2.rowCount > 0) {
            param1["waka_ref_incoterms_id"] = res2.rows[0].lookup_name_id;
            await masterClass.insIncotermsRef(param1);
        } else if (res2.success && res2.rowCount == 0) {
            param1["error_value"] = inco.incoterms;
            param1["ref_code"] = '';
            let err = await masterClass.checkPoMasterErrorExists(param1);
            if (err.success && err.rowCount == 0) {
                param1["is_invite_sent"] = false;
                await masterClass.insPoMasterError(param1);
            }
        } else {
            console.log(res2)
        }
    } catch (error) {
        console.log('Getting Error checkIncoTerms : ', error);
    }
}

export = { startMasterValidationService };
