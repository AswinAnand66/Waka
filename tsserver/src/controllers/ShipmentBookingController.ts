import { ShipmentBookingModel } from './../models/ShipmentBookingModel';
const settings = require('../config/constants');
const path = require('path');
const fs = require('fs');

let shipBookClass = new ShipmentBookingModel();

async function getShipmentBooking(userId:any) {
    try {
        let result = await shipBookClass.getShipmentBooking(userId);
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

async function getPOListforAddPOs(userId:any) {
    try {
        let result = await shipBookClass.getPOListforAddPOs(userId);
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

async function getCompanyLogoPaths(param:any) {
    try {
        let result = await shipBookClass.getCompanyLogoPaths(param);
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

async function updateTEUValue(param:any) {
    try {
        let result = await shipBookClass.updateTEUValue(param);
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

async function insCustomView(param:any) {
    try {
        let result = await shipBookClass.insCustomView(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows, message: 'Custom View Created' };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updCustomView(param:any) {
    try {
        let result = await shipBookClass.updCustomView(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows, message: 'Custom View Updated'};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getCustomViews(param:any) {
    try {
        let result = await shipBookClass.getCustomViews(param);
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

async function deleteCustomView(param:any) {
    try {
        let result = await shipBookClass.deleteCustomView(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows, message: `${param.view_name} Deleted`};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

export = { getShipmentBooking , getCompanyLogoPaths, getPOListforAddPOs, updateTEUValue, insCustomView, updCustomView , getCustomViews, deleteCustomView }

