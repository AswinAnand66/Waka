const psqlAPM = require('./psqlAPM');
export class UserModel {
    constructor(){ };
    async login (email:string){
        const queryText = "SELECT lu.user_id, lu.salt, lu.hash_password AS password, lu.email, lu.full_name, lu.mobile, lu.is_admin, lu.wechat_id, lu.active_flag, (SELECT count(*) FROM waka.company c JOIN waka.company_license cl ON cl.company_id = c.company_id AND cl.is_approved WHERE owned_by=lu.user_id) as company_admin_cnt, (SELECT count(*) FROM waka.user_company WHERE user_id = lu.user_id) as invited_company_cnt FROM waka.login_user as lu WHERE lower(lu.email) = lower($1) AND NOT lu.is_deleted";
        const queryParam = [email];
        return await psqlAPM.fnDbQuery('login', queryText, queryParam);
    };

    async addLoginHistory(email:string, ipAddress:string, message:string, status:boolean, token:string|undefined) {
        let query = "INSERT INTO waka.login_history(email, ip_address, status, remarks, session_id) VALUES ($1, $2, $3, $4, $5);";
        let qryParam = [email, ipAddress, status, message, token];
        return await psqlAPM.fnDbQuery('loginHistory', query, qryParam);
    }

    async logout(token:string){
        const queryText = "UPDATE waka.login_history SET logout_at = now(), remarks = $1 WHERE session_id= $2";
        const queryParam = ["Successfully Logged Out", token];
        return await psqlAPM.fnDbQuery('logoutUser', queryText, queryParam);
    }

    async getUserAllRole(param:any){
        const queryText = "SELECT ur.u_r_id, ur.role_id, r.role_name, r.module_id, m.module_name, m.permission, m.ui_screen FROM user_role as ur JOIN role as r ON r.role_id = ur.role_id JOIN modules as m JOIN r.module_id = m.module_id WHERE ur.user_id = $1";
        const queryParam = [param.userId];
        return await psqlAPM.fnDbQuery('getUserAllRole', queryText, queryParam);
    }

    async getUserRoleForModule(param:any){
        const queryText = "SELECT ur.u_r_id, ur.company_id, ln.lookup_name as company_type, c.company_name, ur.role_id, r.role_name, r.module_id, m.module_name, m.permission, m.ui_screen FROM user_role as ur JOIN role as r ON r.role_id = ur.role_id JOIN modules as m JOIN r.module_id = m.module_id JOIN company c ON c.company_id = ur.company_id JOIN lookup_name ln on ln.lookup_name_id = c.company_type_id WHERE ur.user_id = $1 AND m.module_name = $2";
        const queryParam = [param.userId, param.module_name];
        return await psqlAPM.fnDbQuery('getUserRoleForModule', queryText, queryParam);
    }

    async getUserStat(){
        const queryText="SELECT (SELECT count(user_id) FROM login_user where is_active) as active, (SELECT count(user_id) FROM login_user WHERE is_deleted) as deleted,(SELECT count(user_id) FROM login_user WHERE is_admin OR is_company_admin) as admin";
        return await psqlAPM.fnDbQuery('getUserStat', queryText, []);
    }

    async getUserStatForCompAdmin(userId:number){
        const queryText="SELECT (SELECT count(user_id) FROM login_user WHERE user_id IN (SELECT DISTINCT user_id FROM user_company WHERE company_id IN (SELECT company_id FROM user_company WHERE user_id = $1)) AND is_active) as active, (SELECT count(user_id) FROM login_user WHERE user_id IN (SELECT DISTINCT user_id FROM user_company WHERE company_id IN (SELECT company_id FROM user_company WHERE user_id = $1)) AND is_deleted) as deleted,(SELECT count(user_id) FROM login_user WHERE user_id IN (SELECT DISTINCT user_id FROM user_company WHERE company_id IN (SELECT company_id FROM user_company WHERE user_id = $1) AND is_admin)) as admin";
        let queryParam = [userId]
        return await psqlAPM.fnDbQuery('getUserStat', queryText, queryParam);
    }

    async getRoleStatForAdmin(){
        const queryText="SELECT count(role_id) FROM role WHERE company_id IN (1)";
        return await psqlAPM.fnDbQuery('getRoleStatForAdmin', queryText, []);
    }

    async addPageAccessView(param:any){
        let queryText = "INSERT INTO waka.page_access (user_id, email, name, url, page_name, start_time, end_time, duration_ms, ip_address, created_by) SELECT user_id, email, name, url, page_name, start_time, end_time, duration_ms, ip_address, 1 FROM json_populate_recordset(NULL::waka.page_access,'"+ JSON.stringify(param)+"')";
        return await psqlAPM.fnDbQuery('addPageAccessView', queryText, []);
    }

    async getRoleStatForCompAdmin(param:any){
        let queryText;
        let companies = "";
        let compArr = param.compArr;
        if (compArr.length > 0){
            compArr.map((id: number,ix: number)=>{
                if (ix != 0) companies += ",";
                companies += id;
            });
            queryText="SELECT count(role_id) FROM role WHERE company_id IN (1,"+companies+")";
            return await psqlAPM.fnDbQuery('getRoleStatForCompAdmin', queryText, []);
        } 
        else {
            queryText="SELECT count(role_id) FROM role where company_id IN (1)";
            return await psqlAPM.fnDbQuery('getRoleStatForCompAdmin', queryText, []);
        }
    }

    async getAllUsers(){
        const queryText = "SELECT user_id, email, mobile_country, mobile, full_name, is_active, is_deleted, created_on FROM waka.login_user";
        return await psqlAPM.fnDbQuery('getAllUsers', queryText, []);
    }

    async checkUsrEmailExists(email:string){
        let queryText = "SELECT user_id, email, active_flag FROM waka.login_user WHERE email=TRIM($1)";
        let queryParam = [email];
        return await psqlAPM.fnDbQuery('checkUsrEmailExists', queryText, queryParam);
    }

