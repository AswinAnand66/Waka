import Router from "express-promise-router";

const router = Router();
const settings = require("../config/constants");
const ingestion = require("../controllers/poIngestionController");
const log = require("../log");
const config = require( "../config/constants");
const userCtrl = require("../controllers/userController");

module.exports = router;

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

router.get('/getPoIngestionCards', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.decoded.userId;
        let result = await ingestion.getPoIngestionCards(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoIngestionCards Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoIngestionData', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.getPoIngestionData(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoIngestionData Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/uploadDataSet', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.uploadDataSet(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.uploadDataSet Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoIngestionMappingData', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.getPoIngestionMappingData(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoIngestionData Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/deleUploadedFile', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.deleUploadedFile(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.deleUploadedFile Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/validatePoiMapping', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.validatePoiMapping(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.validatePoiMapping Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/deleteMappings', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.deleteMappings(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.deleteMappings Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/viewPoiMappings', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.viewPoiMappings(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.viewPoiMappings Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/poIngestionTestRequest', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.poIngestionTestRequest(param.url, param.headers, param.body, param.method);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.poIngestionTestRequest Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getIngestionLookups', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.getIngestionLookups(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getIngestionLookups Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/schedulePoIngestion', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.schedulePoIngestion(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.schedulePoIngestion Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoiScheduleData', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.getPoiScheduleData(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoiScheduleData Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoiRunningStatus', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.getPoiRunningStatus(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoiRunningStatus Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoiUnmappedTargets', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.getPoiUnmappedTargets(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoiUnmappedTargets Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoIngestionSchemaErrors', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.getPoIngestionSchemaErrors(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoIngestionSchemaErrors Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getPoIngestionMasterErrors', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.getPoIngestionMasterErrors(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPoIngestionMasterErrors Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/validatePoiSchema', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.validatePoiSchema(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.validatePoiSchema Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getTotalCntForSchemaErrors', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await ingestion.getTotalCntForSchemaErrors(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getTotalCntForSchemaErrors Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getTotalCntForMasterErrors', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await ingestion.getTotalCntForMasterErrors(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getTotalCntForMasterErrors Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/getTotalCntForRunningStatus', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body;
        let result = await ingestion.getTotalCntForRunningStatus(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.getTotalCntForRunningStatus Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getConsigneeListForMasterValidation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.decoded.userId;
        let result = await ingestion.getConsigneeListForMasterValidation(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getConsigneeListForMasterValidation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/delInviteFromMasterValidation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await ingestion.delInviteFromMasterValidation(JSON.parse(param));
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.delInviteFromMasterValidation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.post('/updMasterErrors', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.body.param;
        let result = await ingestion.updMasterErrors(JSON.parse(param));
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `initCntrl.updMasterErrors Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    } 
});

router.get('/getPortListForMasterValidation', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = req.decoded.userId;
        let result = await ingestion.getPortListForMasterValidation(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getPortListForMasterValidation Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/validatePoiMaster', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.validatePoiMaster(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.validatePoiMaster Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/addNewIncoterm', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        param["userId"] = req.decoded.userId;
        let result = await ingestion.addNewIncoterm(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.addNewIncoterm Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/getCompanyInviteData', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt,req.body.param));
        let result = await ingestion.getCompanyInviteData(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.getCompanyInviteData Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});

router.post('/insInviteExistingSupplier', async (req:any, res) => {
    try {
        let dt = new Date().getTime();
        let param = JSON.parse(settings.decrypt(req.decoded.keyEncryptDecrypt, req.body.param));
        let result = await ingestion.insInviteExistingSupplier(param);
        accessLog(req, new Date().getTime()-dt, result.success);
        res.json(result);
    } catch (e:any) {
        log.logger("error", `ingestion.insInviteExistingSupplier Exception ${e.message}, ${e.stack}`);
        res.json({ success: false, error: true, message: e.message });
    }
});
