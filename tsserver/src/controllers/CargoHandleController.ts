import { CHModel } from "../models/cargoHandlingModel";

const docClass = new CHModel();

async function getCHGrp(){
    try {
        let result = await docClass.getCHGrp();
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

async function getCHForGrp(param:any){
    try {
        let result = await docClass.getCHForGrp(param);
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

export = {getCHGrp, getCHForGrp};