    async userMailValidation(user_id:number){
        let queryText = "SELECT user_id, email, active_flag FROM waka.login_user WHERE user_id=$1";
        let queryParam = [user_id];
        return await psqlAPM.fnDbQuery('userMailValidation', queryText, queryParam);
    }

    async UpdMailVerifiedOn(user_id:number){
        let queryText = "UPDATE waka.login_user SET active_flag = true, email_verified_on = now() WHERE user_id=$1";
        let queryParam = [user_id];
        return await psqlAPM.fnDbQuery('UpdMailVerifiedOn', queryText, queryParam);
    }

    async registerUser(param:any){
        let queryText, queryParam;
        if(param.isInvite){
            queryText = "UPDATE waka.login_user SET full_name = $1, hash_password = $2, invite_accepted_on = now(), salt = $4 WHERE email = $3";
            queryParam = [param.full_name, param.hash_password, param.email, param.salt];
        } else {
            queryText = "INSERT INTO waka.login_user(email, full_name, hash_password, created_by, is_active, is_deleted, created_on, salt) VALUES ($1,$2, $3, 1, true, false, now(), $4) returning user_id";
            queryParam = [param.email, param.full_name, param.hash_password, param.salt];
        }
        return await psqlAPM.fnDbQuery('registerUser', queryText, queryParam);
    }

    async getInviteUser(param:any){
        const queryText = "SELECT email, full_name, is_invite_user, invite_accepted_on FROM waka.login_user WHERE user_id = $1";
        const queryParam = [param.invite_user_id];
        return await psqlAPM.fnDbQuery('getInviteUser', queryText, queryParam);
    }
    
    async updUser(param:any){
        const queryText = "UPDATE login_user SET email = $1, full_name = $2, mobile_country = $3, mobile = $4, modified_by = $5, modified_on = now() WHERE user_id = $6";
        const queryParam = [param.email, param.full_name, param.mobile_country, param.mobile, param.userId, param.user_id];
        return await psqlAPM.fnDbQuery('updUser', queryText, queryParam);
    }

    async activateUsr(param:any){
        const queryText = "UPDATE login_user SET is_active = $1, modified_by= $3, modified_on = now() WHERE user_id = $2";
        const queryParam = [param.is_active, param.user_id, param.userId];
        return await psqlAPM.fnDbQuery('activateUsr', queryText, queryParam);
    }

    async delUsr(param:any){
        const queryText = "UPDATE login_user SET is_deleted = $1, modified_by= $3, modified_on = now() WHERE user_id = $2";
        const queryParam = [param.is_deleted, param.user_id, param.userId];
        return await psqlAPM.fnDbQuery('delUser', queryText, queryParam);
    }

    async getUserCompany(userId:number){
        const queryText = "SELECT c.company_id, c.company_name, c.company_short_name, c.company_type_id, ln.lookup_name as company_type, c.address, ci.name as city, st.name as state, co.name as country, c.zip_code, CASE WHEN uc.user_id is NULL THEN false ELSE true END is_selected, COALESCE(uc.is_admin,false) is_admin FROM waka.company c JOIN waka.lookup_name ln ON ln.lookup_name_id = c.company_type_id JOIN waka.country co on co.id=c.country_id JOIN state st on st.id = c.state_id LEFT JOIN city ci on ci.id=c.city_id LEFT JOIN user_company uc ON uc.company_id = c.company_id AND uc.user_id = $1 WHERE c.company_type_id IN (SELECT distinct company_type_id FROM user_company where user_id = $1)";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getUserCompany', queryText, queryParam);
    }

    async delAllUsrCompanyForUser(userId:number){
        const queryText = "DELETE FROM user_company WHERE user_id=$1";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('delAllUsrCompanyForUser', queryText, queryParam);
    }

    async addUsrCompanyForUser(userId:number, insData:any){
        const queryText = "INSERT INTO user_company (created_by, user_id, company_id, company_type_id, is_admin) SELECT $1, * FROM jsonb_to_recordset($2) as x(user_id int, company_id int, company_type_id int, is_admin boolean)";
        const queryParam = [userId, insData];
        return await psqlAPM.fnDbQuery('addUsrCompanyForUser', queryText, queryParam);
    }

    async getUsersForCompAdmin(userId:number){
        const queryText = "SELECT user_id, email, mobile_country, mobile, full_name, is_active, is_deleted, created_on, (SELECT DISTINCT company_type_id FROM waka.user_company WHERE user_id = $1 LIMIT 1) as company_type_id FROM waka.login_user WHERE user_id IN (SELECT DISTINCT user_id FROM user_company WHERE company_id IN (SELECT company_id FROM waka.user_company WHERE user_id = $1))";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getUsersForCompAdmin', queryText, queryParam);
    }

    async insUsrCompany(param:any){
        const queryText = "INSERT INTO user_company (user_id, company_id, company_type_id, created_by) VALUES ($1, $2, $3, $4)";
        const queryParam = [param.user_id, param.company_id, param.company_type_id, param.userId];
        return await psqlAPM.fnDbQuery('insUsrCompany', queryText, queryParam);
    }

    async getAdminRoles_old(param:any){
        const queryText = "SELECT r.role_name, r.role_id, r.company_id, c.company_name, rmm.rmm_id, rmm.module_id, rmm.sub_module_id, m.module_name, sm.sub_module_name, rmm.create_role, rmm.view_role, rmm.update_role, rmm.delete_role  FROM waka.roles as r JOIN waka.role_module_mapping rmm on r.role_id = rmm.role_id LEFT JOIN waka.modules as m ON rmm.module_id = m.module_id LEFT JOIN waka.sub_modules sm ON sm.sub_module_id = rmm.sub_module_id LEFT JOIN waka.company c ON c.company_id = r.company_id where r.created_by = $1";
        return await psqlAPM.fnDbQuery('getAdminRoles', queryText, [param.userId]);
    }

