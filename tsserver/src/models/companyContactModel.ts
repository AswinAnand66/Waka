const psqlAPM = require('./psqlAPM');
export class CompanyContactModel {
    constructor(){ };
    
    async validateCompanyOwner(param: any){
        let queryText = "SELECT company_id,company_name,owned_by,office_category_id FROM waka.company where lower(REGEXP_REPLACE(company_name,'\\s+', '', 'g')) = $1 ORDER BY created_on ASC";
        let queryParam = [param.company_name];
        return await psqlAPM.fnDbQuery('validateCompanyOwner', queryText, queryParam);
    }
    
    async validateCompanyName(param: any){
        if (param.company_id == undefined) {
            let queryText = "SELECT company_id FROM waka.company WHERE lower(REGEXP_REPLACE(company_name,'\\s+', '', 'g')) = $1 AND office_category_id = $2";
            return await psqlAPM.fnDbQuery('validateCompanyName', queryText, [param.company_name, param.office_type]);
        } else {
            let queryText = "SELECT company_id FROM waka.company WHERE lower(REGEXP_REPLACE(company_name,'\\s+', '', 'g')) = $1 AND office_category_id = $2 AND company_id <> $3";
            return await psqlAPM.fnDbQuery('validateCompanyName', queryText, [param.company_name, param.office_type, param.company_id]);
              }
    }

    async getAddressTypeList(){
        let queryText = "SELECT ln.lookup_name_id, ln.lookup_name, ln.display_name FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE lt.lookup_type = 'address_type'";
        return await psqlAPM.fnDbQuery('getAddressTypeList', queryText, []);
    }

    async getParentCompanyList(userIds:number){
        let queryText = `SELECT company_id, company_name FROM waka.company WHERE parent_company_id is null AND owned_by IN (${userIds})`;
        // let queryParam = [userIds];
        return await psqlAPM.fnDbQuery('getParentCompanyList', queryText, []);
    }

    async getTaxRegistrationList(userId:number){
        let queryText = "SELECT ln.lookup_name_id, ln.lookup_name, ln.display_name FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE lt.lookup_type = 'registration_type'";
        return await psqlAPM.fnDbQuery('getTaxRegistrationList', queryText, []);
    }

    async getCountryListForCompany(){
        let queryText = "SELECT country_id, name, iso3, iso2 FROM waka.country order by name";
        return await psqlAPM.fnDbQuery('getCountryListForCompany', queryText, []);
    }

    async getStateListForCompany(country_id:number){
        let queryText = "SELECT state_id, name, country_id FROM waka.state WHERE country_id = $1";
        return await psqlAPM.fnDbQuery('getStateListForCompany', queryText, [country_id]);
    }

    async getCityListForCompany(state_id:number){
        let queryText = "SELECT city_id, name, state_id, country_id FROM waka.city WHERE state_id = $1";
        return await psqlAPM.fnDbQuery('getCityListForCompany', queryText, [state_id]);
    }

    async getOfficeTypeList(){
        let queryText = "SELECT ln.lookup_name_id, ln.lookup_name, ln.display_name FROM waka.lookup_name ln JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE lt.lookup_type = 'office_category'";
        return await psqlAPM.fnDbQuery('getOfficeTypeList', queryText, []);
    }

    async getAllInvitedCompanyForCountry(param:any){
        let queryText = "SELECT c.company_name, a.company_id, ln.lookup_name company_type, ln.lookup_name_id company_type_id, con.name as country_name,ca.country_id, ca.name, ca.email,ca.mobile FROM (SELECT distinct ci.invited_company_id as company_id, ci.invited_company_type_id as company_type_id FROM waka.company_invite ci JOIN waka.lookup_name ln ON ci.invited_company_type_id = ln.lookup_name_id AND ci.invited_company_id IN (select invited_company_id FROM waka.company_invite WHERE invited_user_id = $1 OR invitee_user_id =$1) UNION SELECT distinct ci.invitee_company_id, ci.invitee_company_type_id FROM waka.company_invite ci JOIN waka.lookup_name ln ON ci.invitee_company_type_id = ln.lookup_name_id WHERE ci.invited_company_id IN (select invited_company_id FROM waka.company_invite WHERE invitee_user_id = $1 OR invited_user_id = $1)) as a JOIN waka.company c ON c.company_id = a.company_id JOIN waka.lookup_name ln ON ln.lookup_name_id = a.company_type_id JOIN waka.company_address ca ON ca.company_id = a.company_id JOIN waka.country con ON con.country_id = ca.country_id WHERE ca.address_type_id = (SELECT lookup_name_id from waka.lookup_name WHERE lookup_name ='communication') AND ca.country_id IN (";
        param.countryIds.map((id: number,i: number)=>{
            if (i != 0) queryText += ","
            queryText += id;
        });
        queryText +=")";
        let queryParam = [param.userId];
        return await psqlAPM.fnDbQuery('getAllInvitedCompanyForCountry', queryText, queryParam);
    }

    async getBuyer (userId:number){
        const queryText = "SELECT sq.company_id, c.company_name, sq.company_type_id FROM (select invitee_company_id as company_id, invitee_company_type_id as company_type_id from waka.company_invite WHERE (invited_company_id IN (SELECT company_id FROM my_company WHERE user_id = $1 AND office_category = 'head quarters') OR invitee_company_id IN (SELECT company_id FROM my_company WHERE user_id = $1 AND office_category = 'head quarters')) AND invitee_company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='Consignee') UNION select invited_company_id as company_id, invited_company_type_id as company_type_id from waka.company_invite WHERE (invited_company_id IN (SELECT company_id FROM my_company WHERE user_id = $1 AND office_category = 'head quarters') OR invitee_company_id IN (SELECT company_id FROM my_company WHERE user_id = $1 AND office_category = 'head quarters')) AND invited_company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='Consignee')) as sq JOIN waka.company c on c.company_id = sq.company_id;";        
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getBuyer', queryText, queryParam);
    };

    async getFF(userId:number) {
        let queryText = "SELECT sq.company_id, c.company_name, sq.company_type_id FROM (select invitee_company_id as company_id, invitee_company_type_id as company_type_id from waka.company_invite WHERE (invited_company_id IN (SELECT company_id FROM my_company WHERE user_id =$1 AND office_category = 'head quarters') OR invitee_company_id IN (SELECT company_id FROM my_company WHERE user_id =$1 AND office_category = 'head quarters')) AND invitee_company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='Freight Forwarder') UNION select invited_company_id as company_id, invited_company_type_id as company_type_id from waka.company_invite WHERE (invited_company_id IN (SELECT company_id FROM my_company WHERE user_id =$1 AND office_category = 'head quarters') OR invitee_company_id IN (SELECT company_id FROM my_company WHERE user_id =$1 AND office_category = 'head quarters')) AND invited_company_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='Freight Forwarder')) as sq JOIN waka.company c on c.company_id = sq.company_id;";
        let queryParam:any = [userId];
        return await psqlAPM.fnDbQuery('getFF', queryText, queryParam);
    }

