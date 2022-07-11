const psqlAPM = require('./psqlAPM');
export class SOPModel {
    constructor() { };
    async insSOP(param: any) {
        const queryText = "INSERT INTO waka.sop (principal_id,ff_id,date_of_sop,remarks,rmd,sop_status_id, valid_from, valid_to, created_by, pp_type_id, ff_type_id) SELECT $1,$2,$3,$4,$5,(select lookup_name_id from waka.lookup_name WHERE lookup_name = 'Draft' AND lookup_type_id IN (select lookup_type_id from waka.lookup_type where lookup_type='sop_status')),$6,$7,$8,$9, $10 returning sop_id, sop_status_id";
        const queryParam = [param.principal_id, param.ff_id, param.date_of_sop, param.remarks, param.rmd, param.valid_from, param.valid_to, param.userId, param.pp_type_id, param.ff_type_id];
        return await psqlAPM.fnDbQuery('insSOP', queryText, queryParam);
    };

    async updSOPValidity(param: any) {
        const queryText = "UPDATE waka.sop SET valid_from = $1, valid_to = $2 WHERE sop_id = $3";
        const queryParam = [param.valid_from, param.valid_to, param.sop_id];
        return await psqlAPM.fnDbQuery('updSOPValidity', queryText, queryParam);
    }

    async getSOPId(param: any) {
        let query = "SELECT s.sop_id, s.sop_status_id, ln.lookup_name as status, EXTRACT(day from now() - s.date_of_sop) pending_days, s.valid_from, s.valid_to FROM waka.sop s JOIN waka.lookup_name ln on ln.lookup_name_id=s.sop_status_id WHERE s.principal_id = $1 AND s.ff_id = $2 ORDER BY s.valid_from";
        let qryParam = [param.principal_id, param.ff_id];
        return await psqlAPM.fnDbQuery('getSOPId', query, qryParam);
    }

    async getSOPs_old(userId: number) {
        const queryText = "SELECT distinct s.sop_id, s.principal_id, s.rmd, cp.company_name p_company, s.ff_id, cf.company_name as ff_company, s.date_of_sop, s.remarks, s.sop_status_id, sn.lookup_name as status,EXTRACT(day from now() - s.date_of_sop) pending_days, s.valid_from, s.valid_to, cp.company_logo_path as p_logo_path FROM waka.sop s JOIN waka.user_company uc ON (uc.company_id = s.principal_id OR uc.company_id = s.ff_id OR uc.invited_company_id = s.principal_id OR uc.invited_company_id = s.ff_id ) AND uc.user_id = $1 JOIN waka.company cp ON cp.company_id = s.principal_id JOIN waka.company cf ON cf.company_id = s.ff_id JOIN waka.lookup_name sn on sn.lookup_name_id = s.sop_status_id WHERE NOT s.is_deleted ORDER BY s.valid_from desc";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getSOPs', queryText, queryParam);
    };

    async getSOPs(userId: number) {
        const queryText = "SELECT distinct s.sop_id, s.principal_id, s.rmd, cp.company_name p_company, s.ff_id, cf.company_name as ff_company, s.date_of_sop, s.remarks, s.sop_status_id, sn.lookup_name as status,EXTRACT(day from now() - s.date_of_sop) pending_days, s.valid_from, s.valid_to, cp.company_logo_path as p_logo_path,( SELECT case when a.event_id is null then false else true end as is_edit FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = s.ff_id OR company_id = s.principal_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'EDIT_SOP' LIMIT 1)) as a),(SELECT case when b.event_id is null then false else true end as is_print FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = s.ff_id OR company_id = s.principal_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'PRINT_SOP' LIMIT 1)) as b),(SELECT case when c.event_id is null then false else true end as is_delete FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = s.ff_id OR company_id = s.principal_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DELETE_SOP' LIMIT 1)) as c),(SELECT case when d.event_id is null then false else true end as is_view FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = s.ff_id OR company_id = s.principal_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'VIEW_SOP' LIMIT 1)) as d) FROM waka.sop s JOIN waka.user_company uc ON (uc.company_id = s.principal_id OR uc.company_id = s.ff_id OR uc.invited_company_id = s.principal_id OR uc.invited_company_id = s.ff_id ) AND uc.user_id = $1 JOIN waka.company cp ON cp.company_id = s.principal_id JOIN waka.company cf ON cf.company_id = s.ff_id JOIN waka.lookup_name sn on sn.lookup_name_id = s.sop_status_id WHERE NOT s.is_deleted ORDER BY s.valid_from desc;"
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getSOPs', queryText, queryParam);
    };

    async getSOPCompany(param: any) {
        //const queryText = "SELECT sc.sop_id, sc.company_id, sc.company_type_id, ln.lookup_name as company_type, c.company_name, sc.country_id, co.name as country_name FROM waka.sop_company as sc JOIN waka.company as c on c.company_id = sc.company_id JOIN waka.country co ON co.country_id=sc.country_id JOIN waka.lookup_name as ln ON ln.lookup_name_id = sc.company_type_id WHERE sc.sop_id = $1";
        const queryText = "SELECT sc.sop_id, sc.principal_id as principal_company_id, sc.pp_type_id as pp_company_type_id, sc.ff_id as ff_company_id, sc.ff_type_id as ff_company_type_id from waka.sop as sc WHERE sc.sop_id = $1";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCompany', queryText, queryParam);
    };

    async getAllCompForSOPByCompType(param: any) {
        const queryText = "SELECT sc.sop_company_id, sc.sop_id, c.company_id, c.company_type_id, ln.lookup_name as company_type, c.company_name, c.country_id, co.name as country_name, c.state_id, st.name as state_name, c.city_id, COALESCE(ct.name,c.city) as city_name, c.zip_code, c.address, CASE WHEN sop_company_id is not null THEN true ELSE false END as is_selected FROM company as c LEFT JOIN sop_company as sc on c.company_id = sc.company_id AND sc.sop_id = $1 JOIN country co ON co.id=c.country_id JOIN state st on st.id = c.state_id JOIN lookup_name as ln ON ln.lookup_name_id = c.company_type_id LEFT JOIN city ct ON ct.id = c.city_id WHERE ln.lookup_name=$2 AND ln.lookup_type_id IN (SELECT lookup_type_id FROM lookup_type where lookup_type = 'account_type')";
        const queryParam = [param.sop_id, param.company_type];
        return await psqlAPM.fnDbQuery('getAllCompForSOPByCompType', queryText, queryParam);
    };

    async insSOPCompany(param: any) {
        const queryText = "INSERT INTO waka.sop_company (created_by,sop_id, company_id, company_type_id, country_id) SELECT $1, * FROM jsonb_to_recordset($2) as x(sop_id INT, company_id INT, company_type_id INT, country_id INT) ON CONFLICT ON CONSTRAINT sop_company_sop_id_company_id_key DO NOTHING";
        const queryParam = [param.userId, JSON.stringify(param.sopCompColl)];
        return await psqlAPM.fnDbQuery('insSOPCompany', queryText, queryParam);
    };

