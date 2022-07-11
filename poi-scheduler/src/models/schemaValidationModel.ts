const psqlAPM = require('./psqlAPM');

export class schemaValidationModel {
    constructor() { };

    async schemaUnderProcessChecker() {
        const queryText = "SELECT * FROM waka.poi_scheduler_running_status WHERE is_schema_proceed = true AND is_schema_under_process = false;";
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, []);
    };

    async getPOTemplate(param: any) {
        const queryText = "SELECT po_template, company_id FROM waka.po_ingestion WHERE poi_id = $1";
        const queryParam = [param.poi_id]
        return await psqlAPM.fnDbQuery('getPOTemplate', queryText, queryParam);
    };

    async insPORawData(param: any, company_id: number, poisrs_id: number) {
        let columnName = '';
        for (let key in param[0]) {
            columnName += key + ', '
        }
        const queryText = "INSERT INTO waka.po_raw( " + columnName + " company_id, poisrs_id, created_by) SELECT " + columnName + company_id + ", " + poisrs_id + ", 1 FROM json_populate_recordset(NULL::waka.po_raw,'" + JSON.stringify(param) + "') returning po_raw_id;";
        return await psqlAPM.fnDbQuery('getPOTemplate', queryText, []);
    };

    async insPORawChildData(param: any, po_child_tableName: any) {
        let columnName = '';
        for (let key in param[0]) {
            columnName += key + ', '
        }
        const queryText = "INSERT INTO waka." + po_child_tableName + "( " + columnName + " created_by) SELECT " + columnName + " 1 FROM json_populate_recordset(NULL::waka." + po_child_tableName + ",'" + JSON.stringify(param) + "')";
        return await psqlAPM.fnDbQuery('insPORawChildData', queryText, []);
    };

    async insSchemaErrors(param: any, poi_id: number) {
        const queryText = "INSERT INTO waka.poi_schema_error(poi_id, created_by, missing_key, missing_key_hierarchy) SELECT $1, 1, missing_key, missing_key_hierarchy FROM json_populate_recordset(NULL::waka.poi_schema_error,'" + JSON.stringify(param) + "')";
        const queryParam = [poi_id]
        return await psqlAPM.fnDbQuery('updScheduleRunning', queryText, queryParam);
    };

    async updPOIScheduleStatus(param: any, isSchemaSuccess: any) {
        let queryText = "UPDATE waka.poi_scheduler_running_status SET ";
        queryText += isSchemaSuccess ? 'is_schema_success = TRUE, is_schema_proceed = FALSE, is_master_proceed = TRUE ' : 'is_schema_under_process = true '
        queryText += 'WHERE pois_id = $1 AND poisrs_id = $2;';
        const queryParam: any = [param.pois_id, param.poisrs_id];
        return await psqlAPM.fnDbQuery('updPOISchedule', queryText, queryParam);
    };

    async checkPOTableExists(company_id: any) {
        let queryText = "SELECT EXISTS (select  from information_schema.tables where table_schema = 'waka' AND table_name = $1);";
        const queryParam: any = ['po_' + company_id];
        return await psqlAPM.fnDbQuery('checkPOTableExists', queryText, queryParam);
    }

    async createPOCompanyTable(company_id: any) {
        let queryText = `CREATE TABLE waka.po_${company_id} (po_id SERIAL PRIMARY KEY, po_raw_id INT NOT NULL REFERENCES waka.waka.po_raw(po_raw_id) ON DELETE CASCADE,order_number INT NOT NULL,item_qty INT NULL,supplier_ref_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,product VARCHAR NOT NULL,product_description VARCHAR NOT NULL,origin_port_ref_id INT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,dest_port_ref_id INT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,factory_ref_id INT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,incoterms_ref_id INT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,ff_id INT NULL,ship_date TIMESTAMP NOT NULL,delivery_date TIMESTAMP NOT NULL, cargo_ready_date TIMESTAMP, po_status_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,created_on TIMESTAMP DEFAULT NOW(),created_by INT NOT NULL DEFAULT 1, modified_on TIMESTAMP,modified_by INT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE);`;
        return await psqlAPM.fnDbQuery('insPoMasterError', queryText, []);
    }
}