import { ReqModel } from "../models/requirementModel";

const reqClass = new ReqModel();

async function getDocs(){
    try {
        let result = await reqClass.getDocs();
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e){
        return {success:false, message:e.message};
    }
}

async function insReq(param:any){
    try {
        let result = await reqClass.insReq(param);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e){
        return {success:false, message:e.message};
    }
}

async function getRequirement(type:string){
    try {
        let result = await reqClass.getRequirement(type);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e){
        return {success:false, message:e.message};
    }
}

async function delRequirement(req_id:number){
    try {
        let result = await reqClass.delRequirement(req_id);
        if (result.success) {
            return {success:true,rowCount:result.rowCount, result:result.rows };
        }
        else {
            return {success:false, message:result.message };
        }
    }
    catch (e){
        return {success:false, message:e.message};
    }
}

export = {getDocs,insReq, getRequirement, delRequirement};

//