    async getCarrier() {
        let queryText = "SELECT c.company_id, c.company_name, c.company_local_name, c.company_type_id, ln.lookup_name as company_type, ca.country_id, co.name as country_name FROM waka.company c JOIN waka.lookup_name ln ON ln.lookup_name_id = c.company_type_id JOIN waka.company_address ca ON ca.company_id = c.company_id AND ca.address_type_id IN (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='communication') JOIN waka.country co on co.country_id=ca.country_id WHERE ln.lookup_name IN ('Carrier')";
        let queryParam:any = [];
        return await psqlAPM.fnDbQuery('getCarrier', queryText, queryParam);
    }
    //not used after 18-10-2021
    async insCompany_old(param:any) {
        let queryText,queryParam;
        if (!param.inviteCompany) {
            queryText = "INSERT INTO waka.company (company_name, parent_company_id, office_category_id, company_type_id, company_local_name, website_address, company_logo_path, created_by, owned_by, is_deleted, created_on, company_invite_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, false, now(), $9) returning company_id";
            queryParam = [param.company_name, param.parent_company, param.office_type, param.company_type_id, param.company_local_name, param.company_website, param.relative_path, param.user_id, param.company_invite_id];
        } else {
            queryText = "INSERT INTO waka.company (company_name, company_type_id, created_by, owned_by) VALUES ($1, $2, $3,$4) returning company_id";
            queryParam = [param.company_name, param.company_type, param.user_id];
        }
        return await psqlAPM.fnDbQuery('insCompany_old', queryText, queryParam);
    }

	
    async insCompany(param:any) {
        let queryText,queryParam;
        if (!param.invite_company) {
            queryText = "INSERT INTO waka.company (company_name, company_type_id, office_category_id, parent_company_id, company_logo_path, website_address, owned_by, created_by, company_invite_id, country_id, state_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10) returning company_id";
            queryParam = [param.company_name, param.company_type_id, param.office_type, param.parent_company, param.relative_path, param.company_website, param.user_id, param.company_invite_id, parseInt(param.country_id), parseInt(param.state_id)];
        } else {
            queryText = "INSERT INTO waka.company (company_name, company_type_id, created_by, owned_by) VALUES ($1, $2, $3, $3) returning company_id";
            queryParam = [param.company_name, param.company_type, param.user_id];
        }
        return await psqlAPM.fnDbQuery('insCompany', queryText, queryParam);
    }

    async getCompanyBasicDetails(param:any){
        let queryText = "SELECT * FROM waka.company WHERE company_id =$1;"
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getCompanyBasicDetails', queryText, queryParam);
    }
    
    async delCompanyParent(company_id:number){
        const queryText = "DELETE FROM waka.company WHERE company_id = $1";
        const queryParam = [company_id];
        return await psqlAPM.fnDbQuery('delInviteCompanyPerm', queryText, queryParam);
    } 

    async addInviteCompanyDetails(param:any){
        let queryText = "INSERT INTO waka.company_invite (invited_company_id, invited_user_id,invitee_company_name,invitee_contact_name,invitee_email,invitee_user_id,invitee_company_type_id,invited_company_type_id, invitee_company_id, created_by, poi_master_error_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning company_invite_id";

        let queryParam = [param.invited_company_id, param.userId, param.invitee_company_name, param.invitee_contact_name, param.invitee_email, param.invitee_user_id, param.invitee_company_type_id, param.invited_company_type_id, param.invitee_company_id, param.userId, param.poi_master_error_id];
        return await psqlAPM.fnDbQuery('addInviteCompanyDetails', queryText, queryParam);
    }

    async checkPrevCompInvit(param:any){
        let queryText = "SELECT company_invite_id FROM waka.company_invite WHERE invited_company_id = $1 AND LOWER(REPLACE(invitee_company_name,' ','')) = LOWER(REPLACE($2,' ',''));";
        let queryParam = [param.invited_company_id, param.invitee_company_name];
        return await psqlAPM.fnDbQuery('checkPrevCompInvit', queryText, queryParam);
    }

    async addInviteCompanyModules(param:any){
        let queryText = "INSERT INTO waka.company_invited_modules (company_invite_id, module_id) SELECT " + param.company_invite_id +", UNNEST(ARRAY["+param.shared_modules +"])";   
        return await psqlAPM.fnDbQuery('addInviteCompanyModules', queryText, []);
    };

    async updInviteCompanyModules (param:any){
        let queryText = "UPDATE waka.company_invited_modules SET module_id = " + param.shared_modules +" where company_invite_id = "+param.company_invite_id+";";        
        return await psqlAPM.fnDbQuery('updInviteCompanyModules', queryText, []);
  };

    async insCompanyContact(param:any) {
        let queryText = "INSERT INTO waka.contact_invite (company_id, contact_name, email, mobile, invitee_user_id, created_by, created_on) VALUES ($1, $2, $3, $4, $5, $6, NOW());"
        let queryParam = [param.company_id, param.name, param.email, param.mobile, param.invitee_user_id, param.userId]
        return await psqlAPM.fnDbQuery('addInviteContact', queryText, queryParam);
    }

    async insUserEventMapping(param:any){
        let queryText;
        if(param.invitee_user_id != undefined) {
            queryText = "INSERT INTO waka.role_user_mapping (company_id,assigned_user_id,email,role_id,created_by,created_on) VALUES "
            for(let idx in param.role_ids){
                queryText += `(${param.company_id},${param.invitee_user_id},'${param.email}',${param.role_ids[idx]},${param.userId},NOW())`
                if (parseInt(idx) < param.role_ids.length - 1){
                    queryText += ','
                }
            }
        } else {
            queryText = "INSERT INTO waka.role_user_mapping (company_id,email,role_id,created_by,created_on) VALUES "
            for(let idx in param.role_ids){
                queryText += `(${param.company_id},'${param.email}',${param.role_ids[idx]},${param.userId},NOW())`
                if (parseInt(idx) < param.role_ids.length - 1){
                    queryText += ','
                }
            }
        }
        
        queryText += ';'
        return await psqlAPM.fnDbQuery('insUserEventMapping', queryText, []);
    }

    async deleteUserEventMapping(param:any){
        let queryText = "DELETE FROM waka.role_user_mapping WHERE company_id = $1 AND assigned_user_id = $2"
        let queryParam = [param.company_id,param.invitee_user_id];
        return await psqlAPM.fnDbQuery('insUserEventMapping', queryText, queryParam);
    }