    async getAdminRoles(param:any){
        const queryText = "SELECT rm.role_name, rm.role_id, c.company_name, jsonb_agg(DISTINCT jsonb_build_object('module_name',ml.module_name,'module_id',ml.module_id)) as modules, jsonb_agg(jsonb_build_object('sub_module_name',sml.sub_module_name,'sub_module_id',sml.sub_module_id))as sub_modules,json_agg(rmm.rmm_id) as rmm_ids FROM waka.roles_master rm JOIN waka.company c ON c.company_id = rm.company_id JOIN waka.role_module_mapping_new rmm ON rmm.role_id = rm.role_id JOIN waka.modules_list ml ON rmm.module_id = ml.module_id JOIN waka.sub_modules_list sml ON rmm.sub_module_id = sml.sub_module_id WHERE rm.created_by IN ($1) GROUP BY rm.role_name,rm.role_id, c.company_name;";
        return await psqlAPM.fnDbQuery('getAdminRoles', queryText, [param.userId]);
    }

    async getRoles_old(param:any){
        if(param.company_id != undefined){
            let queryText = "SELECT r.role_name, r.role_id, r.company_id, c.company_name, rmm.rmm_id, rmm.module_id, rmm.sub_module_id, m.module_name, sm.sub_module_name, rmm.create_role, rmm.view_role, rmm.update_role, rmm.delete_role FROM waka.roles as r LEFT JOIN waka.role_module_mapping rmm on r.role_id = rmm.role_id JOIN waka.modules as m ON rmm.module_id = m.module_id LEFT JOIN waka.sub_modules sm ON sm.sub_module_id = rmm.sub_module_id LEFT JOIN waka.company c ON c.company_id = r.company_id where r.created_by = 1 or r.company_id in ($1,$2) or r.company_id in (SELECT invited_company_id FROM waka.company_invite WHERE invitee_company_id = $3 AND is_accepted = True)";
           return await psqlAPM.fnDbQuery('getRoles', queryText, [param.company_id, param.parent_company_id, param.invitee_company_id]);
        } else {
            let queryText = "SELECT  r.role_name, r.role_id, r.company_id, c.company_name, rmm.rmm_id, rmm.module_id, rmm.sub_module_id, m.module_name, sm.sub_module_name, rmm.create_role, rmm.view_role, rmm.update_role, rmm.delete_role, (SELECT CASE WHEN created_by = 1 THEN true ELSE false END FROM waka.role_module_mapping where role_id = r.role_id limit 1) as is_admin_role FROM waka.roles as r JOIN waka.role_module_mapping rmm on r.role_id = rmm.role_id LEFT JOIN waka.modules as m ON rmm.module_id = m.module_id LEFT JOIN waka.sub_modules sm ON sm.sub_module_id = rmm.sub_module_id LEFT JOIN waka.company c ON c.company_id = r.company_id where r.created_by in (1,$1)";
           return await psqlAPM.fnDbQuery('getRoles', queryText, [param.userId]);
        }
    }

    async getRoles(param:any){
        if(param.company_id != undefined){
            let queryText = "SELECT r.role_name, r.role_id, r.company_id, c.company_name FROM waka.roles_master as r JOIN waka.company c ON c.company_id = r.company_id WHERE r.created_by = 1 OR r.company_id IN ($1,$2) or r.company_id IN (SELECT invited_company_id FROM waka.company_invite WHERE invitee_company_id = $3 AND is_accepted = True);";
           return await psqlAPM.fnDbQuery('getRoles', queryText, [param.company_id, param.parent_company_id, param.invitee_company_id]);
        } else {
            let queryText = "SELECT r.role_name, r.role_id, r.company_id, c.company_name FROM waka.roles_master as r JOIN waka.company c ON c.company_id = r.company_id where r.created_by in (1,$1);";
           return await psqlAPM.fnDbQuery('getRoles', queryText, [param.userId]);
        }
    }

    async getCompanyUnqRoleName(companyId:number){
        const queryText = "SELECT distinct role_name FROM waka.roles WHERE company_id = $1";
        const queryParam = [companyId];
        return await psqlAPM.fnDbQuery('getCompanyUnqRoleName', queryText, queryParam);
    }

    async getModulesAndRolesForCompany(module_id:number) {
        const queryText = "select m.module_name, sm.sub_module_name, sm.sub_module_id, mp.allowed_permission, sm.module_id from waka.modules m LEFT JOIN waka.sub_modules sm on m.module_id = sm.module_id LEFT JOIN waka.module_permissions mp on sm.sub_module_id = mp.sub_module_id where m.module_id = $1 order by sm.sub_module_name;"
        const queryParam = [module_id]
        return await psqlAPM.fnDbQuery('getModulesAndRolesForCompany', queryText, queryParam);
    }

    async getRoleNameForCompany(param:any){
        let queryText = "select role_id,role_name,company_id from waka.roles where company_id = $1";
        let queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getRoleNameForCompany', queryText, queryParam);
    }

    async getExistingRoleDetails(role_id : any){
        let queryText = "select rmm.*,r.company_id,sm.sub_module_name from waka.role_module_mapping as rmm left join waka.roles as r on r.role_id = rmm.role_id left join waka.sub_modules as sm on rmm.sub_module_id = sm.sub_module_id where rmm.role_id = $1;"
        let queryParam = [role_id];
        return await psqlAPM.fnDbQuery('getExistingRoleDetails', queryText, queryParam);
    }

