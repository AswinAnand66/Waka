import console from "console";

const psqlAPM = require('./psqlAPM');
export class POIModel {
    constructor() { };

    async getPoIngestionCards(param: any) {
        const queryText = "SELECT DISTINCT c.company_id, c.company_name, c.parent_company_id, c.company_type_id, pc.company_name AS parent_company, pi.is_validated, pi.is_scheduled, oc.lookup_name as office_category, ct.lookup_name FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id JOIN waka.lookup_name ct ON ct.lookup_name_id = c.company_type_id AND LOWER(ct.lookup_name) = 'consignee' LEFT JOIN waka.company_license cl ON cl.company_id = c.company_id AND cl.is_approved LEFT JOIN waka.po_ingestion pi ON pi.company_id = c.company_id WHERE c.owned_by IN (SELECT created_by FROM waka.contact_invite WHERE cl.is_approved AND invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1 AND now() BETWEEN cl.valid_from AND cl.valid_to;";
        const queryParam: any = [param];
        return await psqlAPM.fnDbQuery('getPoIngestionCards', queryText, queryParam);
    };

    async getPoIngestionData(param: any) {
        const queryText = "SELECT * FROM waka.po_ingestion WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('getPoIngestionData', queryText, queryParam);
    };

    async updatePoTemplate(jsonData: any, company_id: number) {
        const queryText = "UPDATE waka.po_ingestion SET po_template = $1 WHERE company_id = $2";
        const queryParam: any = [jsonData, company_id];
        return await psqlAPM.fnDbQuery('updatePoTemplate', queryText, queryParam);
    };

    async uploadDataSet(param: any) {
        const queryText = "INSERT INTO waka.po_ingestion(company_id, filepath, created_by) VALUES ($1, $2, $3);";
        const queryParam: any = [param.company_id, param.relativePath, param.userId];
        return await psqlAPM.fnDbQuery('uploadDataSet', queryText, queryParam);
    };

    async getPoIngestionFileName(param: any) {
        const queryText = "SELECT filepath FROM waka.po_ingestion WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('getPoIngestionData', queryText, queryParam);
    };

    async getPoiTemplate(param: any) {
        const queryText = "SELECT po_template FROM waka.po_ingestion WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('getPoIngestionData', queryText, queryParam);
    };

    async deleUploadedFile(param: any) {
        const queryText = "DELETE FROM waka.po_ingestion WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('deleteDataSet', queryText, queryParam);
    };

    async validatePoiMapping(jsonData: any, unMappedTargets: any, company_id: number) {
        const queryText = "UPDATE waka.po_ingestion SET po_template = $1, unmapped_targets = $2, is_validated = true WHERE company_id = $3";
        const queryParam: any = [jsonData, unMappedTargets, company_id];
        return await psqlAPM.fnDbQuery('updatePoTemplate', queryText, queryParam);
    };

    async createPOChildTables(newColumns: any, company_id: any) {
        let queryText = `create table waka.po_raw_${company_id} (po_raw_${company_id}_id SERIAL NOT NULL PRIMARY KEY, po_raw_id INT NOT NULL REFERENCES waka.po_raw(po_raw_id) ON DELETE CASCADE, `
        //let queryText = `create table waka.po_raw_${company_id} (po_raw_${company_id}_id SERIAL NOT NULL PRIMARY KEY, ordernumber VARCHAR, `
        for (let idx in newColumns) {
            queryText += `${newColumns[idx]} VARCHAR, `;
        }
        queryText += `created_by INT NOT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT now(), modified_by INT REFERENCES waka.login_user(user_id) ON DELETE CASCADE,modified_on TIMESTAMPTZ); `;
        return await psqlAPM.fnDbQuery('createPOChildTables', queryText, []);
    };

