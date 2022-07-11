import { query } from "express";

const psqlAPM = require('./psqlAPM');
export class ModuleModel {
    constructor(){ };

    async getModules(is_licensed?:boolean){
        let queryText;
        if (is_licensed){
            queryText = "SELECT m.module_id, m.module_name, icon, svg, seq, table_reference FROM waka.modules m WHERE is_visible ORDER BY seq";
            return await psqlAPM.fnDbQuery('getModules', queryText, []);
        }
        else {
            queryText = "SELECT m.module_id, m.module_name, icon, svg, table_reference FROM waka.modules m  WHERE is_licensed = $1 ORDER BY m.module_name";
            let queryParam = [is_licensed];
            return await psqlAPM.fnDbQuery('getModules', queryText, queryParam);
        }
    }

    async getModulesList(param?:any){
        let queryText;
        if (param.is_licensed){
            queryText = `SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE is_visible AND is_licensed = false UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE module_name = 'Admin' UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE module_name = 'Manage Orders' UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE module_name = 'Shipment Booking' UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE is_visible AND module_id IN (SELECT DISTINCT module_id FROM waka.role_module_mapping_new WHERE role_id IN (SELECT DISTINCT rum.role_id FROM waka.role_user_mapping rum JOIN waka.contact_invite ci ON ci.invitee_user_id = ${param.userId} WHERE assigned_user_id = ${param.userId} AND ci.is_accepted )) UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE is_visible AND module_id IN (SELECT DISTINCT module_id FROM waka.role_module_mapping_new WHERE role_id IN (SELECT DISTINCT rum.role_id FROM waka.role_user_mapping rum WHERE assigned_user_id = ${param.userId})) ORDER BY seq;`;
            // UNION SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list JOIN waka.company ON company_id IN (SELECT company_id FROM waka.company WHERE owned_by = ${param.userId} AND company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'account_type') AND lookup_name = 'Shipper')) WHERE module_name = 'Manage Orders' ORDER BY seq;
        } else {
            queryText = `SELECT ml.module_id, ml.module_name, ml.seq, ml.icon, ml.svg, ml.table_reference FROM waka.modules_list ml WHERE is_visible AND ml.module_id IN (SELECT rmm.module_id FROM waka.role_module_mapping_new rmm WHERE rmm.role_id IN (SELECT rum.role_id FROM waka.role_user_mapping rum JOIN waka.contact_invite ci ON ci.invitee_user_id = ${param.userId} WHERE assigned_user_id = ${param.userId} AND ci.is_accepted)) UNION SELECT module_id, module_name, seq, icon, svg, table_reference FROM waka.modules_list WHERE module_name = 'Home' OR module_name = 'Company' ORDER BY seq;`
        }
        return await psqlAPM.fnDbQuery('getModulesList', queryText, []);
    }

    async getSubModules(param:any){
        const queryText = "SELECT sm.sub_module_name, sm.sub_module_id, m.module_name, sm.module_id, sm.is_visible, is_admin_owned, sm.icon, sm.table_reference from waka.sub_modules sm JOIN waka.modules m ON m.module_id = sm.module_id where sm.module_id = $1 order by sm.seq asc;";
        const queryParam = [param.module_id]
        return await psqlAPM.fnDbQuery('getSubModules', queryText, queryParam);
    }

    async addModule(param:any){
        const queryText = "INSERT INTO waka.modules (module_name) VALUES ($1)";
        const queryParam = [param.module_name];
        return await psqlAPM.fnDbQuery('addModule', queryText, queryParam);
    }

    async updateModule(param:any){
        const queryText = "UPDATE waka.modules set module_name = $1 where module_id = $2";
        const queryParam = [param.module_name, param.module_id];
        return await psqlAPM.fnDbQuery('updateModule', queryText, queryParam);
    }

    async getLicensedModulesForUser(userId:number){
        const queryText = "SELECT distinct m.module_name,sm.module_id, m.icon, m.svg, m.table_reference FROM waka.user_company uc JOIN waka.company c ON c.company_id = uc.company_id JOIN waka.shared_license sl ON sl.shared_company_id = uc.company_id JOIN waka.shared_lic_module sm ON sm.sl_id = sl.sl_id JOIN waka.modules m ON m.module_id = sm.module_id WHERE uc.user_id = $1 UNION select module_name, module_id, icon, svg, table_reference from waka.modules where is_licensed = false AND is_visible";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getLicensedModulesForUser', queryText, queryParam);
    }

    async getAdminModules(){
        const queryText = "SELECT module_id,module_name,seq,icon,svg,table_reference FROM waka.modules_list WHERE is_visible;"
        return await psqlAPM.fnDbQuery('getAdminModules', queryText, []);
    }

    async getEventId(){
        const queryText = "SELECT jsonb_object_agg(em.event_name,em_id) as event_ids FROM waka.event_master em;"
        return await psqlAPM.fnDbQuery('getEventId', queryText, []);
    }
}