    async getLicenseCompanyForRoles(userId: number){
        let queryText = "SELECT c.company_name, c.company_id, cl.cl_id, ln.lookup_name as office_category,( SELECT case when add.event_id is null then false else true end as is_add_role FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN ($1) AND (company_id = c.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'ADD_ROLE' LIMIT 1)) as add), (SELECT CASE WHEN c.owned_by = $1 then TRUE ELSE FALSE END as is_own_company) FROM waka.company c LEFT JOIN waka.company_license cl on cl.company_id = c.company_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = c.office_category_id WHERE cl.is_approved = true and c.is_deleted = false AND c.created_by = $1 UNION SELECT c.company_name, c.company_id, cl.cl_id, ln.lookup_name as office_category,( SELECT case when add.event_id is null then false else true end as is_add_role FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN ($1) AND (company_id = c.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'ADD_ROLE' LIMIT 1)) as add), (SELECT CASE WHEN c.owned_by = $1 then TRUE ELSE FALSE END as is_own_company) FROM waka.company c LEFT JOIN waka.company_license cl on cl.company_id = c.company_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = c.office_category_id  WHERE cl.is_approved = true and c.is_deleted = false AND c.owned_by IN (select DISTINCT created_by from waka.role_user_mapping WHERE assigned_user_id = $1) ORDER BY company_name ASC;";
        return await psqlAPM.fnDbQuery('getCompany', queryText, [userId]);
    }

    async getAdminCompanyForRoles(userId: number){
        let queryText = "SELECT c.company_name, c.company_id, cl.cl_id, ln.lookup_name as office_category FROM waka.company c LEFT JOIN waka.company_license cl on cl.company_id = c.company_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = c.office_category_id WHERE cl.is_approved = true and c.is_deleted = false and c.created_by = $1 ORDER BY c.company_name asc;";
        return await psqlAPM.fnDbQuery('getCompany', queryText, [userId]);
    }
    
    async validateRoleName(param: any){
        let queryText = "SELECT * FROM waka.roles WHERE lower(REGEXP_REPLACE(role_name,'\\s+', '', 'g')) = $1 AND company_id = $2";
        return await psqlAPM.fnDbQuery('validateRoleName', queryText, [param.role_name, param.company_id]); 
    }

    async insRole(param:any){
        const queryText = "INSERT INTO waka.roles (company_id, role_name, created_by, created_on) VALUES ($1,$2,$3,now()) returning role_id";
        const queryParam = [param.company_id, param.role_name, param.userId];
        return await psqlAPM.fnDbQuery('insRole', queryText, queryParam);
    }

    async insRoleModuleMapping(param:any){
        const queryText = "INSERT INTO waka.role_module_mapping (role_id, created_by, created_on, module_id, sub_module_id, view_role, create_role, update_role, delete_role) SELECT " + param.role_id + ", " + param.userId + ", now() , * FROM jsonb_to_recordset('" + JSON.stringify(param.permissions) + "') as x(module_id int, sub_module_id int, view_role boolean, create_role boolean, update_role boolean, delete_role boolean);";
        return await psqlAPM.fnDbQuery('insRoleModuleMapping', queryText, []);
    }

    async updRole(param:any){
        const queryText = "UPDATE waka.roles set role_name = $1 where role_id = $2";
        const queryParam = [param.role_name, param.role_id];
        return await psqlAPM.fnDbQuery('updRole', queryText, queryParam);
    }

    async getRolePermissionForExist(param:any){
        const queryText = "select waka.role_module_mapping.*,waka.roles.company_id,waka.modules.module_name,waka.sub_modules.sub_module_name from waka.role_module_mapping left join waka.roles on waka.roles.role_id = waka.role_module_mapping.role_id left join waka.modules on waka.role_module_mapping.module_id = waka.modules.module_id left join waka.sub_modules on waka.sub_modules.sub_module_id= waka.role_module_mapping.sub_module_id where waka.role_module_mapping.role_id = $1 and waka.role_module_mapping.module_id=$2";
        const queryParam = [param.role_id , param.module_id];
        return await psqlAPM.fnDbQuery('getRolePermissionForExist', queryText, queryParam);
    }
    
    async deleteRole(role_id:number){
        const queryText = "DELETE FROM waka.roles WHERE role_id  = $1";
        const queryParam = [role_id];
        return await psqlAPM.fnDbQuery('deleteRole', queryText, queryParam);
    }

    async deleteRoleModuleMapping_old(rmm_id:number){
        const queryText = "DELETE FROM waka.role_module_mapping WHERE rmm_id  = $1";
        const queryParam = [rmm_id];
        return await psqlAPM.fnDbQuery('deleteRoleModuleMapping', queryText, queryParam);
    }

    async deleteRoleModuleMapping(role_id:number){
        const queryText = "DELETE FROM waka.role_module_mapping_new WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id=$1)";
        const queryParam = [role_id];
        return await psqlAPM.fnDbQuery('deleteRoleModuleMapping', queryText, queryParam);
    }

    async checkEmail(param:any){
        let queryText,queryParam;
        if(param.user_id == undefined){
             queryText = "SELECT * from waka.login_user WHERE lower(email) = lower($1) ";
             queryParam = [param.email];
        }
        else {
             queryText = "SELECT * from waka.login_user WHERE lower(email) = lower($1) and user_id <> $2";
             queryParam = [param.email, param.user_id];
        }
        return await psqlAPM.fnDbQuery('CheckEmail', queryText, queryParam);
    }

    async checkEmailLinkVerified(param:any){
        let queryText,queryParam;
        queryText = "SELECT * from waka.login_user WHERE lower(email) = lower($1)";
        queryParam = [param.email];
        return await psqlAPM.fnDbQuery('checkEmailLinkVerified', queryText, queryParam);
    }

    async insVerifyLink(param:any){
        const queryText = "INSERT INTO waka.verify_link (email, verify_type, verify_code, validated_on, created_on, is_valid) values ($1, $2, $3, now(), now(), false)";
        const queryParam = [param.email, param.type, param.verify_code];
        return await psqlAPM.fnDbQuery('insVerifyLink', queryText, queryParam);
    }

    async updVerifyLink(param:any){
        const queryText = "Update waka.verify_link set verify_type = $2, verify_code = $3, modified_on = now(), is_valid = false WHERE email ilike $1";
        const queryParam = [param.email, param.type, param.verify_code];
        return await psqlAPM.fnDbQuery('updVerifyLink', queryText, queryParam);
    }

    async checkVerifyLink(email:any){
        const queryText = "select * from waka.verify_link where email = '$1' and created_on > current_timestamp - interval '3 hours";
        const queryParam = [email];
        return await psqlAPM.fnDbQuery('getOTP', queryText, queryParam);
    }

