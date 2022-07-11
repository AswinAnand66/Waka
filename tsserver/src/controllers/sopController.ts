import path from "path";
import fs from "fs";
import { SOPModel } from "../models/sopModel";
const config = require("../config/constants");
const sopClass = new SOPModel();

async function insSOPContact(param: any) {
    try {
        let result = await sopClass.insSOPContact(param);
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

async function updSOPContact(param: any) {
    try {
        let result = await sopClass.updSOPContact(param);
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

async function delSOPContactPorts(param: any) {
    try {
        let result = await sopClass.delSOPContactPorts(param);
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

async function insSOPContactPort(param: any) {
    try {
        let result = await sopClass.insSOPContactPort(param);
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

async function getSOPId(param: any) {
    try {
        let result = await sopClass.getSOPId(param);
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

async function validateAndInsSOP(param: any) {
    // let result = await getSOPId(param);
    // let msg = '';
    // if (result.success && result.rowCount > 0){
    //     result.result.map((row: any)=>{
    //         if (param.sop_id != row.sop_id){
    //             if ((new Date(param.valid_from) >= new Date(row.valid_from) && new Date(param.valid_from) <= new Date(row.valid_to)) ||(new Date(param.valid_to) >= new Date(row.valid_from) && new Date(param.valid_to) <= new Date(row.valid_to))){
    //                 msg += 'Dates are overlapping with other SOPs' ;
    //             }
    //         }
    //     });
    //     if (msg.length > 0){
    //         return({success:true,rowCount:result.rowCount, message:'Dates are overlapping with other SOPs' });
    //     }
    // }
    // if (!result.success){
    //     return {success:false, message:result.message};
    // }
    //if msg length zero or no sop found for ff and principal selection
    if (param.sop_id == undefined) {
        let result1 = await insSOP(param);
        if (result1.success) {
            param["sop_id"] = result1.result[0].sop_id;
            await sopClass.insSOPServicesOnSOPCreation(param);
            return { success: true, rowCount: result1.rowCount, result: result1.result };
        }
        else {
            return { success: false, message: result1.message };
        }
    }
    else {
        let result1 = await sopClass.updSOPValidity(param);
        if (result1.success) {
            return ({ success: true, rowCount: result1.rowCount });
        }
        else {
            return { success: false, message: result1.message };
        }
    }
}

async function insSOP(param: any) {
    try {
        let result = await sopClass.insSOP(param);
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

async function getSOPContacts(param: any) {
    try {
        let result: any;
        if (param.company_id != undefined) {
            result = await sopClass.getSOPContactsForCompany(param);
        } else {
            result = await sopClass.getSOPContactsAllCompany(param);
        }
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

async function delSOPContact(param: any) {
    try {
        let result = await sopClass.delSOPContact(param);
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

async function getSOPContactPorts(param: any) {
    try {
        let result = await sopClass.getSOPContactPorts(param);
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

async function getSOPs(userId: number) {
    try {
        let result = await sopClass.getSOPs(userId);
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

async function getSOPCompany(param: any) {
    try {
        let result = await sopClass.getSOPCompany(param);
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

async function delSOPCompany(param: any) {
    try {
        let result = await sopClass.delSOPContactsByCompId(param);
        if (result.success) {
            let result1 = await sopClass.delSOPCompany(param);
            if (result1.success) {
                return { success: true, rowCount: result1.rowCount, result1: result.rows };
            }
            else {
                return { success: false, message: result1.message };
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

async function getAllCompForSOPByCompType(param: any) {
    try {
        let result = await sopClass.getAllCompForSOPByCompType(param);
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

async function insSOPCompanies(param: any) {
    try {
        let r = await sopClass.delSOPCompany(param);
        if (!r.success) return { success: false, message: r.message };
        let result = await sopClass.insSOPCompany(param);
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

async function removeSOPCompanies(param: any) {
    try {
        let result = await sopClass.removeSOPCompanies(param);
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

async function insSOPCompany(param: any) {
    try {
        let result = await sopClass.insSOPCompany(param);
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

async function updSOPCompany(param: any) {
    try {
        let result = await sopClass.updSOPCompany(param);
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

async function getSOPDocs(param: any) {
    try {
        let result = await sopClass.getSOPDocs(param);
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

async function insSOPDocs(param: any) {
    try {
        let result;
        for (let idx = 0; param.sop_port_ids.length > idx; idx++) {
            result = await sopClass.insSOPDocs(param, idx);
        }
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

async function getSOPContactByEmail(param: any) {
    try {
        let result;
        if (param.sop_contact_id == undefined) {
            result = await sopClass.getSOPContactByEmail(param);
        }
        else {
            result = await sopClass.validateEmail(param);
        }
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

async function insSOPCargoHandling(param: any) {
    try {
        let result = await sopClass.insSOPCargoHandling(param);
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

async function getSOPCHForGroup(param: any) {
    try {
        let result = await sopClass.getSOPCHForGroup(param);
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

async function checkSOPInCH(param: any) {
    try {
        let result = await sopClass.checkSOPInCH(param);
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

async function updSOPCHIsSelected(param: any) {
    try {
        let result = await sopClass.updSOPCHIsSelected(param);
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

async function updSOPCHOptimalValue(param: any) {
    try {
        let result = await sopClass.updSOPCHOptimalValue(param);
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

async function updSOPCHfields(param: any) {
    try {
        let result = await sopClass.updSOPCHfields(param);
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

async function getSOPContainer(param: any) {
    try {
        let result = await sopClass.getSOPContainer(param);
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

async function insSOPContainer(param: any) {
    try {
        let result = await sopClass.insSOPContainer(param);
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

async function updSOPContainer(param: any) {
    try {
        let result = await sopClass.updSOPContainer(param);
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

async function removeSOPContainer(param: any) {
    try {
        let result = await sopClass.removeSOPContainer(param);
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

async function getSOPCarrierAlloc(param: any) {
    try {
        let result = await sopClass.getSOPCarrierAlloc(param);
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

async function insSOPCarrierAlloc(param: any) {
    try {
        let result = await sopClass.insSOPCarrierAlloc(param);
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

async function updSOPCarrierAlloc(param: any) {
    try {
        let result = await sopClass.updSOPCarrierAlloc(param);
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

async function removeSOPCarrierAlloc(param: any) {
    try {
        let result = await sopClass.removeSOPCarrierAlloc(param);
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

async function getSOPCarrierAllocByPort(param: any) {
    try {
        let result = await sopClass.getSOPCarrierAllocByPort(param);
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

async function delSOPCarrierAllocForPort(param: any) {
    try {
        let result = await sopClass.delSOPCarrierAllocForPort(param);
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

async function getSOPCarrierPref(param: any) {
    try {
        let result = await sopClass.getSOPCarrierPref(param);
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

async function insSOPCarrierPref(param: any) {
    try {
        let result = await sopClass.insSOPCarrierPref(param);
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

async function updSOPCarrierPref(param: any) {
    try {
        let result = await sopClass.updSOPCarrierPref(param);
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

async function removeSOPCarrierPref(param: any) {
    try {
        let result = await sopClass.removeSOPCarrierPref(param);
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

async function getSOPCarrierPrefByPort(param: any) {
    try {
        let result = await sopClass.getSOPCarrierPrefByPort(param);
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

async function delSOPCarrierPrefForPort(param: any) {
    try {
        let result = await sopClass.delSOPCarrierPrefForPort(param);
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

async function insSOPPOBooking(param: any) {
    try {
        let result = await sopClass.insSOPPOBooking(param);
        let pobd = await sopClass.insPOBookingDetails(param);
        if (result.success && pobd.success) {
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

async function insSOPLandingCost(param: any) {
    try {
        let result = await sopClass.insSOPLandingCost(param);
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

async function insSOPCarrier(param: any) {
    try {
        let result = await sopClass.insSOPCarrier(param);
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

async function insSOPSchInvoice(param: any) {
    try {
        let result = await sopClass.insSOPSchInvoice(param);
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

async function getSOPPOBForGroup(param: any) {
    try {
        let result = await sopClass.getSOPPOBForGroup(param);
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

async function getSOPDocForGroup(param: any) {
    try {
        let result = await sopClass.getSOPDocForGroup(param);
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

async function getSOPLCForGroup(param: any) {
    try {
        let result = await sopClass.getSOPLCForGroup(param);
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

async function getSOPCarrierForGroup(param: any) {
    try {
        let result = await sopClass.getSOPCarrierForGroup(param);
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

async function getSopPortCountryWiseList(param: any) {
    try {
        let result = await sopClass.getSopPortCountryWiseList(param);
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

async function getDocGrp(param: any) {
    try {
        let result = await sopClass.getDocGrp(param);
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

async function getSOPSchInvForGroup(param: any) {
    try {
        let result = await sopClass.getSOPSchInvForGroup(param);
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

async function checkSOPInPOB(param: any) {
    try {
        let result = await sopClass.checkSOPInPOB(param);
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

async function checkSOPInLC(param: any) {
    try {
        let result = await sopClass.checkSOPInLC(param);
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

async function checkSOPInCarrier(param: any) {
    try {
        let result = await sopClass.checkSOPInCarrier(param);
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

async function checkSOPInSchInvoice(param: any) {
    try {
        let result = await sopClass.checkSOPInSchInvoice(param);
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

async function checkSOPInDoc(param: any) {
    try {
        let result = await sopClass.checkSOPInDoc(param);
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

async function updDocFieldValue(param: any) {
    try {
        let result = await sopClass.updDocFieldValue(param);
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

async function updDocisSelected(param: any) {
    try {
        let result = await sopClass.updDocisSelected(param);
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

async function updCarrierisSelected(param: any) {
    try {
        let result = await sopClass.updCarrierisSelected(param);
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

async function updSOPPOBIsSelected(param: any) {
    try {
        let result = await sopClass.updSOPPOBIsSelected(param);
        if (result.success) {
            console.log(param);
            if(param.control_name == 'GBCToSupplier' && param.is_selected){
                let fields = result.rows[0]
                let genDate = fields.fields[0].field0.field[0].value;
                let genColumn = fields.fields[0].field0.field[0].child[0].field[0].value;
                param['generate_date'] = { date: genDate , mapped_column: genColumn }
                await sopClass.updSOPPOBGenerateDate(param);
            } else if (param.control_name == 'GBCToSupplier' && !param.is_selected) {
                param['generate_date'] = null
                await sopClass.updSOPPOBGenerateDate(param);
            }
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

async function updSOPPOBfields(param: any) {
    try {
        let result = await sopClass.updSOPPOBfields(param);
        if (result.success) {
            if(param.controlname == 'RemainderToGenerate'){
                let fields = result.rows[0]
                let genDate = fields.fields[0].field0.field[0].value;
                let genColumn = fields.fields[0].field0.field[0].child[0].field[0].value;
                param['generate_date'] = { date: genDate , mapped_column: genColumn }
                await sopClass.updSOPPOBGenerateDate(param);
            }
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

async function updSOPLCfields(param: any) {
    try {
        let result = await sopClass.updSOPLCfields(param);
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

async function updSOPCarrierfields(param: any) {
    try {
        let result = await sopClass.updSOPCarrierfields(param);
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

async function updSOPSchInvfields(param: any) {
    try {
        let result = await sopClass.updSOPSchInvfields(param);
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

async function copySOPCompany(param: any) {
    try {
        let result = await sopClass.copySOPCompany(param);
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

async function copySOPContact(param: any) {
    try {
        let result = await sopClass.copySOPContact(param);
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

async function copySOPContactPort(param: any) {
    try {
        let result = await sopClass.copySOPContactPort(param);
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

async function copySOPDocs(param: any) {
    try {
        let result = await sopClass.copySOPDocs(param);
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

async function copySOPPOBooking(param: any) {
    try {
        let result = await sopClass.copySOPPOBooking(param);
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

async function copySOPCargoHandling(param: any) {
    try {
        let result = await sopClass.copySOPCargoHandling(param);
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

async function copySOPContainer(param: any) {
    try {
        let result = await sopClass.copySOPContainer(param);
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

async function copySOPCarrierAlloc(param: any) {
    try {
        let result = await sopClass.copySOPCarrierAlloc(param);
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

async function copySOPCarrierPref(param: any) {
    try {
        let result = await sopClass.copySOPCarrierPref(param);
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

async function delSOP(param: any) {
    try {
        let result = await sopClass.delSOP(param);
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

async function delSOPCountry(param: any) {
    try {
        let result = await sopClass.delSOPCountry(param);
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

async function insSOPCountry(param: any) {
    try {
        let result = await delSOPCountry(param);
        if (!result.success) return { success: false, message: result.message };
        let result1 = await sopClass.insSOPCountry(param);
        if (result1.success) {
            return { success: true, rowCount: result1.rowCount, result: result1.rows };
        }
        else {
            return { success: false, message: result1.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getSOPCountries(sop_id: number) {
    try {
        let result = await sopClass.getSOPCountries(sop_id);
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

async function getSOPServices(sop_id: number) {
    try {
        let result = await sopClass.getSOPServices(sop_id);
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

async function insSOPServices(param: any) {
    try {
        let delStat = await sopClass.delSOPServices(param.sop_id);
        if (!delStat.success) return { success: false, message: delStat.message };
        let result = await sopClass.insSOPServices(param);
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

async function delSOPDoc(param: any) {
    try {
        let result = await sopClass.delSOPDoc(param);
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

async function getSOPCommunication(sop_id: number, instruction_type: string) {
    try {
        let result = await sopClass.getSOPCommunication(sop_id, instruction_type);
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

async function insSOPCommunication(param: any) {
    try {
        let result = await sopClass.insSOPCommunication(param);
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

async function updSOPCommunication(param: any) {
    try {
        let result = await sopClass.updSOPCommunication(param);
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

async function delSOPCommunication(param: any) {
    try {
        let result = await sopClass.delSOPCommunication(param);
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

async function getSOPCommunicationForPrint(sop_id: number, instruction_type: string) {
    try {
        let result = await sopClass.getSOPCommunicationForPrint(sop_id, instruction_type);
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

async function getSOPStakeholdersForPrint(sop_id: number) {
    try {
        let result = await sopClass.getSOPStakeholdersForPrint(sop_id);
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

async function getSOPPOBForGroupForPrint(param: any) {
    try {
        let result = await sopClass.getSOPPOBForGroupForPrint(param);
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

async function getSOPCHForGroupForPrint(param: any) {
    try {
        let result = await sopClass.getSOPCHForGroupForPrint(param);
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

async function getSOPDOCForGroupForPrint(param: any) {
    try {
        let result = await sopClass.getSOPDOCForGroupForPrint(param);
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

async function getSOPCRForGroupForPrint(param: any) {
    try {
        let result = await sopClass.getSOPCRForGroupForPrint(param);
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

async function getContactsEmailForPrint(param: any) {
    try {
        let result = await sopClass.getContactsEmailForPrint(param);
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

async function getContracts(param: any) {
    try {
        let result = await sopClass.getContracts(param);
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

async function getSOPServiceChargeSummary(param: any) {
    try {
        let result = await sopClass.getSOPServiceChargeSummary(param);
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

async function addContract(param: any) {
    try {
        let result = await sopClass.insContract(param);
        if (result.success && result.rowCount > 0) {
            param.contract_id = result.rows[0].contract_id;
            let uploadedFileNames = await fileUpload(param);
            param.uploadedFileNames = uploadedFileNames;
            await sopClass.updContractFileName(param);
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function updateContract(param: any) {
    try {
        let result = await sopClass.updateContract(param);
        if (result.success && result.rowCount > 0) {
            let uploadedFileNames = await fileUpload(param)
            param.uploadedFileNames = uploadedFileNames;
            await sopClass.updContractFileName(param);
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function fileUpload(param: any) {
    try {
        let fileNames = [];
        let filePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id + "");
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        for (var i = 0; i < param.fileDetails.length; i++) {
            let file = param.fileDetails[i].data.replace(/^data:(.*?);base64,/, "").replace(/ /g, '+');
            fs.writeFileSync(filePath + "/" + param.fileDetails[i].name, file, 'base64');
            fileNames.push(param.fileDetails[i].name);
        }
        return fileNames;
    } catch (e) {
        console.log(e);
    }
}

async function delContract(param: any) {
    try {
        let result = await sopClass.delContract(param);
        if (result.success) {
            let filePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id + "");
            fs.rmdirSync(filePath, { recursive: true });
            let zipfilePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id + ".zip");
            if (fs.existsSync(zipfilePath)) {
                fs.unlinkSync(zipfilePath);
            }
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

async function extendContractValidity(param: any) {
    try {
        let result = await sopClass.insContractExtendData(param);
        if (result.success) {
            param.c_f_id = result.rows[0].c_f_id;
            let uploadedFileNames = await UpdExtendContractFiles(param);
            param.uploadedFileNames = uploadedFileNames;
            let updResult = await sopClass.updExtendContractData(param);
            if (updResult.success) {
                return { success: true, rowCount: updResult.rowCount, result: updResult.rows };
            }
            else {
                return { success: false, message: updResult.message };
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

async function UpdExtendContractFiles(param: any) {
    try {
        let filePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id + "/");
        let extendPath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id + "/" + param.c_f_id + "/");
        if (!fs.existsSync(extendPath)) {
            fs.mkdirSync(extendPath);
        }
        let files = fs.readdirSync(filePath);
        for (var i = 0; i < files.length; i++) {
            if (!fs.lstatSync(filePath + files[i]).isDirectory()) {
                fs.renameSync(filePath + files[i], extendPath + files[i]);
            }
        }
        return fileUpload(param);
    } catch (e) {
        //console.log(e);
    }
}

async function validateContract(param: any) {
    try {
        let result = await sopClass.validateContract(param);
        if (result.success) {
            let message = result.rowCount == 0 ? 'Available' : 'Contract already exist';
            return { success: true, rowCount: result.rowCount, result: message };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getSOPServiceChargeItemByGroup(param: any) {
    try {
        let result = await sopClass.getSOPServiceChargeItemByGroup(param);
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

async function getSOPServiceChargeItemByPortPair(param: any) {
    try {
        let result = await sopClass.getSOPServiceChargeItemByPortPair(param);
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

async function insSOPServiceCharge(param: any) {
    try {
        let result = await sopClass.insSOPServiceCharge(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows, msg: 'Service charge created' };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function updSOPServiceCharge(param: any) {
    try {
        let result = await sopClass.updSOPServiceCharge(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows, msg: 'Service charge updated' };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e: any) {
        // notes : found updation failed error in sop service charges will moniter and will remove after that
        return { success: false, message: e.message };
    }
}

async function delSOPServiceCharge(param: any) {
    try {
        let result = await sopClass.delSOPServiceCharge(param);
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

async function delSOPPort(param: any) {
    try {
        let result = await sopClass.delSOPPort(param);
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

async function addSOPSHPort(param: any) {
    try {
        let result;
        for (let idx = 0; param.orgPortIds.length > idx; idx++) {
            result = await sopClass.addSOPSHPort(param, param.orgPortIds[idx]);
        }

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

async function getSopPortList(param: any) {
    try {
        let result = await sopClass.getSopPortList(param);
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

async function getSopContainerWeightForPrint(param: any) {
    try {
        let result = await sopClass.getSopContainerWeightForPrint(param);
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

async function getSopPortFreeStorageDetails(param: any) {
    try {
        let result = await sopClass.getSopPortFreeStorageDetails(param);
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

async function addSopPortFreeStorageValidity(param: any) {
    try {
        let result = await sopClass.addSopPortFreeStorageValidity(param);
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

async function addSopPortFreeStorageDays(param: any) {
    try {
        let result = await sopClass.addSopPortFreeStorageDays(param);
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

async function getCurrentContractByCompanyId(param: any) {
    try {
        let result = await sopClass.getCurrentContractByCompanyId(param);
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

async function getSOPStakeholderList(param: any) {
    try {
        let result = await sopClass.getSOPStakeholderList(param);
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

async function getFFListForAddSOP(param: any) {
    try {
        let result = await sopClass.getFFListForAddSOP(param);
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

async function insNewSOPStakeholders(param: any) {
    try {
        let result = await sopClass.insNewSOPStakeholders(param);
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

async function updSOPStakeholders(param: any) {
    try {
        let result = await sopClass.updSOPStakeholders(param);
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

async function getSopPortCount(param: any) {
    try {
        let result = await sopClass.getSopPortCount(param);
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

async function delContractFile(param: any) {
    try {
        let filePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id.toString(), param.fileName);
        try {
            fs.unlinkSync(filePath);
        }
        catch { }
        let result = await sopClass.updContractFiles(param);
        if (result.success) {
            return { success: true, result: "Successfully removed the file" };
        }
        else {
            return { success: false, result: "Failed to update the database" };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function getSOPConsigneeContacts(param: any) {
    try {
        let result = await sopClass.getSOPConsigneeContacts(param);
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

async function getSOPFFContacts(param: any) {
    try {
        let result = await sopClass.getSOPFFContacts(param);
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

async function insSOPCarrierAllocation(param: any) {
    try {
        let result = await sopClass.insSOPCarrierAllocation(param);
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

async function updSOPCarrierAllocation(param: any) {
    try {
        let result = await sopClass.updSOPCarrierAllocation(param);
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

async function updCAFieldValue(param: any) {
    try {
        let result = await sopClass.updCAFieldValue(param);
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

async function getSOPCarrierAllocation(param: any) {
    try {
        let result = await sopClass.getSOPCarrierAllocation(param);
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

async function getAllocationIntervals() {
    try {
        let result = await sopClass.getAllocationIntervals();
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

async function getSOPCarrierList(param: any) {
    try {
        let result = await sopClass.getSOPCarrierList(param);
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

async function getSOPCarrierForSOPPrint(param: any) {
    try {
        let result = await sopClass.getSOPCarrierForSOPPrint(param);
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

async function saveCarrierPreference(param: any) {
    try {
        let result = await sopClass.saveCarrierPreference(param);
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

async function getSOPSCHINVForGroupForPrint(param: any) {
    try {
        let result = await sopClass.getSOPSCHINVForGroupForPrint(param);
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

async function insShipmentTrackingIns(param: any) {
    try {
        let result = await sopClass.insShipmentTrackingIns(param);
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

async function updShipmentTrackingIns(param: any) {
    try {
        let result = await sopClass.updShipmentTrackingIns(param);
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

async function getShipmentTrackingIns(param: any) {
    try {
        let result = await sopClass.getShipmentTrackingIns(param);
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

async function getEventsSubModulesWise(param: any) {
    try {
        let result = await sopClass.getEventsSubModulesWise(param);
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

async function copyDataforServiceCharges(param: any) {
    try {
        let result1 = await sopClass.delSOPServiceChargesbyPort(param);
        if (result1.success) {
            let result2 = await sopClass.copyDataforServiceCharges(param);
            if(result2.success) {
                return { success: true, rowCount: result2.rowCount, result: result2.rows };
            } else {
                return { success: false, message: result2.message };
            }
        }
        else {
            return { success: false, message: result1.message };
        }
    }
    catch (e: any) {
        return { success: false, message: e.message };
    }
}

async function checkCreateCommIns(param: any) {
    try {
        let result = await sopClass.checkCreateCommIns(param);
        if (result.success) {
            if(result.rowCount > 0 && result.rows[0].comm_ins_count == 0) {
                let result2 = await sopClass.createSOPCommuniation(param);
                if(result2.success) {
                    return { success: true, rowCount: result2.rowCount, result: result2.rows };
                } else {
                    return { success: false, message: result2.message };
                }
            } else if (result.rowCount > 0 && result.rows[0].comm_ins_count > 0) {
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

async function addremoveCommunicationIns(param: any) {
    try {
        let result = await sopClass.addremoveCommunicationIns(param);
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

export = { insSOPContact, updSOPContact, delSOPContactPorts, insSOPContactPort, getSOPId, insSOP, getSOPContacts, delSOPContact, getSOPContactPorts, getSOPs, getSOPCompany, delSOPCompany, getAllCompForSOPByCompType, insSOPCompanies, removeSOPCompanies, insSOPCompany, updSOPCompany, getSOPDocs, insSOPDocs, getSOPContactByEmail, insSOPCargoHandling, getSOPCHForGroup, checkSOPInCH, updSOPCHOptimalValue, updSOPCHIsSelected, updSOPCHfields, getSOPContainer, insSOPContainer, updSOPContainer, removeSOPContainer, getSOPCarrierAlloc, insSOPCarrierAlloc, updSOPCarrierAlloc, removeSOPCarrierAlloc, getSOPCarrierAllocByPort, delSOPCarrierAllocForPort, validateAndInsSOP, delSOPCarrierPrefForPort, getSOPCarrierPrefByPort, removeSOPCarrierPref, updSOPCarrierPref, insSOPCarrier, insSOPCarrierPref, getSOPCarrierPref, insSOPPOBooking, insSOPLandingCost, insSOPSchInvoice, getSOPPOBForGroup, getSOPLCForGroup, getSOPCarrierForGroup, getSopPortCountryWiseList, getSOPSchInvForGroup, checkSOPInPOB, checkSOPInLC, checkSOPInCarrier, checkSOPInSchInvoice, updSOPPOBIsSelected, updSOPPOBfields, updSOPLCfields, updSOPCarrierfields, updSOPSchInvfields, copySOPCompany, copySOPContact, copySOPContactPort, copySOPDocs, copySOPPOBooking, copySOPCargoHandling, copySOPContainer, copySOPCarrierAlloc, copySOPCarrierPref, delSOP, insSOPCountry, getSOPCountries, getSOPServices, insSOPServices, delSOPDoc, getSOPCommunication, insSOPCommunication, updSOPCommunication, delSOPCommunication, getSOPCommunicationForPrint, getSOPStakeholdersForPrint, getSOPPOBForGroupForPrint, getSOPCHForGroupForPrint, getSOPServiceChargeSummary, getSOPServiceChargeItemByGroup, getSOPServiceChargeItemByPortPair, insSOPServiceCharge, updSOPServiceCharge, delSOPServiceCharge, getContracts, addContract, updateContract, delContract, extendContractValidity, delSOPPort, addSOPSHPort, getSopPortList, getCurrentContractByCompanyId, getSOPStakeholderList, getFFListForAddSOP, insNewSOPStakeholders, updSOPStakeholders, getSopPortCount, validateContract, delContractFile, getDocGrp, checkSOPInDoc, getSOPDocForGroup, updDocFieldValue, updDocisSelected, updCarrierisSelected, getSOPConsigneeContacts, getSOPFFContacts, getSopPortFreeStorageDetails, insSOPCarrierAllocation, updSOPCarrierAllocation, getSOPCarrierAllocation, updCAFieldValue, getAllocationIntervals, getSOPCarrierList, saveCarrierPreference, getSOPDOCForGroupForPrint, getContactsEmailForPrint, getSOPSCHINVForGroupForPrint, getSOPCRForGroupForPrint, getSopContainerWeightForPrint, getSOPCarrierForSOPPrint, addSopPortFreeStorageValidity, addSopPortFreeStorageDays, insShipmentTrackingIns, updShipmentTrackingIns, getShipmentTrackingIns, getEventsSubModulesWise, copyDataforServiceCharges, checkCreateCommIns, addremoveCommunicationIns }