import { manageOrdersModel } from './../models/manageOrdersModel';
const settings = require('../config/constants');
const path = require('path');
const fs = require('fs');

let manageOrderClass = new manageOrdersModel();

async function getPurchaseOrders(userId:number) {
    try {
        let result = await manageOrderClass.getCompaniesForPO(userId);
        if (result.success) {
            let company_ids = result.rows[0].company_ids;
            if(company_ids) {
                let result2 = await manageOrderClass.getPurchaseOrders(company_ids,userId);
                if(result2.success) {
                    return { success: true, is_po_assigned : true, rowCount: result2.rowCount, result: result2.rows };
                } else {
                    return { success: false, message: result2.message };
                }
            } else {
                return { success: true, is_po_assigned: false, message: 'PO not assigned' }
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getPurchaseOrdersCompanywise(param:any) {
    try {
        let result = await manageOrderClass.getCompaniesForPO(param.userId);
        if (result.success) {
            param["company_ids"] = result.rows[0].company_ids;
            let result2 = await manageOrderClass.getPurchaseOrdersCompanywise(param);
            if(result2.success) {
                return { success: true, rowCount: result2.rowCount, result: result2.rows };
            } else {
                return { success: false, message: result2.message };
            }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function addOrdersTransaction(param:any) {
    try {
        let filePath, relativePath, image;
        if (param["file_name"] != undefined) {
            if(param["file_type"] == 'PDF') {
                image = param.file.replace(/^data:(.*?);base64,/, "");
            } else {
                image = param.file.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            }
            let unqFileName = new Date().getTime().toString(36);
            let userId:string = param.userId.toString();
            let FileName = param["file_name"].replace(/ /g, "");
            filePath = path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId, unqFileName + FileName);
            relativePath = unqFileName + FileName;
            try {
                if (!fs.existsSync(path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId))) {
                    fs.mkdirSync(path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId));
                }
                fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
            param["relative_path"] = relativePath;
        };
        let result = await manageOrderClass.addOrdersTransaction(param);
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

async function updOrdersTransaction(param:any) {
    try {
        let filePath, relativePath, image;
        if (param["file_name"] != undefined) {
            if(param["file_type"] == 'PDF') {
                image = param.file.replace(/^data:(.*?);base64,/, "");
            } else {
                image = param.file.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            }
            let unqFileName = new Date().getTime().toString(36);
            let userId:string = param.userId.toString();
            let FileName = param["file_name"].replace(/ /g, "");
            filePath = path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId, unqFileName + FileName);
            relativePath = unqFileName + FileName;
            try {
                if (!fs.existsSync(path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId))) {
                    fs.mkdirSync(path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId));
                }
                fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
            param["relative_path"] = relativePath;
        } else {
            param["relative_path"] = null;
        }
        let result = await manageOrderClass.updOrdersTransaction(param);
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

async function delTransaction(param:any) {
    try {
        let result = await manageOrderClass.delTransaction(param);
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

async function getOrderTransactions(param:any) {
    try {
        let result = await manageOrderClass.getOrderTransactions(param);
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

async function viewTransactionsAttachedFile(param:any){
    try {
        let userId = param.userId.toString();
        let FilePath = path.join(__dirname, settings.settings.ordersTransactionAttachementPath, userId, param.filePath);
        if (fs.existsSync(FilePath)) {
            return FilePath;
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

export = { getPurchaseOrders, getPurchaseOrdersCompanywise, addOrdersTransaction, getOrderTransactions, viewTransactionsAttachedFile, updOrdersTransaction, delTransaction }