    async AddColumnInPOChildTables(newColumns: any, company_id: any) {
        let queryText = `ALTER TABLE waka.po_raw_${company_id} `
        for (let idx in newColumns) {
            queryText += `ADD COLUMN ${newColumns[idx]} VARCHAR`;
            parseInt(idx) < newColumns.length - 1 ? queryText += ', ' : queryText += ';';
        }
        return await psqlAPM.fnDbQuery('AddColumnInPOChildTables', queryText, []);
    };

    async delPOSchemaError(mappedColumns: any, company_id: any) {
        let queryText = `DELETE FROM waka.poi_schema_error WHERE LOWER(missing_key) IN (`
        for (let idx in mappedColumns) {
            queryText += `'${mappedColumns[idx].toLowerCase()}'`;
            parseInt(idx) < mappedColumns.length - 1 ? queryText += ', ' : queryText += ') ';
        }
        queryText += `AND poi_id = (SELECT poi_id FROM waka.po_ingestion where company_id = ${company_id});`;
        return await psqlAPM.fnDbQuery('AddColumnInPOChildTables', queryText, []);
    };

    async getCountOfSchemaError(company_id: number) {
        let queryText = `SELECT COUNT(*) AS COUNT FROM waka.poi_schema_error where poi_id IN (SELECT poi_id FROM waka.po_ingestion WHERE company_id = $1)`;
        let queryParam = [company_id];
        return await psqlAPM.fnDbQuery('getCountOfSchemaError', queryText, queryParam);
    };

    async updPOSchemaStatus(company_id: number) {
        let queryText = `UPDATE waka.poi_scheduler_running_status SET is_schema_under_process = false WHERE company_id = $1`;
        let queryParam = [company_id];
        return await psqlAPM.fnDbQuery('updPOSchemaStatus', queryText, queryParam);
    };

    // async validatePoiMapping(param:any) {
    //     let queryText, queryParam;
    //     if (param.newKeys.length != 0 && param.mappedKeys.length == 0) {
    //         queryText = "UPDATE waka.po_ingestion SET new_keys = $1, is_validated = true WHERE created_by = $2";
    //         queryParam = [JSON.stringify(param.newKeys), param.userId];
    //     } else if (param.newKeys.length == 0 && param.mappedKeys.length != 0) {
    //         queryText = "UPDATE waka.po_ingestion SET mapped_keys = $1, is_validated = true WHERE created_by = $2";
    //         queryParam = [JSON.stringify(param.mappedKeys), param.userId];
    //     } else {
    //         queryText = "UPDATE waka.po_ingestion SET mapped_keys = $1, new_keys = $2, is_validated = true WHERE created_by = $3";
    //         queryParam = [JSON.stringify(param.mappedKeys), JSON.stringify(param.newKeys), param.userId];
    //     }
    //     return await psqlAPM.fnDbQuery('validatePoiMapping', queryText, queryParam);
    // };

    async deleteMappings(param: any) {
        const queryText = "UPDATE waka.po_ingestion SET po_template = null, unmapped_targets = null, is_validated = false, is_scheduled = false, mandatory_fields = null WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('deleteMappings', queryText, queryParam);
    };

    async deleteSchedule(param: any) {
        const queryText = "DELETE FROM waka.po_ingestion_schedule WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('deleteSchedule', queryText, queryParam);
    };

    async dropPORawChildTables(param: any) {
        const queryText = "DROP TABLE IF EXISTS waka.po_raw_" + param.company_id;
        return await psqlAPM.fnDbQuery('dropPORawChildTables', queryText, []);
    };

    async viewPoiMappings(user_id: any) {
        const queryText = "SELECT mapped_keys, new_keys FROM waka.po_ingestion WHERE created_by = $1";
        const queryParam: any = [user_id];
        return await psqlAPM.fnDbQuery('viewPoiMappings', queryText, queryParam);
    };

    async getIngestionLookups(param: any) {
        const queryText = "WITH temp AS (SELECT ln.lookup_name_id, ln.display_name, ln.created_by FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE ln.is_deleted = false AND lt.lookup_type = $1 AND company_id IN (1, $2) order by display_name, created_by desc) SELECT DISTINCT ON (display_name) lookup_name_id, display_name, created_by FROM temp ORDER BY display_name ;";
        return await psqlAPM.fnDbQuery('getIngestionLookups', queryText, [param.lookup_name, param.company_id]);
    }

