import { LicenseModel } from "../models/licenseModel";
import { CompanyContactModel } from "../models/companyContactModel";
const companyContactClass = new CompanyContactModel();

let licenseClass = new LicenseModel();

async function getLicenseDetails() {
    try {
        let result = await licenseClass.getLicenseDetails();
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

async function approveLicenseStatus(param: any) {
    try {
        let result = await licenseClass.approveLicenseStatus(param);
        if (result.success) {
            let res = await companyContactClass.delCompanyLicense(param);  
            let res1 = await companyContactClass.insCompanyLicenseModule(param);
            let uc = await licenseClass.insUserCompanyOnLicenseApproval(param);
            if (res.success && res1.success) {
                return { success: true, rowCount: result.rowCount, result: result.rows };
            } else if(!res.success) {
                return { success: false, message: res.message };
            } else if(!res1.success) {
                return { success: false, message: res1.message };
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

async function revokeLicenseStatus(param: any) {
        try {
            let result = await licenseClass.revokeLicenseStatus(param);
            if (result.success) {
                let res = await companyContactClass.delCompanyLicense(param);  
                let res1 = await companyContactClass.insCompanyLicenseModule(param);
                if (res.success && res1.success) {
                    return { success: true, rowCount: result.rowCount, result: result.rows };
                } else if(!res.success) {
                    return { success: false, message: res.message };
                } else if(!res1.success) {
                    return { success: false, message: res1.message };
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

export = { getLicenseDetails, approveLicenseStatus, revokeLicenseStatus};