    // async updUserEventMapping(param:any){
    //     let queryText = "UPDATE waka.role_user_mapping SET role_id =$1, event_ids = (SELECT array_agg(event_id) as event_ids FROM waka.role_module_event_mapping WHERE rmm_id IN (SELECT rmm_id from waka.role_module_mapping_new WHERE role_id = $1)), modified_by = $2, modified_on = NOW() WHERE invitee_user_id = $3;"
    //     let queryParam = [param.role_id,param.userId,param.invitee_user_id];
    //     return await psqlAPM.fnDbQuery('insUserEventMapping', queryText, queryParam);
    // }

    async updCompanyContact(param:any){
        let queryText = "UPDATE waka.contact_invite SET contact_name = $1, mobile = $2 , modified_by = $3, modified_on = NOW() where contact_invite_id = $4";
        let queryParam = [param.name, param.mobile, param.userId, param.contact_invite_id];
        return await psqlAPM.fnDbQuery('updCompanyContact', queryText, queryParam);
    }

    async delCompanyContactPerm(param:any){
        const queryText = "DELETE FROM waka.contact_invite WHERE contact_invite_id = $1";
        let queryParam =  [param.contact_invite_id];
        return await psqlAPM.fnDbQuery('delInviteCompanyPerm', queryText, queryParam);
    }

    async delCompanyContact_old(param:any){
        let queryText;
        if (param.type == 'retrieve') {
            queryText = "UPDATE waka.contact_invite SET is_deleted = false WHERE contact_invite_id = $1";
        } else {
            queryText = "UPDATE waka.contact_invite SET is_deleted = true WHERE contact_invite_id = $1";
        }
        let queryParam =  [param.contact_invite_id];
        return await psqlAPM.fnDbQuery('delCompanyContact', queryText, queryParam);
    }

    async delInviteCompanyPerm(companyInviteId:number){
        const queryText = "DELETE FROM waka.company_invite WHERE company_invite_id = $1";
        const queryParam = [companyInviteId];
        return await psqlAPM.fnDbQuery('delInviteCompanyPerm', queryText, queryParam);
    }

    //not used after 18-10-2021
    async delInviteCompany(param:any){
        let queryText;
        if (param.type == 'retrieve') {
            queryText = "UPDATE waka.company_invite SET is_deleted = false WHERE company_invite_id = $1";
        } else {
            queryText = "UPDATE waka.company_invite SET is_deleted = true WHERE company_invite_id = $1";
        }
        let queryParam =  [param.company_invite_id];
        return await psqlAPM.fnDbQuery('delInviteCompany', queryText, queryParam);
    }
 
    async updInviteCompany(param:any) {
        let queryText = "UPDATE waka.company_invite set invitee_company_name = $1, invitee_contact_name = $2,invitee_company_type_id = $3, invited_company_type_id =  $4 where company_invite_id = $5";
        let queryParam = [param.invitee_company_name, param.invitee_contact_name, param.invitee_company_type_id, param.invited_company_type_id, param.company_invite_id];
        return await psqlAPM.fnDbQuery('updInviteCompany', queryText, queryParam);
    }

    async getCompanyTypeList() {
        let queryText = "SELECT ln.lookup_name as name, ln.lookup_name_id as lookup_id from waka.lookup_name ln JOIN waka.lookup_type lt on ln.lookup_type_id = lt.lookup_type_id WHERE lt.lookup_type = 'account_type';";
        return await psqlAPM.fnDbQuery('getCompanyTypeList', queryText, []);
    };

    async getInviteCompanyLicensedModulesList_old(param:any) {
        let queryText = "select cl.cl_id, m.* as module_name from waka.company_lic_module clm JOIN waka.company_license cl on cl.cl_id = clm.cl_id join waka.modules m ON m.module_id = clm.module_id where cl.company_id = $1 group by cl.cl_id, m.module_id;";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getInviteCompanyLicensedModulesList', queryText, queryParam);
    };

    async getModulesForRoles() {
        let queryText = "SELECT ml.module_id, ml.module_name, ml.seq, ml.icon, ml.table_reference FROM waka.modules_list ml WHERE is_visible AND ml.module_name != 'Home';"
        return await psqlAPM.fnDbQuery('getModulesForRoles', queryText, []);
    };

    async getSubModulesForRoles(param:any){
        let queryText = `SELECT ml.module_name, ml.module_id, jsonb_agg(DISTINCT jsonb_build_object('sub_module_id',sml.sub_module_id,'module_id',sml.module_id,'sub_module_name',sml.sub_module_name,'seq',sml.seq,'sub_module_description',sml.sub_module_description,'icon',sml.icon,'disabled',CASE WHEN em.sub_module_id is null THEN true ELSE false END)) as sub_modules FROM waka.sub_modules_list sml JOIN waka.modules_list ml ON ml.module_id = sml.module_id LEFT JOIN waka.event_master em ON sml.sub_module_id = em.sub_module_id WHERE sml.module_id IN (SELECT module_id FROM waka.modules_list WHERE is_visible) AND sml.is_admin_owned = false AND sml.is_visible GROUP BY 1,2 ORDER BY ml.seq;`
        return await psqlAPM.fnDbQuery('getModulesForRoles', queryText, []);
    }

    async getInviteCompanySharedLicensedModulesList(param:any) {
        let queryText = "SELECT m.* as module_name , cim.module_id FROM waka.company_invited_modules cim JOIN waka.modules m on m.module_id = cim.module_id WHERE company_invite_id =  $1;" 
        let queryParam = [param.company_invite_id];
        return await psqlAPM.fnDbQuery('getInviteCompanySharedLicensedModulesList', queryText, queryParam);
    }; 

    async getCompanyContactDetails_old(param:any) {
        let queryText = "SELECT ci.*, c.company_name, c.company_local_name, r.role_name, (SELECT CASE WHEN is_accepted THEN 'Registered' WHEN is_revoked THEN 'revoked' WHEN is_denied THEN 'Denied' ELSE 'Invited' END FROM waka.contact_invite where company_id = $1 and contact_invite_id = ci.contact_invite_id) as status, (SELECT id from waka.user_company where contact_invite_id = ci.contact_invite_id and company_id = $1) as uc_id from waka.company c JOIN waka.contact_invite ci on c.company_id = ci.company_id LEFT JOIN waka.roles r on ci.role_id = r.role_id  where c.company_id = $1";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getCompanyContactDetails', queryText, queryParam);
    }

