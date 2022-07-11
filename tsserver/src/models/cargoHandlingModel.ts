const psqlAPM = require('./psqlAPM');
export class CHModel {
    constructor(){ };
    async getCHGrp (){
        const queryText = "SELECT distinct grp_seq,grp, html_template FROM waka.cargo_handling WHERE NOT is_deleted ORDER BY 1";
        const queryParam:any = [];
        return await psqlAPM.fnDbQuery('getCHGrp', queryText, queryParam);
    };
    async getCHForGrp (param:any){
        const queryText = "SELECT ch_id, ch_seq, sub_grp_seq, sub_grp, ch_name, control_name, has_child, view_text, fields,ui_img_file_name FROM waka.cargo_handling WHERE NOT is_deleted AND grp=$1 ORDER BY 3,2";
        const queryParam:any = [param.grp];
        return await psqlAPM.fnDbQuery('getCHForGrp', queryText, queryParam);
    };
}