    async getVerifyLinkDetails(email:any){
        const queryText = "SELECT verify_code, is_valid, CASE WHEN validated_on >= now() - interval '3 hours' THEN true ELSE false END AS is_valid_on FROM waka.verify_link WHERE email ilike $1 ";
        const queryParam = [email];
        return await psqlAPM.fnDbQuery('getVerifyLinkDetails', queryText, queryParam);
    }

    async validateOTP(param:any){
        const queryText = "UPDATE waka.verify_link SET validated_on = now(), is_valid = true WHERE email =$1 and verify_type =$2 and verify_code = $3";
        const queryParam = [param.email, param.type, param.otp];
        return await psqlAPM.fnDbQuery('validateOTP', queryText, queryParam);
    }

    async changeForgottenPassword(param:any){
        const queryText = "UPDATE waka.login_user SET hash_password = $2, salt = $3 WHERE email =$1";
        const queryParam = [param.email, param.hash_password, param.salt];
        return await psqlAPM.fnDbQuery('changeForgottenPassword', queryText, queryParam);
    }
    
    async changePassword(param:any){
        const queryText = "UPDATE waka.login_user SET hash_password = $2, salt = $3 WHERE user_id =$1";
        const queryParam = [param.userId, param.hash_password, param.salt];
        return await psqlAPM.fnDbQuery('changePassword', queryText, queryParam);
    }
    
    async updateProfile(param:any){
        // const queryText = "UPDATE waka.login_user SET email = $1, full_name = $2, mobile = $3, wechat_id = $4 WHERE user_id = $5";
        // const queryText = "WITH temp as (UPDATE waka.login_user SET email = $1, full_name = $2, mobile = $3, wechat_id = $4 WHERE user_id = $5 RETURNING user_id, email, full_name) UPDATE waka.contact_invite SET contact_name = t.full_name FROM temp t WHERE waka.contact_invite.invitee_user_id = $5;";
        const queryText = "WITH temp as (UPDATE waka.login_user SET email = $1, full_name = $2, mobile = $3, wechat_id = $4 WHERE user_id = $5 RETURNING user_id, email, full_name) UPDATE waka.company_invite SET invitee_contact_name = t.full_name FROM temp t WHERE waka.company_invite.invitee_user_id = $5;";
        const queryParam = [param.email, param.user_name, param.mobile, param.wechat_id, param.userId];
        return await psqlAPM.fnDbQuery('updateProfile', queryText, queryParam);
    }

    async fetchProfileInfo(param:any){
        const queryText = "SELECT full_name , mobile, wechat_id FROM waka.login_user WHERE user_id = $1;";
        const queryParam = [param.userId];
        return await psqlAPM.fnDbQuery('fetchProfileInfo', queryText, queryParam);
    }

    async getSubModulesForSelModule(moduleId:any){
        const queryText = "SELECT module_id,sub_module_id,sub_module_name,sub_module_description,module_id,icon FROM waka.sub_modules_list Where module_id = $1 AND is_visible = true AND is_admin_owned = false"
        const queryParam = [moduleId];
        return await psqlAPM.fnDbQuery('getSubModulesForSelModule', queryText, queryParam);
    }

    async getEventsForSubModule(param:any){
        const queryText = "select em_id,section_name,event_name,event_description from waka.event_master where module_id=$1 and sub_module_id= $2;"
        const queryParam = [param.module_id, param.sub_module_id];
        return await psqlAPM.fnDbQuery('getEventsForSubModule', queryText, queryParam);
    }

    async getSectionNames(param:any){
        const queryText = "select distinct section_name from waka.event_master where module_id=$1 and sub_module_id= $2;"
        const queryParam = [param.module_id, param.sub_module_id];
        return await psqlAPM.fnDbQuery('getSectionNames', queryText, queryParam);
    }

    async insUserRole(param: any){
        const queryText = "INSERT INTO waka.roles_master (role_name,company_id, created_by) VALUES ($1,$2,$3) returning role_id"
        const queryParam = [param.role_name, param.company_id, param.userId];
        return await psqlAPM.fnDbQuery('insUserRole', queryText, queryParam);
    }

    // async insUserRoleModuleMapping(param: any){
    //     let rmm_ids = [];
    //     let queryText;
    //     for (let submod of param.sub_module_ids){
    //         queryText = `INSERT INTO waka.role_module_mapping_new (role_id, module_id, sub_module_id, created_by) VALUES (${param.role_id}, ${param.module_id}, ${submod}, ${param.userId}) returning rmm_id;`
    //         let data = await psqlAPM.fnDbQuery('insUserRoleModuleMapping', queryText, []);
    //         rmm_ids.push(data.rows[0].rmm_id)
    //     }
    //     return rmm_ids;
    // }

    async insUserRoleModuleMapping(param: any){
        let queryText = "INSERT INTO waka.role_module_mapping_new (role_id,module_id,sub_module_id,created_by) VALUES ";
        for(let idx  in param.sub_module_ids){
            queryText += `(${param.role_id}, (SELECT module_id FROM waka.sub_modules_list WHERE sub_module_id = ${param.sub_module_ids[idx]} LIMIT 1), ${param.sub_module_ids[idx]},${param.userId})`
            if (parseInt(idx) < param.sub_module_ids.length - 1){
                queryText += ','
            }
        }
        queryText += ';'
        return await psqlAPM.fnDbQuery('insUserRoleModuleMapping', queryText, []);
    }

    // async insUserRoleEventMapping(param: any){
    //     let queryText;
    //     for (let [i,rmm_id] of param.rmm_ids.entries()){
    //         for (let event of param[param.sub_module_names[i]]){
    //             queryText = `INSERT INTO waka.role_module_event_mapping (rmm_id, event_id, created_by) VALUES (${rmm_id}, ${event}, ${param.userId})`
    //             await psqlAPM.fnDbQuery('insUserRoleModuleMapping', queryText, []);
    //         }
    //     }
    // }

