const psqlAPM = require('./psqlAPM');
export class Initialize {
    constructor(){ };
    async checkDB(){
        let queryText = "SELECT now()";
        return await psqlAPM.fnDbQuery('checkDBAtLaunch', queryText, []);
    }

    async getLookupValues(){
        let queryText = "SELECT ln.lookup_name_id, ln.lookup_name, ln.display_name, lt.lookup_type FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE NOT ln.is_deleted";
        return await psqlAPM.fnDbQuery('getLookupValues', queryText, []);
    }
 
    async getCountry(){
        let queryText = "SELECT country_id, name, iso3, iso2 FROM waka.country";
        return await psqlAPM.fnDbQuery('getCountry', queryText, []);
    }    

    async getState(){
        let queryText = "SELECT state_id, name, country_id FROM waka.state";
        return await psqlAPM.fnDbQuery('getState', queryText, []);
    }
    
    async getCity(){
        let queryText = "SELECT city_id, name, state_id, country_id FROM waka.city";
        return await psqlAPM.fnDbQuery('getCity', queryText, []);
    }

    async getPorts(){
        let queryText = "SELECT port_id, port_name, country, country_id,  region, subregion, port_name||' '||country as portwithregion FROM waka.port WHERE NOT is_deleted ORDER BY country, port_name";
        return await psqlAPM.fnDbQuery('getPorts', queryText, []);
    }

