import { POIModel } from "../models/poIngestionModel";
const settings = require('../config/constants');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const xml2js = require("xml2js");

const pobClass = new POIModel();
const PO_keys = ['ordernumber', 'consigneecode', 'consigneename', 'suppliername', 'suppliercode', 'factorycode', 'factoryname', 'buyercode', 'buyername', 'incoterms', 'category', 'transportmode', 'originportcode', 'originportname', 'destinationportcode', 'destinationportname', 'destinationdccode', 'destinationdcname', 'shipdate', 'deliverydate', 'cargoreadydate', 'product', 'description', 'productcategory', 'commoditycode', 'sku', 'colour', 'primarysize', 'secondarysize', 'quantity', 'cartons', 'cube', 'weight', 'packtype'];

function getPath(object: { [x: string]: any; }, value: any) {
    try {
        return Object
            .keys(object)
            .reduce((r: any, k) => {
                var kk = Array.isArray(object) ? `[${k}]` : `${k}`;
                if (object[k] === value) {
                    r.push(kk);
                }
                if (object[k] && typeof object[k] === 'object') {
                    r.push(...getPath(object[k], value).map((p: string | string[]) => kk + (p[0] === '[' ? '' : '.') + p));
                }
                return r;
            }, []);
    } catch (e) {
        console.log(e);
    }
}