    async delUserRoleModuleMapping(param: any){
        let queryText = `DELETE FROM waka.role_module_event_mapping  WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE rmm.sub_module_id IN (SELECT em.sub_module_id FROM waka.role_module_mapping_new em WHERE rmm.role_id = ${param.role_id}))`;
        return await psqlAPM.fnDbQuery('insUserRoleEventMapping', queryText, []);
    }

    async insUserRoleEventMapping(param: any){
        let queryText = "INSERT INTO waka.role_module_event_mapping (rmm_id,event_id,created_by) VALUES ";
        for(let idx  in param.event_ids){
            queryText += `((SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE rmm.sub_module_id IN (SELECT em.sub_module_id FROM waka.event_master em WHERE em_id = ${param.event_ids[idx]} AND rmm.role_id = ${param.role_id})),${param.event_ids[idx]},${param.userId})`;
            if (parseInt(idx) < param.event_ids.length - 1){
                queryText += ','
            }
        }
        queryText += ';'
        return await psqlAPM.fnDbQuery('insUserRoleEventMapping', queryText, []);
    }

    async updUserEventMapping(param:any){
        let queryText = "UPDATE waka.role_user_mapping SET role_id =$1, event_ids = (SELECT array_agg(event_id) as event_ids FROM waka.role_module_event_mapping WHERE rmm_id IN (SELECT rmm_id from waka.role_module_mapping_new WHERE role_id = $1)), modified_by = $2, modified_on = NOW();"
        let queryParam = [param.role_id,param.userId];
        return await psqlAPM.fnDbQuery('insUserEventMapping', queryText, queryParam);
    }

    async getRolesOfCompany(param: any){
        const queryText = "SELECT role_name, role_id from waka.roles_master WHERE company_id = $1;"
        const queryParam = [param.company_id];
        return await psqlAPM.fnDbQuery('getRolesOfCompany', queryText, queryParam);
    }

    async getRoleModuleMapping(param: any){
        const queryText = "SELECT array_agg(sub_module_id) as sub_module_ids, array_agg(rmm_id)as rmm_ids from waka.role_module_mapping_new WHERE role_id = $1 AND module_id = $2 AND created_by = $3;"
        const queryParam = [param.role_id, param.module_id, param.userId];
        return await psqlAPM.fnDbQuery('getRoleModuleMapping', queryText, queryParam);
    }

    async getEventsPermission(param: any){
        let queryText, event_ids:any = [];
        for(let rmm_id of param.rmm_ids){
            queryText = `SELECT array_agg(event_id) as event_ids from waka.role_module_event_mapping WHERE rmm_id = ${rmm_id}`;
            let data = await psqlAPM.fnDbQuery('getEventsPermission', queryText, []);
            event_ids.push(data.rows[0]);      
        }
        return event_ids;
    }

    async updUserRole(param:any){
        let queryText;
        for (let [i,rmm_id] of param.rmm_ids.entries()){
            if(param[param.sub_module_names[i] +'_remove'] != undefined){
                for (let event of param[param.sub_module_names[i] +'_remove']){
                    queryText = `DELETE FROM waka.role_module_event_mapping WHERE rmm_id = ${rmm_id} AND event_id = ${event};`
                    await psqlAPM.fnDbQuery('updUserRole', queryText, []);
                }
            }
            if(param[param.sub_module_names[i] +'_update'] != undefined){
                for (let event of param[param.sub_module_names[i] +'_update']){
                    queryText = `INSERT INTO waka.role_module_event_mapping (rmm_id, event_id, created_by) VALUES (${rmm_id}, ${event}, ${param.userId})`
                    await psqlAPM.fnDbQuery('updUserRole', queryText, []);
                }
                
            }
        }
        return {success: true, message: "Updated"}; 
    }

    async getUserRoles(param: any){
        const queryText = "SELECT rm.role_name, c.company_name, ml.module_name, array_agg(sml.sub_module_name) as sub_module_names, ml.module_id, array_agg(sml.sub_module_id) as sub_module_ids FROM waka.roles_master rm JOIN waka.company c ON c.company_id = rm.company_id JOIN waka.role_module_mapping_new rmm ON rmm.role_id = rm.role_id JOIN waka.modules_list ml ON rmm.module_id = ml.module_id JOIN waka.sub_modules_list sml ON rmm.sub_module_id = sml.sub_module_id WHERE rm.created_by = $1 GROUP BY rm.role_name, ml.module_name, c.company_name, ml.module_id ;"
        const queryParam = [param.userId];
        return await psqlAPM.fnDbQuery('getUserRoles', queryText, queryParam);
    }

