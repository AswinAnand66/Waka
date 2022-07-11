import { UserModel } from "../models/userModel";
const settings = require('../config/constants');
const { checkDb, dbConnected } = require("../controllers/initializeController");
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

let userClass = new UserModel();
async function getAccess(details: any, user: any, ip: string) {
    const token = jwt.sign({ userId: details[0].user_id, ip: ip }, settings.settings.jwtKey, { expiresIn: settings.settings.tokenExpiresIn });
    let randLen = Math.floor(Math.random() * 32 + 50);
    let startChar = Math.floor(Math.random() * 15);
    let randString = settings.randomString(randLen);
    addLoginHistory(user, ip, "Successfully logged", true, token);
    delete details[0]["password"];
    delete details[0]['salt'];
    let sendData = { token: settings.shortToHex(randLen + 2) + token + randString + settings.shortToHex(startChar), user: details[0] };
    let response = { success: true, result: Buffer.from(JSON.stringify(sendData), 'binary').toString('base64') };
    return response;
}

function addLoginHistory(user: any, ipAddress: string, message: string, status: boolean, token: any) {
    if (dbConnected()) {
        userClass.addLoginHistory(user.email, ipAddress, message, status, token);
    }
    else {
        checkDb();
    }
}

async function login(user: any, ipAdd: string) {
    try {
        if (dbConnected()) {
            let response;
            let result = await userClass.login(user.email);
            if (result.success) {
                if (result.rowCount > 0) {
                    if(result.rows[0].active_flag){
                        let details = result.rows;
                        let hashPass = settings.MD5Hash(Buffer.concat([Buffer.from(user.password, 'base64'), Buffer.from(details[0].salt, 'hex')]));
                        if (hashPass === details[0].password) {
                        response = await getAccess(details, user, ipAdd);
                        } else {
                            addLoginHistory(user, ipAdd, "Invalid password " + user.password, false, null);
                            response = { success: false, invalidToken: false, message: "Invalid password" };
                        
                        }
                    } else {
                        response = { success: false, invalidToken: false, message: "Verification email is pending, Please verify and try Login again" };
                    }
                } else {
                    addLoginHistory(user, ipAdd, "Invalid login Name " + user.email, false, null);
                    response = { success: false, message: "You don't have account here, Please Signup!"};
                }
                return response;
            } else {
                return { success: false, message: result.message };
            }
        } else {
            checkDb();
            return { success: false, message: "DB connection failure, please try after some time" };
        }
    } catch (e:any) {
        return { success: false, status: 400, message: e.message };
    }
}

function validateToken(token: string) {
    try {
        let decoded = jwt.verify(token, settings.settings.jwtKey);
        if (!dbConnected()) {
            return { success: false, invalidToken: false, message: 'DB Connection Failure' };
        } else {
            return { success: true, decoded: decoded };
        }
    }
    catch (e:any) {
        return { success: false, invalidToken: true, message: 'Session Expired' };
    }
}

function logout(token: string) {
    userClass.logout(token);
}

