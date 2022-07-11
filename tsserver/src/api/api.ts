import Router from "express-promise-router";

const router = Router();
const settings = require("../config/constants");
const userCtrl = require("../controllers/userController");
const companyContact = require("../controllers/companyContactController");
const sopCntrl = require("../controllers/sopController");
const initCntrl = require("../controllers/initializeController");
const manageOrderCntrl  = require("../controllers/manageOrdersController");
const shipBook  = require("../controllers/ShipmentBookingController");
const { getDocs, insReq, getRequirement, delRequirement} = require("../controllers/reqController");
const { getCHGrp, getCHForGrp } = require("../controllers/CargoHandleController");
const { getPOBGrp, getPOBForGrp } = require("../controllers/poBookingController");
const { getLicenseDetails, approveLicenseStatus, revokeLicenseStatus } = require("../controllers/licenseController");
const modules = require("../controllers/moduleController");
const shipmentBook = require("../controllers/ShipmentBookingController");
const scheduler = require("../scheduler/accountVerificationMonitor");
const log = require("../log");
import { zip } from 'zip-a-folder';
import path from "path";
const config = require( "../config/constants");
import fs, { access } from "fs";
class Queue{constructor(){}private a:any[] = [];getLength(){return this.a.length};isEmpty(){return 0==this.a.length};enqueue(item:any){this.a.push(item)};dequeue(){return this.a.shift();};}
const pageAccessQueue = new Queue();
let isPageAccessQueRunning = false;

module.exports = router;

interface lookupValue {
    lookup_name_id: number;
    lookup_name:string;
    display_name:string;
    lookup_type:string;
    require_validation:boolean;
    company_id:number;
}

initCntrl.checkDb();

setInterval(function() {
    scheduler.deleteInactiveAccounts();
}, 60 * 1000); // 60 * 1000 milsec

function getRequestIP(req:any) {
    var ip;
    if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else {
        ip = req.ip;
    }
    return ip;
}

function accessLog(req:any, duration:number, status:boolean) {
    log.accesslog("info", `${getRequestIP(req)}, ${req.url}, ${status}, ${duration}`);
}