    async updSOPCompany(param: any) {
        const queryText = "UPDATE sop_company SET company_id = $1, modified_on= now(), modified_by=$3 WHERE sop_company_id = $2";
        const queryParam = [param.sop_id, param.sop_company_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPCompany', queryText, queryParam);
    };

    async delSOPCompany(param: any) {
        const queryText = "DELETE from waka.sop_company where sop_id = $1";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('delSOPCompany', queryText, queryParam);
    };

    async delSOPContactsByCompId(param: any) {
        const queryText = "DELETE FROM sop_contacts sc WHERE sop_id =$1 AND sc.contact_id IN (SELECT contact_id FROM contacts WHERE company_id = $2);";
        const queryParam = [param.sop_id, param.company_id];
        return await psqlAPM.fnDbQuery('delSOPContactsByCompId', queryText, queryParam);
    }

    // async insSOPCompanies (param:any){
    //     let queryText = "INSERT INTO sop_company (sop_id, company_id,created_by) VALUES ";
    //     param.addedCompanyIds.map((id:number,ix:number) => {
    //         if (ix != 0) queryText += ",";
    //         queryText += "("+param.sop_id+","+id+","+param.userId+")"
    //     });
    //     return await psqlAPM.fnDbQuery('insSOPCompanies', queryText, []);
    // };

    async removeSOPContacts(param: any) {
        let queryText = "DELETE FROM sop_contacts sc WHERE sop_id =" + param.sop_id + " AND sc.contact_id IN (SELECT contact_id FROM contacts WHERE company_id IN (";
        param.removedCompanyIds.map((id: number, ix: number) => {
            if (ix != 0) queryText += ",";
            queryText += id;
        });
        queryText += "))";
        return await psqlAPM.fnDbQuery('removeSOPContacts', queryText, []);
    };

    async removeSOPCompanies(param: any) {
        let queryText = "DELETE FROM sop_company WHERE company_id IN (";
        param.removedCompanyIds.map((id: number, ix: number) => {
            if (ix != 0) queryText += ",";
            queryText += id;
        });
        queryText += ")";
        return await psqlAPM.fnDbQuery('removeSOPCompanies', queryText, []);
    };

    async getSOPContactsForCompany(param: any) {
        const queryText = "SELECT sc.sop_id, sc.sop_contact_id, c.contact_id, c.contact_type, c.company_id, co.company_name, c.contact_name, c.email, c.division, c.position, c.phone_country_id, c.phone, c.mobile_country_id, c.mobile, c.wechatid, sc.remainder_alerts, sc.escalation_alerts FROM contacts c JOIN sop_contacts sc on sc.contact_id = c.contact_id AND sc.sop_id = $1 JOIN company co ON co.company_id = c.company_id WHERE c.company_id = $2 AND c.contact_type=$3";
        const queryParam = [param.sop_id, param.company_id, param.contact_type];
        return await psqlAPM.fnDbQuery('getSOPContactsForCompany', queryText, queryParam);
    }

    async getSOPContactsAllCompany(param: any) {
        const queryText = "SELECT sc.sop_id, sc.sop_contact_id, c.contact_id, c.contact_type, c.company_id, co.company_name, c.contact_name, c.email, c.division, c.position, c.phone_country_id, c.phone, c.mobile_country_id, c.mobile, c.wechatid, sc.remainder_alerts, sc.escalation_alerts FROM contacts c JOIN sop_contacts sc on sc.contact_id = c.contact_id AND sc.sop_id = $1 JOIN company co ON co.company_id = c.company_id WHERE c.contact_type=$2";
        const queryParam = [param.sop_id, param.contact_type];
        return await psqlAPM.fnDbQuery('getSOPContactsAllCompany', queryText, queryParam);
    }

    async insSOPContact(param: any) {
        const queryText = "INSERT INTO sop_contacts(sop_id,contact_id, remainder_alerts, escalation_alerts, created_by) VALUES ($1, $2, $3, $4, $5) returning sop_contact_id";
        const queryParam = [param.sop_id, param.contact_id, param.remainder_alerts, param.escalation_alerts, param.userId];
        return await psqlAPM.fnDbQuery('insSOPContact', queryText, queryParam);
    }

    async updSOPContact(param: any) {
        const queryText = "UPDATE sop_contacts SET sop_id = $1,contact_id=$2, remainder_alerts=$3, escalation_alerts=$4, modified_by=$5, modified_on=now() WHERE sop_contact_id = $6";
        const queryParam = [param.sop_id, param.contact_id, param.remainder_alerts, param.escalation_alerts, param.userId, param.sop_contact_id];
        return await psqlAPM.fnDbQuery('updSOPContact', queryText, queryParam);
    }

    async insSOPContactPort(param: any) {
        let queryText = "INSERT INTO sop_contacts_port (sop_contact_id, origin_port_id, created_by) VALUES ";
        param.origin_ports.map((port: any, i: number) => {
            if (i != 0) queryText += ","
            queryText += "(" + param.sop_contact_id + "," + port.port_id + "," + param.userId + ")";
        });
        return await psqlAPM.fnDbQuery('insSOPContactPort', queryText, []);
    }

    async delSOPContactPorts(param: any) {
        const queryText = "DELETE FROM sop_contacts_port WHERE sop_contact_id = $1";
        const queryParam = [param.sop_contact_id];
        return await psqlAPM.fnDbQuery('delSOPContactPorts', queryText, queryParam);
    }

    async delSOPContact(param: any) {
        const queryText = "DELETE FROM sop_contacts WHERE sop_contact_id = $1";
        const queryParam = [param.sop_contact_id];
        return await psqlAPM.fnDbQuery('delSOPContact', queryText, queryParam);
    }

    async getSOPContactPorts(param: any) {
        const queryText = "SELECT sop_contact_port_id,sop_contact_id,origin_port_id,true as is_selected FROM sop_contacts_port WHERE sop_contact_id=$1";
        const queryParam = [param.sop_contact_id];
        return await psqlAPM.fnDbQuery('getSOPContactPorts', queryText, queryParam);
    }

    async getSOPDocs(param: any) {
        const queryText = "SELECT sd.sop_id, sd.origin_country_id, sd.destination_country_id,d.grp_seq, d.grp, count(d.grp) FROM waka.documents d JOIN waka.sop_document sd ON sd.doc_id = d.doc_id WHERE NOT d.is_deleted AND sd.sop_id = $1 GROUP BY 1,2,3,4,5 ORDER BY d.grp_seq";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPDocs', queryText, queryParam);
    }

    //not in use at 11/18/2021
    async insSOPDocs_old(param: any) {
        const queryText = "INSERT INTO waka.sop_document (created_by,sop_id, origin_country_id,destination_country_id,doc_id,fields) SELECT $1, * FROM jsonb_to_recordset($2) as x(sop_id int, origin_country_id int, destination_country_id int, doc_id int, fields JSON)";
        const queryParam = [param.userId, JSON.stringify(param.sopDoc)];
        return await psqlAPM.fnDbQuery('insSOPDocs', queryText, queryParam);
    }

    async validateEmail(param: any) {
        let queryText = "SELECT c.contact_id, sc.sop_contact_id, c.contact_name, c.division, c.position, c.phone_country_id, c.phone, c.mobile_country_id, c.mobile, c.contact_type, c.company_id, c.wechatid FROM contacts c LEFT JOIN sop_contacts sc on sc.contact_id = c.contact_id AND sc.sop_id = $2 AND sc.sop_contact_id != $3 WHERE c.email = $1 ";
        let queryParam: any = [param.email, param.sop_id, param.sop_contact_id];
        return await psqlAPM.fnDbQuery('getSOPContactByEmail', queryText, queryParam);
    }

    async getSOPContactByEmail(param: any) {
        let queryText = "SELECT c.contact_id, sc.sop_contact_id, c.contact_name, c.division, c.position, c.phone_country_id, c.phone, c.mobile_country_id, c.mobile, c.contact_type, c.company_id, c.wechatid FROM contacts c LEFT JOIN sop_contacts sc on sc.contact_id = c.contact_id AND sc.sop_id = $2 WHERE c.email = $1";
        let queryParam: any = [param.email, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPContactByEmail', queryText, queryParam);
    }

    async insSOPCargoHandling(param: any) {
        let queryText = "Insert INTO waka.sop_ch (sop_id, ch_id, fields, created_by) SELECT " + param.sop_id + ", ch_id, fields," + param.userId + " FROM waka.cargo_handling";
        return await psqlAPM.fnDbQuery('insSOPCargoHandling', queryText, []);
    }

    async getSOPCHForGroup(param: any) {
        let queryText = "SELECT sop_ch_id, sch.sop_id,COALESCE(sch.ch_id, ch.ch_id) as ch_id, ch.ch_seq, ch.sub_grp_seq, ch.sub_grp, ch.ch_name, ch.control_name, ch.has_child, ch.view_text, COALESCE(sch.fields, ch.fields) as fields,ch.ui_img_file_name, COALESCE(sch.is_selected, false) is_selected FROM waka.cargo_handling as ch LEFT JOIN waka.sop_ch as sch ON sch.ch_id = ch.ch_id AND sch.sop_id = $2 WHERE NOT ch.is_deleted AND ch.grp=$1 ORDER BY 4,3"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCHForGroup', queryText, queryParam);
    }

    async checkSOPInCH(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_ch WHERE sop_id = $1";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('checkSOPInCH', queryText, queryParam);
    }

    async updSOPCHIsSelected(param: any) {
        let queryText = "UPDATE waka.sop_ch SET is_selected = $1, modified_on = now(), modified_by=$3 WHERE sop_ch_id = $2";
        let queryParam = [param.is_selected, param.sop_ch_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPCHIsSelected', queryText, queryParam);
    }

    async updSOPCHOptimalValue(param: any) {
        let queryText = "UPDATE waka.sop_container SET fcl_min = $1, lcl_min = $2, optimal_cbm = $3 WHERE sop_container_id = $4";
        let queryParam = [param.fcl_min, param.lcl_min, param.optimal_cbm, param.sop_container_id];
        return await psqlAPM.fnDbQuery('updSOPCHOptimalValue', queryText, queryParam);
    }

    async updSOPCHfields(param: any) {
        let queryText = "UPDATE waka.sop_ch SET fields = $1, modified_on = now(), modified_by=$3 WHERE sop_ch_id = $2";
        let queryParam = [param.fields, param.sop_ch_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPCHfields', queryText, queryParam);
    }

    async getSOPContainer(param: any) {
        let queryText = "SELECT sc.sop_container_id, c.container_id, c.iso_type_code, c.iso_size_code, c.description as description, c.max_cbm, c.max_weight_kgs, sc.min_cbm, sc.optimal_cbm, sc.preference, sc.fcl_min, sc.lcl_min, sc.port_id_exception, c.remarks_required FROM waka.container_sizes c LEFT JOIN waka.sop_container sc ON sc.container_id = c.container_id AND sc.sop_id = $1 JOIN waka.container_first_character fc ON fc.code = c.first_character JOIN waka.container_second_character csc ON csc.code = c.second_character JOIN waka.container_type_desc td ON td.code = c.type_desc WHERE c.is_visible ORDER BY sc.preference, c.iso_type_code";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPContainer', queryText, queryParam);
    }

    async insSOPContainer(param: any) {
        let queryDel = "DELETE FROM waka.sop_container WHERE sop_id = $1";
        await psqlAPM.fnDbQuery('removeSOPContainer', queryDel, [param.sop_id]);
        let queryText = "INSERT INTO waka.sop_container (created_by,sop_id, container_id, min_cbm,optimal_cbm,max_cbm,preference,fcl_min,lcl_min,port_id_exception) SELECT $1, $2, * FROM jsonb_to_recordset($3) as x(container_id int, min_cbm numeric, optimal_cbm numeric, max_cbm numeric, preference int, fcl_min int, lcl_min int, port_id_exception int[])";
        let queryParam = [param.userId, param.sop_id, param.data];
        return await psqlAPM.fnDbQuery('insSOPContainer', queryText, queryParam);
    }

    // async getSOPContainer(param:any){
    //     let queryText = "SELECT sc.sop_container_id, c.container_id, c.iso_type_code, c.iso_size_code, td.description||' L:'|| fc.length_mm||' W:'|| csc.width_mm ||' H:'||csc.height_mm as description, c.max_cbm, c.max_weight_kgs, sc.min_cbm, sc.optimal_cbm, sc.preference, sc.fcl_min, sc.port_id_exception, c.remarks_required FROM waka.container_sizes c LEFT JOIN waka.sop_container sc ON sc.container_id = c.container_id AND sc.sop_id = $1 JOIN waka.container_first_character fc ON fc.code = c.first_character JOIN waka.container_second_character csc ON csc.code = c.second_character JOIN waka.container_type_desc td ON td.code = c.type_desc WHERE c.is_visible ORDER BY sc.preference, c.iso_type_code";
    //     let queryParam = [param.sop_id];
    //     return await psqlAPM.fnDbQuery('getSOPContainer', queryText, queryParam);
    // }

    async updSOPContainer(param: any) {
        let queryText = "";
        param.data.map((row: any) => {
            queryText += "UPDATE waka.sop_container SET sop_id=" + param.sop_id + ",container_id=" + row.container_id + ",min_cbm=" + row.min_cbm + ",optimal_cbm=" + row.optimal_cbm + ",preference=" + row.preference + ",fcl_min=" + row.fcl_min + ",port_id_exception='" + row.port_id_exception + "',modified_by=" + param.userId + ",modified_on=now() WHERE sop_container_id = " + row.sop_container_id + ";";
        });
        return await psqlAPM.fnDbQuery('updSOPContainer', queryText, []);
    }

    // async removeSOPContainer (param:any){
    //     let queryText = "DELETE FROM waka.sop_container WHERE sop_container_id IN (";
    //     param.removedContainerIds.map((id:number,ix:number)=>{
    //         if (ix != 0) queryText += ",";
    //         queryText += id;
    //     });
    //     queryText += ")";
    //     return await psqlAPM.fnDbQuery('removeSOPContainer', queryText, []);
    // }

    async removeSOPContainer(param: any) {
        let queryText = "DELETE FROM waka.sop_container WHERE sop_container_id = $1 and sop_id = $2";
        let queryParam = [param.sop_container_id, param.sop_id];
        return await psqlAPM.fnDbQuery('removeSOPContainer', queryText, queryParam);
    }

    async getSOPCarrierAlloc(param: any) {
        // const queryText = "SELECT sca.sca_id, sca.sop_id, sca.origin_port_id, sca.dest_port_id, sca.carrier_id, sca.contract_number, sca.allocation_percent, sca.remarks, p.port_name||','||p.country as origin_port, dp.port_name||','||dp.country as dest_port,c.company_name as carrier_name, p.port_name||','||p.country ||' to '|| dp.port_name||','||dp.country as origin_dest_port FROM waka.sop_carrier_allocations sca JOIN waka.port p on p.port_id = sca.origin_port_id JOIN waka.port dp ON dp.port_id=sca.dest_port_id JOIN waka.company c ON c.company_id = sca.carrier_id WHERE sca.sop_id = $1;";
        const queryText = "select sca.sop_ca_id, sca.sop_port_id, sca.effective_start_date, sca.effective_end_date, sca.allocated_by, sca.service_type, sca.allocation_type, sca.allocation_value, sca.carrier_preference, sca.carrier, sca.allocation_interval, sp.origin_port_id , sp.dest_port_id, po.port_name||', '||po.country as origin_port, pd.port_name||', '||pd.country as dest_port from waka.sop_carrier_allocation sca join waka.sop_port sp on sp.sop_port_id = sca.sop_port_id join waka.port po on po.port_id = sp.origin_port_id join waka.port pd on pd.port_id = sp.dest_port_id where sca.sop_id = $1;"
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierAlloc', queryText, queryParam);
    }

    async getSOPCarrierAllocByPort(param: any) {
        const queryText = "SELECT sca.sca_id, sca.sop_id, sca.origin_port_id, sca.dest_port_id, sca.carrier_id, sca.contract_number, sca.allocation_percent, sca.remarks, p.port_name||','||p.country as origin_port, dp.port_name||','||dp.country as dest_port,c.company_name as carrier_name FROM waka.sop_carrier_allocations sca JOIN waka.port p on p.port_id = sca.origin_port_id JOIN waka.port dp ON dp.port_id=sca.dest_port_id JOIN waka.company c ON c.company_id = sca.carrier_id WHERE sca.sop_id = $1 AND sca.origin_port_id = $2 AND sca.dest_port_id = $3;";
        const queryParam = [param.sop_id, param.origin_port_id, param.dest_port_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierAllocByPort', queryText, queryParam);
    }

    async insSOPCarrierAlloc(param: any) {
        let queryText = "INSERT INTO waka.sop_carrier_allocations (created_by,sop_id, origin_port_id, dest_port_id, carrier_id, contract_number,allocation_percent) SELECT $1, * FROM jsonb_to_recordset($2) as x(sop_id int, origin_port_id int, dest_port_id int, carrier_id int, contract_number varchar, allocation_percent int)";
        let queryParam = [param.userId, param.data];
        return await psqlAPM.fnDbQuery('insSOPCarrierAlloc', queryText, queryParam);
    }

    async updSOPCarrierAlloc(param: any) {
        let queryText = "";
        param.data.map((row: any) => {
            queryText += "UPDATE waka.sop_carrier_allocations SET carrier_id=" + row.carrier_id + ",contract_number='" + row.contract_number + "',allocation_percent=" + row.allocation_percent + ",modified_by=" + param.userId + ",modified_on=now() WHERE sca_id = " + row.sca_id + ";";
        });
        return await psqlAPM.fnDbQuery('updSOPCarrierAlloc', queryText, []);
    }

    async removeSOPCarrierAlloc(param: any) {
        let queryText = "DELETE FROM waka.sop_carrier_allocations WHERE sca_id IN (";
        param.removedIds.map((id: number, ix: number) => {
            if (ix != 0) queryText += ",";
            queryText += id;
        });
        queryText += ")";
        return await psqlAPM.fnDbQuery('removeSOPCarrierAlloc', queryText, []);
    }

    async delSOPCarrierAllocForPort(param: any) {
        let queryText = "DELETE FROM waka.sop_carrier_allocations WHERE sop_id = $1 AND origin_port_id = $2 AND dest_port_id = $3";
        let queryParam = [param.sop_id, param.origin_port_id, param.dest_port_id];
        return await psqlAPM.fnDbQuery('delSOPCarrierAllocForPort', queryText, queryParam);
    }

    async getSOPCarrierPref(param: any) {
        const queryText = "SELECT sca.scp_id, sca.sop_id, sca.origin_port_id, sca.dest_port_id, sca.carrier_id, sca.contract_number, sca.preference, sca.remarks, p.port_name||','||p.country as origin_port, dp.port_name||','||dp.country as dest_port,c.company_name as carrier_name, p.port_name||','||p.country ||' to '|| dp.port_name||','||dp.country as origin_dest_port FROM waka.sop_carrier_preference sca JOIN waka.port p on p.port_id = sca.origin_port_id JOIN waka.port dp ON dp.port_id=sca.dest_port_id JOIN waka.company c ON c.company_id = sca.carrier_id WHERE sca.sop_id = $1 ORDER BY sca.preference;";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierPref', queryText, queryParam);
    }

    async getSOPCarrierPrefByPort(param: any) {
        const queryText = "SELECT c.company_id as carrier_id, c.company_name as carrier_name, scp.scp_id, scp.sop_id, scp.origin_port_id, scp.dest_port_id, scp.contract_number, scp.preference, scp.remarks, p.port_name||','||p.country as origin_port, dp.port_name||','||dp.country as dest_port FROM waka.company c LEFT JOIN waka.sop_carrier_preference scp ON c.company_id = scp.carrier_id AND scp.sop_id = $1 AND scp.origin_port_id = $2 AND scp.dest_port_id = $3 LEFT JOIN waka.port p on p.port_id = scp.origin_port_id LEFT JOIN waka.port dp ON dp.port_id=scp.dest_port_id WHERE c.company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name IN ('Carrier', 'Freight Forwarder'));";
        const queryParam = [param.sop_id, param.origin_port_id, param.dest_port_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierPrefByPort', queryText, queryParam);
    }

    async insSOPCarrierPref(param: any) {
        let queryText = "INSERT INTO waka.sop_carrier_preference (created_by,sop_id, origin_port_id, dest_port_id, carrier_id, contract_number,preference) SELECT $1, * FROM jsonb_to_recordset($2) as x(sop_id int, origin_port_id int, dest_port_id int, carrier_id int, contract_number varchar, preference smallint)";
        let queryParam = [param.userId, param.data];
        return await psqlAPM.fnDbQuery('insSOPCarrierPref', queryText, queryParam);
    }

    async updSOPCarrierPref(param: any) {
        let queryText = "";
        param.data.map((row: any) => {
            queryText += "UPDATE waka.sop_carrier_preference SET carrier_id=" + row.carrier_id + ",contract_number='" + row.contract_number + "',preference=" + row.preference + ",modified_by=" + param.userId + ",modified_on=now() WHERE scp_id = " + row.scp_id + ";";
        });
        return await psqlAPM.fnDbQuery('updSOPCarrierPref', queryText, []);
    }

    async removeSOPCarrierPref(param: any) {
        let queryText = "DELETE FROM waka.sop_carrier_preference WHERE scp_id IN (";
        param.removedIds.map((id: number, ix: number) => {
            if (ix != 0) queryText += ",";
            queryText += id;
        });
        queryText += ")";
        return await psqlAPM.fnDbQuery('removeSOPCarrierPref', queryText, []);
    }

    async delSOPCarrierPrefForPort(param: any) {
        let queryText = "DELETE FROM waka.sop_carrier_preference WHERE sop_id = $1 AND origin_port_id = $2 AND dest_port_id = $3";
        let queryParam = [param.sop_id, param.origin_port_id, param.dest_port_id];
        return await psqlAPM.fnDbQuery('delSOPCarrierPrefForPort', queryText, queryParam);
    }

    async insSOPPOBooking(param: any) {
        const queryText = "Insert INTO waka.sop_pob (sop_id, pob_id, fields, created_by) SELECT $1, pob_id, fields, $2 FROM waka.po_booking";
        const queryParam = [param.sop_id, param.userId]
        return await psqlAPM.fnDbQuery('insSOPPOBooking', queryText, queryParam);
    }

    async insPOBookingDetails(param: any) {
        const queryText = "INSERT INTO waka.po_booking_details (sop_id, created_by) VALUES ($1,$2);";
        const queryParam = [param.sop_id, param.userId]
        return await psqlAPM.fnDbQuery('insPOBookingDetails', queryText, queryParam);
    }

    async insSOPLandingCost(param: any) {
        const queryText = "Insert INTO waka.sop_lc (sop_id, lc_id, fields, created_by) SELECT $1, lc_id, fields, $2 FROM waka.landing_cost";
        const queryParam = [param.sop_id, param.userId]
        return await psqlAPM.fnDbQuery('insSOPPOBooking', queryText, queryParam);
    }

    async insSOPCarrier(param: any) {
        const queryText = "Insert INTO waka.sop_carrier (sop_id, carrier_id, fields, created_by) SELECT $1, carrier_id, fields, $2 FROM waka.carrier";
        const queryParam = [param.sop_id, param.userId]
        return await psqlAPM.fnDbQuery('insSOPCarrier', queryText, queryParam);
    }

    async insSOPSchInvoice(param: any) {
        const queryText = "Insert INTO waka.sop_sch_inv (sop_id, sci_id, fields, created_by) SELECT $1, sci_id, fields, $2 FROM waka.service_charges_inv";
        const queryParam = [param.sop_id, param.userId]
        return await psqlAPM.fnDbQuery('insSOPSchInvoice', queryText, queryParam);
    }

    async insSOPDocs(param: any, idx: number) {
        const queryText = "Insert INTO waka.sop_document (sop_id, doc_id, sop_port_id, fields, is_selected, created_by) SELECT $1, doc_id, $2, fields, is_selected, $3 FROM waka.documents";
        const queryParam = [param.sop_id, param.sop_port_ids[idx], param.userId]
        return await psqlAPM.fnDbQuery('insSOPDocs', queryText, queryParam);
    }

    async getSOPPOBForGroup(param: any) {
        let queryText = "SELECT sop_pob_id, spob.sop_id,COALESCE(spob.pob_id, pob.pob_id) as pob_id, pob.pob_seq, pob.sub_grp_seq, pob.sub_grp, pob.pob_name, pob.control_name, pob.has_child, pob.view_text, COALESCE(spob.fields, pob.fields) as fields,pob.ui_img_file_name, COALESCE(spob.is_selected, false) is_selected FROM waka.po_booking as pob LEFT JOIN waka.sop_pob as spob ON spob.pob_id = pob.pob_id AND spob.sop_id = $2 WHERE NOT pob.is_deleted AND pob.grp=$1 ORDER BY 4,5"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPPOBForGroup', queryText, queryParam);
    }

    async getSOPDocForGroup(param: any) {
        let queryText = "SELECT sd_id, spoc.sop_id,COALESCE(spoc.doc_id, doc.doc_id) as doc_id, doc.doc_seq, doc.sub_grp_seq, doc.sub_grp, doc.doc_name, doc.control_name, doc.has_child, doc.view_text, COALESCE(spoc.fields, doc.fields) as fields,doc.ui_img_file_name, spoc.is_selected FROM waka.documents as doc LEFT JOIN waka.sop_document as spoc ON spoc.doc_id = doc.doc_id AND spoc.sop_id = $2 WHERE NOT doc.is_deleted AND doc.grp_seq = $1 AND spoc.sop_port_id = $3 ORDER BY 4,5"
        let queryParam = [param.grp_seq, param.sop_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('getSOPDocForGroup', queryText, queryParam);
    }

    async getSOPLCForGroup(param: any) {
        let queryText = "SELECT sop_lc_id, slc.sop_id, COALESCE(slc.lc_id, lc.lc_id) as lc_id, lc.lc_seq, lc.sub_grp_seq, lc.sub_grp, lc.lc_name, lc.control_name, lc.has_child, lc.view_text, COALESCE(slc.fields, lc.fields) as fields, lc.ui_img_file_name, false as expand FROM waka.landing_cost as lc LEFT JOIN waka.sop_lc as slc ON slc.lc_id = lc.lc_id AND slc.sop_id = $1 WHERE NOT lc.is_deleted ORDER BY 4,5;"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPLCForGroup', queryText, queryParam);
    }

    async getSOPCarrierForGroup(param: any) {
        let queryText = "SELECT sop_carrier_id, sca.sop_id, COALESCE(sca.carrier_id, car.carrier_id) as carrier, car.carrier_seq, car.sub_grp_seq, car.sub_grp, car.carrier_name, car.control_name, car.has_child, car.view_text, COALESCE(sca.fields, car.fields) as fields, car.ui_img_file_name, sca.is_selected, false as expand FROM waka.carrier as car LEFT JOIN waka.sop_carrier as sca ON sca.carrier_id = car.carrier_id AND sca.sop_id = $1 WHERE NOT car.is_deleted ORDER BY 4,5;"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierForGroup', queryText, queryParam);
    }

    async getSopPortCountryWiseList(param: any) {
        let queryText = "SELECT origin_country, dest_country, true as is_completed, 6 as docs_count, array_agg(sop_port_id ORDER BY sop_port_id) as sop_port_ids, false as is_selected from waka.vw_sop_port where sop_id = $1 group by 1,2;"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSopPortCountryWiseList', queryText, queryParam);
    }

    async getDocGrp(param: any) {
        let queryText = " SELECT distinct grp_seq, grp, html_template FROM waka.documents WHERE NOT is_deleted ORDER BY 1;";
        return await psqlAPM.fnDbQuery('getDocGrp', queryText, []);
    }

    async getSOPSchInvForGroup(param: any) {
        let queryText = "SELECT ssi_id, ssi.sop_id, COALESCE(ssi.sci_id, sci.sci_id) as sci_id, sci.invoice_seq, sci.sub_grp_seq, sci.sub_grp, sci.invoice_name, sci.control_name, sci.has_child, sci.view_text, COALESCE(ssi.fields, sci.fields) as fields, sci.ui_img_file_name, false as expand FROM waka.service_charges_inv as sci LEFT JOIN waka.sop_sch_inv as ssi ON ssi.sci_id = sci.sci_id AND ssi.sop_id = $1 WHERE NOT sci.is_deleted ORDER BY 4,5;"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPSchInvForGroup', queryText, queryParam);
    }

    async checkSOPInPOB(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_pob WHERE sop_id = $1";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('checkSOPInPOB', queryText, queryParam);
    }

    async checkSOPInLC(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_lc WHERE sop_id = $1";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('checkSOPInPOB', queryText, queryParam);
    }

    async checkSOPInCarrier(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_carrier WHERE sop_id = $1 AND sop_port_id IS NULL";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('checkSOPInCarrier', queryText, queryParam);
    }

    async checkSOPInSchInvoice(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_sch_inv WHERE sop_id = $1;";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('checkSOPInSchInvoice', queryText, queryParam);
    }

    async checkSOPDoc(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_sch_inv WHERE sop_id = $1 AND sop_port_id = $2";
        let queryParam = [param.sop_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('checkSOPDoc', queryText, queryParam);
    }

    async checkSOPInDoc(param: any) {
        let queryText = "SELECT distinct sop_id FROM waka.sop_document WHERE sop_id = $1 AND sop_port_id = $2";
        let queryParam = [param.sop_id, param.sop_port_ids[0]];
        return await psqlAPM.fnDbQuery('checkSOPInDoc', queryText, queryParam);
    }

    async updSOPPOBIsSelected(param: any) {
        let queryText = "UPDATE waka.sop_pob SET is_selected = $1, modified_on = now(), modified_by=$3 WHERE sop_pob_id = $2 RETURNING fields";
        let queryParam = [param.is_selected, param.sop_pob_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPPOBIsSelected', queryText, queryParam);
    }

    async updSOPPOBfields(param: any) {
        let queryText = "UPDATE waka.sop_pob SET fields = $1, modified_on = now(), modified_by = $3 WHERE sop_pob_id = $2 RETURNING fields";
        let queryParam = [param.fields, param.sop_pob_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPPOBfields', queryText, queryParam);
    }

    async updSOPPOBGenerateDate(param: any) {
        let queryText = "UPDATE waka.po_booking_details SET generate_date = $1 WHERE sop_id = $2";
        let queryParam = [param.generate_date, param.sop_id];
        return await psqlAPM.fnDbQuery('updSOPPOBGenerateDate', queryText, queryParam);
    }

    async updSOPLCfields(param: any) {
        let queryText = "UPDATE waka.sop_lc SET fields = $1, modified_on = now(), modified_by = $3 WHERE sop_lc_id = $2";
        let queryParam = [param.fields, param.sop_lc_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPLCfields', queryText, queryParam);
    }

    async updSOPCarrierfields(param: any) {
        let queryText = "UPDATE waka.sop_carrier SET fields = $1, modified_on = now(), modified_by = $3 WHERE sop_carrier_id = $2";
        let queryParam = [param.fields, param.sop_carrier_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPCarrierfields', queryText, queryParam);
    }

    async updSOPSchInvfields(param: any) {
        let queryText = "UPDATE waka.sop_sch_inv SET fields = $1, modified_on = now(), modified_by = $3 WHERE ssi_id = $2";
        let queryParam = [param.fields, param.ssi_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPSchInvfields', queryText, queryParam);
    }

    async copySOPCompany(param: any) {
        const queryText = "INSERT INTO sop_company (sop_id, company_id, created_by) SELECT " + param.to_sop_id + ", company_id, " + param.userId + " FROM sop_company where sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPCompany', queryText, []);
    };

    async copySOPContact(param: any) {
        const queryText = "INSERT INTO sop_contacts(sop_id,contact_id, remainder_alerts, escalation_alerts, created_by) SELECT " + param.to_sop_id + ", contact_id, remainder_alerts, escalation_alerts, " + param.userId + " FROM sop_contacts WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPContact', queryText, []);
    }

    async copySOPContactPort(param: any) {
        const queryText = "INSERT INTO sop_contacts_port (sop_contact_id, origin_port_id, created_by) SELECT a.sop_contact_id, b.origin_port_id,$3 FROM sop_contacts_port b JOIN (select sop_contact_id, contact_id from sop_contacts where sop_id = $1) as c ON c.sop_contact_id = b.sop_contact_id JOIN (select sop_contact_id, contact_id from sop_contacts where sop_id = $2) a on a.contact_id = c.contact_id;";
        const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPContactPort', queryText, queryParam);
    }
    async copySOPDocs(param: any) {
        const queryText = "DELETE FROM sop_document WHERE sop_id = " + param.to_sop_id + ";INSERT INTO sop_document (created_by,sop_id, origin_country_id,destination_country_id,doc_id,fields) SELECT " + param.userId + ", " + param.to_sop_id + ", origin_country_id,destination_country_id,doc_id,fields FROM sop_document WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPDocs', queryText, []);
    }

    async updDocFieldValue(param: any) {
        let queryText = "UPDATE waka.sop_document SET fields = $1, modified_on = now(), modified_by = $3 WHERE sd_id = $2";
        let queryParam = [param.fields, param.sd_id, param.userId];
        return await psqlAPM.fnDbQuery('updDocFieldValue', queryText, queryParam);
    }

    async updDocisSelected(param: any) {
        let queryText = "UPDATE waka.sop_document SET is_selected = $1, modified_on = now(), modified_by = $3 WHERE sd_id = $2";
        let queryParam = [param.is_selected, param.sd_id, param.userId];
        return await psqlAPM.fnDbQuery('updDocisSelected', queryText, queryParam);
    }

    async updCarrierisSelected(param: any) {
        let queryText = "UPDATE waka.sop_carrier SET is_selected = $1, modified_on = now(), modified_by = $3 WHERE sop_carrier_id = $2";
        let queryParam = [param.is_selected, param.sop_carrier_id, param.userId];
        return await psqlAPM.fnDbQuery('updCarrierisSelected', queryText, queryParam);
    }

    async copySOPPOBooking(param: any) {
        const queryText = "DELETE FROM sop_pob WHERE sop_id = " + param.to_sop_id + ";Insert INTO sop_pob (sop_id, pob_id, fields, created_by) SELECT " + param.to_sop_id + ", pob_id, fields, " + param.userId + " FROM sop_pob WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPPOBooking', queryText, []);
    }

    async copySOPCargoHandling(param: any) {
        const queryText = "DELETE FROM sop_ch WHERE sop_id = " + param.to_sop_id + ";Insert INTO sop_ch (sop_id, ch_id, fields, created_by) SELECT " + param.to_sop_id + ", ch_id, fields," + param.userId + " FROM sop_ch WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPCargoHandling', queryText, []);
    }

    async copySOPContainer(param: any) {
        const queryText = "DELETE FROM sop_container WHERE sop_id = " + param.to_sop_id + ";INSERT INTO sop_container (created_by,sop_id, container_id, min_cbm,optimal_cbm,max_cbm,preference,fcl_min,port_id_exception) SELECT " + param.userId + "," + param.to_sop_id + ", container_id, min_cbm,optimal_cbm,max_cbm,preference,fcl_min,port_id_exception FROM sop_container WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPContainer', queryText, []);
    }

    async copySOPCarrierAlloc(param: any) {
        const queryText = "DELETE FROM sop_carrier_allocations WHERE sop_id = " + param.to_sop_id + ";INSERT INTO sop_carrier_allocations (created_by,sop_id, origin_port_id, dest_port_id, carrier_id, contract_number,allocation_percent) SELECT " + param.userId + "," + param.to_sop_id + ",origin_port_id, dest_port_id, carrier_id, contract_number,allocation_percent FROM sop_carrier_allocations WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPCarrierAlloc', queryText, []);
    }

    async copySOPCarrierPref(param: any) {
        const queryText = "DELETE FROM sop_carrier_preference WHERE sop_id = " + param.to_sop_id + ";INSERT INTO sop_carrier_preference (created_by,sop_id, origin_port_id, dest_port_id, carrier_id, contract_number,preference) SELECT " + param.userId + "," + param.to_sop_id + ", origin_port_id, dest_port_id, carrier_id, contract_number,preference FROM sop_carrier_preference WHERE sop_id = " + param.from_sop_id + ";";
        // const queryParam = [param.from_sop_id, param.to_sop_id, param.userId];
        return await psqlAPM.fnDbQuery('copySOPCarrierPref', queryText, []);
    }

    // async delSOP(param:any){
    //     const queryText = "DELETE FROM waka.sop_carrier_preference WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_carrier_allocations WHERE sop_id = "+param.sop_id+";DELETE FROM sop_container WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_ch WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_pob WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_document WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_contacts_port WHERE sop_contact_id IN (SELECT sop_contact_id FROM sop_contacts WHERE sop_id = "+param.sop_id+");  DELETE FROM sop_contacts WHERE sop_id = "+param.sop_id+"; DELETE FROM sop_company WHERE sop_id = "+param.sop_id+"; DELETE FROM sop WHERE sop_id = "+param.sop_id+";";
    //     // const queryParam = [param.sop_id]
    //     return await psqlAPM.fnDbQuery('delSOP', queryText, []);
    // }

    async delSOP(param: any) {
        const queryText = "DELETE FROM waka.sop WHERE sop_id = $1;";
        const queryParam = [param.sop_id]
        return await psqlAPM.fnDbQuery('delSOP', queryText, queryParam);
    }
    async delSOPCountry(param: any) {
        const queryText = "DELETE FROM waka.sop_country WHERE sop_id = $1 AND origin_dest = $2";
        const queryParam = [param.sop_id, param.origin_dest];
        return await psqlAPM.fnDbQuery('delSOPCountry', queryText, queryParam);
    }

    async insSOPCountry(param: any) {
        const queryText = "INSERT INTO waka.sop_country (sop_id, origin_dest, created_by, country_id) SELECT $1, $2, $3, UNNEST(ARRAY[" + param.countryIds + "])";
        const queryParam = [param.sop_id, param.origin_dest, param.userId];
        return await psqlAPM.fnDbQuery('insSOPCountry', queryText, queryParam);
    }

    async getSOPCountries(sop_id: number) {
        const queryText = "SELECT sc.origin_dest, sc.country_id as country_code_id, c.name as country_name FROM waka.sop_country sc JOIN waka.country c ON c.country_id = sc.country_id WHERE sop_id = $1";
        const queryParam = [sop_id];
        return await psqlAPM.fnDbQuery('getSOPCountries', queryText, queryParam);
    }

    async getSOPServices(sop_id: number) {
        const queryText = "SELECT ss.sop_id,s.service_type_id, ln.lookup_name as service_type, COALESCE(ss.service_id,s.service_id) as service_id, COALESCE(ss.service_name,s.service_name) as service_name, CASE WHEN ss.sop_id is NULL THEN false ELSE true END is_selected, s.parent_service_id, s.is_mandatory FROM waka.services s JOIN waka.lookup_name ln ON ln.lookup_name_id = s.service_type_id LEFT JOIN waka.sop_services ss ON ss.service_id = s.service_id AND ss.sop_id = $1 ORDER BY s.service_type_id, s.service_id";
        const queryParam = [sop_id];
        return await psqlAPM.fnDbQuery('getSOPServices', queryText, queryParam);
    }

    async delSOPServices(sop_id: number) {
        const queryText = "DELETE FROM waka.sop_services WHERE sop_id = $1";
        const queryParam = [sop_id];
        return await psqlAPM.fnDbQuery('delSOPServices', queryText, queryParam);
    }

    async insSOPServices(param: any) {
        const queryText = "INSERT INTO waka.sop_services (created_by,sop_id,service_name,service_id) SELECT $1, * FROM jsonb_to_recordset($2) as x(sop_id INT, service_name VARCHAR, service_id INT) ON CONFLICT ON CONSTRAINT sop_services_sop_id_unq_name_service_id_key DO NOTHING";
        const queryParam = [param.userId, JSON.stringify(param.sopServiceColl)];
        return await psqlAPM.fnDbQuery('insSOPServices', queryText, queryParam);
    };

    async delSOPDoc(param: any) {
        const queryText = "DELETE FROM waka.sop_document WHERE sop_id = $1 AND origin_country_id = $2 AND destination_country_id = $3";
        const queryParam = [param.sop_id, param.origin_country_id, param.destination_country_id];
        return await psqlAPM.fnDbQuery('delSOPDoc', queryText, queryParam);
    }

    async getSOPCommunication(sop_id: number, instruction_type: string) {
        const queryText = "SELECT sopc.sop_communication_id, sopc.sop_id, sopc.communication_id, sopc.instruction, sopc.instruction_type, sopc.created_by, sopc.created_on, sopc.modified_by, sopc.modified_on, sopc.is_selected, (SELECT case when c.communication_id is null then false else true end as is_admin_ins) FROM waka.sop_communication sopc LEFT JOIN waka.communication c ON sopc.communication_id = c.communication_id WHERE sop_id = $1 AND sopc.instruction_type = $2 ORDER BY sopc.instruction ASC";
        const queryParam = [sop_id, instruction_type];
        return await psqlAPM.fnDbQuery('getSOPCommunication', queryText, queryParam);
    }

    async insShipmentTrackingIns(param: any) {
        const queryText = "INSERT INTO waka.sop_shipment_tracking_services (instruction, is_selected, sop_id, created_by) VALUES ($1,$2,$3,$4);";
        const queryParam = [param.instruction, param.is_selected, param.sop_id, param.userId];
        return await psqlAPM.fnDbQuery('getSOPShipmentTracking', queryText, queryParam);
    }

    async updShipmentTrackingIns(param: any) {
        const queryText = "UPDATE waka.sop_shipment_tracking_services SET is_selected = $1 WHERE sop_id = $2 AND sop_sts_id = $3";
        const queryParam = [param.is_selected, param.sop_id, param.sop_sts_id];
        return await psqlAPM.fnDbQuery('updShipmentTrackingIns', queryText, queryParam);
    }

    async insSOPCommunication(param: any) {
        const queryText = "INSERT INTO waka.sop_communication (sop_id, communication_id, instruction,created_by, instruction_type, is_selected) VALUES ($1,$2,$3,$4,$5,$6) returning sop_communication_id";
        const queryParam = [param.sop_id, param.communication_id, param.instruction, param.userId, param.instruction_type, param.is_selected];
        return await psqlAPM.fnDbQuery('insSOPCommunication', queryText, queryParam);
    }

    async updSOPCommunication(param: any) {
        const queryText = "UPDATE waka.sop_communication SET instruction = $1, modified_on = now(), modified_by = $2 WHERE sop_communication_id = $3";
        const queryParam = [param.instruction, param.userId, param.sop_communication_id];
        return await psqlAPM.fnDbQuery('updSOPCommunication', queryText, queryParam);
    }

    async delSOPCommunication(param: any) {
        const queryText = "DELETE FROM waka.sop_communication WHERE sop_communication_id = $1";
        const queryParam = [param.sop_communication_id];
        return await psqlAPM.fnDbQuery('delSOPCommunication', queryText, queryParam);
    }

    async getSOPCommunicationForPrint(sop_id: number, instruction_type: string) {
        const queryText = "SELECT sc.sop_communication_id, sc.sop_id, sc.instruction FROM waka.sop_communication sc WHERE sop_id = $1 AND instruction_type = $2 ORDER BY 1";
        const queryParam = [sop_id, instruction_type];
        return await psqlAPM.fnDbQuery('getSOPCommunicationForPrint', queryText, queryParam);
    }

    async getSOPStakeholdersForPrint(sop_id: number) {
        const queryText = "SELECT ss.stakeholder_id, c.company_name, ss.type_id, ln.lookup_name as company_type, con.valid_from, con.valid_to, con.contract_no, con.contract_id, co.name as country_name, c.country_id, lu.full_name as contact_name, lu.mobile, lu.email FROM waka.sop_stakeholder ss JOIN waka.company c ON ss.stakeholder_id = c.company_id JOIN waka.lookup_name ln ON ss.type_id = ln.lookup_name_id JOIN waka.contract con ON con.contract_id = ss.contract_id JOIN waka.country co ON co.country_id = c.country_id JOIN waka.login_user lu ON c.created_by = lu.user_id WHERE ss.sop_id = $1 order by 1;";
        const queryParam = [sop_id];
        return await psqlAPM.fnDbQuery('getSOPStakeholdersForPrint', queryText, queryParam);
    }

    async getSOPPOBForGroupForPrint(param: any) {
        let queryText = "SELECT sop_pob_id, spob.sop_id, spob.pob_id, pob.pob_seq, pob.sub_grp_seq, pob.sub_grp, pob.pob_name, pob.control_name, pob.has_child, pob.view_text, spob.fields,pob.ui_img_file_name,spob.is_selected FROM waka.po_booking as pob JOIN waka.sop_pob as spob ON spob.pob_id = pob.pob_id AND spob.sop_id = $2 WHERE NOT pob.is_deleted AND pob.grp=$1 ORDER BY 4,5"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPPOBForGroupForPrint', queryText, queryParam);
    }

    async getSOPCHForGroupForPrint(param: any) {
        let queryText = "SELECT sop_ch_id, sch.sop_id, sch.ch_id, ch.ch_seq, ch.sub_grp_seq, ch.sub_grp, ch.ch_name, ch.control_name, ch.has_child, ch.view_text, sch.fields,ch.ui_img_file_name,sch.is_selected FROM waka.cargo_handling as ch JOIN waka.sop_ch as sch ON sch.ch_id = ch.ch_id AND sch.sop_id = $2 WHERE NOT ch.is_deleted AND ch.grp=$1 ORDER BY 4,5"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCHForGroupForPrint', queryText, queryParam);
    }

    async getSOPDOCForGroupForPrint(param: any) {
        let queryText = "SELECT sd_id, sdoc.sop_port_id, sdoc.sop_id, sdoc.doc_id, doc.doc_seq, doc.sub_grp_seq, doc.sub_grp, doc.doc_name, doc.control_name, doc.has_child, doc.view_text, sdoc.fields,doc.ui_img_file_name, sdoc.is_selected FROM waka.documents as doc JOIN waka.sop_document as sdoc ON sdoc.doc_id = doc.doc_id AND sdoc.sop_id = $2 JOIN waka.vw_sop_port sp ON sdoc.sop_port_id = sp.sop_port_id WHERE NOT doc.is_deleted AND doc.grp=$1 ORDER BY 4,5"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPPOBForGroupForPrint', queryText, queryParam);
    }

    async getSOPCRForGroupForPrint(param: any) {
        let queryText = "SELECT sop_carrier_id, sc.sop_id, sc.carrier_id, c.carrier_seq, c.sub_grp_seq, c.sub_grp, c.carrier_name, c.control_name, c.has_child, c.view_text, sc.fields,c.ui_img_file_name,sc.is_selected FROM waka.carrier as c JOIN waka.sop_carrier as sc ON sc.carrier_id = c.carrier_id AND sc.sop_id = $2 WHERE NOT c.is_deleted AND c.grp = $1 ORDER BY 4,5"
        let queryParam = [param.grp, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPPOBForGroupForPrint', queryText, queryParam);
    }

    async getContactsEmailForPrint(param: any) {
        let queryText = "SELECT email FROM waka.contact_invite WHERE contact_invite_id = $1;"
        let queryParam = [param.contact_invite_id];
        return await psqlAPM.fnDbQuery('getContactsEmailForPrint', queryText, queryParam);
    }

    async getContracts(param: any) {
        let queryText = `SELECT c.*, com.company_name AS sh_name, com_p.company_name AS p_name, l.lookup_name AS sh_type, (SELECT case when a.event_id is null then false else true end as is_extend_validity FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = ${param.userId} AND (company_id = c.principal_id OR company_id = c.stakeholder_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'EXTEND_VALIDITY' LIMIT 1)) as a), (SELECT case when a.event_id is null then false else true end as is_download_document FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = ${param.userId} AND (company_id = c.principal_id OR company_id = c.stakeholder_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DOWNLOAD_DOCUMENT' LIMIT 1)) as a) FROM waka.contract c JOIN waka.company com ON c.stakeholder_id = com.company_id JOIN waka.company com_p ON c.principal_id = com_p.company_id JOIN waka.lookup_name l ON l.lookup_name_id = c.stakeholder_type_id WHERE c.principal_id IN (${param.accessible_companies}) OR c.stakeholder_id IN (${param.accessible_companies});`
        return await psqlAPM.fnDbQuery('getContracts', queryText, []);
    }

    async insContract(param: any) {
        const queryText = "INSERT INTO waka.contract (principal_id, stakeholder_id, stakeholder_type_id, valid_from, valid_to, contract_no, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING contract_id";
        const queryParam = [param.principal_id, param.stakeholder_id, param.stakeholder_type_id, param.valid_from, param.valid_to, param.contract_no, param.user_id];
        return await psqlAPM.fnDbQuery('insContract', queryText, queryParam);
    }

    async updateContract(param: any) {
        const queryText = "UPDATE waka.contract set principal_id = $1, stakeholder_id = $2, stakeholder_type_id = $3, valid_from = $4, valid_to = $5, contract_no = $6 where contract_id = $7;";
        const queryParam = [param.principal_id, param.stakeholder_id, param.stakeholder_type_id, param.valid_from, param.valid_to, param.contract_no, param.contract_id];
        return await psqlAPM.fnDbQuery('updateContract', queryText, queryParam);
    }

    async validateContract(param: any) {
        let queryText = "SELECT * FROM waka.contract WHERE lower(REGEXP_REPLACE(contract_no,'\\s+', '', 'g')) =  $1;";
        return await psqlAPM.fnDbQuery('validateContract', queryText, [param.contract_no]);
    }

    async updContractFileName(param: any) {
        const queryText = "UPDATE waka.contract SET uploaded_files = $1 WHERE contract_id = $2";
        const queryParam = [param.uploadedFileNames, param.contract_id];
        return await psqlAPM.fnDbQuery('uptContractFileName', queryText, queryParam);
    }

    async getSOPServiceChargeItemByGroup(param: any) {
        let queryText = "SELECT ssc.sop_service_charge_id, ssc.sop_id, ln.lookup_type_id as service_charge_id, ln.lookup_name_id as charge_item_id, ln.display_name as charge_item_name,ssc.charge_description, ssc.currency_id, ssc.uom, ssc.unit_rate, ssc.sop_port_id, false edit FROM waka.lookup_name as ln LEFT JOIN waka.sop_service_charges as ssc ON ssc.charge_item_id = ln.lookup_name_id AND ssc.sop_id = $1 AND ssc.sop_port_id = $3 WHERE ln.lookup_type_id = $2"
        let queryParam = [param.sop_id, param.service_charge_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('getSOPServiceChargeItemByGroup', queryText, queryParam);
    }

    async getSOPServiceChargeItemByPortPair(param: any) {
        let queryText = "SELECT ssc.sop_service_charge_id, ssc.sop_id, ln.lookup_type_id as service_charge_id, ln.lookup_name_id as charge_item_id, ln.display_name as charge_item_name,ssc.charge_description, ssc.currency_id, ssc.uom, ssc.unit_rate, ssc.sop_port_id, false edit FROM waka.lookup_name as ln LEFT JOIN waka.sop_service_charges as ssc ON ssc.charge_item_id = ln.lookup_name_id AND ssc.sop_id = $1 AND ssc.sop_port_id = $3 WHERE ln.lookup_type_id = $2"
        let queryParam = [param.sop_id, param.service_charge_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('getSOPServiceChargeItemByGroup', queryText, queryParam);
    }

    async getSOPServiceChargeSummary(param: any) {
        const queryText = "SELECT vsp.sop_id, vsp.sop_port_id, vsp.origin_port_id, vsp.origin_port, vsp.origin_country, vsp.dest_port_id, vsp.dest_port, vsp.dest_country, count(sop_service_charge_id) charge_items FROM waka.vw_sop_port vsp LEFT JOIN waka.sop_service_charges ssc ON ssc.sop_port_id = vsp.sop_port_id AND ssc.service_charge_id = $2 WHERE vsp.sop_id = $1  GROUP BY 1,2,3,4,5,6,7,8 ORDER BY 5,4,7,6";
        const queryParam = [param.sop_id, param.service_charge_id];
        return await psqlAPM.fnDbQuery('getSOPServiceChargeSummary', queryText, queryParam);
    }

    async insSOPServiceCharge(param: any) {
        const queryText = "INSERT INTO waka.sop_service_charges (sop_id, service_charge_id, charge_item_id, charge_description,sop_port_id, currency_id, uom, unit_rate, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning sop_service_charge_id";
        const queryParam = [param.sop_id, param.service_charge_id, param.charge_item_id, param.charge_description, param.sop_port_id, param.currency_id, param.uom, param.unit_rate, param.created_by];
        return await psqlAPM.fnDbQuery('insSOPServiceCharge', queryText, queryParam);
    }

    async updSOPServiceCharge(param: any) {
        const queryText = "UPDATE waka.sop_service_charges SET charge_description = $1, currency_id = $2, uom = $3, unit_rate = $4, modified_by = $5, modified_on = now() WHERE sop_service_charge_id = $6";
        const queryParam = [param.charge_description, param.currency_id, param.uom, param.unit_rate, param.created_by, param.sop_service_charge_id];
        return await psqlAPM.fnDbQuery('updSOPServiceCharge', queryText, queryParam);
    }

    async delSOPServiceCharge(param: any) {
        const queryText = "DELETE FROM waka.sop_service_charges WHERE sop_service_charge_id = $1";
        const queryParam = [param.sop_service_charge_id];
        return await psqlAPM.fnDbQuery('delSOPServiceCharge', queryText, queryParam);
    }

    async delContract(param: any) {
        const queryText = "DELETE FROM waka.contract WHERE contract_id = $1";
        const queryParam = [param.contract_id];
        return await psqlAPM.fnDbQuery('delContract', queryText, queryParam);
    }

    async insContractExtendData(param: any) {
        const queryText = "INSERT INTO waka.contract_files (contract_id, valid_from, valid_to, contract_no, uploaded_files, created_by) SELECT contract_id, valid_from, valid_to, contract_no, uploaded_files, created_by FROM waka.contract c WHERE c.contract_id = $1 RETURNING c_f_id";
        const queryParam = [param.contract_id];
        return await psqlAPM.fnDbQuery('delContract', queryText, queryParam);
    }

    async updExtendContractData(param: any) {
        const queryText = "UPDATE waka.contract SET valid_from = $1, valid_to = $2, uploaded_files = $3 WHERE contract_id = $4";
        const queryParam = [param.valid_from, param.valid_to, param.uploadedFileNames, param.contract_id];
        return await psqlAPM.fnDbQuery('uptContractFileName', queryText, queryParam);
    }

    async delSOPPort(param: any) {
        const queryText = "DELETE FROM waka.sop_port WHERE sop_port_id = $1";
        const queryText2 = "SELECT COUNT(origin_port_id)::int FROM waka.sop_port WHERE sop_id = $1 AND origin_port_id = $2";
        const queryText3 = "DELETE FROM waka.sop_orgin_port_details WHERE origin_port_id = $2 AND sop_id = $1";
        const queryParam = [param.sop_port_id];
        let delSOPPort = await psqlAPM.fnDbQuery('delSOPPort', queryText, queryParam);
        let OriginPortCount = await psqlAPM.fnDbQuery('CountCheck', queryText2, [param.sop_id, param.origin_port_id]);
        if (OriginPortCount.rows[0].count == 0) {
            await psqlAPM.fnDbQuery('delOriginPortDetails', queryText3, [param.sop_id, param.origin_port_id]);
        } 
        return delSOPPort;
    };

    async addSOPSHPort(param: any, origin_port_id: number) {
        const queryText = "INSERT INTO waka.sop_port (sop_id, principal_id, ff_id, origin_port_id, created_by,created_on, dest_port_id) SELECT $1, $2, $3, $4, $5, now(), UNNEST(ARRAY[" + param.destPortIds + "])";
        const queryText2 = "INSERT INTO waka.sop_orgin_port_details (port_name, sop_id, origin_port_id, created_by, created_on) SELECT port_name, $1, $2, $3, now() FROM waka.port p WHERE p.port_id = $2 ON CONFLICT ON CONSTRAINT sop_orgin_port_details_sop_id_origin_port_id_key DO NOTHING";
        const queryParam = [param.sop_id, param.principal_id, param.ff_id, origin_port_id, param.userId];
        const queryParam2 = [param.sop_id, origin_port_id, param.userId];
        await psqlAPM.fnDbQuery('addSOPOrginPortDetails', queryText2, queryParam2);
        return await psqlAPM.fnDbQuery('addSOPSHPort', queryText, queryParam);
    };

    async getSopPortFreeStorageDetails(param: any) {
        let queryText;
        if (param.reqType == 'Print') {
            queryText = "SELECT port_name AS origin_port, COALESCE(free_storage_days, 0) || ' Days' AS number_of_free_storage_days, ln.display_name AS validity_for_free_storage_days FROM waka.sop_orgin_port_details sopd JOIN waka.lookup_name ln ON ln.lookup_name_id = sopd.free_storage_days_validity WHERE sop_id = $1; "
        } else {
            queryText = "SELECT * FROM waka.sop_orgin_port_details WHERE sop_id = $1"
        }
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSopPortFreeStorageDetails', queryText, queryParam);
    }

    async addSopPortFreeStorageValidity(param: any) {
        let queryText = "UPDATE waka.sop_orgin_port_details SET free_storage_days_validity = $1 WHERE sop_opd_id = $2 AND sop_id = $3"
        let queryParam = [param.free_storage_days_validity, param.sop_opd_id, param.sop_id];
        return await psqlAPM.fnDbQuery('addSopPortFreeStorageValidity', queryText, queryParam);
    }

    async addSopPortFreeStorageDays(param: any) {
        let queryText = "UPDATE waka.sop_orgin_port_details SET free_storage_days = $1 WHERE sop_opd_id = $2 AND sop_id = $3"
        let queryParam = [param.free_storage_days, param.sop_opd_id, param.sop_id];
        return await psqlAPM.fnDbQuery('addSopPortFreeStorageDays', queryText, queryParam);
    }

    async getSopPortList(param: any) {
        let queryText = "SELECT sp.*, po.port_name as origin_port, pd.port_name as dest_port, po.country_id as origin_country_id, co.name as origin_country_name, pd.country_id as dest_country_id, cd.name as dest_country_name FROM waka.sop_port sp JOIN waka.port po ON sp.origin_port_id = po.port_id JOIN waka.port pd ON sp.dest_port_id = pd.port_id JOIN waka.country co on co.country_id = po.country_id JOIN waka.country cd on cd.country_id = pd.country_id WHERE sp.sop_id = $1 ORDER BY po.port_name ASC"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSopPortList', queryText, queryParam);
    }

    async getSopContainerWeightForPrint(param: any) {
        let queryText = "select iso_size_code as container_size, cs.max_cbm, cs.max_weight_kgs, sc.preference from waka.sop_container sc join waka.container_sizes cs on cs.container_id = sc.container_id where sop_id = $1 ORDER BY 4";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSopContainerWeightForPrint', queryText, queryParam);
    }

    async getCurrentContractByCompanyId(param: any) {
        let queryText = "SELECT principal_id,stakeholder_id, valid_from, valid_to, contract_no, contract_id FROM waka.contract WHERE principal_id = $1 AND stakeholder_id = $2 AND stakeholder_type_id = $3;"
        let queryParam = [param.pp_id, param.stakeholder_id, param.stakeholder_type_id];
        return await psqlAPM.fnDbQuery('getCurrentContractByCompanyId', queryText, queryParam);
    }

    async getSOPStakeholderList(param: any) {
        //let queryText = "SELECT ss.sop_stakeholder_id, ci.invitee_company_id company_id, ci.invitee_company_name company_name, ci.invitee_contact_name as name , ci.invitee_email as email, ci.invitee_company_type_id as company_type_id, lu.mobile, ln.lookup_name as company_type, ss.contract_id, c.country_id, con.name as country_name FROM waka.company_invite ci JOIN waka.lookup_name ln ON ci.invitee_company_type_id = ln.lookup_name_id JOIN waka.login_user lu ON ci.invitee_email = lu.email JOIN waka.company c ON c.company_id = ci.invitee_company_id JOIN waka.country con ON con.country_id = c.country_id LEFT JOIN waka.sop_stakeholder ss ON ci.invitee_company_id = ss.stakeholder_id AND ss.sop_id = $2 WHERE invited_company_id = $1;"
        let queryText = "SELECT ss.sop_stakeholder_id, a.stakeholder_id AS company_id, c.company_name, lu.full_name as name, lu.email, a.company_type_id, lu.mobile, ln.lookup_name as company_type, ss.contract_id, c.country_id, co.name as country_name FROM ( SELECT COALESCE(ci.invited_company_id, principal_id) AS principal_id, COALESCE(ci.invitee_company_id, stakeholder_id) AS stakeholder_id, COALESCE(ci.invitee_company_type_id, stakeholder_type_id) AS company_type_id from waka.company_invite ci FULL JOIN waka.contract con ON ci.invitee_company_id = con.stakeholder_id AND ci.invited_company_id = con.principal_id WHERE (principal_id = $1 OR invited_company_id = $1) GROUP BY 1,2,3) a JOIN waka.lookup_name ln ON a.company_type_id = ln.lookup_name_id JOIN waka.company c ON c.company_id = a.stakeholder_id JOIN waka.login_user lu ON c.created_by = lu.user_id JOIN waka.country co ON co.country_id = c.country_id LEFT JOIN waka.sop_stakeholder ss ON a.stakeholder_id = ss.stakeholder_id AND ss.sop_id = $2";
        let queryParam = [param.principal_id, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPStakeholderList', queryText, queryParam);
    }

    async getFFListForAddSOP(param: any) {
        let queryText = "SELECT ci.invitee_company_id company_id, ci.invitee_company_name company_name, ci.invitee_company_type_id as company_type_id, ci.is_accepted , ln.lookup_name as company_type FROM waka.company_invite ci JOIN waka.lookup_name ln ON ci.invitee_company_type_id = ln.lookup_name_id WHERE invited_company_id = $1 AND ln.lookup_name = 'Logistics Provider/Freight Forwarder'";
        let queryParam = [param.principal_id];
        return await psqlAPM.fnDbQuery('getSOPFreightForwarder', queryText, queryParam);
    }

    async insNewSOPStakeholders(param: any) {
        let queryText = "INSERT INTO waka.sop_stakeholder (sop_id, stakeholder_id,type_id,country_id,contract_id,created_by) SELECT * FROM jsonb_to_recordset($1) as x(sop_id int, stakeholder_id int, type_id int, country_id int, contract_id int, created_by int) ON CONFLICT ON CONSTRAINT sop_stakeholder_sop_id_stakeholder_id_type_id_key DO NOTHING";
        let queryParam = [JSON.stringify(param.stakeholders)];
        return await psqlAPM.fnDbQuery('insNewSOPStakeholders', queryText, queryParam);
    }
    
    async updSOPStakeholders(param: any) {
        let queryText = "UPDATE waka.sop_stakeholder SET contract_id = $1, modified_by = $3, modified_on = now() WHERE sop_stakeholder_id = $2";
        let queryParam = [param.contract_id, param.sop_stakeholder_id, param.userId];
        return await psqlAPM.fnDbQuery('updSOPStakeholders', queryText, queryParam);
    }

    async getSopPortCount(param: any) {
        let queryText = "SELECT count(sop_port_id) FROM waka.sop_port sp WHERE sp.sop_id=$1";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSopPortCount', queryText, queryParam);
    }

    async updContractFiles(param: any) {
        const queryText = "UPDATE waka.contract SET uploaded_files = $1 WHERE contract_id = $2";
        const queryParam = [param.uploadedFileNames, param.contract_id];
        return await psqlAPM.fnDbQuery('updContractFiles', queryText, queryParam);
    }

    async insSOPServicesOnSOPCreation(param: any) {
        const queryText = "INSERT INTO waka.sop_services (created_by,sop_id,service_name,service_id) SELECT $1, $2, service_name, service_id FROM waka.services WHERE is_mandatory ON CONFLICT ON CONSTRAINT sop_services_sop_id_unq_name_service_id_key DO NOTHING";
        const queryParam = [param.userId, param.sop_id];
        return await psqlAPM.fnDbQuery('insSOPServicesOnSOPCreation', queryText, queryParam);
    };

    async getSOPConsigneeContacts(param: any) {
        const queryText = "SELECT ci.contact_invite_id, s.principal_id, c.company_id, c.company_name, c.country_id, ci.contact_name, ci.email, ci.mobile, con.name AS country_name FROM waka.sop s JOIN waka.company c ON s.principal_id = c.company_id OR s.principal_id = c.parent_company_id JOIN waka.contact_invite ci ON ci.company_id = c.company_id LEFT JOIN waka.country con ON con.country_id = c.country_id WHERE s.sop_id = $1 AND ci.is_accepted = TRUE AND ci.is_revoked = false";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPConsigneeContacts', queryText, queryParam);
    };

    async getSOPFFContacts(param: any) {
        const queryText = "SELECT ci.contact_invite_id, s.ff_id, c.company_id, c.company_name, c.country_id, ci.contact_name, ci.email, ci.mobile, con.name AS country_name FROM waka.sop s JOIN waka.company c ON s.ff_id = c.company_id OR s.ff_id = c.parent_company_id JOIN waka.contact_invite ci ON ci.company_id = c.company_id LEFT JOIN waka.country con ON con.country_id = c.country_id WHERE s.sop_id = $1 AND ci.is_accepted = TRUE AND ci.is_revoked = false";
        const queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPConsigneeContacts', queryText, queryParam);
    };

    async insSOPCarrierAllocation(param: any) {
        const queryText = "INSERT INTO waka.sop_carrier_allocation (sop_id, sop_port_id, effective_start_date, effective_end_date, allocated_by, carrier, allocation_type, allocation_interval, unit_of_allocation, service_type, allocation_value, carrier_preference, created_by, created_on) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())";
        const queryParam = [param.sop_id, param.sop_port_id, param.effective_start_date, param.effective_end_date, param.allocated_by, param.carrier, param.allocation_type, param.allocation_interval, param.unit_of_allocation, param.service_type, JSON.stringify(param.allocation_value), param.carrier_preference, param.userId];
        return await psqlAPM.fnDbQuery('insSOPCarrierAllocation', queryText, queryParam);
    }

    async updCAFieldValue(param: any) {
        const queryText = "UPDATE waka.sop_carrier_allocation SET allocation_value = $1 WHERE sop_id = $2 AND sop_port_id = $3;";
        const queryParam = [JSON.stringify(param.allocation_value), param.sop_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('updCAFieldValue', queryText, queryParam);
    }

    async updSOPCarrierAllocation(param: any) {
        const queryText = "UPDATE waka.sop_carrier_allocation SET effective_start_date = $1, effective_end_date = $2, allocated_by = $3, carrier = $4 , allocation_type = $5, allocation_interval = $6, unit_of_allocation = $7, service_type = $8, allocation_value = $9, carrier_preference = $13, created_by = $12 WHERE sop_id = $10 AND sop_port_id = $11;";
        const queryParam = [param.effective_start_date, param.effective_end_date, param.allocated_by, param.carrier, param.allocation_type, param.allocation_interval, param.unit_of_allocation, param.service_type, JSON.stringify(param.allocation_value), param.sop_id, param.sop_port_id, param.userId, param.carrier_preference];
        return await psqlAPM.fnDbQuery('updSOPCarrierAllocation', queryText, queryParam);
    }

    async getSOPCarrierList(param: any) {
        //const queryText = "select contract_id,stakeholder_id,stakeholder_type_id,c.company_name  from waka.contract con JOIN waka.company c ON c.company_id = con.stakeholder_id where principal_id = $1 AND stakeholder_id NOT IN (select invitee_company_id FROM waka.company_invite where invited_company_id = $1)";
        const queryText = " select con.contract_id,con.contract_no,con.stakeholder_id,con.stakeholder_type_id,c.company_name,valid_from,valid_to from waka.contract con JOIN waka.company c ON c.company_id = con.stakeholder_id JOIN waka.sop_stakeholder ss ON ss.stakeholder_id = con.stakeholder_id AND ss.contract_id = con.contract_id where principal_id = $1 AND ss.sop_id = $2 AND con.stakeholder_id NOT IN (select invitee_company_id FROM waka.company_invite where invited_company_id = $1)";
        const queryParam = [param.principal_id, param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierList', queryText, queryParam);
    }

    async getSOPCarrierForSOPPrint(param: any) {
        const queryText = "select con.contract_id, con.stakeholder_id, 'value_'||con.stakeholder_id as allocation_value_id, c.company_name, con.contract_no, (select allocation_value FROM waka.sop_carrier_allocation where sop_port_id = $3), (select unit_of_allocation FROM waka.sop_carrier_allocation where sop_port_id = $3) from waka.contract con JOIN waka.company c ON c.company_id = con.stakeholder_id JOIN waka.sop_stakeholder ss ON ss.stakeholder_id = con.stakeholder_id AND ss.contract_id = con.contract_id where principal_id = $1 AND ss.sop_id = $2 AND con.stakeholder_id IN (select unnest(carrier) FROM waka.sop_carrier_allocation where sop_port_id = $3)";
        const queryParam = [param.principal_id, param.sop_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierForSOPPrint', queryText, queryParam);
    }

    async getSOPCarrierAllocation(param: any) {
        const queryText = "SELECT * from waka.sop_carrier_allocation WHERE sop_id = $1 AND sop_port_id = $2";
        const queryParam = [param.sop_id, param.sop_port_id];
        return await psqlAPM.fnDbQuery('getSOPCarrierAllocation', queryText, queryParam);
    }

    async getAllocationIntervals() {
        const queryText = "select * from waka.carrier_allocation_interval";
        return await psqlAPM.fnDbQuery('getAllocationIntervals', queryText, []);
    }

    async saveCarrierPreference(param: any) {
        const queryText = "UPDATE waka.sop_carrier_allocation SET carrier_preference = $2 WHERE sop_ca_id = $1";
        const queryParam = [param.sop_ca_id, param.carrier_preference];
        return await psqlAPM.fnDbQuery('saveCarrierPreference', queryText, queryParam);
    }

    async getSOPSCHINVForGroupForPrint(param: any) {
        let queryText = "SELECT ssi_id, ssi.sop_id, sci.invoice_seq, sci.sub_grp_seq, sci.sub_grp, sci.invoice_name, sci.control_name, sci.has_child, sci.view_text, ssi.fields , sci.ui_img_file_name, false as expand FROM waka.service_charges_inv as sci LEFT JOIN waka.sop_sch_inv as ssi ON ssi.sci_id = sci.sci_id AND ssi.sop_id = $1 WHERE NOT sci.is_deleted ORDER BY 4,5;"
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getSOPPOBForGroupForPrint', queryText, queryParam);
    }
    
    async getShipmentTrackingIns(param: any) {
        let queryText = "SELECT sts.sop_sts_id, sts.instruction, sts.is_selected FROM waka.sop_shipment_tracking_services sts WHERE sts.sop_id = $1";
        let queryParam = [param.sop_id];
        return await psqlAPM.fnDbQuery('getShipmentTrackingIns', queryText, queryParam);
    }

    async getEventsSubModulesWise (param: any){
        let queryText = "SELECT jsonb_agg(DISTINCT jsonb_build_object ('event_name',event_name,'status',true)) as event_names, jsonb_agg(DISTINCT jsonb_build_object ('event_description',event_description,'status',true)) as event_descriptions, jsonb_agg(DISTINCT jsonb_build_object ('section_name',section_name,'status',true)) as section_names FROM waka.event_master WHERE em_id IN (SELECT event_id FROM waka.role_module_event_mapping WHERE rmm_id IN (SELECT rmm_id FROM waka.role_module_mapping_new WHERE role_id IN (SELECT role_id FROM waka.role_user_mapping WHERE company_id = $1) AND sub_module_id IN (SELECT sub_module_id FROM waka.sub_modules_list WHERE sub_module_name = $2)));";
        let queryParam = [param.company_id, param.sub_module_name];
        return await psqlAPM.fnDbQuery('getEventsSubModulesWise', queryText, queryParam);
    }

    async copyDataforServiceCharges(param: any) {
        let insertCount = 0;
        for(let copyto in param.copy_to_portpairs) {
            let queryText = `INSERT INTO waka.sop_service_charges (sop_id, service_charge_id, charge_item_id, charge_description, sop_port_id, currency_id, unit_rate, created_by, created_on, uom) SELECT sop_id, service_charge_id, charge_item_id, charge_description, ${param.copy_to_portpairs[copyto]}, currency_id, unit_rate, ${param.userId}, NOW(), uom FROM waka.sop_service_charges WHERE service_charge_id = ${param.service_charge_id} AND sop_port_id = ${param.sop_port_id} AND sop_id = ${param.sop_id};`;
            let insert = await psqlAPM.fnDbQuery(`copyDataforServiceCharges + ${param.copy_to_portpairs[copyto]}`, queryText, []);
            if(insert.rowCount > 0) {
                insertCount += 1;
            } else {
                return await psqlAPM.fnDbQuery('copyDataforServiceCharges', queryText, []);
            }
        };
        if(insertCount == param.copy_to_portpairs.length) {
            return { success : true, rowCount: insertCount, rows: [] }
        }
    }

    async delSOPServiceChargesbyPort(param: any) {
        let queryText = `DELETE FROM waka.sop_service_charges WHERE sop_service_charge_id IN (SELECT sop_service_charge_id FROM waka.sop_service_charges WHERE sop_id = ${param.sop_id} AND sop_port_id IN (${param.copy_to_portpairs}) AND service_charge_id = ${param.service_charge_id})`;
        return await psqlAPM.fnDbQuery('delSOPServiceChargesbyPort', queryText, []);
    }

     async checkCreateCommIns(param: any) {
        let queryText = `SELECT COUNT(*) as comm_ins_count FROM waka.sop_communication WHERE sop_id = $1 AND instruction_type = $2;`;
        let queryParam = [param.sop_id, param.instruction_type]
        return await psqlAPM.fnDbQuery('checkCreateCommIns', queryText, queryParam);
    }

    async createSOPCommuniation(param: any) {
        let queryText = `INSERT INTO waka.sop_communication (sop_id, communication_id, instruction, instruction_type, created_by) SELECT ${param.sop_id}, communication_id, instruction, instruction_type, ${param.userId} FROM waka.communication WHERE instruction_type = $1`;
        let queryParam = [param.instruction_type]
        return await psqlAPM.fnDbQuery('createSOPCommuniation', queryText, queryParam);
    }

    async addremoveCommunicationIns(param: any) {
        let queryText = `UPDATE waka.sop_communication SET is_selected = $2, modified_on = NOW(), modified_by = $3 WHERE sop_communication_id = $1`;
        let queryParam = [param.sop_communication_id, param.is_selected, param.userId]
        return await psqlAPM.fnDbQuery('addremoveCommunicationIns', queryText, queryParam);
    }
}


