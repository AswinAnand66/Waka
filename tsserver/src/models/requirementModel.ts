const psqlAPM = require('./psqlAPM');
export class ReqModel {
    constructor(){ };
    async getDocs (){
        const queryText = "SELECT d.doc_id, d.grp_seq,d.grp, d.sub_grp_seq, d.sub_grp, d.doc_name, d.control_name, d.doc_seq, d.has_child, d.fields FROM waka.documents d WHERE NOT is_deleted ORDER BY 2, 4,8";
        const queryParam:any = [];
        return await psqlAPM.fnDbQuery('getDocs', queryText, queryParam);
    };

    async insReq(param:any){
        const queryText = "INSERT INTO waka.requirements (req_type_id, grpid0,grpid1,grpid2,grpid3,fields,grpid0_seq,grpid1_seq,grpid2_seq,grpid3_seq,created_by) VALUES ($1,$2,$3,$4,$5,$6,(SELECT COALESCE(max(grpid0_seq),0)+1 FROM waka.requirements WHERE req_type_id = $1),(SELECT COALESCE(max(grpid1_seq),0)+1 FROM waka.requirements WHERE req_type_id = $1 AND grpid0=$2),(SELECT COALESCE(max(grpid1_seq),0)+1 FROM waka.requirements WHERE req_type_id = $1 AND grpid0=$2 AND grpid1=$3),(SELECT COALESCE(max(grpid2_seq),0)+1 FROM waka.requirements WHERE req_type_id = $1 AND grpid0=$2 AND grpid1=$3 AND grpid2=$4),$7)";
        const queryParam = [param.req_type_id, param.group_id0,param.group_id1,param.group_id2,param.group_id3,param.fields,param.userId];
        return await psqlAPM.fnDbQuery('insReq', queryText, queryParam);
    }

    async getRequirement(type:string){
        const queryText = "SELECT r.req_id,r.req_type_id, r.grpid0,r.grpid1,r.grpid2,r.grpid3,r.fields,r.grpid0_seq,r.grpid1_seq,r.grpid2_seq,r.grpid3_seq, g0.display_name g0_name, g1.display_name g1_name, g2.display_name g2_name, g3.display_name g3_name FROM waka.requirements r JOIN waka.lookup_name g0 ON g0.lookup_name_id=r.grpid0 LEFT JOIN waka.lookup_name g1 ON g1.lookup_name_id=r.grpid1 LEFT JOIN waka.lookup_name g2 ON g2.lookup_name_id=r.grpid2 LEFT JOIN waka.lookup_name g3 ON g3.lookup_name_id=r.grpid3 WHERE r.req_type_id IN (SELECT lookup_type_id FROM waka.lookup_type WHERE lookup_type=$1)";
        const queryParam = [type];
        return await psqlAPM.fnDbQuery('getRequirement', queryText, queryParam);
    }

    async delRequirement(req_id:number){
        const queryText = "DELETE FROM waka.requirements WHERE req_id = $1";
        const queryParam = [req_id];
        return await psqlAPM.fnDbQuery('delRequirement', queryText, queryParam);
    }
}