async function JsonObjIteration(Obj: any, achivedKeys: any, achivedMissingKeys: any) {
    try {
        for (let key in Obj) {
            key.includes('$') ? delete Obj[key] : '';
            if (Array.isArray(Obj[key])) {
                if (Obj[key].some((val: any) => { return typeof val == "object" })) {
                    await JsonObjIteration(Obj[key][0], achivedKeys, achivedMissingKeys);
                    Obj[key].length > 1 ? Obj[key].splice(1, Obj[key].length - 1) : '';
                } else {
                    if (PO_keys.includes(key.toLowerCase())) {
                        Obj[key] = 'po_raw.' + key.toLowerCase();
                        achivedKeys.push(key.toLowerCase())
                    } else {
                        Obj[key] = '';
                    }
                }
            } else if (!key.includes('$')) {
                await JsonObjIteration(Obj[key], achivedKeys, achivedMissingKeys);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function getPoIngestionMissingData(fileName: string, param: any) {
    try {
        let targetMissingKeys: any[];
        let sourceMissingKeys: any[];
        let UploadedFilePath = path.join(__dirname, settings.settings.ingestionUploadPath, param.userId.toString(), fileName);
        let xmlData = fs.readFileSync(UploadedFilePath, 'utf8');
        let jsonData = await xml2js.parseStringPromise(xmlData);
        let achivedMissingKeys: any[] = [];
        let achivedKeys: any[] = [];
        if (!Array.isArray(jsonData)) {
            await JsonObjIteration(jsonData, achivedKeys, achivedMissingKeys);
        }
        sourceMissingKeys = getPath(jsonData, '').map((key: any) => key.toString().replaceAll('[0]', ''));
        targetMissingKeys = PO_keys.filter(val => !achivedKeys.includes(val));
        await pobClass.updatePoTemplate(jsonData, param.company_id);
        return { success: true, result: { sourceMissingKeys: sourceMissingKeys, targetMissingKeys: targetMissingKeys } }
    } catch (e) {
        console.log(e);
    }
}

async function getPoIngestionData(param: any) {
    try {
        let result = await pobClass.getPoIngestionData(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoIngestionMappingData(param: any) {
    try {
        let result = await pobClass.getPoIngestionFileName(param);
        if (result.success) {
            return getPoIngestionMissingData(result.rows[0].filepath, param)
            //return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function uploadDataSet(param: any) {
    let dataset = param.dataset.replace(/^data:(.*?);base64,/, "").replace(/ /g, '+');
    let unqFileName = new Date().getTime().toString(36);
    let user_id = param.userId.toString();
    let filePath = path.join(__dirname, settings.settings.ingestionUploadPath, user_id, unqFileName + param["fileName"]);
    let relativePath = unqFileName + param["fileName"];
    param["relativePath"] = relativePath;
    try {
        if (!fs.existsSync(path.join(__dirname, settings.settings.ingestionUploadPath, user_id))) {
            fs.mkdirSync(path.join(__dirname, settings.settings.ingestionUploadPath, user_id));
        }
        fs.writeFileSync(filePath, dataset, 'base64');
        let result = await pobClass.uploadDataSet(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: relativePath };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function deleUploadedFile(param: any) {
    try {
        let result = await pobClass.getPoIngestionFileName(param);
        if (result.success) {
            let fileDel = await pobClass.deleUploadedFile(param);
            if (fileDel.success) {
                let fileName = result.rows[0].filepath;
                let user_id = param.userId.toString();
                if (!fs.existsSync(path.join(__dirname, settings.settings.ingestionUploadPath, 'Recycle Bin'))) {
                    fs.mkdirSync(path.join(__dirname, settings.settings.ingestionUploadPath, 'Recycle Bin'));
                }
                if (!fs.existsSync(path.join(__dirname, settings.settings.ingestionUploadPath, 'Recycle Bin', user_id))) {
                    fs.mkdirSync(path.join(__dirname, settings.settings.ingestionUploadPath, 'Recycle Bin', user_id));
                }
                var oldPath = path.join(__dirname, settings.settings.ingestionUploadPath, user_id, fileName);
                var recyclePath = path.join(__dirname, settings.settings.ingestionUploadPath, 'Recycle Bin', user_id, fileName);
                fs.rename(oldPath, recyclePath, function (err: any) {
                    if (err) throw err
                });
                return { success: true, rowCount: fileDel.rowCount, result: fileDel.rows };
            }
            else {
                return { success: false, message: fileDel.message };
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function validatePoTemplate(path: any, object: any, mappedKey: string, company_id: number, newColumns: any) {
    try {
        let objCopy = object;
        let arrKey = path.split('.');
        for (let key of arrKey) {
            var regex = new RegExp(/\[.\]/, 'g');
            //key = key.replaceAll('[0]', '');
            key = key.replaceAll(regex, '');
            if (key in objCopy) {
                if (Array.isArray(objCopy[key])) {
                    objCopy = objCopy[key][0]
                } else if (typeof objCopy[key] == 'object') {
                    objCopy = objCopy[key];
                } else {
                    //mappedKey == '' ? delete objCopy[key] : (mappedKey.toLowerCase() == 'new_column_po_raw' ? objCopy[key] = 'po_raw_' + company_id + '.' + key.toLowerCase() : objCopy[key] = 'po_raw.' + mappedKey);
                    mappedKey == '' ? objCopy[key] = '' : (mappedKey.toLowerCase() == 'new_column_po_raw' ? objCopy[key] = 'po_raw_' + company_id + '.' + key.toLowerCase() : objCopy[key] = 'po_raw.' + mappedKey);
                    mappedKey.toLowerCase() == 'new_column_po_raw' ? newColumns.push(key.toLowerCase()) : '';
                }
            } else {
                mappedKey == '' ? objCopy[key] = '' : (mappedKey.toLowerCase() == 'new_column_po_raw' ? objCopy[key] = 'po_raw_' + company_id + '.' + key.toLowerCase() : objCopy[key] = 'po_raw.' + mappedKey);
                mappedKey.toLowerCase() == 'new_column_po_raw' ? newColumns.push(key.toLowerCase()) : '';
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function iterate(obj: any, mappedKeys: any[], company_id: number, str?: string) {
    let prev = '';
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                //const s = isArray(obj) ? prev + str + '[' + property + ']' + '.' : prev + property + (isArray(obj[property]) ? '' : '.');
                const s = isArray(obj) ? prev + str + '[' + property + ']' + '.' : (str != undefined ? str : '') + property + (isArray(obj[property]) ? '' : '.');
                iterate(obj[property], mappedKeys, company_id, s);
            } else {
                prev = (str != undefined ? str : '');
                //console.log(prev + property, '- ' + obj[property]);
                if (obj[property] != '') {
                    mappedKeys.push({ sourceKeys: prev + property, targetKeys: obj[property].replace('po_raw.', '').replace('po_raw_' + company_id + '.', '') });
                }
            }
        }
    }
    return obj;
}

function isArray(obj: any) {
    return obj instanceof Array;
}

async function validatePoiMapping(param: any) {
    try {
        let newColumns: any[] = [];
        let result = await pobClass.getPoiTemplate(param);
        if (result.success) {
            let jsonData = result.rows[0].po_template;
            let objCopy = jsonData;
            for (let key in param.mappedKeys) {
                await validatePoTemplate(key, objCopy, param.mappedKeys[key], param.company_id, newColumns);
            }
            let updateResult = await pobClass.validatePoiMapping(jsonData, param.unMappedTargetKeys, param.company_id);
            if (updateResult.success) {
                let res = await pobClass.createPOChildTables(newColumns, param.company_id);
                return { success: true, result: updateResult.rows };
            } else {
                return { success: false, message: 'Unable to validate mapping.' };
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function deleteMappings(param: any) {
    try {
        let result = await pobClass.deleteMappings(param);
        let result2 = await pobClass.deleteSchedule(param);
        if (result.success && result2.success) {
            await pobClass.dropPORawChildTables(param);
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: 'Unable to remove schedule records.' };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function viewPoiMappings(param: any) {
    try {
        let mappedkeys: any[] = [];
        let result = await pobClass.getPoiTemplate({ company_id: param.company_id });
        if (result.success) {
            let jsonData = result.rows[0].po_template;
            await iterate(jsonData, mappedkeys, param.company_id);
            return { success: true, result: mappedkeys };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function poIngestionTestRequest(url: any, headers: any, body: any, method: any) {
    try {
        return fetch(url, { method: method, headers: JSON.parse(headers), body: body })
            .then(async (res: any) => {
                let bodyContent = await res.text();
                let headerArry: any = {};
                res.headers.forEach((header: any, index: number) => {
                    headerArry[index] = header
                });
                return { success: res.ok, error: false, res: res, resBody: bodyContent, statusCode: res.status, statusText: res.statusText, headers: headerArry };
            })
            .then((fullResponse: any) => {
                return fullResponse;
            })
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoIngestionCards(param: any) {
    try {
        let result = await pobClass.getPoIngestionCards(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getIngestionLookups(param: any) {
    try {
        let result = await pobClass.getIngestionLookups(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function schedulePoIngestion(param: any) {
    try {
        let result = await pobClass.schedulePoIngestion(param);
        let result2 = await pobClass.validatePoiSchedule(param);
        if (result.success && result2.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoiScheduleData(param: any) {
    try {
        let result = await pobClass.getPoiScheduleData(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoiRunningStatus(param: any) {
    try {
        let result = await pobClass.getPoiRunningStatus(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoiUnmappedTargets(param: any) {
    try {
        let result = await pobClass.getPoiUnmappedTargets(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoIngestionSchemaErrors(param: any) {
    try {
        let result = await pobClass.getPoIngestionSchemaErrors(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPoIngestionMasterErrors(param: any) {
    try {
        let result = await pobClass.getPoIngestionMasterErrors(param);
        if (result.success) {
            if (result.rowCount > 0) {
                return { success: true, rowCount: result.rowCount, result: result.rows };
            } else {
                await updMasterErrorStatus(param);
                return { success: true, rowCount: result.rowCount, result: result.rows };
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function validatePoiSchema(param: any) {
    try {
        let newColumns: any[] = [];
        let mappedColumns: any[] = [];
        let result = await pobClass.getPoiTemplate(param);
        if (result.success) {
            let jsonData = result.rows[0].po_template;
            let objCopy = jsonData;
            for (let key in param.mappedKeys) {
                await validatePoTemplate(key, objCopy, param.mappedKeys[key], param.company_id, newColumns);
                let arrData = key.split('.');
                mappedColumns.push(arrData[arrData.length - 1]);
            }
            let updateResult = await pobClass.validatePoiMapping(jsonData, param.unMappedTargetKeys, param.company_id);
            if (updateResult.success) {
                console.log(newColumns);
                await pobClass.AddColumnInPOChildTables(newColumns, param.company_id);
                await pobClass.delPOSchemaError(mappedColumns, param.company_id);
                await statusUpdOnPoiSchedule(param);
                return { success: true, result: updateResult.rows };
            } else {
                return { success: false, message: 'Unable to validate mapping.' };
            }
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function statusUpdOnPoiSchedule(param: any) {
    try {
        let res = await pobClass.getCountOfSchemaError(param.company_id);
        if (res.success) {
            if (parseInt(res.rows[0].count) == 0) {
                let upd = await pobClass.updPOSchemaStatus(param.company_id);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

async function getTotalCntForSchemaErrors(param: any) {
    try {
        let result = await pobClass.getTotalCntForSchemaErrors(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getTotalCntForMasterErrors(param: any) {
    try {
        let result = await pobClass.getTotalCntForMasterErrors(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getTotalCntForRunningStatus(param: any) {
    try {
        let result = await pobClass.getTotalCntForRunningStatus(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getConsigneeListForMasterValidation() {
    try {
        let result = await pobClass.getConsigneeListForMasterValidation();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function delInviteFromMasterValidation(param: any) {
    try {
        let delResult = await pobClass.delInviteCompanyPerm(param);
        if (delResult.success) {
            await pobClass.delInviteFromMasterValidation(param);
            return { success: true, rowCount: delResult.rowCount, result: delResult.rows };
        }
        else {
            return { success: false, message: "Delete Invite Failed" };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function updMasterErrors(param: any) {
    try {
        let result = await pobClass.updMasterErrors(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getPortListForMasterValidation() {
    try {
        let result = await pobClass.getPortListForMasterValidation();
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function validatePoiMaster(param: any) {
    try {
        if (param.error_type == 'MASTER_SUPPLIER_NAME') {
            let res1 = await pobClass.checkCompanyInvite(param);
            if (res1.success && res1.rowCount > 0) {
                if (res1.rows[0].is_accepted) {
                    let res2 = await pobClass.poiMasterMapSupplier(param);
                    if (res2.success) {
                        let res3 = await pobClass.delValidatedMasterError(param);
                        if (res3.success) {
                            let error = await pobClass.getMasterErrors(param);
                            if(error.success && error.rows[0].error_count == 0) {
                                param['is_master_under_process'] = false;
                                let upd = await pobClass.updMasterUnderProcess(param);
                            }
                            return { success: true, rowCount: res3.rowCount, result: res3.rows, message: 'Supplier mapped Successfully!' };
                        } else {
                            return { success: false, message: res3.message };
                        }
                    } else {
                        return { success: false, message: res2.message };
                    }
                } else if (!res1.rows[0].is_accepted) {
                    param['is_invite_sent'] = true;
                    let res5 = await pobClass.updInviteSendInMasterError(param);
                    if (res5.success) {
                        return { success: true, rowCount: res5.rowCount, result: res5.rows, message: "Supplier mapped Successfully!" };
                    } else {
                        return { success: false, message: res5.message };
                    }
                } else {
                    return { success: false, message: res1.message };
                }
            } else if (res1.success && res1.rowCount == 0) {
                let res4 = await pobClass.insInviteCompany(param);
                if (res4.success) {
                    param['is_invite_sent'] = true;
                    let res5 = await pobClass.updInviteSendInMasterError(param);
                    if (res5.success) {
                        return { success: true, rowCount: res5.rowCount, result: res5.rows, message: "Supplier mapped and Invited Successfully!" };
                    } else {
                        return { success: false, message: res5.message };
                    }
                } else {
                    return { success: false, message: res4.message };
                }
            } else {
                return { success: false, message: res1.message };
            }
        } else if (param.error_type == 'MASTER_FACTORY_NAME') {
            let res1 = await pobClass.checkCompanyInvite(param);
            if (res1.success && res1.rowCount > 0) {
                if (res1.rows[0].is_accepted) {
                    let res2 = await pobClass.poiMasterMapFactory(param);
                    if (res2.success) {
                        let res3 = await pobClass.delValidatedMasterError(param);
                        if (res3.success) {
                            return { success: true, rowCount: res3.rowCount, result: res3.rows, message: 'Factory mapped Successfully!' };
                        } else {
                            return { success: false, message: res3.message };
                        }
                    } else {
                        return { success: false, message: res2.message };
                    }
                } else if (!res1.rows[0].is_accepted) {
                    param['is_invite_sent'] = true;
                    let res5 = await pobClass.updInviteSendInMasterError(param);
                    if (res5.success) {
                        return { success: true, rowCount: res5.rowCount, result: res5.rows, message: "Factory mapped Successfully!" };
                    } else {
                        return { success: false, message: res5.message };
                    }
                } else {
                    return { success: false, message: res1.message };
                }
            } else if (res1.success && res1.rowCount == 0) {
                let res4 = await pobClass.insInviteCompany(param);
                if (res4.success) {
                    param['is_invite_sent'] = true;
                    let res5 = await pobClass.updInviteSendInMasterError(param);
                    if (res5.success) {
                        return { success: true, rowCount: res5.rowCount, result: res5.rows, message: "Factory mapped and Invited Successfully!" };
                    } else {
                        return { success: false, message: res5.message };
                    }
                } else {
                    return { success: false, message: res4.message };
                }
            } else {
                return { success: false, message: res1.message };
            }
        } else if (param.error_type == 'MASTER_ORIGIN_PORT' || param.error_type == 'MASTER_DESTINATION_PORT') {
            let res1 = await pobClass.checkPortRef(param);
            if (res1.success && res1.rowCount > 0) {
                // port ref available
                await pobClass.delValidatedMasterError(param);
                let msg = param.error_type == 'MASTER_ORIGIN_PORT' ? 'Origin port mapped Successfully!' : 'Destination port mapped Successfully!'
                return { success: true, rowCount: res1.rowCount, result: res1.rows, message: msg };
            } else if (res1.success && res1.rowCount == 0) {
                let res3 = await pobClass.poiMasterMapPort(param);
                if (res3.success) {
                    await pobClass.delValidatedMasterError(param);
                    let msg = param.error_type == 'MASTER_ORIGIN_PORT' ? 'Origin port mapped Successfully!' : 'Destination port mapped Successfully!'
                    return { success: true, rowCount: res3.rowCount, result: res3.rows, message: msg };
                } else {
                    return { success: false, message: res3.message };
                }
            } else {
                return { success: false, message: res1.message };
            }
        } else if (param.error_type == 'MASTER_INCOTERMS_NAME') {
            let res1 = await pobClass.poiMasterMapIncoterm(param);
            if(res1.success && res1.rowCount > 0) {
                let res2 = await pobClass.delValidatedMasterError(param);
                if(res2.success) {
                    return { success: true, rowCount: res2.rowCount, result: res2.rows, message: 'Incoterms mapped Successfully!' };
                } else {
                    return { success: false, message: res2.message };
                }
            } else {
                return { success: false, message: res1.message };
            }
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}


// async function validatePoiMaster(param: any) {
//     try {
//         let result = await pobClass.validatePoiMaster(param);
//         if (result.success) {
//             return { success: true, rowCount: result.rowCount, result: result.rows };
//         }
//         else {
//             return { success: false, message: result.message };
//         }
//     }
//     catch (e: any) {
//         return { success: false, message: e.message };
//     }
// }

async function addNewIncoterm(param: any) {
    try {
        let result = await pobClass.addNewIncoterm(param);
        if (result.success && result.rowCount > 0) {
            let res2 = await pobClass.delValidatedMasterError(param);
            if (res2.success) {
                return { success: true, rowCount: result.rowCount, result: result.rows };
            } else {
                return { success: false, message: res2.message };
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function updMasterErrorStatus(param: any) {
    try {
        let result = await pobClass.updMasterErrorStatus(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getCompanyInviteData(param: any) {
    try {
        let result = await pobClass.getCompanyInviteData(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function insInviteExistingSupplier(param: any) {
    try {
        let result = await pobClass.insInviteExistingSupplier(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}
export = { getPoIngestionData, uploadDataSet, getPoIngestionMappingData, deleUploadedFile, validatePoiMapping, deleteMappings, viewPoiMappings, poIngestionTestRequest, getPoIngestionCards, getIngestionLookups, schedulePoIngestion, getPoiScheduleData, getPoiRunningStatus, getPoiUnmappedTargets, getPoIngestionSchemaErrors, getPoIngestionMasterErrors, validatePoiSchema, getTotalCntForSchemaErrors, getTotalCntForMasterErrors, getTotalCntForRunningStatus, getConsigneeListForMasterValidation, delInviteFromMasterValidation, updMasterErrors, getPortListForMasterValidation, validatePoiMaster, addNewIncoterm, updMasterErrorStatus, getCompanyInviteData, insInviteExistingSupplier };