    async schedulePoIngestion(param: any) {
        let queryText;
        let queryParam;
        if (param.pois_id == null) {
            queryText = "INSERT INTO waka.po_ingestion_schedule(poi_id, company_id, request_type, content_type, testurl, authorize_type, authorize_param, request_headers, frequency, start_time, end_time, selected_days, timezone_offset, test_response, test_response_time, test_response_size, req_body_type, request_parameters, request_body, created_by, created_on) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now());";
            queryParam = [param.poi_id, param.company_id, param.request_type, param.content_type, param.url, param.authorize_type, param.authorize_param, param.request_headers, param.frequency, param.start_time, param.end_time, param.selected_days, param.timezone_offset, param.test_response, param.test_response_time, param.test_response_size, param.req_body_type, param.request_parameters, param.request_body, param.userId];
        } else {
            queryText = "UPDATE waka.po_ingestion_schedule SET request_type=$1, content_type=$2, testurl=$3, authorize_type=$4, authorize_param=$5, request_headers=$6, frequency=$7, start_time=$8, end_time=$9, selected_days=$10, timezone_offset=$11, test_response=$12, test_response_time=$13, test_response_size=$14, req_body_type=$15, request_parameters=$16, request_body=$17, modified_by=$18, modified_on=now() WHERE pois_id = $19";
            queryParam = [param.request_type, param.content_type, param.url, param.authorize_type, param.authorize_param, param.request_headers, param.frequency, param.start_time, param.end_time, param.selected_days, param.timezone_offset, param.test_response, param.test_response_time, param.test_response_size, param.req_body_type, param.request_parameters, param.request_body, param.userId, param.pois_id];
        }
        return await psqlAPM.fnDbQuery('schedulePoIngestion', queryText, queryParam);
    }

    async validatePoiSchedule(param: any) {
        const queryText = "UPDATE waka.po_ingestion SET is_scheduled = true, mandatory_fields = $2 WHERE company_id = $1";
        const queryParam: any = [param.company_id, param.mandatory_fields];
        return await psqlAPM.fnDbQuery('validatePoiSchedule', queryText, queryParam);
    };

    async getPoiScheduleData(param: any) {
        const queryText = "SELECT * FROM waka.po_ingestion_schedule WHERE company_id = $1 AND is_delete = false";
        return await psqlAPM.fnDbQuery('getPoiScheduleData', queryText, [param.company_id]);
    }

    async getPoiRunningStatus(param: any) {
        const queryText = "SELECT * FROM waka.poi_scheduler_running_status WHERE company_id = $1 ORDER BY received_on DESC LIMIT $2 OFFSET $3 ";
        return await psqlAPM.fnDbQuery('getPoiScheduleData', queryText, [param.company_id, param.limit, param.offset]);
    }

    async getPoiUnmappedTargets(param: any) {
        const queryText = "SELECT unmapped_targets FROM waka.po_ingestion WHERE company_id = $1";
        return await psqlAPM.fnDbQuery('getPoiUnmappedTargets', queryText, [param.company_id]);
    }

    async getPoIngestionSchemaErrors(param: any) {
        const queryText = "SELECT se.poi_id, se.missing_key, MIN(se.missing_key_hierarchy) AS missing_key_hierarchy FROM waka.poi_schema_error se JOIN waka.po_ingestion_schedule s ON s.poi_id = se.poi_id WHERE s.company_id = $1 GROUP BY se.missing_key, se.poi_id;";
        return await psqlAPM.fnDbQuery('getPoIngestionSchemaErrors', queryText, [param.company_id]);
    }

