import { ModuleModel } from "../models/moduleModel";
let moduleClass = new ModuleModel();

async function getModules(is_licensed:boolean) {
    try {
        let result = await moduleClass.getModules(is_licensed);
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

async function getModulesList(param: any) {
    try {
        let result = await moduleClass.getModulesList(param);
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

async function getSubModules(param:any) {
    try {
        let result = await moduleClass.getSubModules(param);
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

async function addModule(param:any) {
    try {
        let result = await moduleClass.addModule(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function updateModule(param:any) {
    try {
        let result = await moduleClass.updateModule(param);
        if (result.success) {
            return { success: true, rowCount: result.rowCount, result: result.rows};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getLicensedModulesForUser(userId:any) {
    try {
        let result = await moduleClass.getLicensedModulesForUser(userId);
        if (result.success) {
            return { success: true,rowCount: result.rowCount, result: result.rows};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getAdminModules(userId:any) {
    try {
        let result = await moduleClass.getAdminModules();
        if (result.success) {
            return { success: true,rowCount: result.rowCount, result: result.rows};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}

async function getEventId(userId:any) {
    try {
        let result = await moduleClass.getEventId();
        if (result.success) {
            return { success: true,rowCount: result.rowCount, result: result.rows[0].event_ids};
        }
        else {
            return { success: false, message: result.message };
        }
    }
    catch (e:any) {
        return { success: false, message: e.message };
    }
}


export = { addModule, updateModule, getModules, getSubModules, getLicensedModulesForUser, getModulesList, getAdminModules, getEventId };