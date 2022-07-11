import { POBModel } from "../models/poBookingModel";

const pobClass = new POBModel();

async function getPOBGrp(){
    try {
        let result = await pobClass.getPOBGrp();
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

async function getPOBForGrp(param:any){
    try {
        let result = await pobClass.getPOBForGrp(param);
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

export = {getPOBGrp, getPOBForGrp};