    async getPoIngestionMasterErrors(param: any) {
        const queryText = "SELECT me.poi_me_id, me.poi_id, me.error_type, me.error_value, me.ref_code, is_invite_sent FROM waka.poi_master_error_temp me JOIN waka.po_ingestion_schedule s ON s.poi_id = me.poi_id WHERE s.company_id = $1 GROUP BY me.error_type, me.error_value, me.ref_code, me.poi_id, is_invite_sent, me.poi_me_id;";
        return await psqlAPM.fnDbQuery('getPoIngestionMasterErrors', queryText, [param.company_id]);
    }

    async validatePoiSchema(param: any) {
        const queryText = "select now()";
        return await psqlAPM.fnDbQuery('validatePoiSchema', queryText, []);
    }

    async getTotalCntForSchemaErrors(param: any) {
        const queryText = " WITH query AS ( SELECT s.company_id, COUNT(se.missing_key) FROM waka.poi_schema_error se JOIN waka.po_ingestion_schedule s ON s.poi_id = se.poi_id WHERE s.company_id = $1 GROUP BY se.missing_key, se.poi_id, s.company_id) SELECT MAX(query.company_id) AS company_id, COUNT(*) FROM query;";
        return await psqlAPM.fnDbQuery('getTotalCntForSchemaErrors', queryText, [param.company_id]);
    }

    async getTotalCntForMasterErrors(param: any) {
        //const queryText = " WITH query AS ( SELECT s.company_id, COUNT(me.error_type) FROM waka.poi_master_error_temp me JOIN waka.po_ingestion_schedule s ON s.poi_id = me.poi_id WHERE s.company_id = $1 GROUP BY me.error_type, me.poi_id, s.company_id) SELECT MAX(query.company_id) AS company_id, COUNT(*) FROM query;";
        const queryText = " SELECT s.company_id, COUNT(me.error_value) AS count FROM waka.poi_master_error_temp me JOIN waka.po_ingestion_schedule s ON s.poi_id = me.poi_id WHERE s.company_id = $1 GROUP BY s.company_id;";
        return await psqlAPM.fnDbQuery('getTotalCntForMasterErrors', queryText, [param.company_id]);
    }

    async getTotalCntForRunningStatus(param: any) {
        const queryText = "SELECT company_id, COUNT(*) FROM waka.poi_scheduler_running_status WHERE company_id = $1 GROUP BY company_id;";
        return await psqlAPM.fnDbQuery('getTotalCntForRunningStatus', queryText, [param.company_id]);
    }

    async getConsigneeListForMasterValidation() {
        // const queryText = "SELECT c.company_id, c.company_name, ln.lookup_name FROM waka.company c JOIN waka.lookup_name ln ON ln.lookup_name_id = c.company_type_id WHERE ln.lookup_name = 'Consignee';";
        const queryText = "SELECT c.company_id, c.company_name, ln.lookup_name FROM waka.company c JOIN waka.lookup_name ln ON ln.lookup_name_id = c.company_type_id WHERE c.office_category_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'office_category') AND lookup_name = 'head quarters');";
        return await psqlAPM.fnDbQuery('getConsigneeListForMasterValidation', queryText, []);
    }

    async getPortListForMasterValidation() {
        const queryText = "SELECT port_id, port_name, country FROM waka.port WHERE is_deleted = false and is_visible = true;";
        return await psqlAPM.fnDbQuery('getPortListForMasterValidation', queryText, []);
    }

    async delInviteFromMasterValidation(param: any) {
        const queryText = "UPDATE waka.poi_master_error_temp SET is_invite_sent = false WHERE poi_me_id = $1";
        const queryParam: any = [param.poi_master_error_id];
        return await psqlAPM.fnDbQuery('validatePoiSchedule', queryText, queryParam);
    };

    async delInviteCompanyPerm(param: any) {
        const queryText = "DELETE FROM waka.company_invite WHERE company_invite_id = $1";
        const queryParam = [param.company_invite_id];
        return await psqlAPM.fnDbQuery('delInviteCompanyPerm', queryText, queryParam);
    }

