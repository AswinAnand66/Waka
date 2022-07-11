const psqlAPM = require('./psqlAPM');

export class masterValidationModel {
    constructor() { };

    async masterUnderProcessChecker() {
        const queryText = "SELECT * FROM waka.poi_scheduler_running_status WHERE is_master_proceed = true AND is_master_under_process = false;";
        //const queryText = "SELECT * FROM waka.po_ingestion_schedule WHERE is_master_proceed = true AND is_master_under_process = false AND company_id NOT IN (670,798,572);";
        // const queryText = "SELECT * FROM waka.po_ingestion_schedule WHERE is_master_proceed = true AND is_master_under_process = false AND company_id IN (670,798,572);";
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, []);
    };

    async updPOIMasterStatus(param: any, isMasterSuccess: any) {
        let queryText = "UPDATE waka.poi_scheduler_running_status SET ";
        queryText += isMasterSuccess ? 'is_master_success = TRUE, is_master_proceed = FALSE, is_master_under_process = FALSE' : 'is_master_under_process = true'
        queryText += ' WHERE pois_id = $1 AND poisrs_id = $2;';
        const queryParam: any = [param.pois_id, param.poisrs_id];
        return await psqlAPM.fnDbQuery('updPOISchedule', queryText, queryParam);
    };

    async updMasterUnderProcess(param: any) {
        const queryText = "UPDATE waka.poi_scheduler_running_status SET is_master_under_process =  true WHERE company_id = $1 AND poi_id = $2 AND poisrs_id = $3 AND pois_id = $4;"
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, [param.company_id, param.poi_id, param.poisrs_id, param.pois_id]);
    };

    async getSupplierDetails(param: any) {
        const queryText = "SELECT DISTINCT(suppliername), suppliercode FROM waka.po_raw po LEFT JOIN waka.supplier_ref sr ON LOWER(regexp_replace(sr.supplier_name,'[^a-zA-Z]','','g')) = LOWER(regexp_replace(po.suppliername,'[^a-zA-Z]','','g')) AND sr.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND supplier_ref_id IS NULL;"
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('updScheduleRunning', queryText, queryParam);
    }

    async getFactoryDetails(param: any) {
        const queryText = "SELECT DISTINCT(factoryname), factorycode FROM waka.po_raw po LEFT JOIN waka.factory_ref fr ON LOWER(regexp_replace(fr.factory_name,'[^a-zA-Z]','','g')) = LOWER(regexp_replace(po.factoryname,'[^a-zA-Z]','','g')) AND fr.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND factory_ref_id IS NULL AND po.factoryname != ''";
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('getFactoryDetails', queryText, queryParam);
    }

    async getBuyerDetails(param: any) {
        const queryText = "SELECT DISTINCT(buyername), buyercode FROM waka.po_raw po LEFT JOIN waka.buyer_ref br ON LOWER(regexp_replace(br.buyer_name,'[^a-zA-Z]','','g')) = LOWER(regexp_replace(po.buyername,'[^a-zA-Z]','','g')) AND br.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND buyer_ref_id IS NULL AND po.buyername != ''";
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('getBuyerDetails', queryText, queryParam);
    }

    async getOrgPortDetails(param: any) {
        const queryText = "SELECT DISTINCT(originportname), originportcode FROM waka.po_raw po LEFT JOIN waka.port_ref pr ON LOWER(REPLACE(port_name,' ','')) ~ LOWER(regexp_replace(po.originportname,'[^a-zA-Z]','','g')) AND pr.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND port_ref_id IS NULL;";
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('getPortDetails', queryText, queryParam);
    }

    async getDestPortDetails(param: any) {
        const queryText = "SELECT DISTINCT(destinationportname), destinationportcode FROM waka.po_raw po LEFT JOIN waka.port_ref pr ON LOWER(REPLACE(port_name,' ','')) ~ LOWER(regexp_replace(po.destinationportname,'[^a-zA-Z]','','g')) AND pr.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND port_ref_id IS NULL;";
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('getPortDetails', queryText, queryParam);
    }

    async getIncotermsDetails(param: any) {
        let queryText = "SELECT DISTINCT(incoterms) FROM waka.po_raw po LEFT JOIN waka.incoterms_ref ir ON LOWER(regexp_replace(ir.incoterms_name,'[^a-zA-Z]','','g')) = LOWER(regexp_replace(po.incoterms,'[^a-zA-Z]','','g')) AND ir.company_id = $1 WHERE po.company_id = $1 AND po.poisrs_id = $2 AND incoterms_ref_id IS NULL AND po.incoterms != '';";
        const queryParam = [param.company_id, param.poisrs_id]
        return await psqlAPM.fnDbQuery('getIncotermsDetails', queryText, queryParam);
    }

    async checkSupplierName(param: any) {
        const queryText = "SELECT * FROM waka.supplier_ref WHERE LOWER(regexp_replace(supplier_name,'[^a-zA-Z]','','g')) = $1 AND company_id = $2 AND supplier_code = $3";
        const queryParam = [param.supplier_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.company_id, param.supplier_code]
        return await psqlAPM.fnDbQuery('checkSupplierName', queryText, queryParam);
    };

    async checkOrgPortName(param: any) {
        const queryText = "SELECT * FROM waka.port_ref WHERE LOWER(REPLACE(port_name,' ','')) ~ $1 AND company_id = $2 AND port_code = $3";
        const queryParam = [param.port_name.toLowerCase().replaceAll(' ', ''), param.company_id, param.port_code]
        return await psqlAPM.fnDbQuery('checkOrgPortName', queryText, queryParam);
    };

    async checkDestPortName(param: any) {
        const queryText = "SELECT * FROM waka.port_ref WHERE LOWER(REPLACE(port_name,' ','')) ~ $1 AND company_id = $2 AND port_code = $3";
        const queryParam = [param.port_name.toLowerCase().replaceAll(' ', ''), param.company_id, param.port_code]
        return await psqlAPM.fnDbQuery('checkOrgPortName', queryText, queryParam);
    };

    async checkIncotermsName(param: any) {
        const queryText = "SELECT * FROM waka.incoterms_ref WHERE incoterms_name = $1 AND company_id = $2";
        const queryParam = [param.incoterms_name, param.company_id]
        return await psqlAPM.fnDbQuery('checkOrgPortName', queryText, queryParam);
    };

    async checkFactoryName(param: any) {
        const queryText = "SELECT * FROM waka.factory_ref WHERE factory_name = $1 AND company_id = $2 AND factory_code = $3";
        const queryParam = [param.factory_name, param.company_id, param.factory_code]
        return await psqlAPM.fnDbQuery('checkFactoryName', queryText, queryParam);
    };

    async checkBuyerName(param: any) {
        const queryText = "SELECT * FROM waka.buyer_ref WHERE buyer_name = $1 AND company_id = $2 AND buyer_code = $3";
        const queryParam = [param.buyer_name, param.company_id, param.buyer_code]
        return await psqlAPM.fnDbQuery('checkBuyerName', queryText, queryParam);
    };

    async getSupplierNameRef(param: any) {
        const queryText = "SELECT company_id FROM waka.company WHERE LOWER(regexp_replace(company_name,'[^a-zA-Z]','','g')) = $1;";
        const queryParam = [param.supplier_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, "")]
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    };

    async checkCompanyInvite(param: any) {
        const queryText = "SELECT c.company_id, ci.is_accepted FROM waka.company c LEFT JOIN waka.company_invite ci ON ci.invitee_company_id = c.company_id  AND ci.invited_company_id = $2 WHERE LOWER(regexp_replace(c.company_name,'[^a-zA-Z]','','g')) = $1;"
        const queryParam = [param.supplier_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.company_id];
        console.log('queryParam', queryParam)
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    }

    async getSupplierNameRefInvite(param: any) {
        const queryText = "SELECT company_invite_id, invitee_company_id, is_accepted FROM waka.company_invite WHERE invited_company_id = $2 AND invitee_company_id IN (SELECT company_id FROM waka.company WHERE LOWER(regexp_replace(company_name,'[^a-zA-Z]','','g')) = $1);";
        const queryParam = [param.supplier_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.company_id]
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    };

    async getBuyerNameRef(param: any) {
        const queryText = "SELECT company_id FROM waka.company WHERE company_name = $1;";
        const queryParam = [param.buyer_name]
        return await psqlAPM.fnDbQuery('getBuyerNameRef', queryText, queryParam);
    };

    async getFactoryNameRef(param: any) {
        const queryText = "SELECT company_id FROM waka.company WHERE LOWER(regexp_replace(company_name,'[^a-zA-Z0-9]','','g')) = $1;";
        const queryParam = [param.factory_name.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, "")]
        return await psqlAPM.fnDbQuery('getFactoryNameRef', queryText, queryParam);
    };

    async getOrgPortNameRef(param: any) {
        const queryText = "SELECT origin_port_id FROM waka.sop_port WHERE origin_port_id IN (SELECT port_id FROM waka.port WHERE LOWER(regexp_replace(port_name,'[^a-zA-Z0-9]','','g')) ~ $1) AND (principal_id = $2 OR ff_id = $2);";
        const queryParam = [param.port_name.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, ""), param.company_id]
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    };

    async getDestPortNameRef(param: any) {
        const queryText = "SELECT dest_port_id FROM waka.sop_port WHERE dest_port_id IN (SELECT port_id FROM waka.port WHERE LOWER(regexp_replace(port_name,'[^a-zA-Z0-9]','','g')) ~ $1) AND (principal_id = $2 OR ff_id = $2);";
        const queryParam = [param.port_name.toLowerCase().replaceAll(/[^a-zA-Z0-9]/g, ""), param.company_id]
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    };

    async getIncotermsNameRef(param: any) {
        const queryText = "SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name = $1 AND created_by IN (1) AND lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'incoterms' LIMIT 1);";
        const queryParam = [param.incoterms_name]
        return await psqlAPM.fnDbQuery('schemaUnderProcessChecker', queryText, queryParam);
    };

    async insSupplierInviteCompany(param: any) {
        const queryText = `INSERT INTO waka.company_invite (invited_company_id,invited_user_id,invitee_company_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,created_by,invited_company_type_id,poi_master_error_id) VALUES (${param.company_id},(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),${param.waka_ref_supplier_id},'${param.supplier_name}',(SELECT full_name FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_supplier_id}),(SELECT email FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_supplier_id}),(SELECT user_id FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_supplier_id}),(SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name = 'Shipper'),(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),(SELECT company_type_id FROM waka.company WHERE company_id = ${param.company_id}), ${param.poi_master_error_id}) RETURNING company_invite_id`;
        // (SELECT poi_me_id FROM waka.poi_master_error_temp WHERE poi_id = ${param.poi_id} AND error_value = '${param.supplier_name}')
        return await psqlAPM.fnDbQuery('insSupplierInviteCompany', queryText, []);
    }

    async insFactoryInviteCompany(param: any) {
        const queryText = `INSERT INTO waka.company_invite (invited_company_id,invited_user_id,invitee_company_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,created_by,invited_company_type_id,poi_master_error_id) VALUES (${param.company_id},(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),${param.waka_ref_factory_id},'${param.factory_name}',(SELECT full_name FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_factory_id}),(SELECT email FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_factory_id}),(SELECT user_id FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_factory_id}),(SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name = 'Shipper'),(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),(SELECT company_type_id FROM waka.company WHERE company_id = ${param.company_id}), ${param.poi_master_error_id}) RETURNING company_invite_id`;
        // (SELECT poi_me_id FROM waka.poi_master_error_temp WHERE poi_id = ${param.poi_id} AND error_value = '${param.supplier_name}')
        return await psqlAPM.fnDbQuery('inSupplierRef', queryText, []);
    }

    async insBuyerInviteCompany(param: any) {
        const queryText = `INSERT INTO waka.company_invite (invited_company_id,invited_user_id,invitee_company_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,created_by,invited_company_type_id,poi_master_error_id) VALUES (${param.company_id},(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),${param.waka_ref_buyer_id},'${param.buyer_name}',(SELECT full_name FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_buyer_id}),(SELECT email FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_buyer_id}),(SELECT user_id FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE c.company_id = ${param.waka_ref_buyer_id}),(SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name = 'Shipper'),(SELECT owned_by FROM waka.company WHERE company_id = ${param.company_id}),(SELECT company_type_id FROM waka.company WHERE company_id = ${param.company_id}), ${param.poi_master_error_id}) RETURNING company_invite_id`;
        // (SELECT poi_me_id FROM waka.poi_master_error_temp WHERE poi_id = ${param.poi_id} AND error_value = '${param.supplier_name}')
        return await psqlAPM.fnDbQuery('inSupplierRef', queryText, []);
    }

    async inSupplierRef(param: any) {
        const queryText = "INSERT INTO waka.supplier_ref (company_id,supplier_code,supplier_name,waka_ref_supplier_id) VALUES ($1,$2,$3,$4) RETURNING supplier_ref_id";
        const queryParam = [param.company_id, param.supplier_code, param.supplier_name, param.waka_ref_supplier_id]
        return await psqlAPM.fnDbQuery('inSupplierRef', queryText, queryParam);
    }

    async insFactoryRef(param: any) {
        const queryText = "INSERT INTO waka.factory_ref (company_id,factory_code,factory_name,waka_ref_factory_id) VALUES ($1,$2,$3,$4)";
        const queryParam = [param.company_id, param.factory_code, param.factory_name, param.waka_ref_factory_id]
        return await psqlAPM.fnDbQuery('insFactoryRef', queryText, queryParam);
    }

    async insBuyerRef(param: any) {
        const queryText = "INSERT INTO waka.buyer_ref (company_id,buyer_code,buyer_name,waka_ref_buyer_id) VALUES ($1,$2,$3,$4)";
        const queryParam = [param.company_id, param.buyer_code, param.buyer_name, param.waka_ref_buyer_id]
        return await psqlAPM.fnDbQuery('insBuyerRef', queryText, queryParam);
    }

    async insIncotermsRef(param: any) {
        const queryText = "INSERT INTO waka.incoterms_ref (company_id,incoterms_name,waka_ref_incoterms_id) VALUES ($1,$2,$3)";
        const queryParam = [param.company_id, param.incoterms_name, param.waka_ref_incoterms_id]
        return await psqlAPM.fnDbQuery('insIncotermsRef', queryText, queryParam);
    }

    async insPortRef(param: any) {
        const queryText = "INSERT INTO waka.port_ref (company_id,port_name,port_code,waka_ref_port_id) VALUES ($1,$2,$3,$4)";
        const queryParam = [param.company_id, param.port_name, param.port_code, param.waka_ref_port_id]
        return await psqlAPM.fnDbQuery('insOrgPortRef', queryText, queryParam);
    }

    async checkPoMasterErrorExists(param: any) {
        let queryText = "SELECT * FROM waka.poi_master_error_temp WHERE poi_id = $1 AND LOWER(regexp_replace(error_value,'[^a-zA-Z]','','g')) = $2 AND error_type = $3 AND ref_code = $4";
        const queryParam: any = [param.poi_id, param.error_value.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.error_type, param.ref_code];
        return await psqlAPM.fnDbQuery('checkPoMasterErrorExists', queryText, queryParam);
    }

    async checkErrorNInvite(param: any) {
        let queryText = "SELECT c.company_id, ci.is_accepted, ci.company_invite_id, pom.poi_me_id FROM waka.company c LEFT JOIN waka.company_invite ci ON ci.invitee_company_id = c.company_id  AND ci.invited_company_id = $1 LEFT JOIN waka.poi_master_error_temp pom ON LOWER(regexp_replace(pom.error_value,'[^a-zA-Z]','','g')) = $2 AND pom.poi_id = $3 AND pom.error_type = $4 AND pom.ref_code = $5 WHERE LOWER(regexp_replace(c.company_name,'[^a-zA-Z]','','g')) = $2;";
        const queryParam: any = [param.company_id, param.supplier_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.poi_id, param.error_type, param.supplier_code];
        return await psqlAPM.fnDbQuery('checkErrorNInvite', queryText, queryParam);
    }

    async checkFacErrorNInvite(param: any) {
        let queryText = "SELECT c.company_id, ci.is_accepted, ci.company_invite_id, pom.poi_me_id FROM waka.company c LEFT JOIN waka.company_invite ci ON ci.invitee_company_id = c.company_id  AND ci.invited_company_id = $1 LEFT JOIN waka.poi_master_error_temp pom ON LOWER(regexp_replace(pom.error_value,'[^a-zA-Z]','','g')) = $2 AND pom.poi_id = $3 AND pom.error_type = $4 AND pom.ref_code = $5 WHERE LOWER(regexp_replace(c.company_name,'[^a-zA-Z]','','g')) = $2;";
        const queryParam: any = [param.company_id, param.factory_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.poi_id, param.error_type, param.factory_code];
        return await psqlAPM.fnDbQuery('checkFacErrorNInvite', queryText, queryParam);
    }

    async checkBuyerErrorNInvite(param: any) {
        let queryText = "SELECT c.company_id, ci.is_accepted, ci.company_invite_id, pom.poi_me_id FROM waka.company c LEFT JOIN waka.company_invite ci ON ci.invitee_company_id = c.company_id  AND ci.invited_company_id = $1 LEFT JOIN waka.poi_master_error_temp pom ON LOWER(regexp_replace(pom.error_value,'[^a-zA-Z]','','g')) = $2 AND pom.poi_id = $3 AND pom.error_type = $4 WHERE LOWER(regexp_replace(c.company_name,'[^a-zA-Z]','','g')) = $2;";
        const queryParam: any = [param.company_id, param.buyer_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.poi_id, param.error_type];
        return await psqlAPM.fnDbQuery('checkFacErrorNInvite', queryText, queryParam);
    }

    async checkPortErrorNRef(param: any) {
        let queryText = "SELECT p.port_id, pom.poi_me_id FROM waka.port p LEFT JOIN waka.poi_master_error_temp pom ON LOWER(regexp_replace(pom.error_value,'[^a-zA-Z]','','g')) ~ $1 AND pom.poi_id = $2 AND pom.error_type = $3 WHERE LOWER(regexp_replace(p.port_name,'[^a-zA-Z]','','g')) ~ $1;";
        const queryParam: any = [param.port_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, ""), param.poi_id, param.error_type];
        return await psqlAPM.fnDbQuery('checkFacErrorNInvite', queryText, queryParam);
    }

    async checkIncoRef(param: any) {
        let queryText = "SELECT ln.lookup_name_id FROM waka.lookup_name ln WHERE LOWER(regexp_replace(ln.lookup_name,'[^a-zA-Z]','','g')) = $2 AND ln.company_id IN ($1,1) AND ln.lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type = 'incoterms' LIMIT 1) LIMIT 1;";
        const queryParam: any = [param.company_id, param.incoterms_name.toLowerCase().replaceAll(/[^a-zA-Z]/g, "")];
        return await psqlAPM.fnDbQuery('checkIncoRef', queryText, queryParam);
    }

    async insPoMasterError(param: any) {
        let queryText = "INSERT INTO waka.poi_master_error_temp (poi_id,error_type,error_value,created_by,is_invite_sent,ref_code) VALUES ($1,$2,$3,$4,$5,$6) returning poi_me_id;";
        const queryParam: any = [param.poi_id, param.error_type, param.error_value, 1, param.is_invite_sent, param.ref_code];
        return await psqlAPM.fnDbQuery('insPoMasterError', queryText, queryParam);
    }

    async updCompanyInviteError(param: any) {
        let queryText = "UPDATE waka.company_invite SET poi_master_error_id = $1 WHERE company_invite_id = $2";
        const queryParam: any = [param.poi_master_error_id, param.company_invite_id];
        return await psqlAPM.fnDbQuery('updCompanyInviteError', queryText, queryParam);
    }

    async getMasterErrors(param: any) {
        let queryText = "SELECT COUNT(*) as error_count FROM waka.poi_master_error_temp WHERE poi_id= $1;";
        const queryParam: any = [param.poi_id];
        return await psqlAPM.fnDbQuery('insPoMasterError', queryText, queryParam);
    }

    async checkPOCompanyTableExists(param: any) {
        let queryText = "SELECT * FROM pg_tables WHERE schemaname = 'waka' AND tablename  = $1;";
        const queryParam: any = ['po_' + param.company_id];
        return await psqlAPM.fnDbQuery('checkPOCompanyTableExists', queryText, queryParam);
    }

    async checkPOTableExists(company_id: any) {
        let queryText = "SELECT EXISTS (select  from information_schema.tables where table_schema = 'waka' AND table_name = $1);";
        const queryParam: any = ['po_' + company_id];
        return await psqlAPM.fnDbQuery('checkPOTableExists', queryText, queryParam);
    }

    async createPOCompanyTable(company_id: any) {
        let queryText = `CREATE TABLE waka.po_${company_id} (po_id SERIAL PRIMARY KEY, po_raw_id INT NOT NULL REFERENCES waka.waka.po_raw(po_raw_id) ON DELETE CASCADE,order_number INT NOT NULL,item_qty INT NULL,supplier_ref_id INT NOT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,product VARCHAR NOT NULL,product_description VARCHAR NOT NULL,origin_port_ref_id INT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,dest_port_ref_id INT NULL REFERENCES waka.port(port_id) ON DELETE CASCADE,factory_ref_id INT NULL REFERENCES waka.company(company_id) ON DELETE CASCADE,incoterms_ref_id INT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,ff_id INT NULL,ship_date TIMESTAMP NOT NULL,delivery_date TIMESTAMP NOT NULL, cargo_ready_date TIMESTAMP, po_status_id INT NOT NULL REFERENCES waka.lookup_name(lookup_name_id) ON DELETE CASCADE,created_on TIMESTAMP DEFAULT NOW(),created_by INT NOT NULL DEFAULT 1, modified_on TIMESTAMP,modified_by INT NULL REFERENCES waka.login_user(user_id) ON DELETE CASCADE);`;
        return await psqlAPM.fnDbQuery('insPoMasterError', queryText, []);
    }

    async getPoRawData(param: any) {
        let queryText = "SELECT pr.*, pi.mandatory_fields FROM waka.po_raw pr JOIN waka.po_ingestion pi ON pi.company_id = pr.company_id WHERE pr.company_id = $1 AND pr.poisrs_id = $2";
        const queryParam: any = [param.company_id, param.poisrs_id];
        return await psqlAPM.fnDbQuery('insPoMasterError', queryText, queryParam);
    }

    async checkTableRowCount(param: any) {
        let queryText = `SELECT COUNT(*) FROM waka.po_${param.company_id}`;
        return await psqlAPM.fnDbQuery('checkTableRowCount', queryText, []);
    }

    async insPOData(param: any) {
        let cargoreadydate = param.po_raw_datas[0].mandatory_fields['cargoreadydate'];
        let shipdate = param.po_raw_datas[0].mandatory_fields['shipdate'];
        let deliverydate = param.po_raw_datas[0].mandatory_fields['deliverydate'];
        let queryText = `INSERT INTO waka.po_${param.company_id} (po_raw_id,order_number,item_qty,supplier_ref_id,product,product_description,origin_port_ref_id,dest_port_ref_id,factory_ref_id,incoterms_ref_id,ship_date,delivery_date,cargo_ready_date,po_status_id) VALUES`;
        for (let idx in param.po_raw_datas) {
            if(cargoreadydate){
                let key = cargoreadydate.mapped_key.toLowerCase();
                let d = new Date(param.po_raw_datas[idx][key]);
                let doo = new Date(d.setDate(d.getDate() + cargoreadydate.value));
                let newdate = new Date( doo.getTime() + Math.abs(doo.getTimezoneOffset()*60000) );
                param.po_raw_datas[idx].cargoreadydate = newdate.toISOString();
            }
            if(shipdate){
                let key = shipdate.mapped_key.toLowerCase();
                let d = new Date(param.po_raw_datas[idx][key]);
                let doo = new Date(d.setDate(d.getDate() + shipdate.value));
                let newdate = new Date( doo.getTime() + Math.abs(doo.getTimezoneOffset()*60000) );
                param.po_raw_datas[idx].shipdate = newdate.toISOString();
            }
            if(deliverydate){
                let key = deliverydate.mapped_key.toLowerCase();
                let d = new Date(param.po_raw_datas[idx][key]);
                let doo = new Date(d.setDate(d.getDate() + deliverydate.value));
                let newdate = new Date( doo.getTime() + Math.abs(doo.getTimezoneOffset()*60000) );
                param.po_raw_datas[idx].deliverydate = newdate.toISOString();
            }
            queryText += `(${param.po_raw_datas[idx].po_raw_id},${parseInt(param.po_raw_datas[idx].ordernumber)},${parseInt(param.po_raw_datas[idx].quantity)},(SELECT waka_ref_supplier_id FROM waka.supplier_ref WHERE company_id = ${param.company_id} AND supplier_code = '${param.po_raw_datas[idx].suppliercode}' LIMIT 1),'${param.po_raw_datas[idx].product}','${param.po_raw_datas[idx].description}',(SELECT waka_ref_port_id FROM waka.port_ref WHERE port_name ~ '${param.po_raw_datas[idx].originportname}' AND company_id = ${param.company_id} LIMIT 1),(SELECT waka_ref_port_id FROM waka.port_ref WHERE port_name ~ '${param.po_raw_datas[idx].destinationportname}' AND company_id = ${param.company_id} LIMIT 1),(SELECT waka_ref_factory_id FROM waka.factory_ref WHERE company_id = ${param.company_id} AND factory_code = '${param.po_raw_datas[idx].factorycode}' LIMIT 1),(SELECT waka_ref_incoterms_id FROM waka.incoterms_ref WHERE company_id = ${param.company_id} AND incoterms_name = '${param.po_raw_datas[idx].incoterms}' LIMIT 1),'${param.po_raw_datas[idx].shipdate ? param.po_raw_datas[idx].shipdate : '1991-01-01T00:00:00'}','${param.po_raw_datas[idx].deliverydate ? param.po_raw_datas[idx].deliverydate : '1991-01-01T00:00:00'}', '${param.po_raw_datas[idx].cargoreadydate ? param.po_raw_datas[idx].cargoreadydate : '1991-01-01T00:00:00'}', (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type ='po_status') AND lookup_name = 'active'))`
            if (parseInt(idx) < param.po_raw_datas.length - 1) {
                queryText += ','
            }
        }
        queryText += ';'
        console.log(queryText);
        return await psqlAPM.fnDbQuery('insPOData', queryText, []);
    }
}