import { CompanyContactModel } from "../models/companyContactModel";
const settings = require('../config/constants');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const companyContactClass = new CompanyContactModel();

async function validateCompanyOwner(param:any){
    try {
        let result = await companyContactClass.validateCompanyOwner(param);
        if (result.success) {
            if(result.rowCount > 0){
                if(result.rows[0].owned_by ==  param.user_id){
                    return {success:true, rowCount:result.rowCount, result:result.rows, msg:'his own company', own_company: true };
                } else {
                    return {success:true,rowCount:result.rowCount, msg:'owned by other', own_company: false };
                }
            } else {
                let msg = 'Company Name Available';
                return {success:true,rowCount:result.rowCount, result:msg , company_name_avl: true }
            }
            
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function validateCompanyName(param:any){
    try {
        let result = await companyContactClass.validateCompanyName(param);
        if (result.success) {
            let message = result.rowCount == 0 ? 'Available' : 'Company Name already exist';
            return {success:true, rowCount:result.rows, result: message };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyData(param:any){
    try {
        let result = await companyContactClass.getCompanyData(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows: result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getAddressTypeList(){
    try {
        let result = await companyContactClass.getAddressTypeList();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getParentCompanyList(param:any){
    try {
        let result = await companyContactClass.getParentCompanyList(param.userIds);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getTaxRegistrationList(userId:number){
    try {
        let result = await companyContactClass.getTaxRegistrationList(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCountryListForCompany(){
    try {
        let result = await companyContactClass.getCountryListForCompany();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getStateListForCompany(country_id:number){
    try {
        let result = await companyContactClass.getStateListForCompany(country_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCityListForCompany(state_id:number){
    try {
        let result = await companyContactClass.getCityListForCompany(state_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getOfficeTypeList(){
    try {
        let result = await companyContactClass.getOfficeTypeList();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getBuyer(userId:number){
    try {
        let result = await companyContactClass.getBuyer(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getFF(userId:number){
    try {
        let result = await companyContactClass.getFF(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCarrier(){
    try {
        let result = await companyContactClass.getCarrier();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function insCompany(param:any){
    try {
        let filePath, relativePath ,msg;
        if (param["logo_file_name"] != undefined) {
            let image = param.company_logo.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            let unqFileName = new Date().getTime().toString(36);
            filePath = path.join(__dirname, "../fileuploads/", unqFileName + param["logo_file_name"]);
            relativePath = "../fileuploads/" + unqFileName + param["logo_file_name"];
            try {
              fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
        }
        param["relative_path"] = relativePath;
        param['invite_company'] = false;
        let result = await companyContactClass.insCompany(param);
        if (result.success) {
            return {success:true ,rowCount:result.rowCount, result:result.rows, message:'Company Registered Successfully.' };
        } else {
            return {success:false, message:result.message };
        }
    } catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyBasicDetails(param:any){
    try {
        let result = await companyContactClass.getCompanyBasicDetails(param);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}


//not used after 18-10-2021

async function insCompany_old(param:any){
    try {
        let filePath, relativePath, isResponse = false,msg;
        if (param["logo_file_name"] != undefined) {
            let image = param.company_logo.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            let unqFileName = new Date().getTime().toString(36);
            filePath = path.join(__dirname, "../fileuploads/", unqFileName + param["logo_file_name"]);
            relativePath = "../fileuploads/" + unqFileName + param["logo_file_name"];
            try {
              fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
        }
        param["relative_path"] = relativePath;
        param['invite_company'] = false;
        let result = await companyContactClass.insCompany(param);
        if (result.success) {
            param.company_id = result.rows[0].company_id;
            let res = await companyContactClass.insTaxDetails(param);
            let res1 = await companyContactClass.insCompanyAddress(param);
            if(res.success && res1.success) {
              isResponse = true; 
              msg = "Company added.";
            } else if (res.success == false) {
                await companyContactClass.delCompanyParent(param.company_id);
                await companyContactClass.delCompanyAddress(res1.rows[0].comp_add_id);
                msg = "Error in adding tax details "+res.message;
            } else if (res1.success == false) {
                await companyContactClass.delCompanyParent(param.company_id);
                if (param.tax_details.length != 0) {
                    await companyContactClass.delCompanyRegistrationParent(res.rows[0].comp_reg_id);
                }
                msg = "Error in adding company address "+res1.message;
            }
        } else {
            msg = result.message
        }
        if(isResponse && result.success){
            return {success:true,rowCount:result.rowCount, result:result.rows, message:msg };
        }
        else {
            return {success:false, message:msg };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updCompany(param:any){
    try {
        let filePath, relativePath, isResponse = false, msg;
        if (param["logo_file_name"] != undefined) {
            let image = param.company_logo.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            let unqFileName = new Date().getTime().toString(36);
            filePath = path.join(__dirname, "../fileuploads/", unqFileName + param["logo_file_name"]);
            relativePath = "../fileuploads/" + unqFileName + param["logo_file_name"];
            try {
              fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
            param["relative_path"] = relativePath;
        } else {
            param["relative_path"] = param.exist_logo_path;
        }
        let result = await companyContactClass.updCompany(param);
        if (result.success) {
            return {success:true ,rowCount: result.rowCount, message:'Company Updated Successfully.' };
        } else {
            return {success:false, message:result.message};
        }
    } catch (e:any){
        return {success:false, message:e.message};
    }
}

//not used after 18-10-2021
async function updCompany_old(param:any){
    try {
        let filePath, relativePath, isResponse = false, msg;
        if (param["logo_file_name"] != undefined) {
            let image = param.company_logo.replace(/data:image\/([A-Za-z]+);base64\,/g, "");
            let unqFileName = new Date().getTime().toString(36);
            filePath = path.join(__dirname, "../fileuploads/", unqFileName + param["logo_file_name"]);
            relativePath = "../fileuploads/" + unqFileName + param["logo_file_name"];
            try {
              fs.writeFileSync(filePath, image, 'base64');
            } catch (e:any) {
              console.log(e);
            }
            param["relative_path"] = relativePath;
        } else {
            param["relative_path"] = param.exist_logo_path;
        }
        let result = await companyContactClass.updCompany(param);
        if (result.success) {
            let res = await companyContactClass.insCompanyAddress(param);
            let res1 = await companyContactClass.insTaxDetails(param);
            if(res.success && res1.success) {
                isResponse = true; 
                msg = "Company updated.";
            } else if (res.success == false) {
                msg = res.message;
            } else if (res1.success == false) {
                msg = res1.message;
            }
        } else {
            msg = result.message
        }
        if(isResponse && result.success){
            return {success:true,rowCount:result.rowCount, message:msg };
        }
        else {
            return {success:false, message:msg};
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyLogo(param:any){
    try {
        let imagePath = path.join(__dirname, param);
        if (fs.existsSync(imagePath)) {
            return imagePath;
          }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function removeCompanyLogo(param:any){
    try {
        if (param != undefined) {
            let oldfilePath1 = path.join(__dirname, param);
            if (fs.existsSync(oldfilePath1)) {
                fs.unlinkSync(oldfilePath1);
                return { success: true, message: 'Image Deleted.' };
            } else {
                return { success: true, message: 'Image Not Deleted.' };
            }
        } else {
            return { success: true, message: 'Image Not Deleted' };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyRegDetails(company_id:number){
    try {
        let result = await companyContactClass.getCompanyRegDetails(company_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyAddressDetails(company_id:number){
    try {
        let result = await companyContactClass.getCompanyAddressDetails(company_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyAllAddressDetails(company_id:number){
    try {
        let result = await companyContactClass.getCompanyAllAddressDetails(company_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getAdminCompany(){
    try {
        let result = await companyContactClass.getAdminCompany();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getUsersCompany(userId:number){
    try {
        let result = await companyContactClass.getUsersCompany(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getInvitedCompaniesList(userId:number){
    try {
        let result = await companyContactClass.getInvitedCompaniesList(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getInviteCompany(param:any){
    try {
        let result = await companyContactClass.getInviteCompany(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function delCompany(param:any){
    try {
        let result = await companyContactClass.delCompany(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function insCompanyLicense(param:any){
    try {
        let result = await companyContactClass.insCompanyLicense(param);
        if (result.success) {
            param['cl_id'] = result.rows[0].cl_id;
            let res = await companyContactClass.insCompanyLicenseModule(param);
            if(res.success){
                 return {success:true, rowCount:result.rowCount, result:result.rows };
           }else{
                await companyContactClass.delCompanyLicenseParent(result.rows[0].cl_id);
                return {success:false, message:res.message };
           }
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function insCompanySharedLicense(param:any){
    try {
        let result = await companyContactClass.insCompanySharedLicense(param);
        if (result.success) {
            param['sl_id'] = result.rows[0].sl_id;
            param['cl_id'] = result.rows[0].cl_id;
            let res = await companyContactClass.insCompanySharedLicenseModule(param);
            if(res.success){
                 return {success:true, rowCount:result.rowCount, result:result.rows };
           }else{
                await companyContactClass.delInsCompanySharedLicenseParent(result.rows[0].sl_id);
                return {success:false, message:res.message };
           }
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getlicenseModules(param:any){
    try {
        let result = await companyContactClass.getlicenseModules(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getSharedLicenseModules(param:any){
    try {
        let result = await companyContactClass.getSharedLicenseModules(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updCompanyLicense(param:any){
    try {
        let result = await companyContactClass.delCompanyLicense(param);
        if (result.success) {
            let res = await companyContactClass.insCompanyLicenseModule(param);
            if(res.success){
                 return {success:true, rowCount:result.rowCount, result:result.rows };
           }else{
                return {success:false, message:res.message };
           }
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyForId(companyId:number){
    try {
        let result = await companyContactClass.getCompanyForId(companyId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function checkPrevCompInvit(param:any){
    try {
        let result = await companyContactClass.checkPrevCompInvit(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function addInviteCompany_wrong_changes(param:any){
    try {
        param.poi_me_id ? param["poi_master_error_id"] = param.poi_me_id : '';
        let rest = await companyContactClass.checkCompanyLicense(param.invitee_company_id);
        if(rest.rows.length != 0 && rest.rows[0]?.is_approved){
            let result = await companyContactClass.addInviteCompanyDetails(param);
            if (result.success) {
                if (result.rowCount>0){
                    param["company_invite_id"] = result.rows[0].company_invite_id;
                    let result1 = await companyContactClass.addInviteCompanyModules(param);
                    if (result1.success){
                        return {success:true, message:"Successfully company has been invited with modules"};
                    }
                    else {
                        await companyContactClass.delInviteCompanyPerm(result.rows[0].company_invite_id);
                        return {success:false, message:"Could not invite Company Err"+result1.message};
                    }
                }
                else return {success:false, message:"Could not invite company"};
            } else {
                return {success:false, message:result.message };
            }
        } else {
            return {success:false, message:param.invitee_company_name+' Has No License' };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function addInviteCompany(param:any){
    try {
        param.poi_me_id ? param["poi_master_error_id"] = param.poi_me_id : '';
        let result = await companyContactClass.addInviteCompanyDetails(param);
        if (result.success) {
            if (result.rowCount>0){
                param["company_invite_id"] = result.rows[0].company_invite_id;
                let result1 = await companyContactClass.addInviteCompanyModules(param);
                if (result1.success){
                    return {success:true, message:"Successfully company has been invited with modules"};
                }
                else {
                    await companyContactClass.delInviteCompanyPerm(result.rows[0].company_invite_id);
                    return {success:false, message:"Could not invite Company Err"+result1.message};
                }
            }
            else return {success:false, message:"Could not invite company"};
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function insCompanyContact(param:any){
    try {
           let result = await companyContactClass.insCompanyContact(param);
            if (result.success) {
                let data = await companyContactClass.insUserEventMapping(param);
                if(data.success){
                    return {success:true, message:`Successfully Invited ${param.name} as a contact`};
                } else {
                    return {success:false, message: data.message };
                }
            } else {
                if(result.message.includes('duplicate key value violates unique constraint')){
                    result.message = "Already Exists !"
                }
                return {success:false, message:result.message };
            }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updInviteCompany(param:any){
    try {
            let result = await companyContactClass.updInviteCompany(param);
            if (result.success) {
                let licModule =  await companyContactClass.updInviteCompanyModules(param);
                if (licModule.success) {
                    return {success:true, rowCount:result.rowCount, result:result.rows};
                } else {
                    return {success:false, message:licModule.message };
                }
            } else {
                return {success:false, message:result.message };
            }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updCompanyContact(param:any){
    try {
        let result = await companyContactClass.updCompanyContact(param);
            if (result.success) {
                await insUserEventMapping(param);
                return {success:true,rowCount:result.rowCount, result:result.rows , message:"Successfully updated contact details"};
                // let del = await companyContactClass.deleteUserEventMapping(param);
                // if(del.success){
                //     let data = await companyContactClass.insUserEventMapping(param);
                //     return {success:true,rowCount:result.rowCount, result:result.rows , message:"Successfully updated contact details"};
                // } else {
                //     return {success:false, message:result.message };
                // }
            } else {
                return {success:false, message:result.message };
            }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function insUserEventMapping(param:any){
    try {
        let result = await companyContactClass.deleteUserEventMapping(param);
            if (result.success) {
                let data = await companyContactClass.insUserEventMapping(param);
                if(data.success){
                    return {success:true,rowCount:data.rowCount, result:data.rows, message:`Roles Updated Succesfully for ${param.name}` };
                } else {
                    return {success:false, message:data.message };
                }
            } else {
                return {success:false, message:result.message };
            }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function delCompanyContact(param:any){
    try {
        let result = await companyContactClass.deleteUserEventMapping(param);
            if (result.success) {
                let data = await companyContactClass.delCompanyContactPerm(param);
                if(data.success){
                    return {success:true,rowCount:data.rowCount, result:data.rows };
                } else {
                    return {success:false, message:data.message };
                }
            } else {
                return {success:false, message:result.message };
            }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function delInviteCompany(param:any){
    try {
        let result = await companyContactClass.delInviteCompanyPerm(param.company_invite_id);
        if (result.success) {
            if(param.poi_master_error_id) {
                await companyContactClass.updMasterError(param.poi_master_error_id);
                return {success:true, rowCount:result.rowCount, result:result.rows };
            } else {
                return {success:true, rowCount:result.rowCount, result:result.rows };
            }
        } else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyTypeList(){
    try {
        let result = await companyContactClass.getCompanyTypeList();
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getInviteCompanyLicensedModulesList(param:any){
    try {
        let result = await companyContactClass.getInviteCompanyLicensedModulesList_old(param);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getInviteCompanySharedLicensedModulesList(param:any){
    try {
        let result = await companyContactClass.getInviteCompanySharedLicensedModulesList(param);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}


async function sendInviteCompanyMail(email: any, user_id: number, inviteCompanyName: string, inviteeName: string, route:string) {
    try {
        let encryptData = {
            user_id: user_id,
            email_id: email
        };
        
        let queryData = settings.encrypt(JSON.stringify(encryptData));
        const emailId = {
            emailId: email,
            cc: '',
            bcc: ''
        }

       let mailDetails = {
            inviteename: inviteeName,
            companyname: inviteCompanyName,
            LINK : ''
        }
        
        route == 'login' ? mailDetails.LINK = settings.WAKA_URL+"?data="+queryData : mailDetails.LINK = settings.WAKA_URL+"/signup?data="+queryData;
        
        let emailParam = {
            htmlFile: '',
            mailDetails: JSON.stringify(mailDetails),
            emailIds: JSON.stringify(emailId),
            mailSubject: 'Invite Company',
        };

        route == 'login' ? emailParam.htmlFile = 'waka_invitation_login' : emailParam.htmlFile = 'waka_invitation';
        
        let url = settings.MAIL_SERVICE_URL + "/getMailParam";
        let response = await fetch(url, { 
            method: 'POST', 
            body: JSON.stringify(emailParam), 
            headers: { 
                'Content-Type': 'application/json' 
            } 
        });
        let jsonRes = await response.json();
        if (jsonRes.success) {
            return { success: true };
        } else {
            return { success: false, message: jsonRes.message };
        }
    } catch (e:any) {  
        console.log(e);      
        return { success: false, message: e.message };
    }
}

async function getCompanyContactDetails(param:any){
    try {
        let result = await companyContactClass.getCompanyContactDetails(param);
        if (result.success) {
            let data = await companyContactClass.getCompanyAdminAsContact(param);
            if(data.success){
                return {success:true, rowCount:result.rowCount, result:result.rows , data: data.rows};
            } else {
                return {success:false, message:data.message };
            }
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getPendingInviteForEmail(email:string,userId:number){
    try {
        let result = await companyContactClass.getPendingInviteForEmail(email, userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getPendingContactInviteForEmail(email:string){
    try {
        let result = await companyContactClass.getPendingContactInviteForEmail(email);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updCompanyInviteAccept(param:any){
    try {
        let result = await companyContactClass.updCompanyInviteAccept(param);
        if (result.success && param.type == "accept") {
            if(param.poi_master_error_id != undefined) {
                if(param.master_error_type == 'MASTER_SUPPLIER_NAME') {
                    let insSupRef = await companyContactClass.insSupplierRef(param);
                    if(insSupRef.success && insSupRef.rowCount > 0) {
                        let delaction = await companyContactClass.delActiontakenMasterError(param.poi_master_error_id);
                        if(delaction.success) {
                            let error = await companyContactClass.getMasterErrors(param);
                            if(error.success && error.rows[0].error_count == 0) {
                                param['is_master_under_process'] = false;
                                let upd = await companyContactClass.updMasterUnderProcess(param);
                            }
                        }
                    }
                } else if(param.master_error_type == 'MASTER_FACTORY_NAME') {
                    let insFacRef = await companyContactClass.insFactoryRef(param);
                    if(insFacRef.success && insFacRef.rowCount > 0) {
                        let delaction = await companyContactClass.delActiontakenMasterError(param.poi_master_error_id);
                        if(delaction.success) {
                            let error = await companyContactClass.getMasterErrors(param);
                            if(error.success && error.rows[0].error_count == 0) {
                                param['is_master_under_process'] = false;
                                let upd = await companyContactClass.updMasterUnderProcess(param);
                            }
                        }
                    }
                } else if(param.master_error_type == 'MASTER_BUYER_NAME') {
                    let insBuyerRef = await companyContactClass.insBuyerRef(param);
                    if(insBuyerRef.success && insBuyerRef.rowCount > 0) {
                        let delaction = await companyContactClass.delActiontakenMasterError(param.poi_master_error_id);
                        if(delaction.success) {
                            let error = await companyContactClass.getMasterErrors(param);
                            if(error.success && error.rows[0].error_count == 0) {
                                param['is_master_under_process'] = false;
                                let upd = await companyContactClass.updMasterUnderProcess(param);
                            }
                        }
                    }
                }
            }
            await insUserCompany(param);
            await insCompanySharedLicense(param);
            return {success:true,rowCount:result.rowCount, result:result.rows };
        } else if(result.success && param.type == "deny") {
            await companyContactClass.delCompanyInviteModules(param);
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function checkParentCompany(param:any){
    try {
        let result = await companyContactClass.checkParentCompany(param);
        if (result.success) {
             return {success:true, rowCount:result.rowCount };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}


async function insUserCompany(param:any){
    try {
        let result = await companyContactClass.insUserCompany(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function inviteContactApproveRevoke(param:any){
    try {
        let result = await companyContactClass.inviteContactApproveRevoke(param);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function inviteCompanyApproveRevoke(param:any){
    try {
        let result = await companyContactClass.inviteCompanyApproveRevoke(param);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getAllInvitedCompanyForCountry(param:any){
    try {
        let result = await companyContactClass.getAllInvitedCompanyForCountry(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function updContactInviteAccept(param:any){
    try {
        let result = await companyContactClass.updContactInviteAccept(param);
        if (result.success && param.type != 'deny') {
            await companyContactClass.insContactInviteUserCompany(param);
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getAddressForCompanyId(company_id:number){
    try {
        let result = await companyContactClass.getAddressForCompanyId(company_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getCompanyContacts(company_id:number){
    try {
        let result = await companyContactClass.getCompanyContacts(company_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function checkEmailInviteContact(param:any) {
    try {
        let result = await companyContactClass.checkEmailInviteContact(param);
        if (result.success) {
            let msg = result.rowCount > 0 ? "available" : "Not available";
            return { success: true, result: msg, rows: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getCompanyList(user_id:number) {
    try {
        let result = await companyContactClass.getCompanyList(user_id);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getPrincipalListForSop(user_id:number) {
    try {
        let result = await companyContactClass.getPrincipalListForSop(user_id);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getPrincipalListForContract(user_id:number) {
    try {
        let result = await companyContactClass.getPrincipalListForContract(user_id);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getStakeholderList(principal_id:number) {
    try {
        let result = await companyContactClass.getStakeholderList(principal_id);
        if (result.success) {
            return {success:true, rowCount:result.rowCount, result:result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function validateInviteeCompanyName(param:any){
    try {
        let result = await companyContactClass.validateInviteeCompanyName(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getMyCompanyAndType(userId:number){
    try {
        let result = await companyContactClass.getMyCompanyAndType(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getWhoInvitedMe(userId:number){
    try {
        let result = await companyContactClass.getWhoInvitedMe(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getMyParentCompany(userId:number){
    try {
        let result = await companyContactClass.getMyParentCompany(userId);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getModulesForRoles(){
    try {
        let result = await companyContactClass.getModulesForRoles();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getSubModulesForRoles(param:any){
    try {
        let result = await companyContactClass.getSubModulesForRoles(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}


export = {validateCompanyName,validateCompanyOwner, getAddressTypeList, getCompanyData, getCompanyLogo, getCompanyBasicDetails, removeCompanyLogo, getCompanyRegDetails, getCompanyAddressDetails, getUsersCompany, insUserCompany, getStateListForCompany, getParentCompanyList,getTaxRegistrationList, getCountryListForCompany, getCityListForCompany, getOfficeTypeList, getBuyer, getFF, getCarrier, insCompany, updCompany, getAdminCompany, getCompanyForId, insCompanyLicense, getlicenseModules, updCompanyLicense, addInviteCompany, getCompanyContactDetails, getInviteCompany, updCompanyContact, delCompany, delCompanyContact, getCompanyTypeList, getInviteCompanyLicensedModulesList, updInviteCompany, delInviteCompany, insCompanySharedLicense, getSharedLicenseModules, getInviteCompanySharedLicensedModulesList, checkPrevCompInvit, getPendingInviteForEmail, getPendingContactInviteForEmail,updCompanyInviteAccept, updContactInviteAccept, getAddressForCompanyId, getCompanyContacts, inviteContactApproveRevoke, inviteCompanyApproveRevoke, getAllInvitedCompanyForCountry, checkEmailInviteContact, getCompanyAllAddressDetails, getCompanyList, getPrincipalListForSop, getStakeholderList,validateInviteeCompanyName, getInvitedCompaniesList, checkParentCompany, getMyCompanyAndType, getWhoInvitedMe, getMyParentCompany, getModulesForRoles, getSubModulesForRoles, insCompanyContact , insUserEventMapping, getPrincipalListForContract }