    async getCompanyContactDetails(param:any) {
        let queryText = "SELECT ci.*, c.company_name, c.company_local_name, (SELECT jsonb_agg(jsonb_build_object('role_id',role_id,'role_name',role_name)) as roles FROM waka.roles_master WHERE role_id IN (SELECT role_id from waka.role_user_mapping WHERE ((assigned_user_id = ci.invitee_user_id) OR (email = ci.email)) AND company_id = $1)), (SELECT CASE WHEN is_accepted THEN 'Registered' WHEN is_revoked THEN 'revoked' WHEN is_denied THEN 'Denied' ELSE 'Invited' END FROM waka.contact_invite where company_id = $1 and contact_invite_id = ci.contact_invite_id) as status, (SELECT id from waka.user_company where contact_invite_id = ci.contact_invite_id and company_id = $1) as uc_id from waka.company c JOIN waka.contact_invite ci on c.company_id = ci.company_id where c.company_id = $1;";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getCompanyContactDetails', queryText, queryParam);
    }

    async getCompanyAdminAsContact(param:any){
        let queryText = "SELECT c.company_id,c.company_name,c.owned_by as invitee_user_id,lu.email,lu.full_name as contact_name,lu.mobile,(SELECT 'admin' as status),(SELECT jsonb_agg(jsonb_build_object('role_id',role_id,'role_name',role_name)) as roles FROM waka.roles_master WHERE role_id IN (SELECT role_id from waka.role_user_mapping WHERE assigned_user_id = lu.user_id AND company_id = $1)) FROM waka.company c JOIN waka.login_user lu ON lu.user_id = c.owned_by WHERE company_id= $1;";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getCompanyContactDetails', queryText, queryParam);
    }

    async insCompanyAddress(param:any) {
        let addList = JSON.stringify(param.address_coll);
        let queryText = "INSERT INTO waka.company_address (company_id, created_by, created_on, address_type_id, name, mobile, email, address, country_id, state_id, city_id, city, zip_code) SELECT " + param.company_id + ", " + param.user_id + ", now(),  * FROM jsonb_to_recordset('" + addList + "') as x(address_type_id int, name varchar, mobile varchar, email varchar, address varchar, country_id int, state_id int, city_id int, city varchar, zip_code varchar) returning comp_add_id;";
        return await psqlAPM.fnDbQuery('insCompanyAddress', queryText, []);
    }

    async insTaxDetails(param:any) {
        let queryText = "INSERT INTO waka.company_registration (created_by, company_id, created_on, reg_name, reg_number) SELECT " + param.user_id + ", " + param.company_id + ", now(), * FROM jsonb_to_recordset('" + JSON.stringify(param.tax_details) + "') as x(reg_name varchar, reg_number varchar) returning comp_reg_id";
        return await psqlAPM.fnDbQuery('insTaxDetails', queryText, []);
    }

    async delCompanyRegistrationParent(comp_reg_id:number){
        const queryText = "DELETE FROM waka.company_registration WHERE comp_reg_id = $1";
        const queryParam = [comp_reg_id];
        return await psqlAPM.fnDbQuery('delCompanyRegistrationParent', queryText, queryParam);
    }
    
    async delCompanyAddress(comp_add_id:number){
        const queryText = "DELETE FROM waka.company_address WHERE comp_add_id = $1";
        const queryParam = [comp_add_id];
        return await psqlAPM.fnDbQuery('delCompanyAddress', queryText, queryParam);
    }

    async updCompany(param:any) {
        let delAdd = await psqlAPM.fnDbQuery('deleteCompanyAddress', "DELETE FROM waka.company_address WHERE company_id = $1;", [param.company_id]);
        let delReg = await psqlAPM.fnDbQuery('deleteCompanyRegistration', "DELETE FROM waka.company_registration WHERE company_id = $1;", [param.company_id]);
        
        let queryText = "UPDATE waka.company SET company_name = $1, parent_company_id = $2, office_category_id = $3, website_address = $4, company_logo_path = $5, company_type_id = $6 , country_id = $7, state_id = $8  WHERE company_id = $9";
        let queryParam = [param.company_name, param.parent_company, param.office_type, param.company_website, param.relative_path, param.company_type_id, param.country_id ,param.state_id , param.company_id];

        return await psqlAPM.fnDbQuery('updCompany', queryText, queryParam);
    }

    async getCompanyRegDetails(company_id:number){
        let queryText = "SELECT cr.reg_name::int, cr.reg_number FROM waka.company_registration cr LEFT JOIN waka.lookup_name ln ON ln.lookup_name_id = cr.reg_name::int LEFT JOIN waka.lookup_type lt ON lt.lookup_type_id = ln.lookup_type_id WHERE cr.company_id = $1 AND lt.lookup_type = 'registration_type';";
        return await psqlAPM.fnDbQuery('getCompanyRegDetails', queryText, [company_id]);
    }

    async getCompanyAddressDetails(company_id:number){
        let queryText = "SELECT address_type_id, name, mobile, email, address, country_id, state_id, city_id, city, zip_code FROM waka.company_address WHERE company_id = $1;";
        return await psqlAPM.fnDbQuery('getCompanyAddressDetails', queryText, [company_id]);
    }

    async getCompanyAllAddressDetails(company_id:number){
        let queryText = "SELECT ca.*, ln.lookup_name, s.name as state_name, c.name as country_name, ci.name as city_name FROM waka.company_address ca LEFT JOIN waka.state s on ca.state_id = s.state_id LEFT JOIN waka.country c on c.country_id = ca.country_id LEFT JOIN waka.city ci on ca.city_id = ci.city_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = ca.address_type_id  WHERE ca.company_id = $1;";
        return await psqlAPM.fnDbQuery('getCompanyAddressDetails', queryText, [company_id]);
    }
    
    async getAdminCompany(){
        let queryText = "SELECT c.*, s.name as state, co.name as country , ci.name as city, ca.city as city_name, ca.email, ca.mobile, (SELECT CASE WHEN is_approved THEN 1 ELSE -1 END FROM waka.company_license WHERE company_id = c.company_id AND now() BETWEEN valid_from AND valid_to LIMIT 1) as license_cnt from waka.company c Left JOIN waka.company_address ca on c.company_id = ca.company_id LEFT JOIN waka.country co on ca.country_id = co.country_id LEFT JOIN waka.state s on ca.state_id = s.state_id LEFT JOIN waka.city ci ON ca.city_id = ci.city_id where c.owned_by = 1;";
        return await psqlAPM.fnDbQuery('getAdminCompany', queryText, []);
    }

    async getUsersCompany_old(userId:number){
         const queryText = "SELECT c.company_id, c.company_name, c.company_local_name, c.office_category_id, c.is_deleted, c.company_type_id, oc.lookup_name as office_type, c.company_logo_path, c.website_address, c.parent_company_id, c.previewurl , c.country_id , c.state_id , pc.company_name as parent_company, (SELECT CASE WHEN is_approved THEN 1 ELSE -1 END FROM waka.company_license WHERE company_id = c.company_id AND now() BETWEEN valid_from AND valid_to LIMIT 1) as license_cnt, (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted, (SELECT count(*) FROM waka.company_invite WHERE invited_company_id = c.company_id and invited_user_id = $1) as ci_count, (SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id WHERE c.owned_by IN (select created_by from waka.contact_invite where invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1;";
        const queryParam = [userId]
        return await psqlAPM.fnDbQuery('getUsersCompany', queryText, queryParam);
    }