    async getRolesForGrid(param:any){
        // let queryText = `SELECT rm.role_name, rm.role_id, c.company_name,(SELECT CASE WHEN c.owned_by IN (${param.userId}) then TRUE ELSE FALSE END as is_own_company) , jsonb_agg(DISTINCT jsonb_build_object('module_name',ml.module_name,'module_id',ml.module_id)) as modules, jsonb_agg(jsonb_build_object('sub_module_name',sml.sub_module_name,'sub_module_id',sml.sub_module_id))as sub_modules ,(SELECT CASE WHEN created_by = 1 THEN true ELSE false END FROM waka.role_module_mapping_new where role_id = rm.role_id limit 1) as is_admin_role, ( SELECT case when view.event_id is null then false else true end as is_view FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN (${param.userId}) AND (company_id = rm.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'VIEW_ROLES' LIMIT 1)) as view), ( SELECT case when delete.event_id is null then false else true end as is_delete FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN (${param.userId}) AND (company_id = rm.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DELETE_ROLE' LIMIT 1)) as delete) FROM waka.roles_master rm JOIN waka.company c ON c.company_id = rm.company_id JOIN waka.role_module_mapping_new rmm ON rmm.role_id = rm.role_id JOIN waka.modules_list ml ON rmm.module_id = ml.module_id JOIN waka.sub_modules_list sml ON rmm.sub_module_id = sml.sub_module_id WHERE rm.company_id IN (${param.company_ids}) OR rm.created_by = 1 GROUP BY rm.role_name,rm.role_id, c.company_name,is_admin_role,is_view, is_own_company;`;
        
        let queryText = `SELECT rm.role_name, rm.role_id, c.company_name,(SELECT CASE WHEN c.owned_by IN (${param.userId}) then TRUE ELSE FALSE END as is_own_company), (SELECT CASE WHEN rm.created_by IN (${param.userId}) then TRUE ELSE FALSE END as is_own_role) , jsonb_agg(DISTINCT jsonb_build_object('module_name',ml.module_name,'module_id',ml.module_id)) as modules, jsonb_agg(jsonb_build_object('sub_module_name',sml.sub_module_name,'sub_module_id',sml.sub_module_id))as sub_modules ,(SELECT CASE WHEN created_by = 1 THEN true ELSE false END FROM waka.role_module_mapping_new where role_id = rm.role_id limit 1) as is_admin_role, ( SELECT case when view.event_id is null then false else true end as is_view FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN (${param.userId}) AND (company_id = rm.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'VIEW_ROLES' LIMIT 1)) as view), ( SELECT case when delete.event_id is null then false else true end as is_delete FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN (${param.userId}) AND (company_id = rm.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'DELETE_ROLE' LIMIT 1)) as delete), ( SELECT case when edit.event_id is null then false else true end as is_edit FROM (SELECT DISTINCT em.em_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id IN(SELECT role_id from waka.role_user_mapping  WHERE assigned_user_id IN (${param.userId}) AND (company_id = rm.company_id)))) AS x ON x.event_id = em.em_id WHERE em_id IN(SELECT em_id from waka.event_master WHERE event_name = 'EDIT_ROLE' LIMIT 1)) as edit) FROM waka.roles_master rm JOIN waka.company c ON c.company_id = rm.company_id JOIN waka.role_module_mapping_new rmm ON rmm.role_id = rm.role_id JOIN waka.modules_list ml ON rmm.module_id = ml.module_id JOIN waka.sub_modules_list sml ON rmm.sub_module_id = sml.sub_module_id WHERE rm.company_id IN (${param.company_ids}) OR rm.created_by = 1 GROUP BY rm.role_name,rm.role_id, c.company_name,is_admin_role,is_view, is_own_company;`;

        return await psqlAPM.fnDbQuery('getRolesForGrid', queryText, []);
    }

    async getEventForView(param:any){
        let queryText ="SELECT em.section_name, jsonb_agg(DISTINCT  jsonb_build_object('event_id',em.em_id,'event_description',em.event_description,'is_selected',true)) as events, em.sub_module_id FROM waka.event_master em WHERE em.em_id IN (SELECT rmem.event_id FROM waka.role_module_event_mapping as rmem WHERE rmem.rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new as rmm WHERE role_id =$1)) GROUP BY 1,3";
        return await psqlAPM.fnDbQuery('getEventForView', queryText, [param.role_id]);
    }

    async deleteRoleUser(param:any){
        const queryText = "DELETE FROM waka.roles_master WHERE role_id = $1";
        const queryParam = [param.role_id];
        return await psqlAPM.fnDbQuery('deleteRole', queryText, queryParam);
    }

    async getAssignedRoles(userId:any){
        const queryText = "SELECT rum.role_id, rum.event_ids, array_agg(rmmn.module_id) as module_ids, ci.is_accepted FROM waka.role_user_mapping rum JOIN waka.role_module_mapping_new rmmn ON rum.role_id =rmmn.role_id JOIN waka.contact_invite ci ON ci.invitee_user_id = rum.invitee_user_id WHERE rum.invitee_user_id = $1 AND ci.is_accepted GROUP BY 1,2,4;";
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('getAssignedRoles', queryText, queryParam);
    }
    
    async getCompanyIds(param:any){
        const queryText = "SELECT array_agg(c.company_id) as company_ids FROM waka.company c JOIN waka.lookup_name oc ON oc.lookup_name_id = c.office_category_id LEFT JOIN waka.company pc ON pc.company_id = c.parent_company_id WHERE c.owned_by IN (select created_by from waka.contact_invite where invitee_user_id = $1 AND is_accepted = true AND company_id = c.company_id) OR c.owned_by = $1 AND oc.lookup_name = 'head quarters';"
        const queryParam = [param.userId];
        return await psqlAPM.fnDbQuery('getCompanyIds', queryText, queryParam);
    }

    async getEventsForSelSubModules(param:any){
        let queryText = `SELECT em.section_name, jsonb_agg(DISTINCT  jsonb_build_object('event_id',em.em_id,'event_description',em.event_description,'is_selected',true)) as events, em.sub_module_id FROM waka.event_master em WHERE em.sub_module_id IN (${param.sub_module_ids}) GROUP BY 1,3;`
        return await psqlAPM.fnDbQuery('getEventsForSelSubModules', queryText, []);
    }

    async getEventsPermissionForRole(param:any){
        let queryText;
        if(param.role_id != undefined){
            queryText = `SELECT a.section_name, jsonb_agg(DISTINCT jsonb_build_object('event_id',a.em_id,'event_description',a.event_description,'is_selected',case when a.event_id is null then false else true end)) as events, a.sub_module_id FROM ( SELECT em.section_name, em.em_id, em.event_description, em.sub_module_id, x.event_id FROM waka.event_master em LEFT JOIN (SELECT rmem.event_id AS event_id FROM waka.role_module_event_mapping rmem WHERE rmm_id IN (SELECT rmm.rmm_id FROM waka.role_module_mapping_new rmm WHERE role_id= ${param.role_id})) AS x ON x.event_id = em.em_id WHERE em.module_id IN (SELECT DISTINCT module_id FROM waka.role_module_mapping_new WHERE role_id = ${param.role_id}) AND em.sub_module_id IN (SELECT DISTINCT sub_module_id FROM waka.role_module_mapping_new WHERE role_id = ${param.role_id})) as a GROUP BY 1,3;`;
        } else {
            queryText = `SELECT em.section_name, jsonb_agg(DISTINCT  jsonb_build_object('event_id',em.em_id,'event_description',em.event_description,'is_selected',true)) as events, em.sub_module_id FROM waka.event_master em WHERE em.module_id IN (${param.module_ids}) AND em.sub_module_id IN (${param.sub_module_ids}) GROUP BY 1,3;`
        }
        return await psqlAPM.fnDbQuery('getMyParentCompany', queryText, []);        
    }