router.post('/login', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let user = JSON.parse(Buffer.from(req.body.data, 'base64').toString());
        let result = await userCtrl.login(user,getRequestIP(req));
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `login Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/savePageAccess', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        //pageAccessQueue.enqueue(JSON.stringify(req.body));
        req.body["ip_address"] = getRequestIP(req);
        pageAccessQueue.enqueue(req.body);
        res.json({ success: true, error: false, message: 'added in queue' });
    } catch (e:any) {
        log.logger("error", `login Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

//Queues are cleared if data exist. Queue is checked for every 1s.
setInterval(() => {
    try {
        if (!isPageAccessQueRunning && pageAccessQueue.getLength()>0){
            isPageAccessQueRunning = true;
            drainDBInsQueue();
        }
    } catch (e:any){
        isPageAccessQueRunning = false;
        log.logger("error", `login Exception ${e.message}, ${e.stack}`);
    }
}, 1000);

async function drainDBInsQueue(){
    let cnt = 0;
    let strQry = []
    while(cnt < 1000 && pageAccessQueue.getLength() > 0 ){
      cnt ++;
      strQry.push(pageAccessQueue.dequeue());
    }
    isPageAccessQueRunning = false;
    await userCtrl.addPageAccessView(strQry);
}

router.post('/registerUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(Buffer.from(req.body.param, 'base64').toString());
        let result = await userCtrl.registerUser(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `registerUser Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getInviteUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getInviteUser(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getInviteUser Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkEmail', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await userCtrl.checkEmail(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `CheckEmail Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkEmailLinkVerified', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await userCtrl.checkEmailLinkVerified(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkEmailLinkVerified Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});
router.post('/userValidation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.user;
        let result = await userCtrl.userMailValidation(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `userValidation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getOTP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await userCtrl.getOTP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getOTP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/validateOTP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await userCtrl.validateOTP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getOTP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
  });

router.post('/changeForgottenPassword', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(Buffer.from(req.body.param, 'base64').toString());
        let result = await userCtrl.changeForgottenPassword(param);
        if (result.success) {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
      log.logger.error(process.pid + ' : ' + e.stack);
      res.json({ success: false, error: true, message: e.message });
    }
});
  
router.post('/logoutUser', async (req:any, res) => {
    let dt = new Date().getTime();
    const token = req.headers['authorization'];
    accessLog(req, new Date().getTime()-dt, true);
    res.json({ success: true, message: 'Successfully logged out' });
});

router.use(async (req:any, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
        res.json({ success: false, invalidToken: true, message: 'No token provided' });
    } else {
        let len = auth.substring(0,2);
        let keyLength = settings.hexToShort(len);
        let token = auth.substring(2,auth.length-keyLength);
        let result = userCtrl.validateToken(token);
        result.decoded["keyEncryptDecrypt"] = auth.substring(auth.length-keyLength);
        if (result.success){
            req.decoded = result.decoded;
            next();
        }
        else {
            res.json(result);
        }
    }
});

router.post('/getTotalCntByModule', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = [req.body];
        param.push({userId: req.decoded.userId});
        let result = await initCntrl.getTotalCntByModule(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getTotalCntByModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getBuyer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getBuyer(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getBuyer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getFF', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getFF(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getFF Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCarrier', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getCarrier();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCarrier Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPorts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getPorts();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getPorts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCountry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = initCntrl.getCountry();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json({success:true, result:result });
    } catch (e:any) {
        log.logger("error", `initCntrl.getCountry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCountryCode', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getCountryCode();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getCountryCode Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateEmail', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPContactByEmail(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateEmail Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/changePassword', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(Buffer.from(req.body.param, 'base64').toString());
        param["userId"] = req.decoded.userId;
        let result = await userCtrl.changePassword(param);
        if (result.success) {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
      log.logger.error(process.pid + ' : ' + e.stack);
      res.json({ success: false, error: true, message: e.stack });
    }
});

router.post('/updateProfile', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body["userId"] = req.decoded.userId;
        let result = await userCtrl.updateProfile(req.body);
        if (result.success) {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
      log.logger.error(process.pid + ' : ' + e.stack);
      res.json({ success: false, error: true, message: e.stack });
    }
});

router.post('/insUpdContact', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result:any;
        if (param.contact_id == undefined){
            result = await companyContact.insContact(param);
        } 
        else {
            result = await companyContact.updContact(param);
        }
        if (result.success && param.sop_contact_id == undefined ){
            if (param.contact_id == undefined) param.contact_id = result.result[0].contact_id;
            let result1 = await sopCntrl.insSOPContact(param);
            if (result1.success) {
                param.sop_contact_id = result1.result[0].sop_contact_id;
                if (param.origin_ports != undefined && param.origin_ports.length > 0){
                    let result2 = await sopCntrl.insSOPContactPort(param);
                    if (result2.success){
                        accessLog(req, new Date().getTime()-dt, true);
                        res.json({success:true,rowCount:result1.rowCount, message:"Successfully added the contacts"});
                    } else {
                        accessLog(req, new Date().getTime()-dt, false);
                        res.json(result2);
                    }
                } else {
                    accessLog(req, new Date().getTime()-dt, true);
                    res.json({success:true,rowCount:result1.rowCount, message:"Successfully added the contacts"});
                }
            } 
            else {
                accessLog(req, new Date().getTime()-dt, false);
                res.json(result1);
            }
        }
        else if (result.success && param.sop_contact_id != undefined) {
            let result1 = await sopCntrl.updSOPContact(param);
            if(result1.success){
                await sopCntrl.delSOPContactPorts(param);
                if (param.origin_ports != undefined && param.origin_ports.length > 0){
                    let result3 = await sopCntrl.insSOPContactPort(param);
                    if (result3.success){
                        accessLog(req, new Date().getTime()-dt, true);
                        res.json({success:true, message:"Successfully updated the contacts"});
                    } else {
                        accessLog(req, new Date().getTime()-dt, false);
                        res.json(result3);
                    }
                }
                else {
                    accessLog(req, new Date().getTime()-dt, true);
                    res.json({success:true, message:"Successfully updated the contacts"});
                }
            }
            else {
                accessLog(req, new Date().getTime()-dt, false);
                res.json(result);
            }
        }
        else {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
        log.logger("error", `insUpdContact Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.validateAndInsSOP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPContacts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPContacts(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPContacts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPContacts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPContactPorts(param);
        let result1 = await sopCntrl.delSOPContact(param);
        if (result.success && result1.success ){
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json({success:true, message:"Contacts successfully removed from SOP" });
        } else {
            if (!result.success) {
                accessLog(req, new Date().getTime()-dt, result.success);
                res.json(result);
            } 
            else if (!result1.success) {
                accessLog(req, new Date().getTime()-dt, result1.success);
                res.json(result1)
            }
        }
    } catch (e:any) {
        log.logger("error", `delSOPContacts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPContactPorts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPContactPorts(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPContactPorts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPDocs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPDocs(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPDocs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getDocs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await getDocs();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getDocs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

//not in use at 11/18/2021
router.post('/saveDocs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPDocs_old(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `saveDocs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getSOPs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.getSOPs(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCountryLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = initCntrl.getCountry();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json({success:true, result: result});
    } catch (e:any) {
        log.logger("error", `initCntrl.getCountryLookup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getStateLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = initCntrl.stateColl()
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json({success:true, result: result });
    } catch (e:any) {
        log.logger("error", `initCntrl.getStateLookup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCityLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = initCntrl.cityColl();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json({success:true, result: result });
    } catch (e:any) {
        log.logger("error", `initCntrl.getCityLookup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCompanyTypeLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let lvColl:lookupValue[] = initCntrl.lookupValueColl();
        let accountType = lvColl.filter(x=>x.lookup_type=='account_type' && x.lookup_name !='Freight Forwarder' && x.lookup_name != 'Consignee' && x.lookup_name != 'Enterprise');
        accessLog(req, new Date().getTime()-dt, true);
        res.json({success:true, result: accountType});
    } catch (e:any) {
        log.logger("error", `initCntrl.getCompanyTypeLookup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyBasicDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.getCompanyBasicDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyBasicDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUpdCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let msg;
        let result:any;
        param["user_id"] = req.decoded.userId;
        if (param.company_id == undefined){
            result = await companyContact.insCompany(param);
            msg="Successfully Inserted Company";
        } 
        else {
            result = await companyContact.updCompany(param);
            msg="Successfully Updated Company";
        }
        if (result.success){
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        } 
        else {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
        log.logger("error", `insUpdCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delSOPCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAllCompForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getAllCompForSOPByCompType(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAllCompForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addRemoveSOPCompanies', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPCompanies(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addRemoveSOPCompanies Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCHForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCHForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPCHForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreateCHForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.checkSOPInCH(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPCargoHandling(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkCreateCHForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCHIsSelected', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPCHIsSelected(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updSOPCHIsSelected Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCHOptimalValue', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPCHOptimalValue(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updSOPCHOptimalValue Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCHfields', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPCHfields(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updSOPCHfields Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getRoleStatForCompAdmin', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.getRoleStatForCompAdmin(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRoleStatForCompAdmin Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getUserCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.getUserCompany(param.user_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUserCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getInvitedCompaniesList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.getInvitedCompaniesList(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getInvitedCompaniesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getLicenseCompanyForRoles', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        let result = await userCtrl.getLicenseCompanyForRoles(userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getLicenseCompanyForRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getRoleNameForCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await userCtrl.getRoleNameForCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRoleNameForCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getExistingRoleDetails',async (req : any , res)=>{
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await userCtrl.getExistingRoleDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getExistingRoleDetails Exception ${e.message}, ${e.stack}`);
        res.json({success: false, error: true, message:e.message })
    }
});

router.post('/getRolePermissionForExist',async (req : any , res)=>{
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await userCtrl.getRolePermissionForExist(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRolePermissionForExist Exception ${e.message}, ${e.stack}`);
        res.json({success: false, error: true, message:e.message })
    }
});

router.get('/getRoleStatForAdmin', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getRoleStatForAdmin();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRoleStatForAdmin Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getUserStat', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getUserStat();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUserStat Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAllUsers', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getAllUsers(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAllUsers Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkUsrEmailExists', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.checkUsrEmailExists(param.email, param.user_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkUsrEmailExists Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.updUser(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updUser Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/activateUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.activateUser(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `activateUser Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delUsr', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.delUsr(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delUsr Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAllCompanyType', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let lvColl:lookupValue[] = initCntrl.lookupValueColl();
        let accountType = lvColl.filter(x=>x.lookup_type == 'account_type');
        accessLog(req, new Date().getTime()-dt, true);
        res.json({success:true, result: accountType});
    } catch (e:any) {
        log.logger("error", `getAllCompanyType Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUserCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.insUserCompany(req.decoded.userId, param.user_id, param.data);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insUserCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getUserStatForCompAdmin', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getUserStatForCompAdmin(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUserStatForCompAdmin Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getUsersForCompAdmin', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.getUsersForCompAdmin(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUsersForCompAdmin Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUsrCompanyForCompAdmin', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.insUsrCompanyForCompAdmin(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insUsrCompanyForCompAdmin Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAdminRoles', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.getAdminRoles(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAdminRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getRoles', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        let result = await userCtrl.getRoles(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await modules.getModules(param.is_licensed);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModules Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getModulesList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await modules.getModulesList(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModulesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSubModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await modules.getSubModules(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `modules.getModules Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addModule', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await modules.addModule(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `modules.addModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updateModule', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await modules.updateModule(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `modules.updateModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getLicensedModulesForUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await modules.getLicensedModulesForUser(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getLicensedModulesForUser Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAdminLookups', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getAdminLookups();
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getAdminLookups Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        let result = await initCntrl.getLookup(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAdminLookups Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addLookupEntry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.insLookupEntry(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.addLookupEntry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updateLookupEntry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.updateLookupEntry(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.updateLookupEntry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addServiceEntry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.addServiceEntry(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.addServiceEntry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updateServiceEntry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.updateServiceEntry(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.updateServiceEntry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delServiceEntry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.delServiceEntry(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.delServiceEntry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delLookupName', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.delLookupName(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delLookupName Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.delCompany(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAdminCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getAdminCompany();
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAdminCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getUsersCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getUsersCompany(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUsersCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getInviteCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.getInviteCompany(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getInviteCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyLogo', async (req:any, res:any) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.filePath
        let result = await companyContact.getCompanyLogo(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.sendFile(result);
    } catch (e:any) {
        log.logger("error", `getCompanyLogo Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: 'Image does not exists' });
    } 
});

router.post('/removeCompanyLogo', async (req:any, res:any) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.removeImage
        let result = await companyContact.removeCompanyLogo(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `removeCompanyLogo Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyRegDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.company_id;
        let result = await companyContact.getCompanyRegDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyRegDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyAddressDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.company_id;
        let result = await companyContact.getCompanyAddressDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyAddressDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyAllAddressDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.company_id;
        let result = await companyContact.getCompanyAllAddressDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyAddressDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.post('/getCompanyUnqRoleName', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await userCtrl.getCompanyUnqRoleName(param.company_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyUnqRoleName Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getModulesAndRolesForCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.getModulesAndRolesForCompany(param.module_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModulesAndRolesForCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateRoleName', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await userCtrl.validateRoleName(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateRoleName Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.post('/insRole', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await userCtrl.insRole(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insRole Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updRole', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await userCtrl.updRole(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updRole Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/deleteRole', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await userCtrl.deleteRole(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `deleteEntries Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPContainer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPContainer(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPContainer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPContainer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPContainer(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insSOPContainer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPContainer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updSOPContainer(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPContainer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/removeSOPContainer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.removeSOPContainer(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.removeSOPContainer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierAlloc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCarrierAlloc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierAlloc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPCarrierAlloc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPCarrierAlloc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insSOPCarrierAlloc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCarrierAlloc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updSOPCarrierAlloc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPCarrierAlloc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/removeSOPCarrierAlloc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.removeSOPCarrierAlloc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.removeSOPCarrierAlloc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierAllocByPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCarrierAllocByPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierAllocByPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPCarrierAllocForPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPCarrierAllocForPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOPCarrierAllocForPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPId', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPId(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierPref', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCarrierPref(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierPref Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPCarrierPref', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPCarrierPref(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insSOPCarrierPref Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCarrierPref', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updSOPCarrierPref(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPCarrierPref Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/removeSOPCarrierPref', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.removeSOPCarrierPref(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.removeSOPCarrierPref Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierPrefByPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCarrierPrefByPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierPrefByPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPCarrierPrefForPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPCarrierPrefForPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOPCarrierPrefForPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCHGrp', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await getCHGrp();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCHGrp Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPPOBForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPPOBForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPPOBForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPDocForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPDocForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPDocForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPLCForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPLCForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPLCForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPCarrierForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSopPortCountryWiseList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSopPortCountryWiseList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSopPortCountryWiseList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPConsigneeContacts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPConsigneeContacts(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPConsigneeContacts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPFFContacts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPFFContacts(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPFFContacts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPSchInvForGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSOPSchInvForGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPSchInvForGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreatePOBForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.checkSOPInPOB(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPPOBooking(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreatePOBForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreateLCForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.checkSOPInLC(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPLandingCost(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreateLCForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreateCarrierForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.checkSOPInCarrier(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPCarrier(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreateCarrierForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreateDocForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        //let result = {success: true}
        let result = await sopCntrl.checkSOPInDoc(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPDocs(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreateDocForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkCreateInvForSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.checkSOPInSchInvoice(param);
        if (result.success && result.rowCount == 0){
            param['userId'] = req.decoded.userId;
            result = await sopCntrl.insSOPSchInvoice(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreateInvForSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPPOBIsSelected', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPPOBIsSelected(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPPOBIsSelected Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPPOBfields', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPPOBfields(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPPOBfields Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPLCfields', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPLCfields(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPLCfields Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCarrierfields', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPCarrierfields(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPCarrierfields Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPSchInvfields', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updSOPSchInvfields(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPSchInvfields Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPOBGrp', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await getPOBGrp();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPOBGrp Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getDocGrp', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.getDocGrp();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getDocGrp Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updDocFieldValue', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updDocFieldValue(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updDocFieldValue Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updDocisSelected', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updDocisSelected(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updDocisSelected Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updCarrierisSelected', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.updCarrierisSelected(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updCarrierisSelected Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPContact', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPContact(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPContact Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPContactPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPContactPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPContactPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPDocs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPDocs(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPDocs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPPOBooking', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPPOBooking(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPPOBooking Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPCargoHandling', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPCargoHandling(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPCargoHandling Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPContainer', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPContainer(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPContainer Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPCarrierAlloc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPCarrierAlloc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPCarrierAlloc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copySOPCarrierPref', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.copySOPCarrierPref(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.copySOPCarrierPref Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyForId', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await companyContact.getCompanyForId(param.company_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyForId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getLookupTypeList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getlookupTypeList();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getLookupTypeList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getServiceTypeList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getServiceTypeList();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getServiceTypeList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getserviceTypeColl', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body['userId'] = req.decoded.userId
        let result = await initCntrl.getserviceTypeColl(req.body);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getserviceTypeColl Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCompanyList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getCompanyList(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getCompanyList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getDocumentLookup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let lvColl:lookupValue[] = initCntrl.lookupValueColl();
        let document = lvColl.filter(x=>x.lookup_type=='document');
        accessLog(req, new Date().getTime()-dt, true);
        res.json({success:true, result: document});
    } catch (e:any) {
        log.logger("error", `initCntrl.getDocumentLookup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getLookupTypeId', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await initCntrl.getLookupTypeId(param.type);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getLookupTypeId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insReq', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await insReq(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insReq Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getRequirement', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await getRequirement(param.type);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRequirement Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delRequirement', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await delRequirement(param.req_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delRequirement Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyDataForInvite', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.getCompanyData(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyDataForInvite Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkEmailInviteContact', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await companyContact.checkEmailInviteContact(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkEmailInviteContact Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.get('/getAddressTypeList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getAddressTypeList();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAddressTypeList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getOfficeTypeList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getOfficeTypeList();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getOfficeTypeList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getParentCompanyList', async (req:any, res) => {
    try {
        let dt = new Date().getTime()
        let param = req.body;
        param['userIds'].push(req.decoded.userId)
        let result = await companyContact.getParentCompanyList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getParentCompanyList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getTaxRegistrationList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getTaxRegistrationList(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getTaxRegistrationList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCountryListForCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getCountryListForCompany();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCountryListForCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getStateListForCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getStateListForCompany(req.body.country_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getStateListForCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCityListForCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getCityListForCompany(req.body.state_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCityListForCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkParentCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await companyContact.checkParentCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkParentCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateCompanyOwner', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["user_id"] = req.decoded.userId;
        let result = await companyContact.validateCompanyOwner(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateCompanyOwner Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateCompanyName', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.validateCompanyName(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateCompanyName Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insCompanyLicense', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        param['userId'] = req.decoded.userId;
        let result = await companyContact.insCompanyLicense(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insCompanyLicense Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getlicenseModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await companyContact.getlicenseModules(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getlicenseModules Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updCompanyLicense', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        param['userId'] = req.decoded.userId;
        let result = await companyContact.updCompanyLicense(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updCompanyLicense Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getLicenseDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await getLicenseDetails();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getLicenseDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/approveLicenseStatus', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        param["userId"] = req.decoded.userId;
        let result = await approveLicenseStatus(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `approveLicenseStatus Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/revokeLicenseStatus', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        param["userId"] = req.decoded.userId;
        let result = await revokeLicenseStatus(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `revokeLicenseStatus Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyContactDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        param["userId"] = req.decoded.userId;
        let result = await companyContact.getCompanyContactDetails(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyContactDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkPrevCompInvit', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.checkPrevCompInvit(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkPrevCompInvit Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/inviteCompnay', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        req.body["userId"] = req.decoded.userId;
        let result = await companyContact.addInviteCompany(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addInviteCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getPendingInviteForEmail', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await companyContact.getPendingInviteForEmail(param.email, param.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPendingInviteForEmail Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getPendingContactInviteForEmail', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await companyContact.getPendingContactInviteForEmail(param.email);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPendingContactInviteForEmail Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updCompanyInviteAccept', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await companyContact.updCompanyInviteAccept(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updCompanyInviteAccept Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateInviteeCompanyName', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.validateInviteeCompanyName(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateInviteeCompanyName Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updContactInviteAccept', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await companyContact.updContactInviteAccept(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updContactInviteAccept Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delCompanyContact', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.delCompanyContact(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delCompanyContact Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCompanyTypeList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getCompanyTypeList();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyTypeList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getInviteCompanyLicensedModulesList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.getInviteCompanyLicensedModulesList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getInviteCompanyLicensedModulesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updinviteCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.updInviteCompany(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updInviteCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delInviteCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.delInviteCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delInviteCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSharedLicenseModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await companyContact.getSharedLicenseModules(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSharedLicenseModules Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getInviteCompanySharedLicensedModulesList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param)
        let result = await companyContact.getInviteCompanySharedLicensedModulesList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getInviteCompanySharedLicensedModulesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/inviteContactApproveRevoke', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await companyContact.inviteContactApproveRevoke(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `inviteContactApproveRevoke Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/inviteCompanyApproveRevoke', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(req.body.param);
        let result = await companyContact.inviteCompanyApproveRevoke(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `inviteCompanyApproveRevoke Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPCountry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPCountry(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insSOPCountry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCountries', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCountries(param.sop_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSOPCountries Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAllInvitedCompanyForCountry', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await companyContact.getAllInvitedCompanyForCountry(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAllInvitedCompanyForCountry Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAddressForCompanyId', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await companyContact.getAddressForCompanyId(param.company_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAddressForCompanyId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCompanyContacts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await companyContact.getCompanyContacts(param.company_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getCompanyContacts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPServices', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPServices(param.sop_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPServices', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPServices(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insSOPServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPDoc', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPDoc(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOPDoc Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCommunication', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCommunication(param.sop_id, param.instruction_type);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCommunication Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPCommunication', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insSOPCommunication(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insSOPCommunication Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPCommunication', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updSOPCommunication(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPCommunication Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPCommunication', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPCommunication(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOPCommunication Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCommunicationForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCommunicationForPrint(param.sop_id,param.instruction_type);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCommunicationForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPStakeholdersForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPStakeholdersForPrint(param.sop_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPStakeholdersForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPPOBForGroupForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPPOBForGroupForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPPOBForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCHForGroupForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCHForGroupForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCHForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPDOCForGroupForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPDOCForGroupForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPDOCForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCRForGroupForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCRForGroupForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCRForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getContactsEmailForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getContactsEmailForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getContactsEmailForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
})

router.post('/getContracts', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await sopCntrl.getContracts(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getContracts Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getServiceChargeGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getServiceChargeGroup();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getServiceChargeGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addContract', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param['user_id'] = req.decoded.userId;
        let result = await sopCntrl.addContract(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCHForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updateContract', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param['user_id'] = req.decoded.userId;
        let result = await sopCntrl.updateContract(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updateContract Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/validateContract', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.validateContract(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `validateContract Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPServiceChargeSummary', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPServiceChargeSummary(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPServiceChargeSummary Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPServiceChargeItemByGroup', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPServiceChargeItemByGroup(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPServiceChargeItemByGroup Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPServiceChargeItemByPortPair', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPServiceChargeItemByPortPair(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPServiceChargeItemByPortPair Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
})

router.get('/getChargeUom', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getChargeUom();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getChargeUom Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getLCLValidity', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getLCLValidity();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getLCLValidity Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getCurrency', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await initCntrl.getCurrency();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getCurrency Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAllocationIntervals', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.getAllocationIntervals();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getAllocationIntervals Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCarrierList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierForSOPPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCarrierForSOPPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierForSOPPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insSOPServiceCharge', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let result = await sopCntrl.insSOPServiceCharge(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insSOPServiceCharge Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPServiceCharge', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let result = await sopCntrl.updSOPServiceCharge(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPServiceCharge Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPServiceCharge', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let result = await sopCntrl.delSOPServiceCharge(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delSOPServiceCharge Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delContract', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let result = await sopCntrl.delContract(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delContract Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/extendContractValidity', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let result = await sopCntrl.extendContractValidity(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.extendContractValidity Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/downloadContractFiles', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["created_by"] = req.decoded.userId;
        let filePath = path.join(__dirname, config.settings["fileUploadPath"], param.contract_id+"");
        if (fs.existsSync(filePath+".zip")) {
            fs.unlinkSync(filePath+".zip");
        }
        await zip(filePath, filePath+".zip");
        //let result = await sopCntrl.delContract(param);
        //accessLog(req, new Date().getTime()-dt, result.success);
        res.download(filePath+".zip");
    } catch (e:any) {
        log.logger("error", `sopCntrl.delContract Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delSOPPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.delSOPPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delSOPPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addSOPSHPort', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.addSOPSHPort(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addSOPSHPort Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSopPortList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSopPortList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSopPortList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSopContainerWeightForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await sopCntrl.getSopContainerWeightForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSopContainerWeightForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSopPortFreeStorageDetails', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.getSopPortFreeStorageDetails(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSopPortFreeStorageDetails Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addSopPortFreeStorageValidity', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.addSopPortFreeStorageValidity(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addSopPortFreeStorageValidity Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addSopPortFreeStorageDays', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await sopCntrl.addSopPortFreeStorageDays(req.body);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addSopPortFreeStorageDays Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPrincipalListForSop', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getPrincipalListForSop(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getPrincipalListForSop Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPrincipalListForContract', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getPrincipalListForContract(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getPrincipalListForContract Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCurrentContractByCompanyId', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getCurrentContractByCompanyId(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCurrentContractByCompanyId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getStakeholderList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await companyContact.getStakeholderList(param.principal_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getStakeholderList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getFFListForAddSOP', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getFFListForAddSOP(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getFFListForAddSOP Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPStakeholderList', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPStakeholderList(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPStakeholderList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insNewSOPStakeholders', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.insNewSOPStakeholders(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.insNewSOPStakeholders Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updSOPStakeholders', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updSOPStakeholders(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updSOPStakeholders Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSopPortCount', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSopPortCount(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSopPortCount Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delContractFile', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.delContractFile(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.delContractFile Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getMyCompanyAndType', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getMyCompanyAndType(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getMyCompanyAndType Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});
router.get('/getWhoInvitedMe', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getWhoInvitedMe(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getWhoInvitedMe Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});
router.get('/getMyParentCompany', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await companyContact.getMyParentCompany(req.decoded.userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `companyContact.getMyParentCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUpdSOPCarrierAllocation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let msg;
        param["userId"] = req.decoded.userId;
        let result:any;
        if (param.sop_ca_id == undefined){
            result = await sopCntrl.insSOPCarrierAllocation(param);
            msg="Successfully Inserted Carrier SOP";
        } 
        else {
            result = await sopCntrl.updSOPCarrierAllocation(param);
            msg="Successfully Updated Carrier SOP";
        }
        if (result.success){
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        } 
        else {
            accessLog(req, new Date().getTime()-dt, result.success);
            res.json(result);
        }
    } catch (e:any) {
        log.logger("error", `insUpdSOPCarrierAllocation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updCAFieldValue', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.updCAFieldValue(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.updCAFieldValue Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPCarrierAllocation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPCarrierAllocation(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPCarrierAllocation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/saveCarrierPreference', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.saveCarrierPreference(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.saveCarrierPreference Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSOPSCHINVForGroupForPrint', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await sopCntrl.getSOPSCHINVForGroupForPrint(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.getSOPSCHINVForGroupForPrint Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insShipmentTrackingIns', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.insShipmentTrackingIns(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addRemoveSOPCompanies Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updShipmentTrackingIns', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.updShipmentTrackingIns(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updShipmentTrackingIns Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getShipmentTrackingIns', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.getShipmentTrackingIns(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getShipmentTrackingIns Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/fetchProfileInfo', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await userCtrl.fetchProfileInfo(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `fetchProfileInfo Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSubModulesForSelModule', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.getSubModulesForSelModule(param.module_id);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSubModulesForSelModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getEventsForSubModule', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        if(param.ismultiple){
            for(let i of param.sub_module_ids){
                param.sub_module_id = i.sub_module_id;
                result = await userCtrl.getEventsForSubModule(param);
            }
        } else {
            result = await userCtrl.getEventsForSubModule(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsForSubModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/createUpdateRole', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        if(param.role_id != undefined){
            result = await userCtrl.updUserRole(param);
        } else {
            result = await userCtrl.insUserRole(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsForSubModule Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getRolesForGrid', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        let result = await userCtrl.getRolesForGrid(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRolesForGrid Exception ${e.message}, ${e.stack}`);
    }
});

router.post('/getRolesOfCompany', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        result = await userCtrl.getRolesOfCompany(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getRolesOfCompany Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getEventForView', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.getEventForView(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventForView Exception ${e.message}, ${e.stack}`);
    }
});

router.post('/getEventsPermission', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        result = await userCtrl.getEventsPermission(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsPermission Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/deleteRoleUser', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await userCtrl.deleteRoleUser(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `deleteRoleUser Exception ${e.message}, ${e.stack}`);
    }
});

router.post('/getUserRoles', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.getUserRoles(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getUserRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getModulesForRoles', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        result = await companyContact.getModulesForRoles();
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModulesForRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSubModulesForRoles', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await companyContact.getSubModulesForRoles(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSubModulesForRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getEventsPermissionForRole', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.getEventsPermissionForRole(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsPermissionForRole Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAdminModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await modules.getAdminModules();
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAdminModules Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUpsCompanyContact', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        if(param.contact_invite_id == undefined && !param.is_admin){
            result = await companyContact.insCompanyContact(param);
        } else if (param.contact_invite_id != undefined && param.is_update && !param.is_admin) {
            result = await companyContact.updCompanyContact(param);
        } else {
            result = await companyContact.insUserEventMapping(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insUpsCompanyContact Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getSubModulesForView', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.getSubModulesForView(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getSubModulesForView Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getEventId', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        result = await modules.getEventId(userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventId Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getEventsForSelSubModules', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId
        let result = await userCtrl.getEventsForSelSubModules(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsForSelSubModules Exception ${e.message}, ${e.stack}`);
    }
});

router.post('/getEventsSubModulesWise', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        result = await sopCntrl.getEventsSubModulesWise(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getEventsSubModulesWise Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getAdminCompanyForRoles', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        let result = await userCtrl.getAdminCompanyForRoles(userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAdminCompanyForRoles Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPurchaseOrders', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        let result = await manageOrderCntrl.getPurchaseOrders(userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPurchaseOrders Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getPurchaseOrdersCompanywise', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.getPurchaseOrdersCompanywise(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPurchaseOrdersCompanywise Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addOrdersTransaction', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.addOrdersTransaction(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addOrdersTransaction Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updOrdersTransaction', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.updOrdersTransaction(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updOrdersTransaction Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delTransaction', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.delTransaction(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delTransaction Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getOrderTransactions', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.getOrderTransactions(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getOrderTransactions Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/viewTransactionsAttachedFile', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await manageOrderCntrl.viewTransactionsAttachedFile(param);
        accessLog(req, new Date().getTime()-dt, true);
        res.sendFile(result);
    } catch (e:any) {
        log.logger("error", `viewTransactionsAttachedFile Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/mapServices', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.mapServices(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `mapServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updMappedServices', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.updMappedServices(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updMappedServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/viewMappedServices', async (req:any, res) => {
    try {
        let result, param:any;
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        result = await userCtrl.viewMappedServices(userId);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `viewMappedServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/delMappedServices', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        result = await userCtrl.delMappedServices(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `delMappedServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAvailableServices', async (req:any, res) => {
    try {
        let result;
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        result = await userCtrl.getAvailableServices(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAvailableServices Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/copyDataforServiceCharges', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.copyDataforServiceCharges(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `copyDataforServiceCharges Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.get('/getShipmentBooking', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        let result = await shipmentBook.getShipmentBooking(userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModulesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
})

router.post('/checkCreateCommIns', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.checkCreateCommIns(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `sopCntrl.checkCreateCommIns Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/addremoveCommunicationIns', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await sopCntrl.addremoveCommunicationIns(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `addremoveCommunicationIns Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.post('/getCompanyLogoPaths', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await shipBook.getCompanyLogoPaths(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCompanyLogoPaths Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});


router.post('/getPOListforAddPOs', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await shipBook.getPOListforAddPOs(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getPOListforAddPOs Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updateTEUValue', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await shipBook.updateTEUValue(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `updateTEUValue Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/insUpdCustomView', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result;
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        if(param.sbcv_id == undefined) {
            result = await shipBook.insCustomView(param);
        } else {
            result = await shipBook.updCustomView(param);
        }
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `insUpdCustomView Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getCustomViews', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await shipBook.getCustomViews(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getCustomViews Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/deleteCustomView', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await shipBook.deleteCustomView(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `deleteCustomView Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/checkForSelfInvite', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let result = await userCtrl.checkForSelfInvite(req.body.email);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `checkForSelfInvite Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getAccessProvidedUsers', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param['userId'] = req.decoded.userId;
        let result = await userCtrl.getAccessProvidedUsers(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getAccessProvidedUsers Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getRegisteredSchedulers', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let userId = req.decoded.userId;
        let result = await userCtrl.getRegisteredSchedulers(userId);
        accessLog(req, new Date().getTime()-dt, true);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `getModulesList Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
})

router.post('/getSchedulerLog', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await userCtrl.getSchedulerLog(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getSchedulerLog Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

//getMyCompanyAndType, getWhoInvitedMe, getMyParentCompany