    async getUsersCompany(userId:number){
        // const queryText = "SELECT distinct c.company_id, c.company_name, c.company_local_name, c.office_category_id, c.is_deleted, c.company_type_id, oc.lookup_name as office_type, c.company_logo_path, c.website_address, c.parent_company_id, c.previewurl , c.country_id , c.state_id , pc.company_name as parent_company, (SELECT CASE WHEN is_approved THEN 1 ELSE -1 END FROM waka.company_license WHERE company_id = c.company_id AND now() BETWEEN valid_from AND valid_to LIMIT 1) as license_cnt, (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted, (SELECT count(*) FROM waka.company_invite WHERE invited_company_id = c.company_id and invited_user_id = c.owned_by) as ci_count, (SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_edit_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'EDIT_COMPANY' LIMIT 1)) as a), (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_invite_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'INIVITE_STAKEHOLDER_COMPANY' LIMIT 1)) as a),(SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_invite_contact FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'INIVITE_CONTACT' LIMIT 1)) as a), (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_delete_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DELETE_COMPANY' LIMIT 1)) as a), (SELECT CASE WHEN c.owned_by = $1 then TRUE ELSE FALSE END as is_own_company), (SELECT case when a.event_id is null then false else true end as is_view FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'VIEW_MY_COMPANIES' LIMIT 1)) as a) FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id WHERE c.owned_by IN (select created_by from waka.contact_invite where invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1";

        const queryText = "SELECT distinct c.company_id, c.company_name, c.company_local_name, c.office_category_id, c.is_deleted, c.company_type_id, oc.lookup_name as office_type, c.company_logo_path, c.website_address, c.parent_company_id, c.previewurl , c.country_id , c.state_id , pc.company_name as parent_company, (SELECT CASE WHEN is_approved THEN 1 ELSE -1 END FROM waka.company_license WHERE company_id = c.company_id AND now() BETWEEN valid_from AND valid_to LIMIT 1) as license_cnt, (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted, (SELECT count(*) FROM waka.company_invite WHERE invited_company_id = c.company_id ) as ci_count, (SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_edit_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'EDIT_COMPANY' LIMIT 1)) as a), (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_invite_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'INIVITE_STAKEHOLDER_COMPANY' LIMIT 1)) as a),(SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_invite_contact FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'INIVITE_CONTACT' LIMIT 1)) as a), (SELECT is_accepted FROM waka.company_invite WHERE invitee_company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as ci_is_accepted, (SELECT is_accepted FROM waka.contact_invite WHERE company_id = c.company_id and invitee_user_id = $1 LIMIT 1) as cci_is_accepted,(SELECT count(*) FROM waka.contact_invite WHERE company_id = c.company_id) as contact_count, (SELECT case when a.event_id is null then false else true end as is_delete_company FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DELETE_COMPANY' LIMIT 1)) as a), (SELECT CASE WHEN c.owned_by = $1 then TRUE ELSE FALSE END as is_own_company), (SELECT case when a.event_id is null then false else true end as is_view FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id = $1 AND (company_id = c.company_id )))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'VIEW_MY_COMPANIES' LIMIT 1)) as a) FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id WHERE c.owned_by IN (select created_by from waka.contact_invite where invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1";
       const queryParam = [userId]
       return await psqlAPM.fnDbQuery('getUsersCompany', queryText, queryParam);
   }

    async getInviteCompany(param:any){
        let queryText = "SELECT ci.*, (SELECT count(*) FROM waka.company_invited_modules WHERE company_invite_id = ci.company_invite_id) as module_shared, ln.lookup_name as company_type_name FROM waka.company_invite ci JOIN waka.lookup_name as ln ON ci.invitee_company_type_id = ln.lookup_name_id WHERE ci.invited_company_id = $1";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getInviteCompany', queryText, queryParam);
    }

    async getInvitedCompaniesList(param:any){
        let queryText = "SELECT ci.*, ca.mobile, c1.company_logo_path, c.company_name, ln.display_name FROM waka.company_invite ci LEFT JOIN waka.company c on c.company_id = ci.invited_company_id LEFT JOIN waka.company c1 on c1.company_id = ci.invitee_company_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = ci.invitee_company_type_id LEFT JOIN waka.company_address ca on ca.company_id = ci.invitee_company_id WHERE ci.invited_company_id = $1";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getInvitedCompaniesList', queryText, queryParam);
    }

    async getPendingInviteForEmail(email:string, userId:number){
        let queryText = "SELECT ci.company_invite_id, ci.invited_company_id, ci.invited_user_id, ci.invitee_company_name,ci.invitee_contact_name, ci.invitee_company_type_id, ci.invitee_email, ci.invitee_company_id, ci.poi_master_error_id, pom.error_type as master_error_type, pom.poi_id, pom.poi_me_id, pom.ref_code, c.company_name, ct.lookup_name invitee_company_type, 'pending' as status from waka.company_invite ci JOIN waka.company c ON c.company_id = ci.invited_company_id JOIN waka.lookup_name ct ON ct.lookup_name_id = ci.invitee_company_type_id LEFT JOIN waka.poi_master_error_temp pom ON pom.poi_me_id = ci.poi_master_error_id WHERE (ci.invitee_email= $1 OR ci.invitee_user_id = $2) AND NOT is_accepted AND NOT is_denied AND NOT is_revoked";
        let queryParam = [email, userId];
        return await psqlAPM.fnDbQuery('getPendingInviteForEmail', queryText, queryParam);
    }

    async getPendingContactInviteForEmail(email:string){
        let queryText = "SELECT ci.*, ci.company_id as invited_company_id, c.company_name as invited_company_name from waka.contact_invite ci LEFT JOIN waka.company c on c.company_id = ci.company_id WHERE ci.email=$1 AND NOT is_accepted AND NOT is_denied AND NOT is_revoked";
        let queryParam = [email];
        return await psqlAPM.fnDbQuery('getPendingContactInviteForEmail', queryText, queryParam);
    }
    