    async getTotalCntByModule(param:any){
        let tableName = param[0].table_name;
        if (tableName == 'company') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka."+ tableName +" WHERE owned_by = $1";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, [param[1].userId]);
        } else if (tableName == 'roles_master') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka."+ tableName +" WHERE created_by IN (1,$1) OR company_id IN (SELECT c.company_id as company_ids FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id WHERE c.owned_by IN (select created_by from waka.contact_invite where invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1 AND oc.lookup_name = 'head quarters')";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, [param[1].userId]);
        } else if (tableName == 'lookup_type') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka."+ tableName +" WHERE is_deleted = false";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, []);
        } else if (tableName == 'third_party_services') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE ln.is_deleted = false AND lt.lookup_type ='service_type'";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, []);
        } else if (tableName == 'map_services') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka.map_services_temp WHERE created_by = $1";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, [param[1].userId]);
        } else if (tableName == 'sop') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka."+ tableName +" WHERE created_by = $1";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, [param[1].userId]);
        } else if (tableName == 'contract') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka."+ tableName +" WHERE created_by = $1";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, [param[1].userId]);
        } else if (tableName == 'admin') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka.sub_modules sm JOIN waka.modules m ON m.module_id=sm.module_id WHERE m.module_name='Admin' AND sm.is_admin_owned = false;";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, []);
        } else if (tableName == 'po_ingestion') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka.sub_modules sm JOIN waka.modules m ON m.module_id=sm.module_id WHERE m.module_name='Po Ingestion' AND sm.is_admin_owned = false;";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, []);
        } else if (tableName == 'schedulers_status') {
            let queryText = "SELECT '" + tableName + "' as table_name, COUNT(*) FROM waka.scheduler_availability_status;";
            return await psqlAPM.fnDbQuery('getTotalCntByModule - '+tableName, queryText, []);
        }
    }

    async getCountryCode(){
        let queryText = "SELECT country_id as country_code_id, name as country_name, phone_code as country_code, iso3 as iso_code FROM waka.country ORDER BY 2";
        return await psqlAPM.fnDbQuery('getCountryCode', queryText, []);
    }

    async getAdminLookups(){
        const queryText = "SELECT ln.lookup_name_id, ln.lookup_type_id, ln.lookup_name, ln.display_name, ln.description , lt.lookup_type FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE ln.is_deleted = false";
        return await psqlAPM.fnDbQuery('getAdminRoles', queryText, []);
    }

    // async getLookup(param:any){
    //     let queryText = "SELECT ln.lookup_type_id, ln.company_id, ln.lookup_name_id, ln.lookup_name, ln.display_name, ln.description, c.company_name FROM waka.lookup_name ln JOIN waka.company c ON c.company_id = ln.company_id WHERE ln.lookup_type_id = $1 AND ln.is_deleted = false";
    //     let whereCondition = param.userId == 1 ? " AND ln.created_by = 1 ORDER BY ln.display_name" : " ORDER BY ln.display_name";
    //     queryText += whereCondition;
    //     return await psqlAPM.fnDbQuery('getAdminRoles', queryText, [param.lookup_type_id]);
    // }

    async getLookup(param: any){
        let queryText = '';
        if(param.is_admin) {
            queryText = "SELECT ln.*, c.company_name, false as is_selected, false as is_edit, 'auto' as card_height FROM waka.lookup_name ln JOIN waka.company c ON c.company_id = ln.company_id WHERE lookup_type_id = $1 AND c.owned_by IN ($2,1) AND ln.is_active AND ln.is_deleted = false AND c.is_deleted = false ORDER BY ln.seq;";
        } else {
            queryText = "SELECT ln.*, c.company_name, (SELECT CASE WHEN c.owned_by = 1 THEN true ELSE false END ) as is_admin_lookup, false as is_selected, false as is_edit, 'auto' as card_height FROM waka.lookup_name ln JOIN waka.company c ON c.company_id = ln.company_id WHERE lookup_type_id = $1 AND c.owned_by IN ($2,1) AND ln.is_active AND ln.is_deleted = false AND c.is_deleted = false ORDER BY ln.seq;";
        }
        const queryParam = [param.lookup_type_id, param.userId];
        return await psqlAPM.fnDbQuery('getlookupTypeList', queryText, queryParam);
    }

    async getlookupTypeList(){
        const queryText = "SELECT lt.lookup_type_id, lt.lookup_type, lt.display_name FROM waka.lookup_type lt WHERE lt.is_deleted = false AND lt.is_active ORDER BY lt.display_name;";
        return await psqlAPM.fnDbQuery('getlookupTypeList', queryText, []);
    }

    async getServiceTypeList(){
        const queryText = "SELECT lt.lookup_type_id, ln.lookup_name_id, ln.lookup_name, ln.display_name FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE ln.is_deleted = false AND lt.lookup_type ='service_type' ORDER BY lt.display_name";
        return await psqlAPM.fnDbQuery('getServiceTypeList', queryText, []);
    }

    async getserviceTypeColl(param:any){
        let queryText = "SELECT service_id, service_type_id, service_name, parent_service_id FROM waka.services WHERE service_type_id = $1;";
        return await psqlAPM.fnDbQuery('getserviceTypeColl', queryText, [param.lookup_name_id]);
    }

    async addServiceEntry(param:any){
        const queryText = "INSERT INTO waka.services (service_type_id, service_name, created_by) VALUES ($1, $2, $3)";
        const queryParam = [param.service_type_id, param.service_name, param.userId];
        return await psqlAPM.fnDbQuery('addServiceEntry', queryText, queryParam);    
    }

    async updateServiceEntry(param:any){
        const queryText = "UPDATE waka.services SET service_name = $2, modified_by = $3, modified_on = now() WHERE service_id = $1;";
        const queryParam = [param.service_id, param.service_name, param.userId]
        return await psqlAPM.fnDbQuery('updateServiceEntry', queryText, queryParam);
    }

    async delServiceEntry(param:any){
        const queryText = "DELETE FROM waka.services WHERE service_id = $1;";
        const queryParam = [param.service_id];
        return await psqlAPM.fnDbQuery('delServiceEntry', queryText, queryParam);
    }

    async addLookup(param:any){
        const nextSeq = await psqlAPM.fnDbQuery('addLookupEntry', "SELECT (COUNT(seq) + 1) AS seq FROM waka.lookup_name WHERE lookup_type_id = $1;", [param.lookup_type_id]);
        const queryText = "INSERT INTO waka.lookup_name (company_id, lookup_type_id, lookup_name, display_name, description, seq, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)";
        const queryParam = [param.company_id, param.lookup_type_id, param.lookup_name, param.lookup_disp_name, param.lookup_desc, nextSeq.rows[0].seq, param.userId];
        return await psqlAPM.fnDbQuery('addLookup', queryText, queryParam);    
    }

    async updateLookup(param:any){
        const queryText = "UPDATE waka.lookup_name SET lookup_name = $2, display_name = $3, description = $4 , modified_by = $5, modified_on = now() WHERE lookup_name_id = $1;";
        const queryParam = [param.lookup_name_id, param.lookup_name, param.lookup_disp_name, param.lookup_desc, param.userId]
        return await psqlAPM.fnDbQuery('updateLookup', queryText, queryParam);
    }

    // async delLookupName(param:any){
    //     const queryText = "UPDATE waka.lookup_name SET is_deleted = true WHERE lookup_name_id = $1;";
    //     const queryParam = [param.lookup_id];
    //     return await psqlAPM.fnDbQuery('updateLookupEntry', queryText, queryParam);
    // }

    async delLookupName(param:any){
        const queryText = "DELETE FROM waka.lookup_name WHERE lookup_name_id = $1;";
        const queryParam = [param.lookup_id];
        return await psqlAPM.fnDbQuery('delLookupName', queryText, queryParam);
    }
    
    async getLookupTypeId(type:string){
        const queryText = "SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = $1";
        const queryParam = [type];
        return await psqlAPM.fnDbQuery('getLookupTypeId', queryText, queryParam);
    }

    async getServiceChargeGroup(){
        const queryText = "SELECT lt.lookup_type, lt.display_name, lt.lookup_type_id FROM waka.service_charges_grp scg JOIN waka.lookup_type lt ON lt.lookup_type_id = scg.service_charge_id";
        return await psqlAPM.fnDbQuery('getServiceChargeGroup', queryText, []);
    }

    async getChargeUom(){
        const queryText = "SELECT lookup_name_id, lookup_name, display_name FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'charge_uom') AND NOT is_deleted";
        return await psqlAPM.fnDbQuery('getChargeUom', queryText, []);
    }

    async getLCLValidity(){
        const queryText = "SELECT lookup_name_id, lookup_name, display_name FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'free_storage_days_validity') AND NOT is_deleted";
        return await psqlAPM.fnDbQuery('getLCLValidity', queryText, []);
    }
    
    async getCurrency(){
        const queryText = "SELECT lookup_name_id, lookup_name, display_name FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'currency') AND NOT is_deleted";
        return await psqlAPM.fnDbQuery('getCurrency', queryText, []);
    }
    
    async getCompanyList(param: any){
        const queryText = "SELECT company_id, company_name FROM waka.company WHERE created_by = $1 ORDER BY company_name";
        return await psqlAPM.fnDbQuery('getCompanyList', queryText, [param.userId]);
    }

}