    async updMasterErrors(param: any) {
        const queryText = "UPDATE waka.poi_master_error_temp SET is_invite_sent = true WHERE poi_me_id = $1";
        const queryParam: any = [param.poi_me_id];
        return await psqlAPM.fnDbQuery('updMasterErrors', queryText, queryParam);
    };

    async delValidatedMasterError(param: any) {
        const queryText = "DELETE FROM waka.poi_master_error_temp WHERE error_type = $1 and poi_id = $2 AND LOWER(regexp_replace(error_value,'[^a-zA-Z]','','g')) = $3";
        return await psqlAPM.fnDbQuery('delValidatedMasterError', queryText, [param.error_type, param.poi_id, param.error_value.toLowerCase().replaceAll(/[^a-zA-Z]/g, "")]);
    }

    async addNewIncoterm(param: any) {
        const queryText = "INSERT INTO waka.lookup_name(lookup_type_id, company_id, lookup_name, display_name, seq, created_by) VALUES ((SELECT lookup_type_id FROM waka.lookup_type where lookup_type = 'incoterms'), $1, $2, $2, 1, $3)";
        const queryParam: any = [param.company_id, param.error_value, param.userId];
        return await psqlAPM.fnDbQuery('addNewIncoterm', queryText, queryParam);
    }

    async poiMasterMapPort(param: any) {
        const queryText = "INSERT INTO waka.port_ref(company_id, port_code, port_name, waka_ref_port_id) VALUES ((SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1), $2, $3, $4)";
        return await psqlAPM.fnDbQuery('poiMasterMapPort', queryText, [param.poi_id, param.ref_code, param.error_value, param.matchedPortId]);
    }

    async poiMasterMapIncoterm(param: any) {
        const queryText = "INSERT INTO waka.incoterms_ref(company_id, incoterms_name, waka_ref_incoterms_id) VALUES ((SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1), $2, $3)";
        return await psqlAPM.fnDbQuery('poiMasterMapIncoterm', queryText, [param.poi_id, param.error_value, param.matchedIncotermId]);
    }

    async poiMasterMapSupplier(param: any) {
        const queryText = "INSERT INTO waka.supplier_ref(company_id, supplier_name, supplier_code,waka_ref_supplier_id) VALUES ((SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1),$2,$3,$4)";
        return await psqlAPM.fnDbQuery('poiMasterMapSupplier', queryText, [param.poi_id, param.error_value, param.ref_code, param.matchedCompanyId]);
    }

    async poiMasterMapFactory(param: any) {
        const queryText = "INSERT INTO waka.factory_ref(company_id, factory_name, factory_code,waka_ref_factory_id) VALUES ((SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1), $2,$3,$4)";
        return await psqlAPM.fnDbQuery('poiMasterMapFactory', queryText, [param.poi_id, param.error_value, param.ref_code, param.matchedCompanyId]);
    }

    async poiMasterMapBuyer(param: any) {
        const queryText = "INSERT INTO waka.buyer_ref(company_id, buyer_name, waka_ref_buyer_id) VALUES ($1, $2, $3)";
        return await psqlAPM.fnDbQuery('poiMasterMapBuyer', queryText, [param.company_id, param.buyer_code, param.buyer_name, param.waka_ref_buyer_id]);
    }

    async updMasterErrorStatus(param: any) {
        const queryText = "UPDATE waka.po_ingestion_schedule SET is_master_under_process = true WHERE company_id = $1";
        const queryParam: any = [param.company_id];
        return await psqlAPM.fnDbQuery('updMasterErrorStatus', queryText, queryParam);
    };

    async checkCompanyInvite(param: any) {
        const queryText = "SELECT invitee_company_id, is_accepted, is_denied FROM waka.company_invite WHERE invited_company_id IN (SELECT company_id FROM waka.po_ingestion WHERE poi_id = $2) AND invitee_company_id IN (SELECT company_id FROM waka.company WHERE LOWER(regexp_replace(company_name,'[^a-zA-Z]','','g')) = $1);";
        const queryParam: any = [param.matchedWithExisting.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.poi_id];
        return await psqlAPM.fnDbQuery('checkCompanyInvite', queryText, queryParam);
    };