    async getCompanyForId(companyId:number){
        const queryText = "SELECT c.company_id, c.company_name, c.company_local_name as short_name, ln.lookup_name as company_type, ca.address, ci.name as city, st.name as state, co.name as country, ca.zip_code FROM waka.company c JOIN waka.company_address ca ON ca.company_id = c.company_id AND ca.address_type_id IN (SELECT lookup_name_id from waka.lookup_name WHERE lookup_name ='communication')  JOIN waka.country co on co.country_id=ca.country_id JOIN waka.state st on st.state_id = ca.state_id LEFT JOIN waka.city ci on ci.city_id=ca.city_id LEFT JOIN waka.lookup_name ln ON ln.lookup_name_id = c.company_type_id WHERE c.company_id = $1";
        const queryParam = [companyId];
        return await psqlAPM.fnDbQuery('getCompanyForId', queryText, queryParam);
    };

    async insCompanyLicense(param:any){
        const queryText = "  INSERT INTO waka.company_license(company_id, created_by, created_on, is_approved, valid_from, valid_to) VALUES ($1, $2, now(), false, now(), now()+interval '1 year') returning cl_id";
        const queryParam = [param.company_id, param.userId];
        return await psqlAPM.fnDbQuery('insCompanyLicense', queryText, queryParam);
    };

    async insCompanyLicenseModule(param:any){
        let queryText = "INSERT INTO waka.company_lic_module (cl_id, created_by, created_on, module_id) SELECT " + param.cl_id + ", " + param.userId + ", now(), * FROM UNNEST( ARRAY[" + param.m_ids + "]::int[]) ";
        return await psqlAPM.fnDbQuery('insCompanyLicenseModule', queryText, []);
    };

    async delCompanyLicenseParent(cl_id:number){
        const queryText = "DELETE FROM waka.company_license WHERE cl_id = $1";
        const queryParam = [cl_id];
        return await psqlAPM.fnDbQuery('delCompanyLicenseParent', queryText, queryParam);
    };

    async insCompanySharedLicense(param:any){
        const queryText = "INSERT INTO waka.shared_license(cl_id, licensed_company_id, shared_company_id, valid_from, valid_to, created_by,created_on) SELECT cl_id, company_id, $1, valid_from, valid_to, $3, now() FROM waka.company_license WHERE company_id = $2 AND now() between valid_from and valid_to returning sl_id,cl_id"
        const queryParam = [param.invitee_company_id, param.invited_company_id, param.userId];
        return await psqlAPM.fnDbQuery('insCompanySharedLicense', queryText, queryParam);
    };

    async insCompanySharedLicenseModule(param:any){
        let queryText = "INSERT INTO waka.shared_lic_module(sl_id, cl_id, created_by, created_on, module_id) SELECT " + param.sl_id + ", " + param.cl_id + ", "+param.userId + ", now(), * FROM UNNEST( ARRAY[(select ARRAY_agg(module_id) from waka.company_invited_modules WHERE company_invite_id ="+param.company_invite_id+" )]::int[])";
        return await psqlAPM.fnDbQuery('insCompanySharedLicenseModule', queryText, []);
    };

    async delInsCompanySharedLicenseParent(sl_id:number){
        const queryText = "DELETE FROM waka.shared_license WHERE sl_id = $1";
        const queryParam = [sl_id];
        return await psqlAPM.fnDbQuery('delInsCompanySharedLicenseParent', queryText, queryParam);
    } 

    async getlicenseModules(param:any){
        let queryText = "select array_agg(clm.module_id) as m_d_ids , cl.cl_id, array_agg(m.module_name) as module_name , array_agg(m.icon) as module_icon from waka.company_lic_module clm JOIN waka.company_license cl on cl.cl_id = clm.cl_id join waka.modules_list m ON m.module_id = clm.module_id where cl.company_id = $1 group by cl.cl_id";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getlicenseModules', queryText, queryParam);
    };

    async getSharedLicenseModules(param:any){
        let queryText = "select array_agg(slm.module_id) as m_d_ids , sl.sl_id, array_agg(m.module_name) as module_name from waka.shared_lic_module slm JOIN waka.shared_license sl on sl.sl_id = slm.sl_id join waka.modules m ON m.module_id = slm.module_id where sl.shared_company_id = $1 group by sl.sl_id";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getSharedLicenseModules', queryText, queryParam);
    };

    async delCompanyLicense(param:any){
        let queryText = "DELETE FROM waka.company_lic_module where cl_id = $1 ";
        let queryParam = [param.cl_id];
        return await psqlAPM.fnDbQuery('delCompanyLicense', queryText, queryParam);
    };

    async delSharedCompanyLicense(param:any){
        let queryText = "DELETE FROM waka.shared_lic_module where sl_id = $1 ";
        let queryParam = [param.sl_id];
        return await psqlAPM.fnDbQuery('delCompanyLicense', queryText, queryParam);
    };

    async delCompany(param:any){
        let queryText = "UPDATE waka.company SET is_deleted = $2 WHERE company_id = $1";
        let queryParam = [param.company_id, param.is_deleted];
        return await psqlAPM.fnDbQuery('delCompany', queryText, queryParam);
    };

    async updCompanyInviteAccept(param:any){
        let queryText;
        if (param.type == 'deny') { 
             queryText = "UPDATE waka.company_invite SET invitee_company_id=$3, invitee_user_id=$2, is_denied = true, denied_on = now(), modified_by = $2, modified_on = now() WHERE company_invite_id = $1";
        } else if (param.type == 'accept') {
            queryText = "UPDATE waka.company_invite SET invitee_company_id=$3, invitee_user_id=$2, is_accepted = true, accepted_on = now(), modified_by = $2, modified_on = now() WHERE company_invite_id = $1";
        } else if (param.type = 'accept' && param.poi_master_error_id != undefined) {
            queryText = "UPDATE waka.company_invite SET invitee_company_id=$3, invitee_user_id=$2, is_accepted = true, accepted_on = now(), modified_by = $2, modified_on = now(), poi_master_error_id = null WHERE company_invite_id = $1";
        }
        const queryParam = [param.company_invite_id, param.userId, param.invitee_company_id];
        return await psqlAPM.fnDbQuery('updCompanyInviteAccept', queryText, queryParam);
    }   
    
    async delCompanyInviteModules(param:any){
        const queryText = "DELETE FROM waka.company_invited_modules WHERE company_invite_id = $1";
        const queryParam = [param.company_invite_id];
        return await psqlAPM.fnDbQuery('delCompanyInviteModules', queryText, queryParam);
    }
    
    async insUserCompany(param:any){
        const queryText = "INSERT INTO waka.user_company(company_invite_id,user_id,company_id,invited_company_id,is_company_owner,created_by) VALUES ($1, $2, $3, $4, TRUE, $5);";
        const queryParam = [param.company_invite_id, param.userId, param.invitee_company_id, param.invited_company_id, param.userId];
        return await psqlAPM.fnDbQuery('insCompanyInviteAccept', queryText, queryParam);
    }   

