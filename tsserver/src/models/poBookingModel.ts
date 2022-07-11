const psqlAPM = require('./psqlAPM');
export class POBModel {
    constructor(){ };
    async getPOBGrp() {
        const queryText = "SELECT distinct grp_seq, grp, html_template FROM waka.po_booking WHERE NOT is_deleted ORDER BY 1";
        const queryParam:any = [];
        return await psqlAPM.fnDbQuery('getPOBGrp', queryText, queryParam);
    };
    async getPOBForGrp(param:any) {
        const queryText = "SELECT pob_id, pob_seq, sub_grp_seq, sub_grp, pob_name, control_name, has_child, view_text, fields,ui_img_file_name FROM waka.po_booking WHERE NOT is_deleted AND grp=$1 ORDER BY 3,2";
        const queryParam:any = [param.grp];
        return await psqlAPM.fnDbQuery('getPOBForGrp', queryText, queryParam);
    };
}