    async checkPortRef(param: any) {
        const queryText = "SELECT * FROM waka.port_ref WHERE company_id IN (SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1) AND LOWER(regexp_replace(port_name,'[^a-zA-Z]','','g')) ~ $2;"
        const queryParam: any = [param.poi_id, param.error_value.toLowerCase().replaceAll(/[^a-zA-Z]/g, "")];
        return await psqlAPM.fnDbQuery('checkPortRef', queryText, queryParam);
    }

    async insInviteCompany(param: any) {
        const queryText = "INSERT INTO waka.company_invite (invited_company_id,invited_user_id,invitee_company_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,created_by,invited_company_type_id,poi_master_error_id) VALUES ((SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1),(SELECT owned_by FROM waka.company WHERE company_id IN (SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1)),$2,$3,(SELECT full_name FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = $2),(SELECT email FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = $2),(SELECT user_id FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = $2),(SELECT company_type_id FROM waka.company WHERE company_id = $2),(SELECT owned_by FROM waka.company WHERE company_id IN (SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1)),(SELECT company_type_id FROM waka.company WHERE company_id IN (SELECT company_id FROM waka.po_ingestion WHERE poi_id = $1)),$4)";
        const queryParam = [param.poi_id, param.matchedCompanyId, param.matchedWithExisting, param.poi_me_id];
        return await psqlAPM.fnDbQuery('insInviteCompany', queryText, queryParam);
    }

    async updInviteSendInMasterError(param: any) {
        const queryText = "UPDATE waka.poi_master_error_temp SET is_invite_sent = $1 WHERE error_value = $2 AND error_type = $3 AND poi_id = $4";
        const queryParam = [param.is_invite_sent, param.error_value, param.error_type, param.poi_id];
        return await psqlAPM.fnDbQuery('updInviteSendInMasterError', queryText, queryParam);
    }

    async getCompanyInviteData(param: any) {
        const queryText = "SELECT * FROM waka.company_invite WHERE invited_company_id = $1 AND LOWER(regexp_replace(invitee_company_name,'[^a-zA-Z]','','g')) = $2;";
        const queryParam = [param.company_id, param.invitee_company_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, "")];
        return await psqlAPM.fnDbQuery('getCompanyInviteData', queryText, queryParam);
    }

    async getMasterErrors(param: any) {
        const queryText = "SELECT COUNT(*) as error_count FROM waka.poi_master_error_temp WHERE poi_id = $1;"
        const queryParam = [param.poi_id];
        return await psqlAPM.fnDbQuery('getMasterErrors', queryText, queryParam);
    }

    async updMasterUnderProcess(param: any) {
        const queryText = "UPDATE waka.poi_scheduler_running_status SET is_master_under_process =  $1 WHERE poi_id = $2"
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, [param.is_master_under_process, param.poi_id]);
    };

    async insInviteExistingSupplier(param: any) {
        const queryText = `INSERT INTO waka.company_invite (invited_company_id, invited_user_id,invitee_company_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,created_by,invited_company_type_id,poi_master_error_id) VALUES (${param.invited_company_id},(SELECT owned_by FROM waka.company WHERE company_id = ${param.invited_company_id}),${param.invitee_company_id},'${param.invitee_company_name}',(SELECT full_name FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.invitee_company_id}),(SELECT email FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.invitee_company_id}),(SELECT user_id FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.invitee_company_id}),(SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name = 'Shipper'),(SELECT owned_by FROM waka.company WHERE company_id = ${param.invited_company_id}),(SELECT company_type_id FROM waka.company WHERE company_id = ${param.invited_company_id}), ${param.poi_master_error_id}) RETURNING company_invite_id`;
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, []);
    };
}