    async updContactInviteAccept(param:any){
        let queryText;
        if (param.type == 'deny') {
            queryText = "UPDATE waka.contact_invite SET is_denied = true, denied_on = now(), modified_by = $2, modified_on = now() WHERE contact_invite_id = $1";
        } else if (param.type == 'accept') {
            queryText = "UPDATE waka.contact_invite SET is_accepted = true, accepted_on = now(), modified_by = $2, modified_on = now() WHERE contact_invite_id = $1";            
        }
        let queryParam =  [param.contact_invite_id, param.userId];
        return await psqlAPM.fnDbQuery('updContactInviteAcceptDeny', queryText, queryParam);
    }
    
    async checkEmailInviteContact(param:any){
        const queryText = "SELECT * from waka.contact_invite WHERE email = $1;";
        const queryParam = [param.email];
        return await psqlAPM.fnDbQuery('checkEmailInviteContact', queryText, queryParam);
    }

    async insContactInviteUserCompany(param:any){
        const queryText = "INSERT INTO waka.user_company (contact_invite_id, user_id, created_by, company_id, invited_company_id, is_company_owner) VALUES ($1, $2, $2, $3, $3, true);";
        const queryParam = [param.contact_invite_id, param.userId, param.company_id];
        return await psqlAPM.fnDbQuery('updContactInviteUserCompany', queryText, queryParam);
    }  
    
    async updCompanyInviteDeny(param:any){
        const queryText = "UPDATE waka.company_invite SET is_denied = true, denied_on = now(), modified_by = $2, modified_on = now() WHERE company_invite_id = $1";
        const queryParam = [param.company_invite_id,param.userId];
        return await psqlAPM.fnDbQuery('updCompanyInviteDeny', queryText, queryParam);
    }   

    async getAddressForCompanyId(company_id:number){
        const queryText = "SELECT ca.address, COALESCE(ci.name, ca.city) as city, st.name as state, co.name as country, ca.zip_code FROM waka.company_address ca JOIN waka.country co on co.country_id=ca.country_id JOIN waka.state st on st.state_id = ca.state_id LEFT JOIN waka.city ci on ci.city_id=ca.city_id WHERE ca.company_id = $1 AND ca.address_type_id = (SELECT lookup_name_id FROM waka.lookup_name WHERE lookup_name ='communication')";
        const queryParam = [company_id];
        return await psqlAPM.fnDbQuery('getAddressForCompanyId', queryText, queryParam);
    }

    async getCompanyContacts(company_id:number){
        //const queryText = "SELECT contact_name,email,designation,department,mobile FROM waka.contact_invite WHERE company_id = $1 ";
        const queryText = "select ci.contact_name, ci.email, ci.mobile, '' AS designation, COALESCE(lu.wechat_id, '') AS wechat_id FROM waka.contact_invite ci JOIN waka.login_user lu ON ci.invitee_user_id = lu.user_id where ci.company_id = $1";
        const queryParam = [company_id];
        return await psqlAPM.fnDbQuery('getCompanyContacts', queryText, queryParam);
    }

    async inviteContactApproveRevoke(param:any){
        let queryText;
            if (param.type == 'revoke') {
                queryText = "UPDATE waka.contact_invite SET is_accepted = false , accepted_on = null, is_revoked = true, revoked_on = now() WHERE contact_invite_id = $1";
            } else if (param.type = 'approve' && param.uc_id != null) {
                queryText = "UPDATE waka.contact_invite SET is_accepted = true , accepted_on = now(), is_revoked = false, revoked_on = null WHERE contact_invite_id = $1";            
            } else if (param.type = 'approve' && param.uc_id == null) {
                queryText = "UPDATE waka.contact_invite SET is_revoked = false, revoked_on = null WHERE contact_invite_id = $1";            
            }
            let queryParam =  [param.contact_invite_id];
            return await psqlAPM.fnDbQuery('inviteContactApproveRevoke', queryText, queryParam);
    }

    async inviteCompanyApproveRevoke(param:any){
        let queryText;
            if (param.type == 'revoke') {
                queryText = "UPDATE waka.company_invite SET is_accepted = false , accepted_on = null, is_revoked = true, revoked_on = now() WHERE company_invite_id = $1";
            } else if (param.type = 'approve' && param.uc_id != null) {
                queryText = "UPDATE waka.company_invite SET is_accepted = true , accepted_on = now(), is_revoked = false, revoked_on = null WHERE company_invite_id = $1";            
            } else if (param.type = 'approve' && param.uc_id == null) {
                queryText = "UPDATE waka.company_invite SET is_revoked = false, revoked_on = null WHERE company_invite_id = $1";            
            }
            let queryParam =  [param.company_invite_id];
            return await psqlAPM.fnDbQuery('inviteCompanyApproveRevoke', queryText, queryParam);
    }

    async getCompanyList(userId:number){
        let queryText = "SELECT c.*, cl.is_approved, cl.valid_to::DATE, oc.lookup_name as office_category FROM waka.company c FULL OUTER JOIN waka.company_license cl ON c.company_id = cl.company_id JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id WHERE c.created_by = $1  AND c.is_deleted = false  ORDER BY company_name";
        let queryParam =  [userId];
        return await psqlAPM.fnDbQuery('getCompanyList', queryText, queryParam);
    }

    async getPrincipalListForSop(userId:number){
        let queryText = "SELECT *,(SELECT case when add.event_id is null then false else true end as is_add_sop FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN ($1) AND (company_id = c.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'ADD_SOP' LIMIT 1)) as add) FROM waka.company c JOIN waka.company_license cl ON c.company_id = cl.company_id AND is_approved = TRUE WHERE c.created_by IN (select DISTINCT created_by from waka.role_user_mapping WHERE assigned_user_id = $1) AND parent_company_id is null AND company_type_id IN (SELECT ln.lookup_name_id as lookup_id from waka.lookup_name ln JOIN waka.lookup_type lt on ln.lookup_type_id = lt.lookup_type_id where lt.lookup_type = 'account_type' AND ln.lookup_name ilike 'consignee') AND c.is_deleted = false";
        let queryParam =  [userId];
        return await psqlAPM.fnDbQuery('getPrincipalListForSop', queryText, queryParam);
    }

    async getPrincipalListForContract(userId:number){
        let queryText = "SELECT *,(SELECT case when add.event_id is null then false else true end as is_add_contract FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN ($1) AND (company_id = c.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'ADD_CONTRACT' LIMIT 1)) as add) FROM waka.company c JOIN waka.company_license cl ON c.company_id = cl.company_id AND is_approved = TRUE WHERE c.created_by IN (select DISTINCT created_by from waka.role_user_mapping WHERE assigned_user_id = $1) AND parent_company_id is null AND company_type_id IN (SELECT ln.lookup_name_id as lookup_id from waka.lookup_name ln JOIN waka.lookup_type lt on ln.lookup_type_id = lt.lookup_type_id where lt.lookup_type = 'account_type' AND ln.lookup_name ilike 'consignee') AND c.is_deleted = false";
        let queryParam =  [userId];
        return await psqlAPM.fnDbQuery('getPrincipalListForContract', queryText, queryParam);
    }

