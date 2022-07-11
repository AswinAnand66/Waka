const psqlAPM = require('./psqlAPM');
export class LicenseModel {
    constructor(){ };

    async getLicenseDetails(){
        const queryText = "SELECT cl.company_id, c.company_name, cl.cl_id,  ln.lookup_name , CASE  WHEN cl.is_approved = false THEN 'Requested' ELSE 'Registered' END AS status FROM waka.company_license cl JOIN waka.company c ON cl.company_id = c.company_id LEFT JOIN waka.company_lic_module clm ON clm.cl_id = cl.cl_id LEFT JOIN waka.lookup_name ln on ln.lookup_name_id = c.office_category_id group by c.company_name, ln.lookup_name, cl.cl_id order by cl.is_approved = false desc, cl.created_on desc;";
        return await psqlAPM.fnDbQuery('getLicenseDetails', queryText, []);
    }
 
    async approveLicenseStatus(param:any){
        const queryText = " UPDATE waka.company_license set is_approved = true where cl_id = $1";
        const queryParam = [param.cl_id];
        return await psqlAPM.fnDbQuery('approveLicenseStatus', queryText, queryParam);
    }
    
    async revokeLicenseStatus(param:any){
        const queryText = " UPDATE waka.company_license set is_approved = false where cl_id = $1";
        const queryParam = [param.cl_id];
        return await psqlAPM.fnDbQuery('revokeLicenseStatus', queryText, queryParam);
    } 

    async insUserCompanyOnLicenseApproval(param:any){
        const queryText = "INSERT INTO waka.user_company (user_id, company_id, is_company_owner, created_by) SELECT c.owned_by, c.company_id, true, $2 FROM waka.company c WHERE c.company_id = $1";
        const queryParam = [param.company_id, param.userId];
        return await psqlAPM.fnDbQuery('insUserCompanyOnLicenseApproval', queryText, queryParam);
    }
}