async function getUserAllRole(param: any) {
    try {
        let result = await userClass.getUserAllRole(param);
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

async function getRoleStatForAdmin() {
    try {
        let result = await userClass.getRoleStatForAdmin();
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

async function addPageAccessView(param:any) {
    try {
        let result = await userClass.addPageAccessView(param);
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

async function getUserCompany(userId: number) {
    try {
        let result = await userClass.getUserCompany(userId);
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

async function getRoleStatForCompAdmin(param: any) {
    try {
        let result = await userClass.getRoleStatForCompAdmin(param);
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

async function getUserStat() {
    try {
        let result = await userClass.getUserStat();
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

async function getAllUsers() {
    try {
        let result = await userClass.getAllUsers();
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

//This function not used on 10/21/2021
async function checkUsrEmailExists(email: string, user_id: number) {
    try {
        let result = await userClass.checkUsrEmailExists(email);
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

async function userMailValidation(param: any) {
    try {
        let user_id = parseInt(Buffer.from(param, 'base64').toString());
        let result = await userClass.userMailValidation(user_id);
        if (result.success && result.rowCount > 0) {
            if(result.rows[0].active_flag){
                return { success: true, message:'account already activated' };
            } else {
                await userClass.UpdMailVerifiedOn(user_id);
                return { success: true, message:'account activate' };
            }

        }
        else {
            return { success: false, message: "account doesn't exist" };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function registerUser(param: any) {
    try {
        let userExists = await userClass.checkUsrEmailExists(param.email);
        if(userExists.success && userExists.rowCount > 0){
            if (settings.isMailServiceEnabled){
                if(!userExists.rows[0].active_flag){
                    let user = Buffer.from(userExists.rows[0].user_id+'', 'binary').toString('base64');
                    let link = settings.WAKA_URL+"/login?user="+user;
                    let mailDetails = {
                        LINK: link,
                        SIGNUP_LINK: settings.WAKA_URL+'/signup'
                    }
                    sendVerificationMail(param.email, mailDetails, 'waka_signup');
                } else {
                    let link = settings.WAKA_URL+"/login";
                    let mailDetails = {
                        LINK: link
                    }
                    sendVerificationMail(param.email, mailDetails, 'waka_user_exist');
                }
            }
            else {
                await userClass.UpdMailVerifiedOn((userExists.rows[0].user_id));
            }
            return { success: true };
        } else {
            let salt = settings.randBytes(32);
            param["hash_password"] = settings.MD5Hash(Buffer.concat([Buffer.from(param.password, 'base64'), salt]));
            param["salt"] = salt.toString('hex');
            let result = await userClass.registerUser(param);
            if (result.success) {
                if (settings.isMailServiceEnabled){
                    let user = Buffer.from(result.rows[0].user_id+'', 'binary').toString('base64');
                    let link = settings.WAKA_URL+"/login?user="+user;
                    let mailDetails = {
                        LINK: link,
                        SIGNUP_LINK: settings.WAKA_URL+'/signup'
                    }
                    sendVerificationMail(param.email, mailDetails, 'waka_signup');
                }
                else {
                    await userClass.UpdMailVerifiedOn(result.rows[0].user_id);
                    await userClass.addDetailsForUserMapping(result.rows[0].user_id,param.email);
                    await userClass.updContactInviteDetails(result.rows[0].user_id,param.email);
                    return { success: true, message:'account activate' };
                }
                return { success: true, rowCount: result.rowCount, result: result.rows };
            } else {
                return { success: false, message: result.message };
            }
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getInviteUser(param: any) {
    try {
        let result = await userClass.getInviteUser(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    } catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updUser(param: any) {
    try {
        let result = await userClass.updUser(param);
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

async function activateUser(param: any) {
    try {
        let result = await userClass.activateUsr(param);
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

async function delUsr(param: any) {
    try {
        let result = await userClass.delUsr(param);
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

async function insUserCompany(userId: number, user_id: number, data: any) {
    try {
        let result = await userClass.delAllUsrCompanyForUser(user_id);
        if (result.success) {
            let result1 = await userClass.addUsrCompanyForUser(userId, data);
            if (result1.success) return { success: true, rowCount: result1.rowCount, result: result1.rows };
            else return { success: false, message: result1.message }
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getUserStatForCompAdmin(userId: number) {
    try {
        let result = await userClass.getUserStatForCompAdmin(userId);
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

async function getUsersForCompAdmin(userId: number) {
    try {
        let result = await userClass.getUsersForCompAdmin(userId);
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

async function insUsrCompanyForCompAdmin(param: any) {
    try {
        let result = await userClass.insUsrCompany(param);
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

async function getAdminRoles(param:any) {
    try {
        let result = await userClass.getAdminRoles(param);
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

async function getRoles(param:any) {
    try {
        let result = await userClass.getRoles(param);
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



async function getCompanyUnqRoleName(companyId: number) {
    try {
        let result = await userClass.getCompanyUnqRoleName(companyId);
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

async function getModulesAndRolesForCompany(moduleId: number) {
    try {
        let result = await userClass.getModulesAndRolesForCompany(moduleId);
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

async function insRole(param: any) {
    try {
        let result = await userClass.insRole(param);
        if (result.success) {
            if (result.rowCount>0){
                    param["role_id"] = result.rows[0].role_id;
                    let result1 = await userClass.insRoleModuleMapping(param);
                    if (result1.success){ 
                        return {success:true, message:"Role "+ param.role_name +" Added"};
                    }
                    else {
                        await userClass.deleteRole(result.rows[0].role_id);
                        return {success:false, message:"Role Insertion Failed "+result1.message};
                    }
                }
            else return {success:false, message:"Role Insertion Failed"};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updRole(param: any) {
    try {
        await userClass.deleteRoleModuleMapping(param.rmm_id);
        let result = await userClass.updRole(param);
        if (result.success) {
            let result1 = await userClass.insRoleModuleMapping(param);
            return { success: true, rowCount: result.rowCount, message: 'Role '+ param.role_name +' Updated' };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getRolePermissionForExist(role_id: number) {
    try {
        let result = await userClass.getRolePermissionForExist(role_id);
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

async function deleteRole(param: any) {
    try {
        let result = await userClass.deleteRoleModuleMapping(param.rmm_id);
        if (result.success) {
            if(param.isDeleteRole){
                let detail = await userClass.deleteRole(param.role_id);
                if(detail.success){
                    return { success: true, message: 'Role Deleted Permanently' };
                }
            } else{
                return { success: true, message: 'Role Deleted' };
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

async function getLicenseCompanyForRoles(userId: number) {
    try {
        let result = await userClass.getLicenseCompanyForRoles(userId);
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

async function getRoleNameForCompany(param:any){
    try {
        let result = await userClass.getRoleNameForCompany(param);
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

async function getExistingRoleDetails(role_id:any) {
    try {
        let result = await userClass.getExistingRoleDetails(role_id);
        if(result.success){
            return {success:true, rowCount: result.rowCount, result:result.rows };
        }
        else{
            return {success : false, message : result.message };
        }
    } catch (e:any) {
        return {success : false, message : e.message };
    }    
}

async function validateRoleName(param:any){
    try {
        let result = await userClass.validateRoleName(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount};
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function checkEmail(param: any) {
    try {
        let result = await userClass.checkEmail(param);
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

async function checkEmailLinkVerified(param: any) {
    try {
        let result = await userClass.checkEmailLinkVerified(param);
        if (result.success && result.rowCount > 0) {
            
            let msg = result.rows[0].active_flag ? "verified" : "Not verified";
            return { success: true, result: msg };
            
        } else {
            let msg = "Not Available";
            return { success: false, message: msg };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getOTP(param: any) {
    try {
        let msg;
        let is_valid_on = false, IsResSuccess = false;
        let verify_code = Math.floor(Math.random() * (9999 - 1000) + 1000);
        param["verify_code"] = verify_code;
        let result = await userClass.getVerifyLinkDetails(param.email);
        if (result.success && result.rowCount > 0) {
            is_valid_on = result.rows[0].is_valid_on;
            IsResSuccess = is_valid_on;
            if (!is_valid_on) {
                let updateResult = await userClass.updVerifyLink(param);
                IsResSuccess = updateResult.success;
            }
        } else {
            let insResult = await userClass.insVerifyLink(param);
            IsResSuccess = insResult.success;
        }
        if (IsResSuccess) {
            let mailResponse = is_valid_on ? { success: true } : {success: true}; //await sendEmail(param.email, verify_code);
            //let mailResponse = is_valid_on ? { success: true } : await sendEmail(param.email, verify_code);
            msg = !mailResponse.success ? "Failed to send PIN, Please try again after some time" : is_valid_on ? "Generated PIN : " + result.rows[0].verify_code : "Generated PIN : " +verify_code;
            //msg = !mailResponse.success ? "Failed to send PIN, Please try again after some time" : "Verification PIN has been sent to your email.";
            return { success: mailResponse.success, is_valid_on: is_valid_on, message: msg ,result:result.rows};
        } else {
            return { success: false, message: "Failed to send PIN Please Try Again" };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function validateOTP(param: any) {
    try {
        let msg = '', result;
        result = await userClass.getVerifyLinkDetails(param.email);
        if (result.rows[0].verify_code == param.otp) {
            if (result.rows[0].is_valid_on == true) {
                await userClass.validateOTP(param);
                msg = "Validation Successful"
            } else if (result.rows[0].is_valid_on == false) {
                msg = "PIN Expired, Please generate PIN again"
            }
            return { success: true, message: msg };
        }
        else {
            return { success: false, message: "PIN match failed, Please Check" };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function changeForgottenPassword(param: any) {
    try {
        let salt = settings.randBytes(32);
        param["hash_password"] = settings.MD5Hash(Buffer.concat([Buffer.from(param.password, 'base64'), salt]));
        param["salt"] = salt.toString('hex');
        let result = await userClass.changeForgottenPassword(param);
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

async function changePassword(param: any) {
    try {
        let salt = settings.randBytes(32);
        param["hash_password"] = settings.MD5Hash(Buffer.concat([Buffer.from(param.password, 'base64'), salt]));
        param["salt"] = salt.toString('hex');
        let result = await userClass.changePassword(param);
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

async function updateProfile(param: any) {
    try {
        let result = await userClass.updateProfile(param);
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

async function sendVerificationMail(email: any, mailDetails: any, htmlFileName: String) {
    try {
        const emailId = {
            emailId: email,
            cc: '',
            bcc: ''
        }
        const emailParam = {
            htmlFile: htmlFileName,
            mailDetails: JSON.stringify(mailDetails),
            emailIds: JSON.stringify(emailId),
            mailSubject: 'Waka - SignUp Verification',
        };
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
        return { success: false, message: e.message };
    }
}

async function sendEmail(email: any, verify_code: number) {
    try {
        let sNumber = verify_code.toString().split("");
        let code = sNumber.map(Number);
        let mailDetails = {
            code1: code[0],
            code2: code[1],
            code3: code[2],
            code4: code[3],
            //LINK: "http://localhost:4200/forgotpassword"
            LINK: "https://test.appedo.com:9999/forgotpassword"
        }
        const emailId = {
            emailId: email,
            cc: '',
            bcc: ''
        }
        const emailParam = {
            htmlFile: 'waka_forgot_password',
            mailDetails: JSON.stringify(mailDetails),
            emailIds: JSON.stringify(emailId),
            mailSubject: 'Waka Password Reset',
        };
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
        return { success: false, message: e.message };
    }
}

async function fetchProfileInfo(param: any) {
    try {
        let result = await userClass.fetchProfileInfo(param);
        if (result.success) {
            return { success: true, result: result.message, rows: result.rows };
        } else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getSubModulesForSelModule(moduleId: number) {
    try {
        let result = await userClass.getSubModulesForSelModule(moduleId);
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

async function getEventsForSubModule(param: any) {
    try {
        let result = await userClass.getEventsForSubModule(param);
        if (result.success) {
            let data = await userClass.getSectionNames(param);
            return { success: true, rowCount: result.rowCount, result: result.rows , data: data.rows };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getRolesForGrid(param:any) {
    try {
        let result1 = await userClass.getCompanyIds(param);
        if(result1.success){
            param['company_ids'] = result1.rows[0].company_ids;
            let result = await userClass.getRolesForGrid(param);
            if (result.success) {
                return { success: true, rowCount: result.rowCount, result: result.rows };
            }
            else {
                return { success: false, message: result.message };
            }
        }
        else{
            return { success: false, message: result1.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function insUserRole(param: any) {
    try {
        let insresult = await userClass.insUserRole(param);
        if (insresult.success) {
            param["role_id"] = insresult.rows[0].role_id;
            let delevents = await userClass.delUserRoleModuleMapping(param);
            if(delevents.success){
                await userClass.insUserRoleModuleMapping(param);
                let insevent = await userClass.insUserRoleEventMapping(param);
                if(insevent.success){
                    return { success: true, rowCount: insevent.rowCount, result: insresult.rows, message: 'Role '+ param.role_name +' Added Successfully' };
                } else {
                    return { success: false, message: insevent.message };
                }
            } else {
                return { success: false, message: delevents.message };
            }
        }
        else {
            return { success: false, message: insresult.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getRolesOfCompany(param: any) {
    try {
        let result = await userClass.getRolesOfCompany(param);        
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

async function getEventForView(param:any) {
    try {
        let result = await userClass.getEventForView(param);
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
async function getEventsPermission(param: any) {
    try {
        let result = await userClass.getRoleModuleMapping(param);
        if (result.success) {
            let rmm_ids = result.rows[0].rmm_ids;
            param['rmm_ids'] = rmm_ids;
            let data = await userClass.getEventsPermission(param);
            return { success: true, rowCount: result.rowCount, result: result.rows , data: data };
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}


async function deleteRoleUser(param:any) {
    try {
        let result = await userClass.deleteRoleUser(param);
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
async function getUserRoles(param: any) {
    try {
        let result = await userClass.getUserRoles(param);
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

async function updUserRole(param: any) {
    try {
        let result = await userClass.deleteRoleModuleMapping(param.role_id);
        if (result.success) {
            let rolemodres = await userClass.insUserRoleModuleMapping(param);
            param['rmm_ids'] = rolemodres.rows;
            let insevent = await userClass.insUserRoleEventMapping(param);
            if(insevent.success){
                return { success: true, message: 'Role '+ param.role_name +' Updated Successfully'}
            } else {
                return { success: false, message: insevent.message };
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

async function getEventsForSelSubModules(param: any) {
    try {
        let result = await userClass.getEventsForSelSubModules(param);
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

async function getSubModulesForView(param:any){
    try {
        let result = await userClass.getSubModulesForView(param);
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
async function getEventsPermissionForRole(param:any){
    try {
        let result = await userClass.getEventsPermissionForRole(param);
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

async function getAdminCompanyForRoles(userId: number) {
    try {
        let result = await userClass.getAdminCompanyForRoles(userId);
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

async function mapServices(param:any){
    try {
        let result = await userClass.mapServices(param);
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

async function updMappedServices(param:any){
    try {
        let result = await userClass.updMappedServices(param);
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

async function delMappedServices(param:any){
    try {
        let result = await userClass.delMappedServices(param);
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

async function viewMappedServices(param:any){
    try {
        let result = await userClass.viewMappedServices(param);
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

async function getAvailableServices(param:any){
    try {
        let result = await userClass.getAvailableServices(param);
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

async function checkForSelfInvite(param:any){
    try {
        let result = await userClass.checkForSelfInvite(param);
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

async function getAccessProvidedUsers(param:any){
    try {
        let result = await userClass.getAccessProvidedUsers(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, rows:result.rows[0] };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e:any){
        return {success:false, message:e.message};
    }
}

async function getRegisteredSchedulers() {
    try {
        let result = await userClass.getRegisteredSchedulers();
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

async function getSchedulerLog(param: any) {
    try {
        let result = await userClass.getSchedulerLog(param);
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

export = { login, userMailValidation, validateToken, addPageAccessView, getRolePermissionForExist, logout, getUserAllRole, getRoleStatForCompAdmin, getUserCompany, getRoleStatForAdmin, getUserStat, getAllUsers, checkUsrEmailExists, registerUser, updUser, delUsr, activateUser, insUserCompany, getUserStatForCompAdmin, getExistingRoleDetails, getUsersForCompAdmin, insUsrCompanyForCompAdmin, getRoleNameForCompany, getAdminRoles, getCompanyUnqRoleName, getModulesAndRolesForCompany, insRole, sendEmail, getOTP, validateOTP, changeForgottenPassword, checkEmail, checkEmailLinkVerified, changePassword, updateProfile, getLicenseCompanyForRoles, getRoles, updRole, deleteRole, getInviteUser, validateRoleName, fetchProfileInfo, getSubModulesForSelModule, getEventsForSubModule, insUserRole, getRolesOfCompany, getEventsPermission, updUserRole, getUserRoles , getRolesForGrid, getEventForView, deleteRoleUser, getEventsForSelSubModules, getEventsPermissionForRole, getSubModulesForView, getAdminCompanyForRoles, mapServices, viewMappedServices, updMappedServices, delMappedServices, getAvailableServices, checkForSelfInvite, getAccessProvidedUsers, getRegisteredSchedulers, getSchedulerLog };