    async getStakeholderList(principal_id:number){
        let queryText = "SELECT a.*, ln.lookup_name AS company_type FROM (select COALESCE(ci.invitee_company_id,c.company_id) AS company_id , COALESCE(ci.invitee_company_name, c.company_name) AS company_name, COALESCE(ci.invitee_company_type_id, c.company_type_id) AS company_type_id, COALESCE(ci.is_accepted, true) AS is_accepted from (select * from waka.company_invite where invited_company_id = $1) ci FULL OUTER JOIN (select * from waka.company where company_type_id IN (select lookup_name_id from  waka.lookup_name where lookup_name ilike 'carrier')) c ON ci.invitee_company_id = c.company_id) AS a JOIN waka.lookup_name ln ON a.company_type_id = ln.lookup_name_id";
        let queryParam = [principal_id];
        return await psqlAPM.fnDbQuery('getStakeholderList', queryText, queryParam);
    }
    async validateInviteeCompanyName(param: any){
        let queryText = "SELECT company_id, company_name , office_category_id FROM waka.company WHERE created_by =  $1";
        return await psqlAPM.fnDbQuery('validateInviteeCompanyName', queryText, [param.created_by]);        
    }
    

    async getCompanyData(param: any){
        let queryText = "SELECT c.company_id, c.company_name, lu.email, lu.full_name , c.office_category_id,c.company_type_id , oc.lookup_name as office_category FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id join waka.login_user lu on lu.user_id = c.created_by where LOWER(c.company_name) = $1;";
        return await psqlAPM.fnDbQuery('getCompanyData', queryText, [param.company_name]);        
    }

    async checkParentCompany(param: any){
        let queryText = "SELECT * FROM waka.company WHERE parent_company_id =  $1;";
        return await psqlAPM.fnDbQuery('checkParentCompany', queryText, [param.parent_company_id]);        
    }

    async getMyCompanyAndType(userId:number){
        let queryText = "SELECT * from vw_my_company_and_type WHERE user_id = $1;";
        let queryParam = [userId];
        return await psqlAPM.fnDbQuery('getMyCompanyAndType', queryText, queryParam);        
    }

    async getWhoInvitedMe(userId:number){
        let queryText = "SELECT ci.invited_company_id as company_id, c.company_name, c.owned_by, ci.invited_company_type_id as company_type_id, ln.lookup_name as company_type,ci.invitee_company_id as my_company_id FROM waka.company_invite ci JOIN waka.company c ON c.company_id = ci.invited_company_id JOIN waka.lookup_name ln ON ln.lookup_name_id = ci.invited_company_type_id WHERE ci.invitee_company_id IN (SELECT company_id from my_company where user_id = $1);";
        let queryParam = [userId];
        return await psqlAPM.fnDbQuery('getWhoInvitedMe', queryText, queryParam);        
    }

    async getMyParentCompany(userId:number){
        let queryText = "select mc.company_id as my_company_id, pc.parent_company_id, pc.parent_company_name, pc.parent_company_type_id, ln.lookup_name parent_company_type FROM my_company mc JOIN waka.company pc ON pc.parent_company_id = mc.company_id JOIN waka.lookup_name ln on ln.lookup_name_id = pc.company_type_id WHERE user_id = $1";
        let queryParam = [userId];
        return await psqlAPM.fnDbQuery('getMyParentCompany', queryText, queryParam);        
    }

    async delActiontakenMasterError(poi_master_error_id: number) {
        const queryText = "DELETE FROM waka.poi_master_error_temp WHERE poi_me_id = $1";
        const queryParam = [poi_master_error_id];
        return await psqlAPM.fnDbQuery('delActiontakenMasterError', queryText, queryParam);
    }

    async updMasterError(poiMasterErrorId:number) {
        const queryText = `UPDATE waka.poi_master_error_temp SET is_invite_sent = false WHERE poi_me_id = ${poiMasterErrorId}`;
        return await psqlAPM.fnDbQuery('delActiontakenMasterError', queryText, []);
    }

    async insSupplierRef(param: any) {
        const queryText = "INSERT INTO waka.supplier_ref (company_id, supplier_code, supplier_name, waka_ref_supplier_id) VALUES ($1,$2,$3,$4) RETURNING supplier_ref_id";
        const queryParam = [param.invited_company_id, param.ref_code, param.invitee_company_name, param.invitee_company_id];
        return await psqlAPM.fnDbQuery('insSupplierRef', queryText, queryParam);
    }
    
    async insBuyerRef(param: any) {
        const queryText = "INSERT INTO waka.buyer_ref (company_id, buyer_code, buyer_name, waka_ref_buyer_id) VALUES ($1,$2,$3,$4) RETURNING buyer_ref_id";
        const queryParam = [param.invited_company_id, param.ref_code, param.invitee_company_name, param.invitee_company_id];
        return await psqlAPM.fnDbQuery('insSupplierRef', queryText, queryParam);
    }

    async insFactoryRef(param: any) {
        const queryText = "INSERT INTO waka.factory_ref (company_id,factory_code,factory_name,waka_ref_factory_id) VALUES ((SELECT company_id FROM waka.poi_scheduler_running_status WHERE poi_id IN (SELECT poi_id FROM waka.poi_master_error_temp WHERE poi_me_id = $1) LIMIT 1),(SELECT ref_code FROM waka.poi_master_error_temp WHERE poi_me_id = $1),(SELECT error_value FROM waka.poi_master_error_temp WHERE poi_me_id = $1),$2)";
        const queryParam = [param.poi_master_error_id, param.invitee_company_id];
        return await psqlAPM.fnDbQuery('insFactoryRef', queryText, queryParam);
    }

    async getMasterErrors(param: any) {
        const queryText = "SELECT COUNT(*) as error_count FROM waka.poi_master_error_temp WHERE poi_id = $1"
        const queryParam = [param.poi_id];
        return await psqlAPM.fnDbQuery('getMasterErrors', queryText, queryParam);
    }

    async updMasterUnderProcess(param: any) {
        const queryText = "UPDATE waka.poi_scheduler_running_status SET is_master_under_process =  $1 WHERE poi_id = $2;";
        return await psqlAPM.fnDbQuery('updMasterUnderProcess', queryText, [param.is_master_under_process, param.poi_id]);
    };
    
    async checkCompanyLicense(compId: any) {
        const queryText = "SELECT is_approved FROM waka.company_license WHERE company_id = $1";
        return await psqlAPM.fnDbQuery('checkCompanyLicense', queryText, [compId]);
    };
}