    async getSubModulesForView(param:any){
        let queryText = `SELECT ml.module_name, ml.module_id, jsonb_agg(DISTINCT jsonb_build_object('sub_module_id',sml.sub_module_id,'module_id',sml.module_id,'sub_module_name',sml.sub_module_name,'seq',sml.seq,'sub_module_description',sml.sub_module_description,'icon',sml.icon,'disabled',CASE WHEN em.sub_module_id is null THEN true ELSE false END)) as sub_modules FROM waka.sub_modules_list sml JOIN waka.modules_list ml ON ml.module_id = sml.module_id LEFT JOIN waka.event_master em ON sml.sub_module_id = em.sub_module_id WHERE sml.module_id IN (${param.module_ids}) AND sml.is_admin_owned = false AND sml.is_visible GROUP BY 1,2 ORDER BY ml.seq;`
        return await psqlAPM.fnDbQuery('getSubModulesForView', queryText, []);
    }

    async addDetailsForUserMapping(user_id:number,email:any){
        let queryText = "UPDATE waka.role_user_mapping SET assigned_user_id = $1 WHERE email = $2;";
        const queryParam = [user_id,email];
        return await psqlAPM.fnDbQuery('addDetailsForUserMapping', queryText, queryParam);
    }

    async updContactInviteDetails(user_id:number,email:any){
        let queryText = "UPDATE waka.contact_invite SET invitee_user_id = $1 WHERE email = $2;";
        const queryParam = [user_id,email];
        return await psqlAPM.fnDbQuery('addDetailsForUserMapping', queryText, queryParam);
    }

    async mapServices(param:any){
        const queryText = "INSERT INTO waka.map_services_temp (account_type_id, service_type_id, selected_services, created_by) VALUES ($1, $2, $3, $4);";
        const queryParam = [param.account_type_id, param.service_type_id, param.selected_services, param.userId];
        return await psqlAPM.fnDbQuery('mapServices', queryText, queryParam);
    }
    
    async updMappedServices(param:any){
        const queryText = "UPDATE waka.map_services_temp SET account_type_id = $1, service_type_id = $2, selected_services = $3 WHERE ms_id = $4";
        const queryParam = [param.account_type_id, param.service_type_id, param.selected_services, param.ms_id];
        return await psqlAPM.fnDbQuery('updMappedServices', queryText, queryParam);
    }

    async delMappedServices(param:any){
        const queryText = "DELETE FROM waka.map_services_temp WHERE ms_id = $1 AND created_by = $2";
        const queryParam = [param.ms_id, param.userId];
        return await psqlAPM.fnDbQuery('delMappedServices', queryText, queryParam);
    }

    async viewMappedServices(userId:any){
        // const queryText = "SELECT ms.*, ln.display_name as account_type FROM waka.map_services_temp ms JOIN waka.lookup_name ln ON ln.lookup_name_id = ms.account_type_id WHERE ms.created_by = $1"
        const queryText = "SELECT ms.*, ln.display_name as account_type, array_agg(lnn.lookup_name) AS service_types FROM waka.map_services_temp ms JOIN waka.lookup_name ln ON ln.lookup_name_id = ms.account_type_id JOIN waka.lookup_name lnn ON lnn.lookup_name_id = ANY(ms.service_type_id) WHERE ms.created_by = $1 GROUP BY ms.ms_id, ln.display_name;"
        const queryParam = [userId];
        return await psqlAPM.fnDbQuery('viewMappedServices', queryText, queryParam);
    }

    async getAvailableServices(param:any){
        const queryText = "SELECT service_id, service_name, unq_name FROM waka.services s JOIN waka.lookup_name ln ON ln.lookup_name_id = s.service_type_id WHERE ln.lookup_name = '"+ param.service_type+"' ORDER BY 1;";
        return await psqlAPM.fnDbQuery('getAvailableServices', queryText, []);
    }
    
    async checkForSelfInvite(param:any){
        const queryText = "SELECT c.company_id , lu.email FROM waka.login_user lu JOIN waka.company c ON c.owned_by = lu.user_id  WHERE lu.email = '"+ param+"' ;";
        return await psqlAPM.fnDbQuery('getAvailableServices', queryText, []);
    }

    async getAccessProvidedUsers(param:any){
        const queryText = "SELECT array_agg(DISTINCT com.owned_by) as event_provided_users, array_agg(DISTINCT com.company_id) as accessible_companies FROM waka.role_user_mapping rum JOIN waka.company com ON com.company_id = rum.company_id JOIN waka.role_module_mapping_new rmm ON rum.role_id = rmm.role_id WHERE rum.assigned_user_id = $1 AND rmm.module_id = $2;";
        const queryParam = [param.userId, param.module_id];
        return await psqlAPM.fnDbQuery('getAccessProvidedUsers', queryText, queryParam);
    }

    async getRegisteredSchedulers(){
        const queryText = "SELECT * FROM waka.scheduler_availability_status;";
        return await psqlAPM.fnDbQuery('getRegisteredSchedulers', queryText, []);
    }

    async getSchedulerLog(param: any) {
        let type = param.type == 'PO Ingestion' ? "waka.poi_scheduler_running_status" : "waka.sb_scheduler_running_status";
        const queryText = "SELECT * FROM " + type +" ORDER BY received_on DESC LIMIT $1 OFFSET $2";
        return await psqlAPM.fnDbQuery('getSchedulerLog', queryText, [param.limit, param.offset]);
    }
}